import math
import random
from copy import deepcopy
import time


# globalne premenne pre rychlejsie modifikovanie programu
VELKOST_GENERACIE = 60  # kolko jedincov bude v jednej generacii
POCET_GENERACII = 200  # kolko generacii sa vygeneruje kym program skonci
POCET_MIEST = 50  # aka dlha bude cesta
VELKOST_TURNAJA = 5  # kolko jedincov sa vyberie z generacie pre turnajovy vyber
PRAVDEPODOBNOST_MUTACIE = 0.01  # pravdepodonost zmutovania jedinca


class Mesto():
    def __init__(self, x, y):
        self.x = x
        self.y = y


class Jedinec():
    def __init__(self):
        self.vzdialenost = 0
        self.fitness = 0
        self.cesta = []

    # pocita vzdialenost celej cesty cez pytagorovu vetu
    def vyrataj_vzdialenost(self):
        for i in range(len(self.cesta)):
            self.vzdialenost += math.sqrt(pow(self.cesta[i + 1].x - self.cesta[i].x, 2) + pow(self.cesta[i + 1].y - self.cesta[i].y, 2))
            i += 1
            if i == len(self.cesta) - 1:
                break

# nahodne vyberie permutaciu miest ktore musi obchodny cestujuci prejst
def prva_generacia(mesta):
    generacia = []
    for i in range(VELKOST_GENERACIE):
        jedinec = Jedinec()
        jedinec.cesta = random.sample(mesta, len(mesta))
        generacia.append(jedinec)
    return generacia

# pri rulete je max_fitness vzdy rovnake kedzde sa pouziva rank based fitness
MAX_FITNESS = 0


def ruleta(generacia):
    global MAX_FITNESS
    # max fitness staci vyratat len raz pre beh programu
    if MAX_FITNESS == 0:
        MAX_FITNESS = sum([jedinec.fitness for jedinec in generacia])
    # nahodne vyberie cislo od 0 az do maximalneho fitness
    nahodne = random.uniform(0, MAX_FITNESS)
    suma = 0
    # roztocenie rulety
    for jedinec in generacia:
        suma += jedinec.fitness
        if suma > nahodne:
            return jedinec


def turnaj(generacia):
    vyber = []
    # nahodne vyberieme sutaziacich do turnaja
    for i in range(VELKOST_TURNAJA):
        vyber.append(random.choice(generacia))

    # vitaz je ten ktory ma najmensiu vzdialenost
    vitaz = min(vyber, key=lambda jedinec: jedinec.vzdialenost)

    return vitaz


def mutacia(dieta):
    for i in range(len(dieta.cesta)):
        if random.random() < PRAVDEPODOBNOST_MUTACIE:
            mesto1 = random.randint(0, len(dieta.cesta)-1)
            dieta.cesta[mesto1], dieta.cesta[i] = dieta.cesta[i], dieta.cesta[mesto1]


def krizenie(generacia, rodicia):
    nova_generacia = []
    # vytvorame potomkov, vytvarame rovnaky pocet ako v predchadzajucej generacii
    for i in range(VELKOST_GENERACIE):
        if rodicia == "turnaj":
            rodic2 = turnaj(generacia)
            rodic1 = turnaj(generacia)
        else:
            rodic2 = ruleta(generacia)
            rodic1 = ruleta(generacia)

        # urcime usek ktory sa bude vkladat do potomka z prveho rodica
        bod1 = random.randint(0, len(rodic1.cesta))
        bod2 = random.randint(0, len(rodic1.cesta))

        zaciatok = min(bod1, bod2)
        koniec = max(bod1, bod2)

        dieta = Jedinec()

        # najprv vytvorime cestu potomka o velkosti vsetkych miest
        for j in range(len(rodic1.cesta)):
            dieta.cesta.append(None)

        # na rovnake miesto vlozime do potomka usek z prveho rodica
        for j in range(zaciatok, koniec):
            dieta.cesta[j] = rodic1.cesta[j]

        # doplnime vsetky ostatne mesta z druheho rodica ktore sa v potomkovi este nenachadzaju
        for j in range(len(rodic2.cesta)):
            if not rodic2.cesta[j] in dieta.cesta:
                for k in range(len(dieta.cesta)):
                    if dieta.cesta[k] is None:
                        dieta.cesta[k] = rodic2.cesta[j]
                        break

        mutacia(dieta)
        nova_generacia.append(dieta)
    return nova_generacia


