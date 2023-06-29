---
title: 最大的 leftMax 与 rightMax 之差的绝对值
---

### 一、题目

给定一个长度为N的整型数组 arr，可以划分成左右两个部分： 左部分 `arr[0..K]`，右部分 `arr[K+1..arr.length-1]`，K 可以取值的范围是 `[0,arr.length-2]` 求这么多划分方案中，左部分中的最大值减去右部分最大值的绝对值，最大是多少？

 例如：` [2,7,3,1,1]` 当左部分为`[2,7]`，右部分为 `[3,1,1]` 时，左部分中的最大值减去右部分最大值的绝对值为4; 当左部分为`[2,7,3]`，右部分为`[1,1]`时，左部分中的最大值减去右部分最大值的绝对值为 6;  最后返回的结果为 6。 注意：如果数组的长度为 N，请尽量做到时间复杂度 `O(N)`，额外空间复杂度 `O(1)`

### 二、分析

最笨的办法是，在数组的每个位置 i 都做一次这种划分，找到 `arr[0 ... i]` 的最大值 maxLeft，找到 `arr[i+1 ... N-1]` 的最大值 maxRight。然后计算两个值相减的绝对值。每次划分都这样求一下，可以得到最大的相减的绝对值。但是时间复杂度：`O(N^2)`，额外的空间复杂度：`O(1)`

稍加优化，将中间结果存储一下，准备两个数组 leftArr、rightArr，对原数组先从左向右遍历一次，`leftArr[i]` 就存储 `arr[0 ... i]` 中的最大值。再从右向左遍历一次，`rightArr[i]` 存储 `arr[i ... N-1]` 中的最大值。然后最后一次遍历看那种划分的情况下可以得到两部分最大的相减绝对值。这种情况下，时间复杂度：`O(N)`，空间复杂度：`O(N)`

```
int maxABS(const std::vector<int>& arr) {
    if (arr.empty()) {
        return 0;
    }
    std::vector<int> leftArr(arr.size(), 0);
    leftArr[0] = arr[0];
    std::vector<int> rightArr(arr.size(), 0);
    rightArr[arr.size()-1] = arr[arr.size()-1];
    for (int i = 1; i < arr.size(); i++) {
        leftArr[i] = std::max(leftArr[i-1], arr[i]);
    }
    for (int i = arr.size()-2; i >= 0; i--) {
        rightArr[i] = std::max(rightArr[i+1], arr[i]);
    }
    int res = 0;
    for (int i = 0; i <= arr.size()-2; i++) {
        res = std::max(res, std::abs(leftArr[i] - rightArr[i+1]));
    }
    return res;
}
```

还能继续优化，先求整个 arr 的最大值 max，因为 max 是全局最大值，所以不管怎么划分，max 要么成为左部分的最大值，要么成为右部分的最大值。如果 max 作为左部分的最大值，接下来只要让右部分的最大值尽量小就可以。有部分的最大值怎么尽量小呢？右部分只含有 `arr[N-1]`的时候就是尽量小的时候。同理，如果 max 作为右部分的最大值，只要让左部分的最大值尽量小就可以，左部分只含有 `arr[0]` 的时候就是尽量小的时候。所以整个求解过程如下，时间复杂度和空间复杂度都是：`O(1)`

```
int maxABS2(const std::vector<int>& arr) {
    int max = INT32_MIN;
    for (int i = 0; i < arr.size(); i++) {
        max = std::max(max, arr[i]);
    }
    return max - std::min(arr[0], arr[arr.size()-1]);
}
```

