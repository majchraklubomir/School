from scapy.all import *

ETHERNET = 1500  # constant


class Frame:
    hexdump = None
    frameNumber = None
    lenAPI = None
    lenMedium = None
    eth_type = None
    dstMAC = None
    srcMAC = None
    l3 = None
    l4 = None
    l5 = None
    srcIP = None
    dstIP = None
    dstPort = None
    srcPort = None


# will print contents of objects to console and into txt file
def print_packet(frame, f):
    print("Frame:", frame.frameNumber)
    f.write("Frame: " + str(frame.frameNumber) + "\n")

    print("Length of frame from pcap API:", frame.lenAPI)
    f.write("Length of frame from pcap API: " + str(frame.lenAPI) + "\n")

    print("Length of frame transmitted over the medium:", frame.lenMedium)
    f.write("Length of frame transmitted over the medium: " + str(frame.lenMedium) + "\n")

    print(frame.eth_type)
    f.write(frame.eth_type + "\n")

    print("Source MAC address: ", frame.srcMAC)
    f.write("Source MAC address: " + frame.srcMAC + "\n")

    print("Destination MAC address: ", frame.dstMAC)
    f.write("Destination MAC address: " + frame.dstMAC + "\n")

    print(frame.l3)
    f.write(frame.l3 + "\n")

    if frame.l3 == "IPv4":
        print("Source IP:", frame.srcIP)
        f.write("Source IP: " + frame.srcIP + "\n")
        print("Destination IP:", frame.dstIP)
        f.write("Destination IP: " + frame.dstIP + "\n")

        print(frame.l4)
        f.write(frame.l4 + "\n")
        if frame.l4 is not None and (frame.l4 == "TCP" or frame.l4 == "UDP"):
            print(frame.l5)
            f.write(frame.l5 + "\n")
            print("Source port:", frame.srcPort)
            f.write("Source port: " + frame.srcPort + "\n")
            print("Destination port", frame.dstPort)
            f.write("Destination port: " + frame.dstPort + "\n")


# will print hexdump of frame to console and into txt file
def print_hexdump(frame, f):
    # hexdump of analyzed frame
    for i in range(0, len(frame.hexdump), 2):
        if i % 32 == 0:
            print("")
            f.write("\n")
        elif i % 16 == 0:
            print("", end=" ")
            f.write(" ")
        print(frame.hexdump[i:i + 2], end=" ")
        f.write(frame.hexdump[i:i + 2] + " ")
    print("\n")
    f.write("\n\n")


# find length of frame
def order_and_len(counter, record, frame):
    frame.frameNumber = counter
    frame.lenAPI = record.wirelen
    if record.wirelen + 4 <= 64:
        frame.lenMedium = 64
    else:
        frame.lenMedium = record.wirelen + 4


# find port in files
def tcp_or_udp(frame):
    hexFrame = frame.hexdump
    srcPort = str(int(hexFrame[68:72], 16))
    dstPort = str(int(hexFrame[72:76], 16))
    frame.srcPort = srcPort
    frame.dstPort = dstPort
    if hexFrame[46:48] == "06":  # TCP
        with open("TCPports.txt", "r") as file:
            for line in file:
                if srcPort == line.split()[0] or dstPort == line.split()[0] or line.split()[0] == "ZZ":
                    frame.l5 = line.split()[1]
                    break
    else:
        with open("UDPports.txt", "r") as file:
            for line in file:
                if srcPort == line.split()[0] or dstPort == line.split()[0] or line.split()[0] == "ZZ":
                    frame.l5 = line.split()[1]
                    break


# make ipv4 format from hex
def calc_ip(hexFrame, start, end):
    IP = '.'.join(str(int(hexFrame[i:i + 2], 16)) for i in range(start, end, 2))
    return IP


# determine protocol on network layer
def ethertypes(listofnodes, protocol, frame):
    hexFrame = frame.hexdump
    offset = 0
    if protocol == "SNAP":
        offset = 16
    with open("ethertypes.txt", "r") as file:
        for line in file:
            if line[0:4] == hexFrame[24 + offset:28 + offset]:
                frame.l3 = line[5:len(line) - 1]
                if line[0:4] == "0800" and protocol != "SNAP":  # IPv4 and Ethernet II
                    srcIP = calc_ip(hexFrame, 52, 60)
                    dstIP = calc_ip(hexFrame, 60, 68)
                    frame.srcIP = srcIP
                    frame.dstIP = dstIP
                    listofnodes.append(srcIP)  # will store IP of sending node
                    with open("IPprotocols.txt", "r") as file1:
                        for line1 in file1:
                            if line1[:2] == hexFrame[46:48]:
                                frame.l4 = line1[3:len(line1) - 1]
                                if hexFrame[46:48] == "06" or hexFrame[46:48] == "11":  # TCP or UDP
                                    tcp_or_udp(frame)
                                break
                            elif line1[0:2] == "ZZ":
                                frame.l4 = line1[3:len(line1)]
                                break
                break
            elif line[0:4] == "ZZZZ":
                frame.l3 = line[5:len(line)]
                break


