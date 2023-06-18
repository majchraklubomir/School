import socket
import struct
import zlib
import os.path
from threading import Thread
import time

resend_frame = None
keepalive_stop_condition = 0


# vytvori hlavicku ako bytove pole argumentov
def create_header(number, crc, flag):
    return struct.pack("iIc", number, crc, flag.encode())


# vytvori prislusnu hlavicku oznaujucu typ ramca a posle na adresu
def send_INIT(sock, address):
    header = create_header(0, 0, "I")
    sock.sendto(header, address)


# vytvori prislusnu hlavicku oznaujucu typ ramca a posle na adresu
def send_ACK(sock, address, last_fragment):
    header = create_header(last_fragment, 0, "A")
    sock.sendto(header, address)


# vytvori prislusnu hlavicku oznaujucu typ ramca a posle na adresu
def send_Resend_request(sock, address, last_fragment):
    header = create_header(last_fragment, 0, "R")
    sock.sendto(header, address)


# vytvori prislusnu hlavicku oznaujucu typ ramca a posle na adresu
def send_Keep_Alive(sock, address):
    header = create_header(0, 0, "K")
    sock.sendto(header, address)

# server prijimanie dat
def recive_data(sock, addr, number_of_frames, filename, file_save_path, message_type):
    fragments = []
    resend_flag = 0
    frame_number = 0
    number = 0
    # prijimaj ramce kym nepride ramec ktory je posledny
    while number < number_of_frames:
        frame = sock.recvfrom(1500)
        number, crc, flag = struct.unpack("iIc", frame[0][:9])  # vyber z ramca hlavicku

        if zlib.crc32(frame[0][9:]) == crc:  # porovnaj ci su data neposkodene
            if frame_number == number:  # porovnaj ci sa ramec nestratil
                resend_flag = 0
                fragments.append(frame[0][9:])  # data z prijateho ramca vloz do listu
                print("Prijaty ramec cislo:", number, " velkost:", len(frame[0][9:]))
                if number == number_of_frames - 1:  # prijal si posledny ramec
                    send_ACK(sock, addr, number)  # odosli finalne potvrdenie
                    size_of_data = 0
                    for i in fragments:
                        size_of_data += len(i)
                    print("Prijal som", len(fragments), "ramcov, celkova velkost prijatych dat:", size_of_data, "bajtov")
                    if message_type == "F":  # podla toho aky typ dat si prijal sa rozhodni ako ich spracujes
                        print("subor bol ulozeny na miesto")
                        print(os.path.abspath(file_save_path + filename))
                        with open(file_save_path + filename, "wb") as file:
                            for i in fragments:
                                file.write(i)
                    else:
                        print("Sprava bola prijata")
                        for i in fragments:
                            print(i.decode(), end="")
                        print("")
                    return
                frame_number += 1
                send_ACK(sock, addr, number)
            elif resend_flag:
                continue

            else:  # ak sa stane ze ramec ktory prisiel nema spravne poradie vypyta si znova poslat ramec s ocakavanym poradim
                print("Strateny ramec cislo:", frame_number)
                resend_flag = 1
                resend = frame_number
                send_Resend_request(sock, addr, resend)
        elif resend_flag:
            continue
        else:  # ak pride ramec ktory ma poskodene data vypyta si ho znova
            print("Poskodeny ramec cislo:", frame_number)
            resend_flag = 1
            resend = number
            send_Resend_request(sock, addr, resend)


def server_establish_comm(sock):
    addr = None
    flag = bytes()
    print("Server caka na nadviazanie spojenia")
    while flag.decode() != "I":
        frame, addr = sock.recvfrom(1500)
        number, crc, flag = struct.unpack("iIc", frame[:9])
    print("Poziadavka o nadviazanie spojenia")
    send_ACK(sock, addr, 0)
    return addr


# dialog okno pre server aby som ho vedel ukoncit aj ked prijme data alebo ho nechat nech udrzuje spojenie
def transfer_complete():
    print("Prenos dat bol dokonceny vyber z moznosti (za 20 sekund sa spojenie prerusi)")
    print("1 - Udrzovat spojenie")
    print("2 - Zmena role / odhlasenie")
    while True:
        try:
            choice = input()
            if choice == "1":
                return 1
            elif choice == "2":
                return 2
            else:
                print("Musis zadat jednu z ponukanych moznosti")
        except socket.timeout:
            print("Nevybral si ziadnu moznost server sa odpojil")
            return 2


