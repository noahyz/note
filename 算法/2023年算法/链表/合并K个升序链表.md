---
title: 合并K个升序链表
---

### 一、题目

给你一个链表数组，每个链表都已经按升序排列。请你将所有链表合并到一个升序链表中，返回合并后的链表。

```
输入：lists = [[1,4,5],[1,3,4],[2,6]]
输出：[1,1,2,3,4,4,5,6]
解释：链表数组如下：
[
  1->4->5,
  1->3->4,
  2->6
]
将它们合并到一个有序链表中得到。
1->1->2->3->4->4->5->6
```

Leetcode：https://leetcode.cn/problems/merge-k-sorted-lists/

### 二、分析

我们准备一个优先级队列，也就是一个堆，并且是一个最小堆。长度为 K。也就是将 K 个链表的头节点插入堆中。

堆顶元素就是结果链表的第一个节点。我们注意，最好定一个傀儡节点。这样我们在处理头节点就好办很多。

我们从堆中拿走一个节点后，相当于从某个链表中拿走一个节点，然后让当前链表的下一个位置节点插入到堆中。

如下代码

```
class Solution {
private:
    struct WrapListNode {
        int val;
        ListNode* node;
        bool operator<(const WrapListNode& other) const {
            return val > other.val;
        }
    };

public:
    ListNode* mergeKLists(vector<ListNode*>& lists) {
        if (lists.empty()) {
            return nullptr;
        }
        std::priority_queue<WrapListNode> qu;
        for (int i = 0; i < lists.size(); i++) {
            if (lists[i] != nullptr) {
                qu.push({lists[i]->val, lists[i]});
            }
        }
        ListNode dummy;
        ListNode* res = &dummy;
        while (!qu.empty()) {
            ListNode* tmp = qu.top().node;
            qu.pop();
            res->next = tmp;
            res = res->next;
            if (tmp->next != nullptr) {
                qu.push({tmp->next->val, tmp->next});
            }
        }
        return dummy.next;
    }
};
```

