#include "hash_vlastny.h"
#include "strom_vlastny.h"
#include "hash_prevzaty.h"
#include "strom_prevzaty.h"
#include <time.h>
#include <stdio.h>
#include <sys/time.h>

double timer(struct timeval start, struct timeval stop){
    long seconds = stop.tv_sec - start.tv_sec;
    long microseconds = stop.tv_usec - start.tv_usec;
    double elapsed = seconds + microseconds*1e-6;
    return elapsed;
}

void myAVLTree(FILE *f, int marker){
    // vseobecne premenne
    struct timeval start, stop;
    int number;
    char string[64];

    // dolezite premenne pre konkretnu implementaciu
    struct TreeNode *root = NULL;

    //nastavenie pozicie na prvy zaznam a spustenie casovaca
    fseek(f, marker,SEEK_SET);
    gettimeofday(&start, 0);

    // vkladanie zaznamov zo suboru
    while(fscanf(f,"%d %s\n",&number,string) != EOF){
        root = tInsert(root, number, string);
    }

    // zastavenie casovaca
    gettimeofday(&stop, 0);

    // vypocet casu ktory zabralo vkladanie
    printf("Time taken for insert: %f\n", timer(start, stop));

    // nastavenie pozicie na prvy zaznam a spustenie casovaca
    fseek(f, marker,SEEK_SET);
    gettimeofday(&start, 0);

    // vyhladavanie vsetkych vlozenych zaznamov
    while(fscanf(f,"%d %s\n",&number,string) != EOF){
        if(!tSearch(root, number, string, 0)) printf("Not found");
    }

    // zastavenie casovaca
    gettimeofday(&stop, 0);

    // vypocet casu ktory zabralo vyhladanie
    printf("Time taken for search: %f\n", timer(start,stop));
}

void internetRBTree(FILE *f, int marker){
    // vseobecne premenne
    struct timeval start, stop;
    int number;
    char string[64];

    // dolezite premenne pre konkretnu implementaciu
    struct Node* RBT = NULL;

    //nastavenie pozicie na prvy zaznam a spustenie casovaca
    fseek(f, marker,SEEK_SET);
    gettimeofday(&start, 0);

    // vkladanie zaznamov zo suboru
    while(fscanf(f,"%d %s\n",&number,string) != EOF){
        RBT = RB_insert(RBT,number,string);
    }

    // zastavenie casovaca
    gettimeofday(&stop, 0);

    // vypocet casu ktory zabralo vkladanie
    printf("Time taken for insert: %f\n", timer(start, stop));

    // nastavenie pozicie na prvy zaznam a spustenie casovaca
    fseek(f, marker,SEEK_SET);
    gettimeofday(&start, 0);

    // vyhladavanie vsetkych vlozenych zaznamov
    while(fscanf(f,"%d %s\n",&number,string) != EOF){
        if(!BST_search(RBT,number, string)) printf("Not found\n");
    }

    // zastavenie casovaca
    gettimeofday(&stop, 0);

    // vypocet casu ktory zabralo vyhladanie
    printf("Time taken for search: %f\n", timer(start,stop));
}

void myChainingHash(FILE *f,int marker){
    // vseobecne premenne
    struct timeval start, stop;
    int number;
    char string[64];

    // dolezite premenne pre konkretnu implementaciu
    int size = 50000;
    size = hFindNextPrime(size);
    struct HashNode **table;
    table = hInit(size);
    int flagResize = 0;

    //nastavenie pozicie na prvy zaznam a spustenie casovaca
    fseek(f, marker,SEEK_SET);
    gettimeofday(&start, 0);

    // vkladanie zaznamov zo suboru
    while(fscanf(f,"%d %s\n",&number,string) != EOF){
        hInsert(number, string, table, size, &flagResize);
        if(flagResize) table = hResize(table, &size);
        flagResize = 0;
    }

    // zastavenie casovaca
    gettimeofday(&stop, 0);

    // vypocet casu ktory zabralo vkladanie
    printf("Time taken for insert: %f\n", timer(start, stop));

    // nastavenie pozicie na prvy zaznam a spustenie casovaca
    fseek(f, marker,SEEK_SET);
    gettimeofday(&start, 0);

    // vyhladavanie vsetkych vlozenych zaznamov
    while(fscanf(f,"%d %s\n",&number,string) != EOF){
        if(!hSearch(number, string, table, size)) printf("Not found\n");
    }

    // zastavenie casovaca
    gettimeofday(&stop, 0);

    // vypocet casu ktory zabralo vyhladanie
    printf("Time taken for search: %f\n", timer(start,stop));
}

