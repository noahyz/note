---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

## perf 工具学习

```
抓火焰图：
perf record -F 99 -a -g -p $PID -- sleep 180
perf script -i perf.data > perf.unfold
```

