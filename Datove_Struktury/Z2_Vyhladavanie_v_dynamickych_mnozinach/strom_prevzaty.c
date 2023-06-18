//https://github.com/amitbansal7/Data-Structures-and-Algorithms/tree/master/9.Red-Black-tree

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

//CLRS
//Insertion and Deletion in a Red Black Tree
enum type {RED,BLACK};


struct Node
{
    int data;
    char string[64];
    struct Node* left;
    struct Node* right;
    struct Node* parent;
    enum type color;
};

struct Queue
{
    struct Node* data;
    struct Queue* next;
};



struct Queue* front = NULL;
struct Queue* rear = NULL;

struct Node* pfront()
{
    struct Node* data ;
    data = front->data;
    return data;
}

int isempty()
{
    if(front==NULL)
        return 1;

    else
        return 0;
}

void dequeue()
{
    if(isempty())
        return ;

    struct Queue* temp = front;
    front = front->next;
    free(temp);
}


void enqueue(struct Node* data)
{
    struct Queue* temp  =(struct Queue*)malloc(sizeof(struct Queue));
    temp->data = data;
    temp->next = NULL;

    if(front==NULL && rear == NULL)
    {
        front = rear = temp;
        return;
    }

    rear->next = temp;
    rear = temp;
}

void levelorder(struct Node* root)
{
    if(root==NULL)
        return;

    enqueue(root);

    while(!isempty())
    {
        struct Node* current = pfront();
        printf("%d ",current->data);

        if(current->left!=NULL)
            enqueue(current->left);

        if(current->right!=NULL)
            enqueue(current->right);

        dequeue();
    }
}

void LeftRotate(struct Node** T,struct Node** x)
{
    struct Node* y = (*x)->right;
    (*x)->right = y->left;

    if(y->left!=NULL)
        y->left->parent = *x;

    y->parent = (*x)->parent;

    if((*x)->parent == NULL)
        *T = y;

    else if(*x == (*x)->parent->left)
        (*x)->parent->left = y;

    else
        (*x)->parent->right = y;

    y->left = *x;

    (*x)->parent = y;

}
void RightRotate(struct Node** T,struct Node** x)
{
    struct Node* y = (*x)->left;
    (*x)->left = y->right;

    if(y->right!=NULL)
        y->right->parent = *x;

    y->parent = (*x)->parent;

    if((*x)->parent==NULL)
        *T = y;

    else if((*x)== (*x)->parent->left)
        (*x)->parent->left = y;

    else
        (*x)->parent->right = y;

    y->right = *x;
    (*x)->parent = y;

}

void RB_insert_fixup(struct Node** T, struct Node** z)
{
    struct Node* grandparent = NULL;
    struct Node* parentpt = NULL;

    while(((*z)!=*T)&& ((*z)->color!= BLACK) && ((*z)->parent->color == RED))
    {
        parentpt = (*z)->parent;
        grandparent = (*z)->parent->parent;

        if(parentpt == grandparent->left)
        {
            struct Node* uncle = grandparent->right;

            if(uncle!=NULL && uncle->color == RED)
            {
                grandparent->color = RED;
                parentpt->color = BLACK;
                uncle->color = BLACK;
                *z = grandparent;
            }

            else
            {
                if((*z) == parentpt->right)
                {
                    LeftRotate(T,&parentpt);
                    (*z) = parentpt;
                    parentpt = (*z)->parent;
                }

                RightRotate(T,&grandparent);
                parentpt->color = BLACK;
                grandparent->color = RED;
                (*z) = parentpt;
            }
        }

        else
        {
            struct Node* uncle = grandparent->left;

            if(uncle!=NULL && uncle->color == RED)
            {
                grandparent->color = RED;
                parentpt->color = BLACK;
                uncle->color = BLACK;
                (*z) = grandparent;
            }

            else
            {
                if((*z) == parentpt->left)
                {
                    RightRotate(T,&parentpt);
                    (*z) = parentpt;
                    parentpt = (*z)->parent;
                }

                LeftRotate(T,&grandparent);
                parentpt->color = BLACK;
                grandparent->color = RED;
                (*z) = parentpt;
            }
        }
    }
    (*T)->color = BLACK;

}

