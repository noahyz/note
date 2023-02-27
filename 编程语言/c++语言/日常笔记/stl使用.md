---
title: STL使用
date: 2023-01-19 11:11:41
tags:
- linux
---

##  STL使用

```
string 替换指定字符
replace(str.begin(), str.end(), '/', '.')
会将str字符串中所有的 '/' 替换成 '.' 
```

### 二、最大堆、最小堆

priority_queue 默认是最大堆

```
priority_queue<int, vector<int>, less<int>> maxHeap;  // 最大堆 
priority_queue<int, vector<int>, greater<int>> minHeap;  // 最小堆
```

也可以自定义比较函数

```
// 内置类型
struct cmp {
     bool operator()(const int &a, const int &b) {
         return a > b;
    }
};
// 非内置类型
struct cmp {
     bool operator()(const Node&a, const Node&b) {
         return a.val > b.val;
    }
};
priority_queue<int, vector<int>, cmp> minHeap;
```