# server prijima ramec ktory je bud nejake data alebo keepalive
def server_type_of_comm(sock, address):
    frame = None
    while frame is None:
        frame = sock.recvfrom(1500)
    number, crc, flag = struct.unpack("iIc", frame[0][:9])
    # ak data ktore sa mu klient pokusa poslat je sprava tak nepotrebuje ziadne dalsie informacie len potrvdi ze ocakava dany pocet ramcov a zacne spracovavat data
    if flag.decode() == "M":
        sock.settimeout(None)
        number_of_frames = number
        send_ACK(sock, address, number_of_frames)
        print("Ocakavam", number, "ramcov")
        recive_data(sock, address, number_of_frames, None, None, "M")
        sock.settimeout(20)
        return transfer_complete()
    # data ktore sa mu klient pokusa poslat je subor, potrebuje vediet kam ho ma ulozit, posle potvrdenie ze caka na dany pocet ramcov a zacne spracovavat data
    if flag.decode() == "F":
        sock.settimeout(None)
        number_of_frames = number
        filename = frame[0][9:].decode()
        print("Zadaj cestu pre ulozenie suboru")
        file_save_path = input()
        send_ACK(sock, address, number_of_frames)
        print("Ocakavam", number, "ramcov")
        recive_data(sock, address, number_of_frames, filename, file_save_path, "F")
        sock.settimeout(20)
        return transfer_complete()
    # prijme poziadavku pre udrzanie spojenia a posle klientovy potvrdenie
    if flag.decode() == "K":
        send_Keep_Alive(sock, address)
        return 3


def server():
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    print("Zadaj port na ktorom bude server pocuvat")
    port = int(input())
    IP = socket.gethostbyname(socket.gethostname())
    print(IP)
    sock.bind((IP, port))
    address = server_establish_comm(sock)
    while True:
        try:
            choice = server_type_of_comm(sock, address)
            if choice == 1:
                continue
            elif choice == 2:
                header = create_header(0, 0, "E")
                sock.sendto(header, address)
                break
        # ak sa klient odpoji server sa odpoji po urcitom case ked mu nepride ziaden keepalive frame
        except socket.timeout:
            print("Server neprijal ziadny keepalive v casovom limite a odpojil sa")
            return


# zacne s posielanim ramcov s datami
def send_Fragments(sock, address, fragments, lost, damaged, message_type):
    global resend_frame
    iterate_fragment = 0
    print("Simulovat chybu v datovej casti ramca ?")
    print("1 - Ano")
    print("2 - Nie")
    choice = input()
    if choice == "1":
        print("Zadajte cislo ramca v ktorom bude chyba")
        damaged.append(int(input()))
    thread = Thread(target=file_recive_ack, args=(sock, fragments)) # vytvori nove vlakno pre prijem potvrdeni zo servera
    thread.start()
    # posielaj ramce kym ich neposles vsetky
    while iterate_fragment < len(fragments):
        print("Posielam ramec cislo:", iterate_fragment, ", velkost ramca:", len(fragments[iterate_fragment]), ", Ostava na poslanie", len(fragments) - iterate_fragment - 1,
              "fragmentov")
        # simulacia strateneho ramca
        if iterate_fragment + 1 in lost:
            lost.remove(iterate_fragment + 1)
            iterate_fragment += 1
            continue
        data = fragments[iterate_fragment]
        crc = zlib.crc32(data)  # vypocita checksum pre data
        # simulacia poskodeneho ramca
        if iterate_fragment + 1 in damaged:
            damaged.remove(iterate_fragment + 1)
            data = b"n"
        # vytvor hlavicku a posli data, potom chvilu pockaj
        header = create_header(iterate_fragment, crc, message_type)
        sock.sendto(header + data, address)
        time.sleep(0.000000001)

        # kontroluje ci si server nahodou nevyziadal znovuposlanie nejakeho ramca ak ano zacne znova posielat ramce od toho ktory si server vyziadal
        if resend_frame is not None:  # globalna premenna ktora sa nastavuje vo vlakne kde sa prijimaju potvrdenia zo servera
            iterate_fragment = resend_frame
            resend_frame = None
        else:
            iterate_fragment += 1

        # ked uz si vsetko poslal daj serveru cas potvrdit ze dostal vsetky data ak nie posli ich znova
        if iterate_fragment == len(fragments):
            time.sleep(1)
            if resend_frame is not None:
                iterate_fragment = resend_frame
                resend_frame = None
    thread.join()


