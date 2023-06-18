from copy import deepcopy
from collections import deque
import time


class Auto:
    def __init__(self, farba, velkost, poziciaX, poziciaY, smer):
        self.farba = farba
        self.velkost = velkost
        self.poziciaX = poziciaX
        self.poziciaY = poziciaY
        self.smer = smer

    def __eq__(self, other):
        return self.farba == other.farba


class Stav:
    hlbka = 0

    def __init__(self, auto, pohyb, posun, plocha, auta, rodic):
        self.auto = auto
        self.pohyb = pohyb
        self.posun = posun
        self.plocha = plocha
        self.auta = auta
        self.deti = []
        self.rodic = rodic

    def pridaj_dieta(self, dieta):
        self.deti.append(dieta)

    def __eq__(self, other):
        return self.plocha == other.plocha


def obmedzene_prehladavanie_do_hlbky(limit, rad, nespracovane, spracovane):
    navstivene = []  # pomaha pri prechadzani stromu v kazdej iteracii
    prejdene = 0  # pocita kolko uzlov presiel v danej hlbke ked nasiel riesenie
    while rad:
        aktualny = rad.pop()  # vyberie uzol z fronty na pravej strane
        navstivene.append(aktualny)

        # ak je to cielovy stav vypise riesenie a ukonci hladanie
        if aktualny.plocha[2][5] == "cervene":
            cesta = [aktualny.posun, aktualny.auto, aktualny.pohyb]
            rodic = aktualny.rodic
            while rodic.auto is not None:
                cesta.append(rodic.posun)
                cesta.append(rodic.auto)
                cesta.append(rodic.pohyb)
                rodic = rodic.rodic
            print("Prejdene stavy:", prejdene)
            for i in range(len(cesta)-1, 0, -3):
                print(cesta[i].upper(), "(", cesta[i-1], ", ", cesta[i-2], ")", sep="")
            return True

        # ohranicenie hladanie do hlbky
        if aktualny.hlbka < limit:
            prejdene += 1
            # kontroluje ci uzol bol spracovany
            if aktualny in nespracovane:
                nespracovane.remove(aktualny)
            # kontroluje ci uz ma vytvorenych potomkov
            if not aktualny.deti:
                spracovane.insert(0, aktualny)
                nove_stavy(aktualny) # vytvori potomkov
                # vytriedi opakujucich sa potomkov
                for i in aktualny.deti[:]:
                    if i not in spracovane:
                        nespracovane.append(i)
                    else:
                        aktualny.deti.remove(i)
            # prida nenavstivenych potomkov do fronty
            for i in aktualny.deti:
                if i not in navstivene:
                    rad.append(i)
                    navstivene.append(i)
    return False


def algoritmus(root):
    limit = 1
    nespracovane = [root]
    spracovane = []
    # nekonecna slucka
    while True:
        rad = deque()
        rad.append(root)  # vzdy zacne od vrchu
        if obmedzene_prehladavanie_do_hlbky(limit, rad, nespracovane, spracovane):
            return True
        # ak uz neexistuje ziaden nespracovany uzol
        if not nespracovane:
            print("nema riesenie")
            return False
        limit += 1


