---
title: bcc 工具
---

BCC 工具链都是基于 eBPF 开发的。BCC 提供了贯穿内核各个子系统的动态追踪工具

<img src="./image/BCC工具.png" style="zoom:40%;" />

#### 工具调研

- memleak：检测内存泄漏。定期采集出未释放的内存块以及打印出其堆栈
- deadlock：死锁检测。调试未成功
- filetop：按照文件名和进程排序文件读写量。调试未成功
- opensnoop：跟踪 openat 系统调用