# nastavi vsetko potrebne pre poslanie textovej spravy
def send_Message(sock, address, fragment_size, lost, damaged):
    print("Zadaj spravu")
    data = input()

    # vytvori fragmenty zo zadanej spravy a posle serveru informaciu kolko fragmentov sa bude posielat
    fragments = make_Fragments(data, len(data), fragment_size, "M")
    header = create_header(len(fragments), 0, "M")
    sock.sendto(header, address)

    # caka na potvrdenie ze server je pripraveny prijat data
    flag = bytes()
    while flag.decode() != "A":
        try:
            frame = sock.recvfrom(1500)
            number, crc, flag = struct.unpack("iIc", frame[0][:9])
        except (Exception,):  # pokial by sa stalo ze server sa odpojil tak vypis ze je nedostupny
            print("Server nedostupny")
            return 1

    print("Idem posielat", len(fragments), "ramcov, celkova velkost odosielanych dat:", len(data), "bajtov")
    # posli vsetky fragmenty
    send_Fragments(sock, address, fragments, lost, damaged, "M")
    return 2


# nastavy vsetko potrebne pre poslanie suboru
def send_File(sock, address, fragment_size, lost, damaged):
    print("Zadaj cestu k suboru")
    path = None
    size = 0
    file_found = 0
    # pyta od pouzivatela cestu k suboru ktory sa ma poslat, pouzivatel musi zadat korektnu cestu
    while file_found == 0:
        path = input()
        if os.path.isfile(path):
            size = os.path.getsize(path)
            file_found = 1
        else:
            print("Subor neexistuje")
            print("1 - Zadat novu cestu")
            print("2 - Zrusit posielanie suboru")
            choice = input()
            if choice == "1":
                continue
            elif choice == "2":
                return 1
    # ak subor existuje vytvoria sa fragmenty
    if file_found == 1:
        fragments = make_Fragments(path, size, fragment_size, "F")
        # vytvori sa hlavicka oznamujuca kolko ramcov sa bude posielat a posle aj meno suboru ktory ide posielat
        header = create_header(len(fragments), 0, "F")
        basename_path = os.path.basename(path)
        sock.sendto(header + basename_path.encode(), address)

        # caka na potvrdenie ze server je pripraveny prijat data
        flag = bytes()
        while flag.decode() != "A":
            try:
                frame = sock.recvfrom(1500)
                number, crc, flag = struct.unpack("iIc", frame[0][:9])
            except (Exception,): # pokial by sa stalo ze server sa odpojil tak vypis ze je nedostupny
                print("Server nedostupny")
                return 1
        size_of_file = 0
        for i in fragments:
            size_of_file += len(i)
        print("Idem posielat", len(fragments), "ramcov, celkova velkost odosielanych dat:", size_of_file, "bajtov")
        # posli vsetky fragmenty
        send_Fragments(sock, address, fragments, lost, damaged, "F")
        print("Subor sa posielal z miesta:", path)
        print()
    return 2


# prijimaj potvrdenia zo servera ze dostal data, pripadne ze chce data poslat znova
def file_recive_ack(sock, fragments):
    global resend_frame
    while True:
        frame = sock.recvfrom(1500)
        number, n, flag = struct.unpack("iIc", frame[0][:9])
        if flag.decode() == "A":
            # ak pride finalne potvrdenie skonci cyklus
            if number == len(fragments) - 1:
                print("Prenos bol uspesny")
                break
        if flag.decode() == "R":
            print("Ziadost o znovuposlianie fragmentov od fragmentu", number)
            resend_frame = number  # nastav globalnu premennu ze server potrebuje poslat fragment znova