def nove_stavy(uzol):
    # postupne pohne kazdym autom na krizovatke do vsetkych smerov a o vsetky mozne vzdialenosti
    for auto in uzol.auta:
        for posun in range(1, 5, 1):
            if vpravo(uzol.plocha, auto, posun):
                # kontrola spetneho tahu
                if uzol.auto == auto.farba and uzol.pohyb == "vlavo" and uzol.posun == posun:
                    continue
                # nakopiruje podstatne informacie pre novy uzol
                nova_plocha = [x[:] for x in uzol.plocha]
                nove_auto = deepcopy(auto)
                nove_auta = deepcopy(uzol.auta)

                # vykona samotny posun na krizovatke a upravi poziciu v objekte auta
                for poz in range(0, posun, 1):
                    nova_plocha[nove_auto.poziciaX][nove_auto.poziciaY] = "-"
                    nove_auto.poziciaY += 1
                    nova_plocha[nove_auto.poziciaX][nove_auto.poziciaY + nove_auto.velkost - 1] = nove_auto.farba
                if auto in nove_auta:
                    nove_auta.remove(auto)
                nove_auta.append(nove_auto)

                # vytvori novy uzol upravi jeho hlbku a prida ho ako dieta
                novy_uzol = Stav(nove_auto.farba, "vpravo", posun, nova_plocha, nove_auta, uzol)
                novy_uzol.hlbka = uzol.hlbka + 1
                uzol.pridaj_dieta(novy_uzol)

            if vlavo(uzol.plocha, auto, posun):
                # kontrola spetneho tahu
                if uzol.auto == auto.farba and uzol.pohyb == "vpravo" and uzol.posun == posun:
                    continue
                # nakopiruje podstatne informacie pre novy uzol
                nova_plocha = [x[:] for x in uzol.plocha]
                nove_auto = deepcopy(auto)
                nove_auta = deepcopy(uzol.auta)

                # vykona samotny posun na krizovatke a upravi poziciu v objekte auta
                for poz in range(0, posun, 1):
                    nova_plocha[nove_auto.poziciaX][nove_auto.poziciaY + auto.velkost - 1] = "-"
                    nove_auto.poziciaY -= 1
                    nova_plocha[nove_auto.poziciaX][nove_auto.poziciaY] = nove_auto.farba
                if auto in nove_auta:
                    nove_auta.remove(auto)
                nove_auta.append(nove_auto)

                # vytvori novy uzol upravi jeho hlbku a prida ho ako dieta
                novy_uzol = Stav(nove_auto.farba, "vlavo", posun, nova_plocha, nove_auta, uzol)
                novy_uzol.hlbka = uzol.hlbka + 1
                uzol.pridaj_dieta(novy_uzol)

            if hore(uzol.plocha, auto, posun):
                # kontrola spetneho tahu
                if uzol.auto == auto.farba and uzol.pohyb == "dole" and uzol.posun == posun:
                    continue
                # nakopiruje podstatne informacie pre novy uzol
                nova_plocha = [x[:] for x in uzol.plocha]
                nove_auto = deepcopy(auto)
                nove_auta = deepcopy(uzol.auta)

                # vykona samotny posun na krizovatke a upravi poziciu v objekte auta
                for poz in range(0, posun, 1):
                    nova_plocha[nove_auto.poziciaX + nove_auto.velkost - 1][nove_auto.poziciaY] = "-"
                    nove_auto.poziciaX -= 1
                    nova_plocha[nove_auto.poziciaX][nove_auto.poziciaY] = nove_auto.farba
                if auto in nove_auta:
                    nove_auta.remove(auto)

                # vytvori novy uzol upravi jeho hlbku a prida ho ako dieta
                nove_auta.append(nove_auto)
                novy_uzol = Stav(nove_auto.farba, "hore", posun, nova_plocha, nove_auta, uzol)
                novy_uzol.hlbka = uzol.hlbka + 1
                uzol.pridaj_dieta(novy_uzol)

            if dole(uzol.plocha, auto, posun):
                # kontrola spetneho tahu
                if uzol.auto == auto.farba and uzol.pohyb == "hore" and uzol.posun == posun:
                    continue
                # nakopiruje podstatne informacie pre novy uzol
                nova_plocha = [x[:] for x in uzol.plocha]
                nove_auto = deepcopy(auto)
                nove_auta = deepcopy(uzol.auta)

                # vykona samotny posun na krizovatke a upravi poziciu v objekte auta
                for poz in range(0, posun, 1):
                    nova_plocha[nove_auto.poziciaX][nove_auto.poziciaY] = "-"
                    nove_auto.poziciaX += 1
                    nova_plocha[nove_auto.poziciaX + auto.velkost - 1][nove_auto.poziciaY] = nove_auto.farba
                if auto in nove_auta:
                    nove_auta.remove(auto)

                # vytvori novy uzol upravi jeho hlbku a prida ho ako dieta
                nove_auta.append(nove_auto)
                novy_uzol = Stav(nove_auto.farba, "dole", posun, nova_plocha, nove_auta, uzol)
                novy_uzol.hlbka = uzol.hlbka + 1
                uzol.pridaj_dieta(novy_uzol)


# nasledujuce 4 funkcie su velmi podobne a sluzia na kontrolu ci je mozne vykonat pohyb po krizovatke v danom smere
# o dany pocet policok
def vpravo(plocha, auto, i):
    if auto.smer == "v":
        return False
    riadok = auto.poziciaX
    poziciaY = auto.poziciaY + auto.velkost - 1
    stlpec = poziciaY + i
    if stlpec < 6:
        j = poziciaY
        while j < stlpec:
            j += 1
            if plocha[riadok][j] != "-":
                return False
        return True
    else:
        return False


def vlavo(plocha, auto, i):
    if auto.smer == "v":
        return False
    riadok = auto.poziciaX
    stlpec = auto.poziciaY - i
    if stlpec > -1:
        for j in range(stlpec, auto.poziciaY, 1):
            if plocha[riadok][j] != "-":
                return False
        return True
    else:
        return False


def hore(plocha, auto, i):
    if auto.smer == "h":
        return False
    riadok = auto.poziciaX - i
    stlpec = auto.poziciaY
    if riadok > -1:
        for j in range(riadok, auto.poziciaX, 1):
            if plocha[j][stlpec] != "-":
                return False
        return True
    else:
        return False


def dole(plocha, auto, i):
    if auto.smer == "h":
        return False
    poziciaX = auto.poziciaX + auto.velkost - 1
    riadok = poziciaX + i
    stlpec = auto.poziciaY
    if riadok < 6:
        j = poziciaX
        while j < riadok:
            j += 1
            if plocha[j][stlpec] != "-":
                return False
        return True
    else:
        return False


def main():
    auta = []
    plocha = []
    # vytvori krizovatku
    for riadok in range(6):
        plocha.append([])
        for stlpec in range(6):
            plocha[riadok].append("-")

    # definuje odkial ma zobrat vstup
    # vstup je vo formate (farbaAuta, velkost, poziciaX, poziciaY, smer)
    with open("test1.txt", "r") as file:
        for line in file:
            auto = Auto(line.split()[0], int(line.split()[1]), int(line.split()[2]), int(line.split()[3]),
                        line.split()[4])
            auta.append(auto)

    # prida na krizovatku auta podla ich startovacej pozicie
    for a in auta:
        if a.smer == "h":
            for stlpec in range(a.poziciaY, a.poziciaY + a.velkost, 1):
                plocha[a.poziciaX][stlpec] = a.farba
        else:
            for riadok in range(a.poziciaX, a.poziciaX + a.velkost, 1):
                plocha[riadok][a.poziciaY] = a.farba

    root = Stav(None, None, None, plocha, auta, None)
    start = time.time()
    algoritmus(root)
    end = time.time()
    print("Cas vykonania programu:", format(end - start, ".4f"))


if __name__ == '__main__':
    main()
