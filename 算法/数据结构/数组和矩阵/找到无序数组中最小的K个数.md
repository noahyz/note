---
title: 找到无序数组中最小的K个数
---

## 找到无序数组中最小的K个数

### 一、题目

输入整数数组 `arr` ，找出其中最小的 `k` 个数。例如，输入4、5、1、6、2、7、3、8这8个数字，则最小的4个数字是1、2、3、4。

Leetocde：https://leetcode.cn/problems/zui-xiao-de-kge-shu-lcof/

### 二、思路

无序数组中找最小的、或者最大的 K 个数，这种题目一般排序的思路是不符合要求的，排序的时间复杂度达到了 `O(n*logn)`，而我们可以选择堆这种数据结构来做。可以让时间复杂度为 `O(nlogK)`

如果求最小的 K 个数，那么就需要维护一个大根堆。否则应该维护一个小根堆。先申请一个 K 长度的数组，然后往数组中插入 K 个数字，使其满足大根堆。然后依次插入数组中剩下的元素到大根堆中，如果发现元素小于堆顶元素，就给他插入堆中，并调节堆。

遍历完成，大根堆中的元素即为无序数组中最小的 K 个数

### 三、代码

```c++
#include <vector>
#include <iostream>

class Solution {
public:
    std::vector<int> getLeastNumbers(std::vector<int>& arr, int k) {
        if (arr.empty() || arr.size() < k || k <= 0) {
            return std::vector<int>();
        }
        std::vector<int> heap(k, 0);
        for (size_t i = 0; i < k; ++i) {
            heap_insert(heap, arr[i], i);
        }
        for (size_t i = k; i < arr.size(); ++i) {
            if (arr[i] < heap[0]) {
                heap[0] = arr[i];
                heapify(heap, 0, k);
            }
        }
        return heap;
    }

private:
    void heap_insert(std::vector<int>& heap, int value, int index) {
        heap[index] = value;
        for (; index != 0;) {
            int parent = (index - 1) / 2;
            if (heap[parent] < heap[index]) {
                std::swap(heap[parent], heap[index]);
                index = parent;
            } else {
                break;
            }
        }
    }

    void heapify(std::vector<int>& heap, int index, int heap_size) {
        int left = index * 2 + 1;
        int right = index * 2 + 2;
        int largest = index;
        for (; left < heap_size;) {
            if (heap[index] < heap[left]) {
                largest = left;
            }
            if (right < heap_size && heap[right] > heap[largest]) {
                largest = right;
            }
            if (largest != index) {
                std::swap(heap[largest], heap[index]);
            } else {
                break;
            }
            index = largest;
            left = index * 2 + 1;
            right = index * 2 + 2;
        }
    }
};

void print_vec(const std::vector<int>& arr) {
    for (const auto& x : arr) {
        std::cout << x << " ";
    }
    std::cout << std::endl;
}

int main() {
    std::vector<int> arr{0, 1, 1, 2, 4, 4, 1, 3, 3, 2};
    Solution s;
    auto res = s.getLeastNumbers(arr, 6);
    print_vec(res);
    return 0;
}
```

时间复杂度：`O(n*logK)`，空间复杂度：`O(K)`