# vytvori fragmenty podla zadanej velkosti zo zadanych dat
def make_Fragments(message, size, fragment_size, data_type):
    if data_type == "F":
        file = open(message, "rb")
        data = file.read()
        file.close()
    else:
        data = message.encode()
    fragment_list = []
    number_of_fragment = 0
    # ak by sme posielali data mensie ako velkost ramca
    if fragment_size > size:
        fragment_list.append(data)
    else:
        # vytvor potrebny pocet fragmentov
        while (number_of_fragment * fragment_size) < size:
            fragment_list.append(data[number_of_fragment * fragment_size:(number_of_fragment + 1) * fragment_size])
            number_of_fragment += 1
    return fragment_list


# udrzuje spojenie pomocou vlastnych signalov
def start_Keep_Alive(sock, address):
    print("Zapinam KeepAlive")
    counter = 0
    global keepalive_stop_condition
    while True:
        if keepalive_stop_condition:
            sock.settimeout(None)
            break
        if counter > 3:
            print("Keepalive, spojenie prerusene")
            break
        send_Keep_Alive(sock, address)
        sock.settimeout(5)
        while True:
            try:
                frame = sock.recvfrom(1500)
                number, n, flag = struct.unpack("iIc", frame[0][:9])
            except socket.timeout:
                counter += 1
                print("Keepalive, server neodpoveda")
                break
            if flag.decode() == "K":
                print("prijaty keepalive")
                sock.settimeout(None)
                counter = 0
                time.sleep(5)
                break
            if flag.decode() == "E":
                print("Server prerusil spojenie")
                return


def client():
    damaged = []
    lost = []

    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    print("Zadaj IP servera")
    IP = input()
    print("Zadaj port servera")
    port = int(input())
    print("Zadaj velkost ramcov v rozmedzi: 1 - 1463")
    while True:
        fragment_size = int(input())
        if 0 < fragment_size < 1464:
            break
        else:
            print("Velkost fragmentov musi byt v rozmedzi: 1 - 1463")
    address = (IP, port)
    keep_alive_thread = Thread(target=send_Keep_Alive, args=(sock, address))
    global keepalive_stop_condition
    send_INIT(sock, address)  # posli poziadavku o nadviazanie spojenia
    flag = bytes()
    while flag.decode() != "A":  # pockaj na odpoved
        frame = sock.recvfrom(1500)
        number, crc, flag = struct.unpack("iIc", frame[0][:9])
    while True:
        print("Spojenie nadviazane vyberte co chcete poslat")
        print("1 - poslat textovu spravu")
        print("2 - poslat subor")
        print("3 - Zmena role / odhlasenie")
        choice = input()
        if choice == "1":
            if keep_alive_thread.is_alive():
                keepalive_stop_condition = 1
                keep_alive_thread.join()
                keepalive_stop_condition = 0

            error = send_Message(sock, address, fragment_size, lost, damaged)
            if error == 1:
                continue
            else:
                send_Keep_Alive(sock, address)
                keep_alive_thread = Thread(target=start_Keep_Alive, args=(sock, address))
                keep_alive_thread.start()

        elif choice == "2":
            if keep_alive_thread.is_alive():
                keepalive_stop_condition = 1
                keep_alive_thread.join()
                keepalive_stop_condition = 0

            error = send_File(sock, address, fragment_size, lost, damaged)
            if error == 1:
                continue
            else:
                send_Keep_Alive(sock, address)
                keep_alive_thread = Thread(target=start_Keep_Alive, args=(sock, address))
                keep_alive_thread.start()

        elif choice == "3":
            if keep_alive_thread.is_alive():
                keepalive_stop_condition = 1
                keep_alive_thread.join()
                keepalive_stop_condition = 0
            return


def main():
    while True:
        print("Vyber si rolu")
        print("1 - Klient")
        print("2 - Server")
        print("3 - Skoncit program")
        choice = input()
        if choice == "1":
            client()
        elif choice == "2":
            server()
        elif choice == "3":
            return


if __name__ == '__main__':
    main()
