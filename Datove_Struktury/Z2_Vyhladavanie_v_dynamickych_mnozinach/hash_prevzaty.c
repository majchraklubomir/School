//https://github.com/Triorwy/Hash-open-addressing

#include "hash_prevzaty.h"

void HashTableInit(HashTable *ht,size_t size)//初始化
{
    ht->_size = 0;
    ht->N = size;
    ht->_table = (pHashNode *)malloc(sizeof(pHashNode)*(ht->N));
    assert(ht->_table);
    for (size_t i = 0; i < ht->N; i++)//初始化状态
    {
        ht->_table[i]._status = Empty;
    }
}
size_t GetNextPrimeNum(size_t cur)//构建一个扩容数字，将扩容的值都存在里面,ul代表这些值得类型
{
    static const unsigned long _PrimeList[28] =
            {
                    53ul, 97ul, 193ul, 389ul, 769ul,
                    1543ul, 3079ul, 6151ul, 12289ul, 24593ul,
                    49157ul, 98317ul, 196613ul, 393241ul, 786433ul,
                    1572869ul, 3145739ul, 6291469ul, 12582917ul, 25165843ul,
                    50331653ul, 100663319ul, 201326611ul, 402653189ul, 805306457ul,
                    1610612741ul, 3221225473ul, 4294967291ul
            };
    for (int i = 0; i < 28; i++)
    {
        if (cur < _PrimeList[i])
        {
            cur = _PrimeList[i];
            return cur;
        }
    }
    return _PrimeList[27];
}
size_t HashFunc(KeyType key, size_t N)
{
    return key%N;//返回存储在数组里位置的下标
}
int HashTableInsert(HashTable *ht, KeyType key, ValueType *value)//插入
{
    if (10 * ht->_size / ht->N > 7)//超过负载因子，扩容
    {
        size_t newN = GetNextPrimeNum(ht->N);//得到新的扩容大小
        HashTable Newht;//创建新的结构体
        HashTableInit(&Newht, newN);
        for (size_t i = 0; i < ht->_size; i++)
        {
            //将原来结构体中存储的数字重新排布在新的结构体里
            HashTableInsert(&Newht, ht->_table[i]._key, ht->_table[i]._value);
        }
        free(ht->_table);//释放掉原来结构体里数组的内容
        ht->N = newN;//将新值赋给原来结构体
        ht->_table = Newht._table;

    }
    size_t Index = HashFunc(key, ht->N);//得到存储数字的下标
    while (ht->_table[Index]._status == Exits)//解决哈希冲突，使用开放地址法
    {//当发生哈希冲突时，如果哈希表未被装满，说明在哈希表中必然还有空位置，
        //那么可以把key存放到表中“下一个” 空位中去
        //printf("kolizia\n");
        if (ht->_table[Index]._key == key && strcmp(ht->_table[Index]._value,value) == 0)
        {
            return -1;
        }
        Index++;
        if (Index > ht->N)
        {
            Index = 0;
        }
    }
    ht->_table[Index]._key = key;
    strcpy(ht->_table[Index]._value,value);
    ht->_table[Index]._status = Exits;
    ht->_size++;
    return 0;
}


int HashTableFind(HashTable *ht, KeyType key, ValueType *value)//查找
{

    assert(ht);
    size_t Index = HashFunc(key, ht->N);
    if (key == ht->_table[Index]._key && strcmp(ht->_table[Index]._value,value) == 0)
    {
        return 1;//找到返回该节点
    }
    else
    {
        for (size_t i = 1; i <= ht->N; i++)
        {
            Index ++;//找下一个下标是否为该值
            if (Index > ht->N)//如果下标超过数组总大小，从头开始
            {
                Index = 0;
            }
            if (key == ht->_table[Index]._key && strcmp(ht->_table[Index]._value,value) == 0)
            {
                return 1;

            }
            if (Empty == ht->_table[Index]._status)//如果状态为空表示没有
            {
                return 0;

            }
        }
        return 0;
    }
}