def algoritmus(mesta):
    pocet_generacie = 0
    min_dlzka = 1000000
    # vytvorime prvu generaciu a jej duplikat aby bolo mozne dat rovnake startovacie podmienky pre 2 druhy selekcie rodicov
    generacia = prva_generacia(mesta)
    generacia1 = deepcopy(generacia)

    # aby sme vedeli aka bola najmensia vzdialenost pri prvej generacii pre porovnanie ucinnosti algoritmu
    for i in generacia:
        i.vyrataj_vzdialenost()
    pociatocna_vzdialenost = min(generacia, key=lambda jedinec: jedinec.vzdialenost)
    for i in generacia:
        i.vzdialenost = 0

    # ako prvy spustime algoritmus s turnajovym vyberom rodicov
    turnaj_start = time.time()
    while pocet_generacie < POCET_GENERACII:
        for i in generacia:
            i.vyrataj_vzdialenost()
        # zistime najmensiu vzdialenost v aktualnej generacii a ak je to najmensia zatial najdena zapametame si ju
        minimal = min(generacia, key=lambda jedinec: jedinec.vzdialenost)
        if min_dlzka > minimal.vzdialenost:
            min_dlzka = minimal.vzdialenost
            # print("GEN", pocet_generacie, "/ dlzka", format(min_dlzka, ".4f"))

        generacia = krizenie(generacia, "turnaj")
        pocet_generacie += 1
    turnaj_end = time.time()
    turnaj_min_dlzka = min_dlzka


    pocet_generacie = 0
    min_dlzka = 1000000
    generacia = generacia1

    # ako druhy spustime algoritmus s ruletovym vyberom rodicov kde fitness je rank based
    ruleta_start = time.time()
    while pocet_generacie < POCET_GENERACII:
        for i in generacia:
            i.vyrataj_vzdialenost()
        # populaciu musime zoradit aby bolo mozne jej pridelit rank, zoradenie je od najlepsieho jedinca po najhorsieho
        generacia.sort(key=lambda jedinec: jedinec.vzdialenost)
        # pridelenie ranku
        for i in range(len(generacia)):
            generacia[i].fitness = 1 / (i + 1)
        # zistime najmensiu vzdialenost v aktualnej generacii a ak je to najmensia zatial najdena zapametame si ju
        # staci sa pozriet na prveho jedinca v generacii kedze sme si ju zoradili a prvy ma urcite vzdy najmensiu dlzku
        if min_dlzka > generacia[0].vzdialenost:
            min_dlzka = generacia[0].vzdialenost
            # print("GEN", pocet_generacie, "/ dlzka", format(min_dlzka, ".4f"))

        generacia = krizenie(generacia, "ruleta")
        pocet_generacie += 1
    ruleta_end = time.time()
    ruleta_min_dlzka = min_dlzka

    print("Najkratsia vzdialenost z prvej generacie =", format(pociatocna_vzdialenost.vzdialenost, ".4f"))
    print("Turnaj najkratsia vzdialenost =", format(turnaj_min_dlzka, ".4f"), "cas =", format(turnaj_end - turnaj_start, ".2f"))
    print("Ruleta najkratsia vzdialenost =", format(ruleta_min_dlzka, ".4f"), "cas =", format(ruleta_end - ruleta_start, ".2f"))


def main():
    for i in range(1):
        global MAX_FITNESS
        MAX_FITNESS = 0
        print("Test", i + 1)
        mesta = []
        for j in range(POCET_MIEST):
            x = random.randint(0, 200)
            y = random.randint(0, 200)
            nove_mesto = Mesto(x, y)
            mesta.append(nove_mesto)
        algoritmus(mesta)


if __name__ == '__main__':
    main()
