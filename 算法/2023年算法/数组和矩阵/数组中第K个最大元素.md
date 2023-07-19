---
title: 数组中第K个最大元素
---

### 一、题目

给定整数数组 `nums` 和整数 `k`，请返回数组中第 k 个最大的元素。

请注意，你需要找的是数组排序后的第 `k` 个最大的元素，而不是第 `k` 个不同的元素。

```
输入: [3,2,1,5,6,4], k = 2
输出: 5
```

Leetcode：https://leetcode.cn/problems/kth-largest-element-in-an-array/

### 二、分析

此题目求 topK 问题，首先想到的是堆排序了。先建立一个大小为 K 的最小堆。填充进 K 个元素。

然后，遍历剩余的元素，如果当前元素大于堆顶元素，则将当前元素赋值给堆顶元素，然后重新建堆。最后直接返回堆顶元素即可

```
class Solution {
public:
    int findKthLargest(const std::vector<int>& nums, int k) {
        if (nums.size() < k) {
            return -1;
        }
        // 建立小根堆(K个元素)
        std::vector<int> heap(k, 0);
        for (int i = 0; i < k; i++) {
            build_heap(heap, nums[i], i);
        }
        // 处理数组中剩余元素
        for (int i = k; i < nums.size(); i++) {
            if (nums[i] > heap[0]) {
                re_cal_heap(heap, nums[i]);
            }
        }
        // 返回堆顶元素即可
        return heap[0];
    }

private:
    void build_heap(std::vector<int>& heap, int elem, int last) {
        heap[last] = elem;
        while (last > 0 && heap[last] < heap[(last-1)/2]) {
            std::swap(heap[last], heap[(last-1)/2]);
            last = (last-1) / 2;
        }
    }
    void re_cal_heap(std::vector<int>& heap, int elem) {
        heap[0] = elem;
        int last = heap.size()-1;
        int i = 0;
        while (true) {
            int min_pos = i;
            if (i*2+1 <= last && heap[i] > heap[i*2+1]) {
                min_pos = i*2+1;
            }
            if (i*2+2 <= last && heap[min_pos] > heap[i*2+2]) {
                min_pos = i*2+2;
            }
            if (min_pos == i) {
                break;
            }
            std::swap(heap[i], heap[min_pos]);
            i = min_pos;
        }
    }
};
```

时间复杂度：`n*LogK`。建立小根堆的方式，在 K 小于 n 的时候，效率更高。