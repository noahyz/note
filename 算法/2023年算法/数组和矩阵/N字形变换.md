---
title: N 字形变换
---

### 一、题目

将一个给定字符串 `s` 根据给定的行数 `numRows` ，以从上往下、从左到右进行 Z 字形排列。

比如输入字符串为 `"PAYPALISHIRING"` 行数为 `3` 时，排列如下：

```
P   A   H   N
A P L S I I G
Y   I   R
```

之后，你的输出需要从左往右逐行读取，产生出一个新的字符串，比如：`"PAHNAPLSIIGYIR"`。

Leetcode：https://leetcode.cn/problems/zigzag-conversion/description/

### 二、分析

如上，我们发现只要把这个字符串放入矩阵中即可。并且矩阵的行有 r 行。

当我们在矩阵中填写字符时，会向下填写 row 个字符，然后向右上继续填写 r-2 个字符，最后回到第一行。其中减 2 是一个周期内不包括第一行和最后一行的字符。因此变换周期为 `t = r + r-2 = 2r-2`。并且每个周期会占用矩阵上的 `1 + r-2 = r-1` 列。

我们现在求有多少周期，为了向上取整，我们有：` (n+r-1) / t * (r-1)` 个周期。

最后我们创建 r 行 c 列的矩阵即可。

```
class Solution {
public:
    std::string convert(std::string s, int num_rows) {
        if (s.empty() || num_rows <= 1) return s;
        int row = num_rows;
        int t = 2*row-2;
        int n = s.size();
        int line = (n + t - 1) / t * (row-1);
        std::vector<std::vector<char>> vec(row, std::vector<char>(line, 0));
        int vec_row = -1, vec_line = 0;
        bool flag = true;
        for (int i = 0; i < n; i++) {
            if (flag == true) {
                vec_row++;
                vec[vec_row][vec_line] = s[i];
                if (vec_row == row-1) {
                    flag = false;
                }
            } else {
                vec_row--;
                vec_line++;
                vec[vec_row][vec_line] = s[i];
                if (vec_row == 0) {
                    flag = true;
                }
            }
        }
        print_vec(vec);
        std::string res;
        res.reserve(n);
        for (int i = 0; i < row; i++) {
            for (int j = 0; j < line; j++) {
                if (vec[i][j] != 0) {
                    res.push_back(vec[i][j]);
                }
            }
        }
        return res;
    }

private:
    void print_vec(const std::vector<std::vector<char>>& vec) {
        for (int i = 0; i < vec.size(); i++) {
            for (int j = 0; j < vec[0].size(); j++) {
                std::cout << vec[i][j] << "  ";
            }
            std::cout << std::endl;
        }
        std::cout << std::endl;
    }
};
```

时间复杂度：`O(r*n)`，空间复杂度：`O(r*n)`

我们发现矩阵中有很多空出来的位置，我们其实可以去掉列这一属性。因此我们可以将矩阵的每一行都初始化成一个字符串。如下：

```
class Solution2 {
public:
    std::string convert(std::string s, int num_rows) {
        if (s.empty() || num_rows <= 1) {
            return s;
        }
        std::vector<std::string> vec(num_rows);
        int vec_row = -1;
        bool flag = true;
        for (int i = 0; i < s.size(); i++) {
            if (flag == true) {
                vec_row++;
                vec[vec_row].push_back(s[i]);
                if (vec_row == num_rows-1) {
                    flag = false;
                }
            } else {
                vec_row--;
                vec[vec_row].push_back(s[i]);
                if (vec_row == 0) {
                    flag = true;
                }
            }
        }
        std::string res;
        res.reserve(s.size());
        for (int i = 0; i < vec.size(); i++) {
            std::cout << vec[i] << std::endl;
            res.append(vec[i]);
        }
        return res;
    }
};
```

这样时间复杂度：`O(n)`，空间复杂度：`O(n)`

还有一种解法，第一种方法中，矩阵的每个非空字符会对应到 s 的那个下标（记做 idx），我们直接构造答案。

我们变化的周期是 `t = 2*r-2`，因此对于矩阵第一行的非空字符，其对应的 idx 均为 t 的倍数；同理，对于矩阵最后一行的非空字符，应该满足 `idx = (r-1) / t`。

对于矩阵的其余行，行号设为 i，每个周期内有两个字符，第一个字符满足 `idx = i/t`，第二个字符满足 `idx = t-i/t`

就是有如下的矩阵

```
0             0+t                    0+2t                     0+3t
1      t-1    1+t            0+2t-1  1+2t            0+3t-1   1+3t
2  t-2        2+t  0+2t-2            2+2t  0+3t-2             2+3t  
3             3+t                    3+2t                     3+3t

```

```
class Solution3 {
public:
    std::string convert(const std::string& s, int numRows) {
        if (s.empty() || numRows <= 1 || numRows >= s.size()) {
            return s;
        }
        int n = s.size();
        int r = numRows;
        int t = r*2-2;
        std::string res;
        for (int i = 0; i < r; i++) {
            for (int j = 0; j+i < n; j += t) {
                res.push_back(s[j+i]);
                if (0 < i && i < r-1 && j+t-i < n) {
                    res.push_back(s[j+t-i]);
                }
            }
        }
        return res;
    }
};
```

