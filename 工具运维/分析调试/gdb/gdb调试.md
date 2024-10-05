---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

#### 1. 在 main 函数之前调试 core

```
# 可以帮助我们识别程序崩溃时正在加载的库
LD_DEBUG=all ./a.out
```

