---
title: 字符串的最长回文子串
---

### 一、题目

给定一个字符串 str，返回 str 中最长回文子串的长度

```
str="123", 其中的最长回文子串为 "1"、"2" 或者 "3"，所以返回 1
str="abc1234321ab"，其中的最长回文子串为 "1234321",所以返回 7
```

Leetcode：https://leetcode.cn/problems/longest-palindromic-substring/

### 二、分析

大名鼎鼎的 manacher 算法，就是用于此种类型的题目

首先给给定的字符串中的每个位置插入一个字符，作为虚轴。即如下，给每个位置都插入一个 # 字符

```
abccba => #a#b#c#c#b#a#
```

为什么这样做呢？对于暴力解法中，对于奇回文，都有一个 轴 可以作为中心，可以向两边扩得到回文。但是对于偶回文，却没有一个轴，我们需要做特殊处理，特殊判断，这样增加了代码的难度。还不如在每个位置都增加一个 # 字符，让奇、偶回文，都可以变成奇回文，也就是让回文串都有一个轴。

接下来，我们定义几个变量来供我们理解

- C 表示中心点，也就是回文串的中心轴
- L 表示中心点的左边界； R 表示中心点的右边界。最远可以到达的边界
- 来一个数组 pArr，长度和处理过后的字符串一样长。表示以每个字符为中心点，回文串的半径

然后我们遍历这个字符串，假设当前遍历到 i 位置了，来分情况讨论，两个大情况。

第一种情况是 i 大于 R 了，也就是 i 的位置没法加速。只能暴力扩。

第二种情况就是 i 在 R 内，这种情况下分为三种小情况，i 在 R 内的话，相对于中心点 C 一定有一个对应点 `i'` 点。可以利用 `i'` 点来做加速。

- 当以 `i'` 点为中心点，它的回文半径在 L..R 内时，对应的 i 点的回文半径也一定在 L..R 内
- 当 `i'` 点的回文半径在 L..R 外时，对应的 i 点的回文半径一定在 L..R 边界上。
- 当 `i'` 点的回文半径在 L..R 边界上，对应的 i 点的回文半径就需要从 L..R 边界向外扩，查看是否还能扩

好，一共就这 4 种情况，这样子的话，我们求最长回文串的时间复杂度就可以达到 `O(N)`

如下代码

```
// 求最长回文串的长度
class Solution {
public:
    int get_max_palindrome_len(const std::string& str) {
        if (str.empty()) {
            return 0;
        }
        std::string wrap_str;
        wrap_str.resize(str.size()*2+1);
        int index = 0;
        for (int i = 0; i < str.size()*2+1; i++) {
            wrap_str[i] = (i & 0x01) == 0 ? '#' : str[index++];
        }
        std::vector<int> pArr(wrap_str.size(), 0);
        int R = -1;
        int C = -1;
        int max = 0;
        for (int i = 0; i < wrap_str.size(); i++) {
            // i > R 说明 i 在 L..R 范围外。还需要往外扩
            // i <= R 说明 i 在 L..R 范围内。处于边界上时需要往外扩，
            pArr[i] = i > R ? 1 : std::min(pArr[2*C-i], R-i);
            while (i+pArr[i] < wrap_str.size() && i - pArr[i] > -1) {
                if (wrap_str[i+pArr[i]] == wrap_str[i-pArr[i]]) {
                    pArr[i]++;
                } else {
                    break;
                }
            }
            if (i+pArr[i] > R) {
                R = i+pArr[i];
                C = i;
            }
            max = std::max(max, pArr[i]);
        }
        return max-1;
    }
};

// 求最长的回文串
class Solution2 {
public:
    std::string get_max_palindrome_str(const std::string& str) {
        if (str.empty()) {
            return "";
        }
        std::string wrap_str;
        wrap_str.resize(str.size()*2+1);
        int index = 0;
        for (int i = 0; i < wrap_str.size(); i++) {
            // 注意，& 和 == 运算符的优先级
            wrap_str[i] = (i & 0x01) == 0 ? '#' : str[index++];
        }
        std::vector<int> pArr(wrap_str.size(), 0);
        int R = -1;
        int C = -1;
        for (int i = 0; i < wrap_str.size(); i++) {
            // i > R 说明 i 在 L..R 范围外。还需要往外扩
            // i <= R 说明 i 在 L..R 范围内。处于边界上时需要往外扩，
            // 注意：2*C-i 可能被 leetcode 认为有可能小于 0，导致代码检测失败。这里给判断一下
            pArr[i] = i > R ? 1 : std::min((2*C-i >= 0 ? pArr[2*C-i] : R-i), R-i);
            while (i+pArr[i] < wrap_str.size() && i - pArr[i] > -1) {
                if (wrap_str[i+pArr[i]] == wrap_str[i-pArr[i]]) {
                    pArr[i]++;
                } else {
                    break;
                }
            }
            if (i+pArr[i] > R) {
                R = i+pArr[i];
                C = i;
            }
        }
        int max_radii = 0;
        int pos = 0;
        for (int i = 0; i < pArr.size(); i++) {
            if (pArr[i] > max_radii) {
                max_radii = pArr[i];
                pos = i;
            }
        }
        // 奇回文：回文半径是偶数。中心点是实轴，就是非 # 字符。它的边界肯定是我们添加的 # 字符
        // 偶回文：回文半径是奇数。中心点是虚轴，就是我们添加的 # 字符。它的边界肯定也是我们添加的 # 字符
        // 但是无论是奇回文，还是偶回文。他们的边界一定是我们添加的 # 字符，因此我们要跳过这个 # 字符
        std::string res;
        for (int i = pos-max_radii+1+1; i <= pos+max_radii-1-1; i+=2) {
            res.push_back(wrap_str[i]);
        }
        return res;
    }
};
```