# determine protocol on link layer
def identify_protocol(listofnodes, frame):
    hexFrame = frame.hexdump
    protocol = int(hexFrame[24:28], 16)
    # determining protocol based on decimal number, ETHERNET is 1500
    if protocol > ETHERNET:
        frame.eth_type = "Ethernet II"
        ethertypes(listofnodes, "ETHERNET", frame)

    else:
        if hexFrame[28:30] == 'aa':
            frame.eth_type = "IEEE 802.3 - LLC + SNAP"
            ethertypes(listofnodes, "SNAP", frame)
        elif hexFrame[28:30] == 'ff':
            frame.eth_type = "IEEE 802.3 - Raw"
            frame.l3 = "IPX"
        else:
            frame.eth_type = "IEEE 802.3 - LLC"
            with open("LLCprotocols.txt", "r") as file:
                for line in file:
                    if line[:2] == hexFrame[28:30]:
                        frame.l3 = line[3:len(line) - 1]


# determine source and destination MAC
def identify_mac(frame):
    hexFrame = frame.hexdump
    srcMAC = ' '.join(hexFrame[i:i + 2] for i in range(12, 24, 2))
    frame.srcMAC = srcMAC
    dstMAC = ' '.join(hexFrame[i:i + 2] for i in range(0, 12, 2))
    frame.dstMAC = dstMAC


# not much useful only for better code management
def basic_info(record, counter, listofnodes, frame):
    frame.hexdump = raw(record).hex()
    order_and_len(counter, record, frame)
    identify_protocol(listofnodes, frame)
    identify_mac(frame)


# will write which IP node sent most frames
def sending_nodes(listofnodes, outputfile):
    uniqueIP = []

    for i in listofnodes:
        if i not in uniqueIP:
            uniqueIP.append(i)

    countOfSent = []
    print("IP addresses of sending nodes:")
    outputfile.write("IP addresses of sending nodes:\n")
    for i in uniqueIP:
        print(i)
        outputfile.write(i + "\n")
        countOfSent.append(listofnodes.count(i))

    highest = max(countOfSent)
    print("\nNode with most sent frames:")
    outputfile.write("\nNode with most sent frames:\n")
    for i in range(0, len(countOfSent), 1):
        if countOfSent[i] == highest:
            print(uniqueIP[i], "    ", countOfSent[i], "frames")
            outputfile.write(uniqueIP[i] + "    " + str(countOfSent[i]) + "frames\n")


# check if first 3 frames in list are tcp handshake
def three_way(listoftcp):
    if not listoftcp:
        return False
    if listoftcp[0].hexdump[94:96] == "02":  # SYN
        if listoftcp[1].hexdump[94:96] == "12":  # SYN, ACK
            if listoftcp[2].hexdump[94:96] == "10":  # ACK
                return True
    return False


# various combinations of ending tcp communication
def tcp_ending(comm):
    # 11 - ACK, FIN
    # 10 - ACK
    # 01 - FIN
    # 04 - RST
    len_of_comm = len(comm) - 1
    if comm[len_of_comm - 3].hexdump[94:96] == "11":
        if comm[len_of_comm - 2].hexdump[94:96] == "10":
            if comm[len_of_comm - 1].hexdump[94:96] == "11":
                if comm[len_of_comm].hexdump[94:96] == "10":
                    return True

    elif comm[len_of_comm - 3].hexdump[94:96] == "01":
        if comm[len_of_comm - 2].hexdump[94:96] == "10":
            if comm[len_of_comm - 1].hexdump[94:96] == "01":
                if comm[len_of_comm].hexdump[94:96] == "10":
                    return True

    elif comm[len_of_comm - 2].hexdump[94:96] == "10":
        if comm[len_of_comm - 1].hexdump[94:96] == "11":
            if comm[len_of_comm].hexdump[94:96] == "10":
                return True

    elif comm[len_of_comm - 2].hexdump[94:96] == "01":
        if comm[len_of_comm - 1].hexdump[94:96] == "11":
            if comm[len_of_comm].hexdump[94:96] == "10":
                return True

    elif comm[len_of_comm - 1].hexdump[94:96] == "01":
        if comm[len_of_comm].hexdump[94:96] == "04":
            return True

    elif comm[len_of_comm].hexdump[94:96] == "04":
        return True

    elif comm[len_of_comm - 1].hexdump[94:96] == "01":
        if comm[len_of_comm].hexdump[94:96] == "04":
            return True

    else:
        return False


