#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <math.h>

// reprezentacia boolovskej funkcie
struct BF;

// uzol v strome
struct BDD_node{
    char *vector;
    struct BDD_node *next;
    struct BDD_node *low;
    struct BDD_node *high;
};

//strom
struct BDD{
    int numberOfVariables;
    int sizeOfTree;
    struct BDD_node *root;
};

//globalna premenna pre pole ukazovatelov na struktury, tu sa tvoria spajane zoznamy pre zaznamenavanie jedinecnych uzlov
struct BDD_node **array;

// tvorenie spajaneho zoznamu pre jedinecne uzly
void add(struct BDD_node *node, int index){
    if(array[index] == NULL){
        array[index] = node;
        return;
    }
    struct BDD_node *temp = array[index];
    while (temp->next != NULL){
        if(strcmp(temp->vector, node->vector) == 0)
            return;
        temp = temp->next;
    }
    if(strcmp(temp->vector, node->vector) == 0)
        return;
    temp->next = node;
}

// tvorenie stromu pomocou delenia vektora na na polovicu prva polovica ide do laveho potomka drhua ide do praveho
struct BDD_node *insert(struct BDD_node *node, char *bfunkcia){
    int len = (int) strlen(bfunkcia);
    node = malloc(sizeof(struct BDD_node));
    node->vector = malloc(len * sizeof(char) + 1);
    node->high = NULL;
    node->low = NULL;
    node->next = NULL;
    strcpy(node->vector, bfunkcia);
    if(len == 1){
       add(node, 0);
       return node;
    }
    add(node, (int) log2(len));
    len /= 2;
    char *high, *low;
    high = malloc(len * sizeof(char) + 1);
    low = malloc(len * sizeof(char) + 1);

    for (int i = 0; i < len; ++i) {
        low[i] = bfunkcia[i];
        high[i] = bfunkcia[i + len];
    }
    low[len] = '\0';
    high[len] = '\0';

    node->low = insert(node->low, low);
    node->high = insert(node->high, high);
    free(bfunkcia);

    return node;
}

// vytvorenie stromu a informacii o nom
struct BDD *BDD_create(struct BF *bfunkcia){
    struct BDD *newBDD = malloc(sizeof(struct BDD));
    char *pointer = (char *) bfunkcia;
    int len = (int) strlen(pointer);

    newBDD->numberOfVariables = (int) log2(len);
    newBDD->sizeOfTree = (int) pow(2, newBDD->numberOfVariables + 1) - 1;
    newBDD->root = NULL;

    array = malloc((newBDD->numberOfVariables +1 ) * sizeof(struct BDD_node));
    for (int i = 0; i < newBDD->numberOfVariables + 1; ++i) {
        array[i] = malloc(sizeof(struct BDD_node));
        array[i] = NULL;
    }
    newBDD->root = insert(newBDD->root, pointer);
    return newBDD;
}

// odstranuje uzly na rovnakej urovni ktore su duplicitne
void reduceRow(struct BDD_node *node, int index, struct BDD *bdd){
    if (node == NULL )
        return;
    //vzdy sa porovnavaju potomkovia uzla
    if(strlen(array[index+1]->vector) == strlen(node->vector)){
        struct BDD_node *temp = array[index];
        while(temp != NULL){
            if(strcmp(temp->vector, node->low->vector) == 0 && temp != node->low){
                struct BDD_node *temp1 = node->low;
                node->low = temp;
                free(temp1->vector);
                free(temp1);
                bdd->sizeOfTree--;
            }
            if(strcmp(temp->vector, node->high->vector) == 0 && temp != node->high){
                struct BDD_node *temp1 = node->high;
                node->high = temp;
                free(temp1->vector);
                free(temp1);
                bdd->sizeOfTree--;
            }
            temp = temp->next;
        }
    }
    reduceRow(node->low, index, bdd);
    reduceRow(node->high, index, bdd);
}
// pre kazdu uroven sa musi spravit redukcia
void reduceRows(struct BDD_node *node, struct BDD *bdd){
    for (int i = 1; i < bdd->numberOfVariables + 1; ++i)
       reduceRow(node, i - 1, bdd);
}
// redukcia uzlov bez pridanej hodnoty tu sa este neuvolnia z pamete pretoze by to pokazilo spajane zoznamy v array
void reduceBranch(struct BDD_node *node, struct BDD *bdd){
    if (node == NULL || strlen(node->vector) == 1)
        return;
    if(node->low->low != NULL && node->low->high != NULL && strcmp(node->low->low->vector, node->low->high->vector) == 0){
        node->low = node->low->low;
        bdd->sizeOfTree--;
    }
    if(node->high->low != NULL && node->high->high != NULL && strcmp(node->high->low->vector, node->high->high->vector) == 0){
        node->high = node->high->high;
        bdd->sizeOfTree--;
    }
    if(strlen(node->low->vector) > 1)
        reduceBranch(node->low, bdd);
    if(strlen(node->high->vector) > 1)
        reduceBranch(node->high, bdd);
}

