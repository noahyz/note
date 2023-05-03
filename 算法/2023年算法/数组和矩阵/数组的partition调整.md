---
title: 数组的partition调整
---

## 数组的partition调整

### 一、题目

给定一个有序数组 arr，调整 arr 使得这个数组的左半部分没有重复元素且升序，而不用保证右部分是否有序

例子：

```
arr = {1, 2, 2, 2, 3, 3, 4, 5, 6, 6, 7, 7, 8, 8, 8, 9}
调整之后：
arr = {1 2 3 4 5 6 7 8 9 6 2 7 2 8 8 3}
```

### 二、思路

这道题目的思路较为简单，我们需要一个分界位置，假定为 u，那么我们设定 `[0 ... u]` 上的元素是没有重复元素且生序的。u 从 0 开始。然后 `arr[u+1, i]` 上的元素不用管他是否有重复元素，其中 i 是遍历数组的索引。

数组索引 i 从 1 开始遍历，

- 如果遇到 `arr[u]` 和 `arr[i]` 不相等，那么说明 i 位置的元素可以放在前一个无重复元素的区域中，那么就调换 `arr[u+1], arr[i]`，当然这里可以做一点优化，判断 u+1 和 i 是否相等，不相等才去调换。
- 如果 `arr[u]` 和 `arr[i]` 相等，位置 i 继续遍历即可

### 三、代码

```c++
#include <vector>
#include <iostream>

class Solution {
public:
    void partition_sort(std::vector<int>& arr) {
        if (arr.empty() || arr.size() < 2) {
            return;
        }
        int u = 0;
        for (int i = 1; i < arr.size(); i++) {
            if (arr[u] != arr[i]) {
                if (u+1 != i) {
                    std::swap(arr[u+1], arr[i]);
                }
                u++;
            }
        }
    }
};

void print_arr(const std::vector<int>& arr) {
    for (const auto& x : arr) {
        std::cout << x << " ";
    }
    std::cout << std::endl;
}

int main() {
    Solution s;
    std::vector<int> arr{1, 2, 2, 2, 3, 3, 4, 5, 6, 6, 7, 7, 8, 8, 8, 9};
    s.partition_sort(arr);
    print_arr(arr);
    return 0;
}
```