# one function for all tcp protocols
def all_tcp_communication(comm, outputfile, name_of_comm):
    comm_complete = []
    comm_not_complete = []
    for i in comm[:]:
        temp_comm = []
        if three_way(comm):  # check 3 way handshake
            port = i.srcPort
            sorcIP = i.srcIP
            destIP = i.dstIP
            for j in comm:
                if j.srcPort == port and j.srcIP == sorcIP and j.dstIP == destIP:
                    temp_comm.append(j)
                elif j.dstPort == port and j.dstIP == sorcIP and j.srcIP == destIP:
                    temp_comm.append(j)
            if tcp_ending(temp_comm):  # check if ended correctly
                for o in temp_comm:
                    if o in comm:
                        comm.remove(o)
                comm_complete = temp_comm
            else:
                for o in temp_comm:
                    if o in comm:
                        comm.remove(o)
                comm_not_complete = temp_comm
            if not comm_not_complete or not comm_complete:
                continue
            break
        else:
            if i in comm:
                comm.remove(i)
    # print complete communication if exist
    if comm_complete:
        print(name_of_comm + " communication complete")
        outputfile.write(name_of_comm + " communication complete\n")
        count = 0
        for i in comm_complete:
            if count < 10 or count > (len(comm_complete) - 10):
                print_packet(i, outputfile)
                print_hexdump(i, outputfile)
            count += 1
    # print incomplete communication if exist
    if comm_not_complete:
        print(name_of_comm + " communication not complete")
        outputfile.write(name_of_comm + " communication not complete\n")
        count = 0
        for i in comm_not_complete:
            if count < 10 or count > (len(comm_not_complete) - 11):
                print_packet(i, outputfile)
                print_hexdump(i, outputfile)
            count += 1


# pick all http frames from pcap and use function to print tcp communication
def http_communication(analyzedpcap, outputfile):
    http = []
    for i in analyzedpcap:
        if i.l4 == "TCP":
            if i.l5 == "http":
                http.append(i)
    all_tcp_communication(http, outputfile, "HTTP")


# pick all https frames from pcap and use function to print tcp communication
def https_communication(analyzedpcap, outputfile):
    https = []
    for i in analyzedpcap:
        if i.l4 == "TCP":
            if i.l5 == "https(ssl)":
                https.append(i)
    all_tcp_communication(https, outputfile, "HTTPS")


# pick all telnet frames from pcap and use function to print tcp communication
def telnet_communication(analyzedpcap, outputfile):
    telnet = []
    for i in analyzedpcap:
        if i.l4 == "TCP":
            if i.l5 == "telnet":
                telnet.append(i)
    all_tcp_communication(telnet, outputfile, "Telnet")


# pick all ssh frames from pcap and use function to print tcp communication
def ssh_communication(analyzedpcap, outputfile):
    ssh = []
    for i in analyzedpcap:
        if i.l4 == "TCP":
            if i.l5 == "ssh":
                ssh.append(i)
    all_tcp_communication(ssh, outputfile, "SSH")


# pick all ftp-control frames from pcap and use function to print tcp communication
def ftp_control_communication(analyzedpcap, outputfile):
    ftp_control = []
    for i in analyzedpcap:
        if i.l4 == "TCP":
            if i.l5 == "ftp-control":
                ftp_control.append(i)
    all_tcp_communication(ftp_control, outputfile, "FTP-control")


# pick all ftp-data frames from pcap and use function to print tcp communication
def ftp_data_communication(analyzedpcap, outputfile):
    ftp_data = []
    for i in analyzedpcap:
        if i.l4 == "TCP":
            if i.l5 == "ftp-data":
                ftp_data.append(i)
    all_tcp_communication(ftp_data, outputfile, "FTP-data")


