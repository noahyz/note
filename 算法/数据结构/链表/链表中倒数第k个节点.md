---
title: 链表中倒数第k个节点
---

## 链表中倒数第k个节点

### 一、题目

输入一个链表，输出该链表中倒数第k个节点。为了符合大多数人的习惯，本题从1开始计数，即链表的尾节点是倒数第1个节点。

例如，一个链表有 6 个节点，从头节点开始，它们的值依次是 1、2、3、4、5、6。这个链表的倒数第 3 个节点是值为 4 的节点

### 二、思路

单链表，两个指针，一个指针先走 K 步，然后两个指针一起走，直到先走 K 步的那个指针到达链表尾部

### 三、code

```c++
struct ListNode {
    int val;
    ListNode* next;
    ListNode(int x) : val(x), next(nullptr) {}
};

class Solution {
public:
    ListNode* getKthFromEnd(ListNode* head, int k) {
        if (head == nullptr) return nullptr;
        ListNode* fast = head, *slow = head;
        for (; fast != nullptr && k-- > 0;) {
            fast = fast->next;
        }
        for (; fast != nullptr && slow != nullptr;) {
            fast = fast->next;
            slow = slow->next;
        }
        return slow;
    }
};

ListNode* get_list(const std::vector<int>& vec) {
    ListNode* node = new ListNode(vec[0]);
    ListNode* tmp = node;
    for (size_t i = 1; i < vec.size(); ++i) {
        tmp->next = new ListNode(vec[i]);
        tmp = tmp->next;
    }
    return node;
}

void print_list(ListNode* node) {
    for (; node != nullptr;) {
        std::cout << node->val << " ";
        node = node->next;
    }
    std::cout << std::endl;
}

int main() {
    Solution s;
    ListNode* list = get_list({1, 2, 3, 4, 5});
    print_list(list);
    ListNode* node = s.getKthFromEnd(list, 2);
    print_list(node);
    return 0;
}
```



