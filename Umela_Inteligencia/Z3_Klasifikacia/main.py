import math
import random
from math import sqrt
import matplotlib.pyplot as plt
import time

global all_points
global grid
global success


class Point:
    def __init__(self, x, y, color):
        self.x = x
        self.y = y
        self.color = color

    def __eq__(self, other):
        arr = [self.x, self.y]
        return arr == other

    def __hash__(self):
        return hash((self.x, self.y))

    def euclidean_distance(self, other):
        return sqrt(pow(other.x - self.x, 2) + pow(other.y - self.y, 2))

# pouziva sa pri sortovani najblizsich susedov
def take_second(value):
    return value[1]

# prida do listu vsetky body zo stvorca
def get_neighbours(neighbor_list, point, x, y):
    for i in grid[x][y]:
        if i != point:
            neighbor_list.append((i, i.euclidean_distance(point)))


def classify(point, k):
    global success
    neighbor_list = []
    # pre prvych 1000 bodov na ploche ich vsetkych povazuj ako susedov
    if len(all_points) < 1000:
        for i in all_points:
            if i != point:
                neighbor_list.append((i, i.euclidean_distance(point)))
    else:
        # rozdeluj plochu na mensie stvorce a vyber susedov iba z nich
        x = math.floor((point.x + 5000 - 1) / 1000)
        y = math.floor((point.y + 5000 - 1) / 1000)

        if (x - 1 >= 0) and (y - 1 >= 0):
            get_neighbours(neighbor_list, point, x - 1, y - 1)
        if y - 1 >= 0:
            get_neighbours(neighbor_list, point, x, y - 1)
        if (x + 1 <= 9) and (y - 1 >= 0):
            get_neighbours(neighbor_list, point, x + 1, y - 1)
        if x - 1 >= 0:
            get_neighbours(neighbor_list, point, x - 1, y)

        get_neighbours(neighbor_list, point, x, y)

        if x + 1 <= 9:
            get_neighbours(neighbor_list, point, x + 1, y)
        if (x - 1 >= 0) and (y + 1 <= 9):
            get_neighbours(neighbor_list, point, x - 1, y + 1)
        if y + 1 <= 9:
            get_neighbours(neighbor_list, point, x, y + 1)
        if (x + 1 <= 9) and (y + 1 <= 9):
            get_neighbours(neighbor_list, point, x + 1, y + 1)

    neighbor_list.sort(key=take_second)  # zorad najblizsich susedov
    neighbor_list = neighbor_list[:k]  # vyber k najblizsich
    r = 0
    g = 0
    b = 0
    p = 0
    # vypocitaj aka farba prevlada
    for i in neighbor_list:
        if i[0].color == "r":
            r += 1
        elif i[0].color == "g":
            g += 1
        elif i[0].color == "b":
            b += 1
        else:
            p += 1
    if r > max(g, b, p):
        most_common = "r"
    elif g > max(r, b, p):
        most_common = "g"
    elif b > max(r, g, p):
        most_common = "b"
    elif p > max(r, g, b):
        most_common = "m"
    else:
        most_common = point.color
    # ak sa farba nezmenila je to uspech
    if most_common == point.color:
        success += 1
    point.color = most_common


# generuje bod kdekolvek na celej ploche
def generate_random(color, k):
    global all_points
    while True:
        x = random.randint(-5000, 5000)
        y = random.randint(-5000, 5000)
        arr = hash((x, y))
        # skontroluj ci je pozicia prazdna
        if arr not in all_points:
            point = Point(x, y, color)
            grid[math.floor((x + 5000 - 1) / 1000)][math.floor((y + 5000 - 1) / 1000)].append(point)
            classify(point, k)
            all_points.add(point)
            break


# generuje cervene body
def generate_red(k):
    global all_points
    if random.randint(1, 100) != 100:
        while True:
            x = random.randint(-5000, 500)
            y = random.randint(-5000, 500)
            arr = hash((x, y))
            # skontroluj ci je pozicia prazdna
            if arr not in all_points:
                point = Point(x, y, "r")
                grid[math.floor((x + 5000 - 1) / 1000)][math.floor((y + 5000 - 1) / 1000)].append(point)
                classify(point, k)
                all_points.add(point)
                break
    else:
        generate_random("r", k)


