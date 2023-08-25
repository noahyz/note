---
title: 数字字符串删除 N 个字符，使结果最小
---

### 一、题目

有一个字符串s，仅有数字组成，现在将字符串的删除n个字符，使得剩下的字符组成的数字最小，不能打乱字符的顺序。

```
输入样例：
1221 2
324682385 3
输出样例：
11
242385
```

### 二、分析

贪心算法求解。最优解是删除出现的第一个左边 大于 右边的数，因为删除之后高位减小；每次删除一个数，一共删除 n 次，留下的数总是当前最优解。

```
class Solution {
public:
    std::string delete_n_numbers(std::string& str, int n) {
        bool flag = false;
        int start_pos = 0;
        for (int i = 0; i < n; i++) {
            flag = false;
            for (int j = start_pos; j < str.size()-1; j++) {
                if (str[j] > str[j+1]) {
                    str.erase(j, 1);
                    flag = true;
                    start_pos = j == 0 ? 0 : j-1;
                    break;
                }
            }
            // 如果所有数都递增，删除最后 i 个数字后直接返回
            if (flag == false) {
                str.erase(str.end()-i, str.end());
                break;
            }
        }
        return str;
    }
};
```