struct Node* RB_insert(struct Node* T,int data, char *string)
{
    struct Node* z = (struct Node*)malloc(sizeof(struct Node));
    z->data = data;
    strcpy(z->string,string);
    z->left = NULL;
    z->right = NULL;
    z->parent = NULL;
    z->color = RED;

    struct Node* y = NULL;
    struct Node* x = T;//root

    while(x!=NULL)
    {
        y = x;
        if(z->data < x->data)
            x = x->left;

        else
            x = x->right;
    }
    z->parent = y;

    if(y==NULL)
        T = z;

    else if(z->data < y->data)
        y->left = z;

    else
        y->right = z;

    RB_insert_fixup(&T,&z);

    return T;
}

void preorder(struct Node* root)
{
    if(root==NULL)
        return;

    printf("%d ",root->data);
    preorder(root->left);
    preorder(root->right);
}

struct Node* Tree_minimum(struct Node* node)
{
    while(node->left!=NULL)
        node = node->left;

    return node;
}

void RB_delete_fixup(struct Node** T, struct Node** x)
{
    while((*x)!=*T && (*x)->color == BLACK)
    {
        if((*x)==(*x)->parent->left)
        {
            struct Node* w = (*x)->parent->right;

            if(w->color==RED)
            {
                w->color = BLACK;
                (*x)->parent->color = BLACK;
                LeftRotate(T,&((*x)->parent));
                w = (*x)->parent->right;
            }

            if(w->left->color==BLACK && w->right->color == BLACK)
            {
                w->color = RED;
                (*x) = (*x)->parent;
            }

            else
            {
                if(w->right->color == BLACK)
                {
                    w->left->color = BLACK;
                    w->color = RED;
                    RightRotate(T,&w);
                    w = (*x)->parent->right;
                }

                w->color = (*x)->parent->color;
                (*x)->parent->color = BLACK;
                w->right->color = BLACK;
                LeftRotate(T,&((*x)->parent));
                (*x) = *T;
            }
        }

        else
        {
            struct Node* w = (*x)->parent->left;

            if(w->color==RED)
            {
                w->color = BLACK;
                (*x)->parent->color = BLACK;
                RightRotate(T,&((*x)->parent));
                w = (*x)->parent->left;
            }

            if(w->right->color==BLACK && w->left->color == BLACK)
            {
                w->color = RED;
                (*x) = (*x)->parent;
            }

            else
            {
                if(w->left->color == BLACK)
                {
                    w->right->color = BLACK;
                    w->color = RED;
                    LeftRotate(T,&w);
                    w = (*x)->parent->left;
                }

                w->color = (*x)->parent->color;
                (*x)->parent->color = BLACK;
                w->left->color = BLACK;
                RightRotate(T,&((*x)->parent));
                (*x) = *T;
            }
        }
    }
    (*x)->color = BLACK;

}

void RB_transplat(struct Node** T, struct Node** u,struct Node** v)
{
    if((*u)->parent == NULL)
        *T = *v;

    else if((*u)==(*u)->parent->left)
        (*u)->parent->left = *v;
    else
        (*u)->parent->right = *v;

    if((*v)!=NULL)
        (*v)->parent = (*u)->parent;
}


int BST_search(struct Node* root, int x, char *string)
{
    int found = 0;
    if (root == NULL) return 0;
    if(root->data == x && strcmp(root->string,string) == 0)
        return 1;

    if(found == 0 && root->data >= x)
        found =  BST_search(root->left,x, string);
    if(found == 0 && root->data <= x)
        found = BST_search(root->right,x, string);
    return found;
}