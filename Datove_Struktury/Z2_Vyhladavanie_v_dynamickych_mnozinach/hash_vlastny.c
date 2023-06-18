#include "hash_vlastny.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// overuje prvocislo
int hIsPrime(int number){
    if(number % 2 == 0 || number % 3 ==0) return 0;
    for (int i = 5; i * i <= number; ++i)
        if(number % i == 0) return 0;
    return 1;
}

//najde prvocislo vacie od cisla ktore mu pride, ak uz prvocislo prislo tak nehlada vacsie
int hFindNextPrime(int number){
    int prime = 0;
    while(!prime){
        prime = hIsPrime(number);
        number++;
    }
    number--;
    return number;
}

// vytvori zaznam
struct HashNode *hCreateNode(int val, char *string){
    struct HashNode *node = malloc(sizeof(struct HashNode));
    strcpy(node->data, string);
    node->value = val;
    node->numberOfCollisions = 0;
    node->next = NULL;
    return node;
}

// pripravi miesto v pameti pre zaznamy
struct HashNode **hInit(int size){
    struct HashNode** table = malloc(size * sizeof(struct HashNode));
    for (int i = 0; i < size; ++i) {
        table[i] = NULL;
    }
    return table;
}

// hasovacia funkcia s pouzitim hornerovej metody
int hHash(int value, char *string, int size){
    for (int i = 0; i < strlen(string); ++i) {
        value = (value * 31 + string[i]) % size;
    }
    return value;
}

// vkladanie zaznamov do tabulky
void hInsert(int value, char *string, struct HashNode **table, int size, int *flagResize){
    int key = hHash(value, string, size); //vypocet hashkodu
    struct HashNode *temp = table[key];
    //ak je index vyrataneho hashkodu prazdny vlozi zaznam
    if(table[key] == NULL){
        //printf("Record was inserted on index: %d \n", key);
        table[key] = hCreateNode(value, string);    //vlozenie do tabulky
    }
    // ak uz sa tam nieco nachadza vznikla kolizia, vytvori sa spajany zoznam na tomto indexe
    else{
       // printf("Index %d is already taken \n", key);
        table[key]->numberOfCollisions++; // na prvom zazname v indexe sa pocita kolko zaznamov je uz takto zretazenych
        while(temp->next != NULL){
            // ak sa snazime vlozit identicky zaznam ktory sa uz v  tabulke nachadza nespravi nic
            if (temp->value == value && strcmp(temp->data,string) == 0){
               // printf("Identical record is already in table, nothing has been inserted\n");
                return;
            }
            temp = temp->next;
        }
        //osetrenie vkladania identickeho zaznamu aj ked sa na indexe nachadza len jeden zaznam
        if (temp->value == value && strcmp(temp->data,string) == 0){
           // printf("Identical record is already in table, nothing has been inserted\n");
            return;
        }
        // vloz zaznam do spajaneho zoznamu
        temp->next = hCreateNode(value, string);
    }
    // ak je pocet zretazenych zaznamov na tomto idnexe vacsi ako je dane cislo tak budeme vytvarat novu tabulku
    if (*flagResize == 0 && table[key]->numberOfCollisions > 4) {
        *flagResize = 1;
        return;
    }
}

// hladanie zaznamov
int hSearch(int value, char *string, struct HashNode **table, int size){
    int key = hHash(value, string,size); // vyrata sa hash toho co chceme hladat
    int i=1;
    struct HashNode* temp = table[key];
    while(temp != NULL){
        // pozrieme sa na index vyrataneho hashkodu a prejdeme aj pripadny spajany zoznam ak najdeme zhodu vratime 1
        if(temp->value == value && strcmp(temp->data,string) == 0){
           // printf("Found searched record on index %d, its number %d record on this index, value = %d, data = %s\n", key,i,temp->value,temp->data);
            return 1;
        }
        i++;
        temp = temp->next;
    }
}

// vytvaranie novej tabulky
struct HashNode** hResize(struct HashNode **table, int *size){
    int insertFlag = -1;
    //printf("*** Resizing the table ***\n");
    int newSize = hFindNextPrime(2*(*size)); // najde novu velkost 2x vacsiu ako bola doteraz, velkost vrati ako prvocislo
    struct HashNode **newTable = hInit(newSize);
    struct HashNode *temp;
    struct HashNode *tempFree;
    //prejde kazdy index v tabulke ak sa tam nieco nachadza vyrata sa pre prvok novy hashkod pre zvecsenu tabulku
    for (int i = 0; i < *size; ++i) {
        temp = table[i];
        if(temp == NULL) {
            free(table[i]);
            continue;
        }
        else{
            while(temp != NULL){
                temp->numberOfCollisions = 0;
                hInsert(temp->value, temp->data, newTable, newSize, &insertFlag);
                tempFree = temp;
                temp = temp->next;
                free(tempFree);
            }
            free(temp);
        }
    }
    free(table);
    *size = newSize;
    return newTable;
}