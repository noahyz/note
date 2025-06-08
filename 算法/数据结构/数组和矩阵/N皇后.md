---
title: N皇后问题
---

### 一、题目

n 皇后问题 研究的是如何将 n 个皇后放置在 n × n 的棋盘上，并且使皇后彼此之间不能相互攻击。

给你一个整数 n ，返回 n 皇后问题 不同的解决方案的数量。

Leetcode：https://leetcode.cn/problems/n-queens/

Leetcode：https://leetcode.cn/problems/n-queens-ii/

### 二、分析

如果在 `(i, j)` 位置放置了一个皇后，然后

- 第 i 行不能在放皇后
- 第 j 列不能在放皇后
- 有一个位置 `(a, b)`，如果 `abs(a-i) == abs(b-j)` ，这两个点就处于同一个斜线上，所以这个位置也不能放皇后

那么，我们可以通过判断如上三个条件，看是否可以放皇后。因为我们是按照每一行遍历的，所以天生的第一种条件是支持的。我们用一个数组 record，记录的是某一行的那一列放了皇后。

我们使用递归的方式，递归本身就是在遍历行。而递归的内部是遍历列。遍历每一位置的时候，进行判断，当前点是否有效。就是判断如上第二、三条件

如下代码：

```
class Solution {
public:
    int get_num(int n) {
        if (n < 1) {
            return 0;
        }
        std::vector<int> record(n, 0);
        return process(record, 0, n);
    }

private:
    int process(std::vector<int>& record, int i, int n) {
        if (i == n) {
            return 1;
        }
        int res = 0;
        for (int j = 0; j < n; j++) {
            if (invalid(record, i, j)) {
                record[i] = j;
                res += process(record, i+1, n);
            }
        }
        return res;
    }
    bool invalid(const std::vector<int>& record, int i, int j) {
        for (int k = 0; k < i; k++) {
            if (record[k] == j || std::abs(i-k) == std::abs(j-record[k])) {
                return false;
            }
        }
        return true;
    }
};
```

