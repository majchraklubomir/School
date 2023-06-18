#ifndef HASH_VLASTNY_C_STROM_PREVZATY_H
//https://github.com/amitbansal7/Data-Structures-and-Algorithms/tree/master/9.Red-Black-tree


struct Node* pfront();

int isempty();

void dequeue();


void enqueue(struct Node* data);

void levelorder(struct Node* root);
void LeftRotate(struct Node** T,struct Node** x);
void RightRotate(struct Node** T,struct Node** x);

void RB_insert_fixup(struct Node** T, struct Node** z);
struct Node* RB_insert(struct Node* T,int data, char *string);

void preorder(struct Node* root);

struct Node* Tree_minimum(struct Node* node);
void RB_delete_fixup(struct Node** T, struct Node** x);

void RB_transplat(struct Node** T, struct Node** u,struct Node** v);
int BST_search(struct Node* root, int x, char *string);

#endif
