#ifndef HASH_VLASTNY_H

struct HashNode{
    int value;
    char data[64];
    struct HashNode *next;
    int numberOfCollisions;
};

int hIsPrime(int number);

int hFindNextPrime(int number);

struct HashNode *hCreateNode(int val, char *string);

struct HashNode **hInit(int size);

int hHash(int value, char *string, int size);

void hInsert(int value, char *string, struct HashNode **table, int size, int *flagResize);

int hSearch(int value, char *string, struct HashNode **table, int size);

struct HashNode** hResize(struct HashNode **table, int *size);

#endif
