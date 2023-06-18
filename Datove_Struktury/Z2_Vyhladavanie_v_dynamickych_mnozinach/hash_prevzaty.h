#ifndef HASH_PREVZATY_H
////https://github.com/Triorwy/Hash-open-addressing
#pragma once

#include<stdio.h>
#include<windows.h>
#include<assert.h>

typedef int KeyType;
typedef char ValueType;

typedef enum Status//设置三种状态状态，空，存在，删除
{
    Empty,
    Exits,
    Delete,
}Status;

typedef struct pHashNode//存储的内容
{
    KeyType _key;
    ValueType _value[64];
    Status _status;

}pHashNode;

typedef struct HashTable
{
    pHashNode* _table;
    size_t _size;//存储的个数
    size_t N;//表的大小

}HashTable;

size_t GetNextPrimeNum(size_t cur);//得到扩容的值
size_t HashFunc(KeyType key, size_t N);//得到数字存储的下标


void HashTableInit(HashTable *ht,size_t size);//初始化
int HashTableInsert(HashTable *ht, KeyType key,ValueType *value);//插入
int HashTableFind(HashTable *ht, KeyType key, ValueType *value);//查找





#endif
