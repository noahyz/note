---
title: URL反转
---

### 一、URL反转

给你一个url，反转。

如 `https://www.baidu.com/dev-ops/question`，反转后结果为 `https://question/ops-dev/com.baidu.www`

### 二、分析

此题目是按照 `/` 来反转的，而且要排除掉 `https://`。所以我们先对 `www.baidu.com/dev-ops/question` 这部分全部反转，然后在每隔 `/` 作为一个分隔，进行反转即可

```
class Solution {
public:
    void reserve_str(std::string& url) {
        int left = 0, right = url.size()-1;
        int count = 0;
        while (count != 2) {
            if (url[left] == '/') {
                count++;
            }
            left++;
        }
        int pos = left;
        // 先全部反转
        while (left < right) {
            std::swap(url[left++], url[right--]);
        }
        left = pos;
        for (int i = left; i < url.size(); i++) {
            if (url[i] == '/' || i == url.size()-1) {
                right = i == url.size()-1 ? i : i-1;
                while (left < right) {
                    std::swap(url[left++], url[right--]);
                }
                left = i+1;
            }
        }
    }
};
```