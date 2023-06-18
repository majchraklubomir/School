/*//////////////////////////
Autor: Lubomir Majchrak
Projekt: DSA1-Spravca Pamati
///////////////////////////*/

#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <time.h>

#define HEADER (sizeof(int) + sizeof(char)) //velkost hlavicky bloku

void *memory; //ukazovatel na zaciatok pamete s ktorou program pracuje

// prvotna inicializacia pamete, vytvori sa hlavicka pre celu pamet a vytvori sa prvy volny blok
void memory_init(void *ptr, unsigned int size){
    for (int i = 0; i<size; i++)
        *((char*) ptr + i) = -2;

    memory = ptr;
    *(unsigned int*) ptr = size; // prve 4 bajty spravovanej pameti oznacuju jej celkovu velkost
    ptr += sizeof(int); // posun na prvy volny blok v pameti
    *(unsigned int*) ptr = size - sizeof(int); // vytvorenie hlavicky
    *((char*) ptr + sizeof(int)) = 1; // oznacenie bloku ako volny
}

void *memory_alloc(unsigned int size){
    void *p = memory + sizeof(int); //nastavuje pointer na prvy blok pamete
    // kontroluje aby sa pointer nedostal za hranicu spravovanej pamete
    while( p < (memory + *((int*) memory)) ){
        // first fit algoritmus
        // najst sa musi taky volny blok pamete ktory ma minimalnu velkost aspon o 6 bajtov vacsiu ako je pozadovana
        // pretoze hlavika bloku tvori 5 bajtov a ostane vzdy aspon 1 bajt pre pridelenie v novom bloku
        if((*(int*) p == (size + HEADER)) && (*((char*) p + sizeof(int)) == 1)){
            *((char*) p + sizeof(int)) = -1; //oznaci blok pamete ako prideleny

            return p + HEADER;
        }
        else if(((*(int*) p > (size + HEADER)) && ((*(int*) p <= (size + HEADER + HEADER))) && (*((char*) p + sizeof(int)) == 1)) && (p+(size + HEADER + HEADER)) < (memory + *((int*) memory))){
            *((char*) p + sizeof(int)) = -1; //oznaci blok pamete ako prideleny

            return p + HEADER;
        }
        else if( (*(int*) p > (size + HEADER + HEADER)) && (*((char*) p + sizeof(int)) == 1) ) {
            *((char*) p + sizeof(int)) = -1; //oznaci blok pamete ako prideleni
            *((unsigned int*) (p + size + HEADER)) = *(unsigned int*) p - (size + HEADER ); //velkost noveho bloku ktory vznikne po rozdeleni
            *(unsigned int*) p = size + HEADER; // velkost pamete prideleneho bloku
            *((char*) p + *(int*) p + sizeof(int)) = 1; // nastavuje novo vzniknuty blok po rozdeleni ako volny

            return p + HEADER; // vrati ukazovatel na pridelenu pamet az za hlavickou
        }

        p += *(int*) p; // posunie sa na dalsi blok v poradi
    }
    return NULL;
}

int memory_free(void *valid_ptr){
    if ((*((char*) valid_ptr - sizeof(char)) == -1) && (valid_ptr >= memory && valid_ptr < memory + *((int*) memory))){
        *((char*) valid_ptr - sizeof(char)) = 1; // nastavuje blok ako volny
        void *ptr = memory + sizeof(int);

        // prejde bloky v pameti a spoji tie ktore su uvolnene, volne bloky musia nasledovat za sebou aby sa spojili
        while (ptr < (memory + *((int*) memory))){
            if ((ptr + *(char*) ptr + sizeof(int) < memory + *((int*) memory)) && (*((char*) (ptr + *(char*) ptr + sizeof(int))) == 1)
            && (*((char*) ptr+4) == 1)){
                *((unsigned char*) ptr) += *(unsigned char*) (ptr + *(unsigned char*) ptr);

                for (int i = 5; i < *(int*) ptr; ++i) {
                    *((char*) ptr + i) = -2;
                }
            }

            ptr += *(int*) ptr;
        }

        return 0;
    }
    else return 1;
}

// ak je ukazovatel na blok pamete platny vrati 1 inak vrati 0
int memory_check(void *ptr){
    if ((*((char*) ptr - sizeof(char)) == -1) || (*((char*) ptr - sizeof(char)) == 1) && (ptr >= memory && ptr < memory + *((int*) memory))) return 1;
    else return 0;
}

void test1(char *region, int Block, int maxMemomry){
    memset(region,0,10000);
    memory_init(region,maxMemomry);
    int count=0;
    for (int i = 0; i < maxMemomry; i++){
        if (memory_alloc(Block)) count+=Block;
    }
    printf("Z povodnych %d bajtov pri velkosti bloku %d bolo alokovanych %d blokov\n",maxMemomry,Block,count/Block);
}

void test2(char *region, int minBlock, int maxBlock,int minMemory, int maxMemomry){
    memset(region,0,100000);
    srand(time(0));
    int predicated=0,real=0,j=0;
    int predicatedCount=0,realCount=0;

    int block = rand() % (maxBlock - minBlock + 1) + minBlock;
    int randMemory = rand() % (maxMemomry - minMemory + 1) + minMemory;
    char *allocPtr[randMemory];
    memory_init(region,randMemory);

    for (int i = 0; i < randMemory; i++){
        if(predicated + block > randMemory){
            block = rand() % (maxBlock - minBlock + 1) + minBlock;
            continue;
        }

        predicated += block;
        predicatedCount++;
        allocPtr[j] = memory_alloc(block);

        if (allocPtr[j]) {
            real +=block;
            realCount++;
            j++;
        }

        block = rand() % (maxBlock - minBlock + 1) + minBlock;
    }
    for (int i = 0; i < j; i++) {
        if (memory_check(allocPtr[i])){
            memory_free(allocPtr[i]);
        }
        else printf("chyba");
    }

    printf("Z povodnych %d bajtov pri nahodnej velkosti blokov od  %d do %d bolo alokovanych %d bajtov a %.2f%% blokov\n",randMemory,minBlock,maxBlock,real,((float)(real) / (float)predicated)*100);
}

int main(){
    char region[100000];
   /* test1(region, 8, 50);
    test1(region, 16, 100);
    test1(region, 24, 200);
    test2(region, 8, 24, 50, 200);
    test2(region, 500, 5000, 1000, 20000);
    test2(region, 8, 50000, 1000, 60000);
    */

    memory_init(region,500);
    char* a = (char*) memory_alloc(10);
    char* b = (char*) memory_alloc(16);
    char* c = (char*) memory_alloc(15);
    char* d = (char*) memory_alloc(24);
    memory_free(c);
    char* e = (char*) memory_alloc(8);

    return 0;
}