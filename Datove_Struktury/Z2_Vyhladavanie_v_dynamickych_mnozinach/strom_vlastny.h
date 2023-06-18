#ifndef STROM_VLASTNY_H


struct TreeNode{
    int value;
    int height;
    char data[64];
    struct TreeNode *left;
    struct TreeNode *right;
};

struct TreeNode *tCreateNode(int val,char *string);

int tGetNodeHeight(struct TreeNode *node);

int tNewNodeHeight(struct TreeNode *node);

int tIsBalanced(struct TreeNode *node);

struct TreeNode *tLeftRotation(struct TreeNode *node);

struct TreeNode *tRightRotation(struct TreeNode *node);

struct TreeNode *tRightLeftRotation(struct TreeNode *node);

struct TreeNode *tLeftRightRotation(struct TreeNode *node);

struct TreeNode *tInsert(struct TreeNode *node,int val,char *data);

void printTree(struct TreeNode *node);

int tSearch(struct TreeNode* node, int val, char *string,int found);

#endif
