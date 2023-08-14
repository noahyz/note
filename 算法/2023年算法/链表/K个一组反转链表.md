---
title: K个一组反转链表
---

### 一、题目

给你链表的头节点 `head` ，每 `k` 个节点一组进行翻转，请你返回修改后的链表。

`k` 是一个正整数，它的值小于或等于链表的长度。如果节点总数不是 `k` 的整数倍，那么请将最后剩余的节点保持原有顺序。

你不能只是单纯的改变节点内部的值，而是需要实际进行节点交换。

Leetcode：https://leetcode.cn/problems/reverse-nodes-in-k-group/description/

### 二、分析

这道题目本身比较简单，主要需要关注节点指针的边界问题。

我们封装一个函数，参数为两个链表上的两个节点，需求是反转这两个节点中的所有元素。

然后在主函数中，我们每次以 K 个节点生成这样的区间。完成反转之后再进行拼接。注意使用一个傀儡节点可以有效减轻代码复杂度

```
struct ListNode {
    int val{0};
    ListNode* next{nullptr};
    explicit ListNode(int v) : val(v) {}
};

class Solution {
public:
    ListNode* reverse_k_group(ListNode* head, int k) {
        ListNode* dummy = new ListNode(0);
        dummy->next = head;
        ListNode* pre = dummy;
        while (head != nullptr) {
            ListNode* tail = pre;
            for (int i = 0; i < k; ++i) {
                tail = tail->next;
                if (tail == nullptr) {
                    return dummy->next;
                }
            }
            ListNode* nex = tail->next;
            std::pair<ListNode*, ListNode*> res = reverse_link(head, tail);
            head = res.first;
            tail = res.second;
            pre->next = head;
            tail->next = nex;
            pre = tail;
            head = tail->next;
        }
        return dummy->next;
    }

private:
    std::pair<ListNode*, ListNode*> reverse_link(ListNode* head, ListNode* tail) {
        ListNode* prev = tail->next;
        ListNode* p = head;
        ListNode* nex = nullptr;
        while (prev != tail) {
            nex = p->next;
            p->next = prev;
            prev = p;
            p = nex;
        }
        return {tail, head};
    }
};
```

