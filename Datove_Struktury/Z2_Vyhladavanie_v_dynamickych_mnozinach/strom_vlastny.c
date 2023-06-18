#include "strom_vlastny.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>



// vytvori novy uzol v strome
struct TreeNode *tCreateNode(int val,char *string){
    struct TreeNode *newNode = malloc(sizeof(struct TreeNode));
    strcpy(newNode->data,string);
    newNode->value = val;
    newNode->height = 1;
    newNode->left = NULL;
    newNode->right = NULL;
    return newNode;
}

// vrati vysku uzla
int tGetNodeHeight(struct TreeNode *node){
    if(node == NULL) return 0;
    else return node->height;
}

// vyrata novu vysku uzla (pri vkladani alebo pri rotacii)
int tNewNodeHeight(struct TreeNode *node){
    if(tGetNodeHeight(node->right) == 0 && tGetNodeHeight(node->left) == 0)
        return 0;
    else if(tGetNodeHeight(node->right) > tGetNodeHeight(node->left))
        return node->right->height;
    else return node->left->height;
}

// porovnava balanc medzi pravou a lavou vetvou stromu
int tIsBalanced(struct TreeNode *node){
    return tGetNodeHeight(node->right) - tGetNodeHeight(node->left);
}

// 4 pripady ktore mozu nastat ked sa strom balancuje
struct TreeNode *tLeftRotation(struct TreeNode *node){
    struct TreeNode *temp = node->right;

    node->right = temp->left;
    temp->left = node;
    // pre uzly ktore sa prehazdovali sa vyrata nova vyska
    node->height = tNewNodeHeight(node) + 1;
    temp->height = tNewNodeHeight(temp) + 1;

    return temp;
}

struct TreeNode *tRightRotation(struct TreeNode *node){
    struct TreeNode *temp = node->left;

    node->left = temp->right;
    temp->right = node;
    // pre uzly ktore sa prehazdovali sa vyrata nova vyska
    node->height = tNewNodeHeight(node) + 1;
    temp->height = tNewNodeHeight(temp) + 1;

    return temp;
}

struct TreeNode *tRightLeftRotation(struct TreeNode *node){
    node->right = tRightRotation(node->right);
    return tLeftRotation(node);
}

struct TreeNode *tLeftRightRotation(struct TreeNode *node){
    node->left = tLeftRotation(node->left);
    return tRightRotation(node);
}

//vkladanie zaznamu do stromu rekurzivne
struct TreeNode *tInsert(struct TreeNode *node,int val,char *data){
    if(node == NULL)
        return tCreateNode(val,data); //ak sme nasli vhodne miesto na vlozenie zaznamu

        //jednoduche rozhodovanie kam sa v strome budeme posuvat podla hodnot jednotlivych uzlov
    if(val < node->value)
        node->left = tInsert(node->left,val,data);
    else if(val >= node->value)
        node->right = tInsert(node->right,val,data);
    else return node;

    //vyratanie novej vysky pre kazdy uzol
    node->height = 1 + tNewNodeHeight(node);

    //kontroluje a upravuje balanc stromu
    if(tIsBalanced(node) < -1){
        if(tIsBalanced(node->left)<=0){
            return tRightRotation(node);
        }
        else return tLeftRightRotation(node);
    }
    else if(tIsBalanced(node) > 1){
        if(tIsBalanced(node->right) >=0)
            return tLeftRotation(node);
        else return tRightLeftRotation(node);
    }
    return node;
}

// vypis stromu (nepotrebne)
void printTree(struct TreeNode *node){
    if(node != NULL){
        printf(" %d , %s ",node->value,node->data);
        printf("Left: ");
        printTree(node->left);
        printf("Right: ");
        printTree(node->right);
    }
}

//hladanie v strome
int tSearch(struct TreeNode* node, int val, char *string,int found){
    if(node!=NULL && found == 0){
        if(val == node->value && strcmp(node->data,string) == 0){
           // printf("Found record height: %d, value: %d, data:  %s\n",node->height, node->value, node->data);

           found = 1; //ak sme nasli hladany zaznam nastavime premennu
        }
        if (found == 1) return found;
        if (val >= node->value){
            found = tSearch(node->right,val,string,found);
        }
        if (found == 1) return found;
        if (val <= node->value) {
            found = tSearch(node->left,val,string,found);
        }
        return found;
    }
    return found;
}