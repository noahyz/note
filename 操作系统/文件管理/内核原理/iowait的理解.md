---
title: iowait 的理解
---

### 一、什么是 iowait

来自 linux 中的解释

```
Show the percentage of time that the CPU or CPUs were idle during which the system had an outstanding disk I/O request.
```

**iowait 指在一个采样周期内有百分之几的时间是属于以下情况：CPU处于空闲状态并且至少有一个未完成的磁盘IO请求**

那么根据 iowait 的定义可知，iowait 是属于 idle 的一个子类。可以把 iowait 当成一种等待 IO 而造成的 idle 状态。

### 二、原理

在内核中，`user, sys, idle, iowait` 四种状态，每个状态都有一个计数器，负责一个采样周期内统计每个状态的计数，最后计算每个计数器占总计数的百分比，结果就是每个状态所占的百分比。

也就是说，当发生时钟中断的时候，内核会检查 CPU 当前的状态，如果 CPU 正在执行内核空间的指令，则 sys 的计数器加 1 ，如果是用户空间的指令，则 user 的计数器加 1。如果 CPU 此时处于 idle 状态，内核会检查：是否存在从该 CPU 发起的一个未完成的本地磁盘、网络 IO 请求等条件。如果存在，则 iowait 的计数器加 1，如果都没有，则 idle 的计数器加 1。

Linux 系统时钟频率是一个常数 HZ，通常 HZ 为 100，一秒振动 100 次。也就是说，每 10ms 进行一次中断。计数器在每次时钟中断时进行计数，所以用每种状态的计数器的增量值除以总间隔时钟数，就能得到每种状态所占时间的百分比。

### 三、iowait 常见的误解

#### 1. iowait 高不代表 IO 存在瓶颈

https://blog.csdn.net/fengye_csdn/article/details/124092138