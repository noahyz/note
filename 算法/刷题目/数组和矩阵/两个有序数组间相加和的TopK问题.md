---
title: 两个有序数组间相加和的TopK问题
---

### 一、题目

给定两个有序数组arr1和arr2，再给定一个整数k，返回来自arr1和arr2的两个数相加和最大的前k个，两个数必须分别来自两个数组。按照降序输出。[要求]时间复杂度为O(klogk)。

```
arr1=[1,2,3,4,5], arr2=[3,5,7,9,11], k=4
返回数组 [16, 15, 14, 14]
```

### 二、分析

这道题目本身比较简单，就是写起来比较麻烦

注意 K 这个参数，我们需要调整，如果 arr1 的数量和 arr2 的数量之积，小于 K，则 K 取此积。

我们准备一个大根堆，堆元素是 “arr1 的下标” 和 “arr2 的下标” 以及 “两数之和”。我们先往堆中插入 `{N-1, M-1, arr[N-1]+arr[M-1]}` 这个元素。然后进行循环，循环条件是 K 次。

在循环内，从堆中取出元素，获取到下标 left，right，以及值。将这个值插入到结果数组中。然后插入 left-1，right 这个位置的元素到堆中；再插入 left、right-1 这个位置的元素到堆中。

注意，`left-1, right` 或者 `left, right-1` 这些位置可能会被重复插入。因此要去重

```
struct Node {
    int left;
    int right;
    int val;

    Node(int l, int r, int v) : left(l), right(r), val(v) {}
};

class Solution {
public:
    std::vector<int> topK_sum(const std::vector<int>& arr1, const std::vector<int>& arr2, int topK) {
        if (arr1.empty() || arr2.empty() || topK < 1) {
            return {};
        }
        topK = std::min(static_cast<uint64_t>(topK), arr1.size()*arr2.size());
        heap.resize(topK);
        int left_pos = arr1.size()-1;
        int right_pos = arr2.size()-1;
        int heap_size = 0;
        heap_insert(heap_size++, left_pos, right_pos, arr1[left_pos]+arr2[right_pos]);
        int res_index = 0;
        std::vector<int> res_vec(topK, 0);
        while (res_index < topK) {
            auto node = get_heap_top(heap_size--);
            res_vec[res_index++] = node->val;
            int tmp_left = node->left-1;
            int tmp_right = node->right;
            if (tmp_left >= 0 && st.find(hash(tmp_left, tmp_right)) == st.end()) {
                heap_insert(heap_size++, tmp_left, tmp_right, arr1[tmp_left]+arr2[tmp_right]);
                st.insert(hash(tmp_left, tmp_right));
            }
            tmp_left = node->left;
            tmp_right = node->right-1;
            if (tmp_right >= 0 && st.find(hash(tmp_left, tmp_right)) == st.end()) {
                heap_insert(heap_size++, tmp_left, tmp_right, arr1[tmp_left]+arr2[tmp_right]);
                st.insert(hash(tmp_left, tmp_right));
            }
            delete node;
            node = nullptr;
        }
        while (heap_size > 0) {
            auto node = get_heap_top(heap_size--);
            delete node;
        }
        return res_vec;
    }

private:
    void heap_insert(int index, int left, int right, int value) {
        heap[index] = new Node(left, right, value);
        int parent = (index-1)/2;
        while (index != 0) {
            if (heap[index]->val > heap[parent]->val) {
                std::swap(heap[index], heap[parent]);
                index = parent;
                parent = (index-1)/2;
            } else {
                break;
            }
        }
    }

    Node* get_heap_top(int heap_size) {
        auto res = heap[0];
        heap[0] = heap[heap_size-1];
        heap[--heap_size] = nullptr;
        heapify(0, heap_size);
        return res;
    }

    void heapify(int index, int heap_size) {
        int left = index*2+1;
        int right = index*2+2;
        int max_pos = index;
        while (left < heap_size) {
            if (heap[left]->val > heap[index]->val) {
                max_pos = left;
            }
            if (right < heap_size && heap[right]->val > heap[max_pos]->val) {
                max_pos = right;
            }
            if (max_pos == index) {
                break;
            }
            std::swap(heap[max_pos], heap[index]);
            index = max_pos;
            left = index*2+1;
            right = index*2+2;
        }
    }

    std::string hash(int left, int right) {
        return std::to_string(left) + std::to_string(right);
    }

private:
    std::vector<Node*> heap;
    std::unordered_set<std::string> st;
};
```