//funkia ktora spusta redukciu najprv po urovniach a potom po vetvach
int BDD_reduce(struct BDD *bdd){
    if(bdd == NULL || bdd->root == NULL){
        printf("BDD_reduce bad input\n");
        return -1;
    }
    int result = bdd->sizeOfTree;
    reduceRows(bdd->root, bdd);
    reduceBranch(bdd->root, bdd);
    result -= bdd->sizeOfTree;
    if(bdd->root == NULL || result < 0) return -1;
    return result;
}
//kontrolovania ci je strom poskladany dobre
char BDD_use(struct BDD *bdd, char *vstupy){
    if(strlen(vstupy) > bdd->numberOfVariables) return 3;
    struct BDD_node *node = bdd->root;
    int len;
    for (int i = 0; i <= strlen(vstupy); ++i) {
        if(strlen(node->vector) == 1){
            break;
        }
        // 'len' sa pocita kvoli redukcii uzlov bez pridanej hodnoty vzdy je tam postupnost ze log2 z dlzky vektora musi
        // byt o jedno mensie ak je to viac 'i' sa prirata o tu hodnotu a preskakuju sa nejake hodnoty zo vstupu
        if(vstupy[i] == '0') {
            len = (int) log2((int) strlen(node->vector)) - (int) log2((int) strlen(node->low->vector));
            len--;
            i += len;
            node = node->low;
        }
        else {
            len = (int) log2((int) strlen(node->vector)) - (int) log2((int) strlen(node->high->vector));
            len--;
            i += len;
            node = node->high;
        }
    }
    if(strcmp(node->vector, "1") == 0) return '1';
    else if(strcmp(node->vector, "0") == 0) return '0';
    else return '3';
}

int iterator = 0; // sluzi na kontrolu aby som vedel skontrolovat ci mi BDD_use vracia spravne hodnoty
double timeForUse = 0; //globalna premenna pre meranie casu BDD_use

void permutations(struct BDD *bdd, const char *vars, char *string, int length){
    if (length == 0){
        clock_t start, end;
        start = clock();
        char result = BDD_use(bdd,string);
        end = clock();
        timeForUse += ((double) (end - start));
        //tu sa kontroluje spravnost
        if(result != bdd->root->vector[iterator]){
            printf("BDD_use returned value different than expected");
            if(result == '3') {
                printf(" it is an error value");
            }
            printf("\n");
        }
        iterator++;
        free(string);
        return;
    }
    for (int i = 0; i < 2; i++){
        char* newPermutation;
        newPermutation = malloc(strlen(string) * sizeof(char) + 2);
        strcpy(newPermutation, string);
        newPermutation[strlen(string)] = vars[i];
        newPermutation[strlen(string) + 1] = '\0';
        permutations(bdd, vars, newPermutation, length - 1);
    }
}
// uvolnenie spajanych zoznamov a teda uvolnenie celeho stromu
void freeEverything(struct BDD *bdd){
    struct BDD_node *temp;
    for (int i = 0; i < bdd->numberOfVariables + 1; ++i) {
        while(array[i] != NULL){
            temp = array[i];
            array[i] = array[i]->next;
            temp->next = NULL;
            free(temp->vector);
            free(temp);
        }
    }
    free(array);
    free(bdd);
}
//testovanica funkcia

void test(int numOfTrees, int numOfVariables){
    clock_t start, end;
    double timeForCreate = 0;
    double timeForReduce = 0;
    double averageReduced = 0;
   // double timeForUseBeforeReduce = 0;
    double timeForUseAfterReduce = 0;
    int totalTreeNodesReduced = 0;
    for (int i = 0; i < numOfTrees; ++i) {
        struct BDD *bdd = NULL;
        srand(time(NULL));

        char vars[] = {'0', '1'};
        char *vector;
        int numOfVars = (int) pow(2, numOfVariables);
        vector = malloc(numOfVars * sizeof(char) + 1);
        //nahodne sa vygeneruje ziadany pocet znakov podla toho kolko je premennych
         for (int j = 0; j < numOfVars; ++j) {
             vector[j] = vars[rand() % 2];
         }
        vector[numOfVars] = '\0';

        start = clock();
        bdd = BDD_create((struct BF*) vector);
        end = clock();
        timeForCreate += ((double) (end - start));

        int length = bdd->numberOfVariables;

        start = clock();
        totalTreeNodesReduced += BDD_reduce(bdd);
        end = clock();
        timeForReduce += ((double) (end - start));

        permutations(bdd, vars, "", length);
        timeForUseAfterReduce += timeForUse;
        iterator = 0;
        timeForUse = 0;

        freeEverything(bdd);
    }
    timeForCreate /= CLOCKS_PER_SEC;

    timeForReduce /= CLOCKS_PER_SEC;

    double timeForUseWholeTree = timeForUseAfterReduce / CLOCKS_PER_SEC;
    timeForUseAfterReduce /= (pow(2,13));
    timeForUseAfterReduce /= CLOCKS_PER_SEC;

    averageReduced = totalTreeNodesReduced / (numOfTrees * (pow(2,numOfVariables+1) - 1));

    printf("Test with %d trees with %d variables\n",numOfTrees, numOfVariables);
    printf("Average reduction per tree %.2f%%\n",averageReduced * 100);
    printf("Average time taken for BDD_create %.3fms\n",(timeForCreate / numOfTrees) * 1000);
    printf("Average time taken for BDD_reduce %.3fms\n",(timeForReduce / numOfTrees) * 1000);
    printf("Average time taken for BDD_use after reduce %fms\n",(timeForUseAfterReduce / numOfTrees) * 1000);
    printf("Average time taken for BDD_use every possible combination after reduce %.3fms\n",(timeForUseWholeTree / numOfTrees) * 1000);
    printf("Sum of average times per tree (with BDD_use called on reduced tree) %.3fms\n", ((timeForCreate + timeForUseWholeTree + timeForReduce) / numOfTrees) * 1000);
}

int main() {
    clock_t start, end;
    double totalTime;
    start = clock();
    test(2000, 13);
    end = clock();
    totalTime = ((double) (end - start)) / CLOCKS_PER_SEC;
    printf("Total time from starting program till end %.4fs\n",totalTime);

    return 0;
}