void internetOpenAddressingHash(FILE *f, int marker){
    // vseobecne premenne
    struct timeval start, stop;
    int number;
    char string[64];

    // dolezite premenne pre konkretnu implementaciu
    HashTable ht;
    size_t ssize = 5000000; //musi byt velke cislo, tabulka sa nespravne prehasuje tato implementacia s tym ma problem
    HashTableInit(&ht,ssize);

    //nastavenie pozicie na prvy zaznam a spustenie casovaca
    fseek(f, marker,SEEK_SET);
    gettimeofday(&start, 0);

    // vkladanie zaznamov zo suboru
    while(fscanf(f,"%d %s\n",&number,string) != EOF){
        HashTableInsert(&ht, number, string);
    }

    // zastavenie casovaca
    gettimeofday(&stop, 0);

    // vypocet casu ktory zabralo vkladanie
    printf("Time taken for insert: %f\n", timer(start, stop));

    // nastavenie pozicie na prvy zaznam a spustenie casovaca
    fseek(f, marker,SEEK_SET);
    gettimeofday(&start, 0);

    // vyhladavanie vsetkych vlozenych zaznamov
    while(fscanf(f,"%d %s\n",&number,string) != EOF){
        if(!HashTableFind(&ht, number, string)) printf("Not found\n");
    }

    // zastavenie casovaca
    gettimeofday(&stop, 0);

    // vypocet casu ktory zabralo vyhladanie
    printf("Time taken for search: %f\n", timer(start,stop));
}

void generateFile(FILE *f){
    int number;
    int randomNumberValue, randomNumberData;
    char alphabet[] = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    char randomChosenLetter;
    time_t t;

    srand(time(&t));
    f = fopen("data.txt","w");

    printf("Enter how much records will be generated\n");
    scanf("%d",&number);
    fprintf(f, "%d\n", number);

    for (int i = 0; i < number; ++i) {
        randomNumberValue = ( (rand() * rand()) % 1000000) + 1;
        randomNumberData = (rand() % 48) + 8;
        fprintf(f, "%d ", randomNumberValue);
        for (int j = 0; j < randomNumberData; ++j) {
            randomChosenLetter = alphabet[rand() % 52];
            fprintf(f, "%c", randomChosenLetter);
        }
        fprintf(f, "\n");
    }
    fclose(f);
}



int main() {
    FILE *f;
    int marker;
    int number;

    generateFile(f);

    f = fopen("data.txt", "r");
    fscanf(f,"%d\n",&number);   // prve cislo v subore je pocet zaznamov ktore subor obsahuje
    printf("Number of records: %d\n\n",number);
    marker = ftell(f);  // nastavi poziciu v subore na prvy zaznam


    //spusti vkladanie a nasledne vyhladavanie zaznamov pre kazdu implementaciu a zobrazi cas za ktory sa jednotlive implementacie vysporiadaju s datami

    printf("My chaining hashtable:\n");
    myChainingHash(f, marker);

    printf("\nMy AVL tree:\n");
    myAVLTree(f, marker);

    printf("\nInternet open addressing hashtable:\n");
    internetOpenAddressingHash(f, marker);

    printf("\nInternet RB tree:\n");
    internetRBTree(f, marker);

    fclose(f);

    return 0;
}

