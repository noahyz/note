---
title: LRU 缓存
---

### 一、题目

请你设计并实现一个满足  LRU (最近最少使用) 缓存 约束的数据结构。
实现 LRUCache 类：
LRUCache(int capacity) 以 正整数 作为容量 capacity 初始化 LRU 缓存
int get(int key) 如果关键字 key 存在于缓存中，则返回关键字的值，否则返回 -1 。
void put(int key, int value) 如果关键字 key 已经存在，则变更其数据值 value ；如果不存在，则向缓存中插入该组 key-value 。如果插入操作导致关键字数量超过 capacity ，则应该 逐出 最久未使用的关键字。
函数 get 和 put 必须以 O(1) 的平均时间复杂度运行。

Leetcode：https://leetcode.cn/problems/lru-cache

### 二、分析

本题使用双向链表+哈希表的方式，可以完成如上的要求。

当 get 的时候，我们从哈希表中查找，如果找不到，直接返回 -1。如果找到了，将此节点从双向链表中移动到最前端，并返回

当 put 的时候，先从哈希表中查找，如果找到了，则更改值。如果找不到，创建节点，并将其插入到哈希表，然后放在双向链表的前端。最后检测双向链表的容量，容量超了，就删除尾节点。

```
#include <unordered_map>

struct DLinkNode {
    int key{0};
    int val{0};
    DLinkNode* prev{nullptr};
    DLinkNode* next{nullptr};

    DLinkNode() = default;
    DLinkNode(int k, int v) : key(k), val(v), prev(nullptr), next(nullptr) {}
};

class LRUCache {
public:
    explicit LRUCache(int capacity)
        : size_(0), capacity_(capacity) {
        head_ = new DLinkNode();
        tail_ = new DLinkNode();
        head_->next = tail_;
        tail_->prev = head_;
    }

    int get(int key) {
        auto iter = mp_.find(key);
        if (iter == mp_.end()) {
            return -1;
        } else {
            delete_node(iter->second);
            add_head(iter->second);
            return iter->second->val;
        }
    }

    void put(int key, int value) {
        // 存在的情况下
        auto iter = mp_.find(key);
        if (iter != mp_.end()) {
            iter->second->val = value;
            delete_node(iter->second);
            add_head(iter->second);
        } else {  // 不存在的情况
            DLinkNode* node = new DLinkNode(key, value);
            mp_[key] = node;
            add_head(node);
            size_++;
            if (size_ > capacity_) {
                DLinkNode* node = remove_tail();
                mp_.erase(node->key);
                delete node;
                size_--;
            }
        }
    }

private:
    void delete_node(DLinkNode* node) {
        node->prev->next = node->next;
        node->next->prev = node->prev;
    }

    void add_head(DLinkNode* node) {
        node->prev = head_;
        node->next = head_->next;
        head_->next = node;
        node->next->prev = node;
    }

    DLinkNode* remove_tail() {
        DLinkNode* node = tail_->prev;
        delete_node(node);
        return node;
    }

private:
    int size_{0};
    int capacity_{0};
    DLinkNode* head_{nullptr};
    DLinkNode* tail_{nullptr};
    std::unordered_map<int, DLinkNode*> mp_;
};
```

