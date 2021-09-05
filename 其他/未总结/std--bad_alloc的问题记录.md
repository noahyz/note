---
title: 同时启动多个程序，出现“std::bad_alloc”的问题
date: 2020-10-18 11:11:11
categories: 
- 其他
tags:
- linux
---

最近在linux上出现了这么一个问题：

```
terminate called after throwing an instance of 'std::bad_alloc' 
what(): std::bad_alloc
Aborted (core dumped)
```

是我在启动多个程序脚本的时候发生。是这样解决的

- 首先在别的机器上测试了启动，是正常的。排除了程序本身的问题
- 发现有core dumped，于是先查看了是否开启了core dump，ulimit -c 并设置。
- 发现coredump，没有急于去分析coredump。查看了系统日志，发现了在启动脚本的那个时间点出现了oom
- 于是立马检查了系统内存，最终发现由于同时启动多个程序时一下子占用过多内存导致。



插个眼：为什么同时启动多个程序会出问题，而一个一个的启动出现的概率较低。