# pick all icmp frames from pcap
def icmp_communication(analyzedpcap, outputfile):
    icmp = []
    for i in analyzedpcap:
        if i.l4 == "ICMP":
            icmp.append(i)

    start = 1
    counter = 0
    srcIP = None
    destIP = None
    for i in icmp:
        if start == 1:
            srcIP = i.srcIP
            destIP = i.dstIP
            start = 0
            counter += 1
            print("IMCP communication:", counter)
            outputfile.write("IMCP communication: " + str(counter) + "\n")
        if srcIP != i.srcIP or destIP != i.dstIP:
            if i.dstIP != srcIP:
                srcIP = i.srcIP
                destIP = i.dstIP
                counter += 1
                print("IMCP communication:", counter)
                outputfile.write("IMCP communication: " + str(counter) + "\n")
        print_packet(i, outputfile)
        with open("ICMP.txt", "r") as file:
            for line in file:
                if line.split()[0] == str(int(i.hexdump[68:70], 16)):
                    print("Type of ICMP message:", line)
                    outputfile.write("Type of ICMP message: " + line + "\n")
                    print_hexdump(i, outputfile)
                    break
                elif line.split()[0] == "ZZ":
                    print("Additional data to previous frame\n")
                    outputfile.write("Additional data to previous frame\n")
                    print_hexdump(i, outputfile)


# pick all arp frames from pcap and separate them on request and reply
def arp_communication(analyzedpcap, outputfile):
    arprequest = []
    arpreply = []
    arpreply2 = []
    commnum = 0
    for i in analyzedpcap:
        if i.l3 == "ARP":
            if i.hexdump[42:44] == "01":
                arprequest.append(i)
            if i.hexdump[42:44] == "02":
                arpreply.append(i)

    # iterate through replies and pair every reply with request by its data
    for reply in arpreply:
        first = 1
        for request in arprequest:
            # source ip is on 56:64
            # destination ip is on 76:84
            if request.hexdump[56:64] == reply.hexdump[76:84] and request.hexdump[76:84] == reply.hexdump[56:64]:
                if first == 1:
                    commnum += 1
                    print("Communication number:", commnum)
                    outputfile.write("Communication number: " + str(commnum) + "\n")
                    print("ARP-Request, IP:", calc_ip(request.hexdump, 76, 84), "MAC address:")
                    outputfile.write("ARP-Request, IP: " + calc_ip(request.hexdump, 76, 84) + " MAC address: " + "\n")
                    print("Source IP:", calc_ip(request.hexdump, 56, 64), "Destination IP:",
                          calc_ip(request.hexdump, 76, 84))
                    outputfile.write("Source IP: " + calc_ip(request.hexdump, 56, 64) + " Destination IP: " + calc_ip(request.hexdump, 76, 84) + "\n")
                first = 0
                print_packet(request, outputfile)
                print_hexdump(request, outputfile)
                arprequest.remove(request)
                if reply.frameNumber > request.frameNumber:
                    print("ARP-Reply, IP:", calc_ip(reply.hexdump, 56, 64), "MAC address:", reply.srcMAC)
                    outputfile.write("ARP-Reply, IP: " + calc_ip(reply.hexdump, 56, 64) + " MAC address: " + reply.srcMAC + "\n")
                    print("Source IP:", calc_ip(reply.hexdump, 56, 64), "Destination IP:",
                          calc_ip(reply.hexdump, 76, 84))
                    outputfile.write("Source IP: " + calc_ip(reply.hexdump, 56, 64) + " Destination IP: " + calc_ip(reply.hexdump, 76, 84) + "\n")
                    print_packet(reply, outputfile)
                    print_hexdump(reply, outputfile)
                    arpreply2.append(reply)
                    break

    print("Requests without reply")
    outputfile.write("Requests without reply\n")
    for request in arprequest:
        print("ARP-Request, IP:", calc_ip(request.hexdump, 76, 84), "MAC address:")
        outputfile.write("ARP-Request, IP: " + calc_ip(request.hexdump, 76, 84) + " MAC address:\n")
        print("Source IP:", calc_ip(request.hexdump, 56, 64), "Destination IP:", calc_ip(request.hexdump, 76, 84))
        outputfile.write("Source IP: " + calc_ip(request.hexdump, 56, 64) + " Destination IP: " + calc_ip(request.hexdump, 76, 84) + "\n")
        print_packet(request, outputfile)
        print_hexdump(request, outputfile)

    print("Replies without requests")
    outputfile.write("Replies without requests\n")
    for reply in arpreply:
        if reply not in arpreply2:
            print("ARP-Reply, IP:", calc_ip(reply.hexdump, 56, 64), "MAC address:", reply.srcMAC)
            outputfile.write("ARP-Reply, IP: " + calc_ip(reply.hexdump, 56, 64) + " MAC address: " + reply.srcMAC + "\n")
            print("Source IP:", calc_ip(reply.hexdump, 56, 64), "Destination IP:", calc_ip(reply.hexdump, 76, 84))
            outputfile.write("Source IP: " + calc_ip(reply.hexdump, 56, 64) + " Destination IP: " + calc_ip(reply.hexdump, 76, 84) + "\n")
            print_packet(reply, outputfile)
            print_hexdump(reply, outputfile)


