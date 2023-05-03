---
title: 打印N个数组中整体最大的topK
---

## 打印N个数组中整体最大的topK

### 一、题目

有N 个长度不一的数组，所有的数组都是有序的，请从大到小打印这N 个数组整体最大的前K 个数。

例如：

```
输入含有 N 行元素的二维数组可以代表N个一维数组
{219, 405, 538, 845, 971},
{148, 558},
{52, 99, 348, 691},
再输入整数 K = 5，打印：
top 5: 971， 845， 691， 558， 538
```

### 二、思路

topK 问题统一使用堆来解决适合大部分场景。此题目也是使用堆来解决。题目的前提条件是数组是有序的。

建大根堆，堆所在的数组长度为 N。 堆中单个节点应该存储的数据为：元素本身、元素所在数组、元素所在数组的位置。 然后插入所有数组的最后一位元素。

此时大根堆中诞生了整体最大值。将堆顶元素出堆，并且插入这个堆顶元素所在数组的前一个元素，插入后调整堆。如果要出堆的元素所在的数组没有元素了，则将堆所在数组的最后一位元素提到堆顶，并且将堆所在数组的长度剪一。直到打印出前 K 个最大数。

### 三、代码

```c++
#include <iostream>
#include <vector>

class Solution {
private:
    struct HeapNode {
        // 值
        int val;
        // 代表那个数组
        int arr_num;
        // 代表数组中那个位置
        int arr_pos;
    };

public:
    void printTopK(std::vector<std::vector<int>> matrix, int topK) {
        int heap_size = matrix.size();
        std::vector<HeapNode> big_heap;
        big_heap.resize(heap_size);
        for (int i = 0; i < heap_size; i++) {
            int index = matrix[i].size()-1;
            // 数组个数小于 topK 个
            big_heap[i] = {matrix[i][index], i, index};
            heap_insert(big_heap, i);
        }
        std::cout << "topK: ";
        for (int i = 0; i < topK; i++) {
            if (heap_size == 0) {
                break;
            }
            auto& cur_node = big_heap[0];
            std::cout << cur_node.val << " ";
            if (cur_node.arr_pos > 0) {
                big_heap[0] = {matrix[cur_node.arr_num][cur_node.arr_pos-1], cur_node.arr_num, cur_node.arr_pos-1};
                heapify(big_heap, 0, heap_size);
            } else {
                std::swap(big_heap[0], big_heap[heap_size-1]);
                heapify(big_heap, 0, --heap_size);
            }
        }
        std::cout << std::endl;
    }

private:
    void heap_insert(std::vector<HeapNode>& big_heap, int index) {
        for (; index != 0;) {
            int parent = (index - 1) / 2;
            if (big_heap[parent].val < big_heap[index].val) {
                std::swap(big_heap[parent], big_heap[index]);
                index = parent;
            } else {
                break;
            }
        }
    }
    void heapify(std::vector<HeapNode>& big_heap, int index, int heap_size) {
        int left_child = index*2 + 1;
        int right_child = index*2 + 2;
        int largest = index;
        for (; left_child < heap_size;) {
            if (big_heap[left_child].val > big_heap[index].val) {
                largest = left_child;
            }
            if (right_child < heap_size && big_heap[right_child].val > big_heap[largest].val) {
                largest = right_child;
            }
            if (largest != index) {
                std::swap(big_heap[largest], big_heap[index]);
            } else {
                break;
            }
            index = largest;
            left_child = index * 2 + 1;
            right_child = index * 2 + 2;
        }
    }
};

int main() {
    Solution s;
    std::vector<std::vector<int>> matrix{
      {219, 405, 538, 845, 971},
      {148, 558},
      {52, 99, 348, 691},
    };
    s.printTopK(matrix, 5);
    return 0;
}
```