# generuje zelene body
def generate_green(k):
    global all_points
    if random.randint(1, 100) != 100:
        while True:
            x = random.randint(-500, 5000)
            y = random.randint(-5000, 500)
            arr = hash((x, y))
            # skontroluj ci je pozicia prazdna
            if arr not in all_points:
                point = Point(x, y, "g")
                grid[math.floor((x + 5000 - 1) / 1000)][math.floor((y + 5000 - 1) / 1000)].append(point)
                classify(point, k)
                all_points.add(point)
                break
    else:
        generate_random("g", k)


# generuje modre body
def generate_blue(k):
    global all_points
    if random.randint(1, 100) != 100:
        while True:
            x = random.randint(-5000, 500)
            y = random.randint(-500, 5000)
            arr = hash((x, y))
            # skontroluj ci je pozicia prazdna
            if arr not in all_points:
                point = Point(x, y, "b")
                grid[math.floor((x + 5000 - 1) / 1000)][math.floor((y + 5000 - 1) / 1000)].append(point)
                classify(point, k)
                all_points.add(point)
                break
    else:
        generate_random("b", k)


# generuje fialove body
def generate_purple(k):
    global all_points
    if random.randint(1, 100) != 100:
        while True:
            x = random.randint(-500, 5000)
            y = random.randint(-500, 5000)
            arr = hash((x, y))
            # skontroluj ci je pozicia prazdna
            if arr not in all_points:
                point = Point(x, y, "m")
                grid[math.floor((x + 5000 - 1) / 1000)][math.floor((y + 5000 - 1) / 1000)].append(point)
                classify(point, k)
                all_points.add(point)
                break
    else:
        generate_random("m", k)


def generate(k):
    for i in range(5000):
        generate_red(k)
        generate_green(k)
        generate_blue(k)
        generate_purple(k)


def starting_points(i, coords, color):
    global all_points
    global grid
    x = coords[i][0]
    y = coords[i][1]
    point = Point(x, y, color)
    all_points.add(point)
    grid[math.floor((x + 5000 - 1) / 1000)][math.floor((y + 5000 - 1) / 1000)].append(point)


def init(k):
    for i in range(10):
        inner = []
        for j in range(10):
            inner.append([])
        grid.append(inner)
    list_R = [[-4500, -4400], [-4100, -3000], [-1800, -2400], [-2500, -3400], [-2000, -1400]]
    list_G = [[+4500, -4400], [+4100, -3000], [+1800, -2400], [+2500, -3400], [+2000, -1400]]
    list_B = [[-4500, +4400], [-4100, +3000], [-1800, +2400], [-2500, +3400], [-2000, +1400]]
    list_P = [[+4500, +4400], [+4100, +3000], [+1800, +2400], [+2500, +3400], [+2000, +1400]]

    for i in range(5):
        starting_points(i, list_R, "r")
        starting_points(i, list_G, "g")
        starting_points(i, list_B, "b")
        starting_points(i, list_P, "m")

    generate(k)

# vykresli vyslednu plochu
def scatter(k, elapsed_time):
    fig, axs = plt.subplots()
    list_of_x = []
    list_of_y = []
    list_of_c = []
    for j in all_points:
        list_of_x.append(j.x)
        list_of_y.append(j.y)
        list_of_c.append(j.color)
    axs.scatter(list_of_x, list_of_y, 50, c=list_of_c)
    axs.set_title("K = %i" % k)
    print("Success rate for k = {}: {:.2f}%,".format(k, (success / 20000) * 100),
          "time taken = {:.2f}".format(elapsed_time), "seconds")


def main():
    global success
    global grid
    global all_points
    k_values = [1, 3, 7, 15]

    for i in k_values:
        success = 0
        all_points = set()
        grid = []
        random.seed()
        start = time.time()
        init(i)
        end = time.time()
        scatter(i, end - start)
        plt.show()


if __name__ == '__main__':
    main()