# pick all tftp frames from pcap
def tfpt_communication(analyzedpcap, outputfile):
    udp = []
    firsts = []
    for i in analyzedpcap:
        if i.l4 == "UDP":
            udp.append(i)
            if i.dstPort == "69":  # pick frames that has destination port 69 and mark them as start of communication
                firsts.append(i)
                udp.remove(i)

    # iterate through frames with destination port 69 and set needed information
    counter = 0
    for i in firsts:
        counter +=1
        print("\nTFTP communication", counter)
        outputfile.write("\nTFTP communication " + str(counter) + "\n")
        print_packet(i, outputfile)
        print("Opcode:", int(i.hexdump[84:88], 16))
        outputfile.write("Opcode: " + str(int(i.hexdump[84:88], 16)) + "\n")
        print_hexdump(i, outputfile)

        numone = 1
        newPort = None
        setLen = None
        # print rest of communication, end of communication is packet that has lesser length than others
        for j in udp:
            if i.frameNumber > j.frameNumber:
                continue
            if numone == 1:
                newPort = j.srcPort
                setLen = j.lenAPI
                numone = 0
            if j.srcPort == newPort:  # server
                print_packet(j, outputfile)
                print("Opcode:", int(j.hexdump[84:88], 16))
                outputfile.write("Opcode: " + str(int(j.hexdump[84:88], 16)) + "\n")
                if j.hexdump[84:88] == "0005":
                    print("Error")
                    outputfile.write("Error\n")
                    print_hexdump(j, outputfile)
                    break
                if setLen != j.lenAPI:
                    print("Last packet")
                    outputfile.write("Last packet\n")
                    print_hexdump(j, outputfile)
                    break
                print_hexdump(i, outputfile)
            if j.dstPort == newPort:  # client
                print_packet(j, outputfile)
                print("Opcode:", int(j.hexdump[84:88], 16))
                outputfile.write("Opcode: " + str(int(j.hexdump[84:88], 16)) + "\n")
                if j.hexdump[84:88] == "0005":
                    print("Error")
                    outputfile.write("Error\n")
                    print_hexdump(j, outputfile)
                    break
                print_hexdump(j, outputfile)


def main():
    pcap = rdpcap("vzorky_pcap_na_analyzu\\trace-16.pcap")  # path to pcap file location

    print("Type number and hit enter")
    print("1) to show every frame in pcap file")
    print("2) for HTTP communication")
    print("3) for HTTPS communication")
    print("4) for TELNET communication")
    print("5) for SSH communication")
    print("6) for FTP-control")
    print("7) for FTP-data")
    print("8) for TFTP communication")
    print("9) for ICMP communication")
    print("10) for ARP communication")
    val = input()

    outputFile = open("output.txt", "w")  # output file
    analyzedpcap = []
    listofnodes = []
    counter = 0
    for record in pcap:
        counter += 1
        frame = Frame()
        basic_info(record, counter, listofnodes, frame)
        analyzedpcap.append(frame)

    if val == "1":
        for i in analyzedpcap:
            print_packet(i, outputFile)
            print_hexdump(i, outputFile)
        if len(listofnodes) != 0:
            sending_nodes(listofnodes, outputFile)
    elif val == "2":
        http_communication(analyzedpcap, outputFile)
    elif val == "3":
        https_communication(analyzedpcap, outputFile)
    elif val == "4":
        telnet_communication(analyzedpcap, outputFile)
    elif val == "5":
        ssh_communication(analyzedpcap, outputFile)
    elif val == "6":
        ftp_control_communication(analyzedpcap, outputFile)
    elif val == "7":
        ftp_data_communication(analyzedpcap, outputFile)
    elif val == "8":
        tfpt_communication(analyzedpcap, outputFile)
    elif val == "9":
        icmp_communication(analyzedpcap, outputFile)
    elif val == "10":
        arp_communication(analyzedpcap, outputFile)

    print("\nOutput has been also written into following file:", outputFile.name)
    outputFile.close()


if __name__ == "__main__":
    main()
