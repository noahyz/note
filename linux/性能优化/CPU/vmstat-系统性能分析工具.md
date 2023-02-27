---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

## vmstat

当系统所需的内存超过实际的物理内存，内核会释放某些进程占用但未使用的部分或所有物理内存，将这部分资料存储在磁盘上直到进程下一次调用，并将释放出的内存提供给有需要的进程使用。

vmstat （Virtual Memory）命令的含义为显示虚拟内存状态，可以报告关于进程、内存、IO 等系统整体运行状态

```shell
➜  [/tmp] vmstat -h

Usage:
 vmstat [options] [delay [count]]

Options:
 -a, --active           active/inactive memory
 -f, --forks            number of forks since boot
 -m, --slabs            slabinfo
 -n, --one-header       do not redisplay header
 -s, --stats            event counter statistics
 -d, --disk             disk statistics
 -D, --disk-sum         summarize disk statistics
 -p, --partition <dev>  partition specific statistics
 -S, --unit <char>      define display unit
 -w, --wide             wide output
 -t, --timestamp        show timestamp

 -h, --help     display this help and exit
 -V, --version  output version information and exit
```

- -a：显示活跃和非活跃内存
- -f：显示从系统启动至今的 fork 数量
- -m：显示 slabinfo
- -n：只在开始时显示一次各字段名称
- -s：显示内存相关统计信息及多种系统活动数量
- -d：显示磁盘相关统计信息
- -p：显示指定磁盘分区统计信息
- -S：使用指定单位显示，参数有 k、K、m、M，分别代表 1000、1024、1000000、1048576字节（byte）。默认单位是 K（1024 bytes）
- -V：显示版本信息

### 一、每 3 秒输出一条结果

```shell
➜  [/tmp] vmstat 3
procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
 1  0      0 5235672 1278632 6337300    0    0     5    18    0    0  1  1 98  0  0
 0  0      0 5235540 1278800 6337308    0    0    55    32 1880 1452  0  0 99  0  0
```

- procs （进程）
    - r：运行队列中进程数量，就是正在运行和等待CPU的进程数
    - b：等待 IO 的进程数量，就是出于不可中断睡眠状态的进程数
- Memory（内存）
    - swpd：使用虚拟内存大小
    - free：空闲物理内存大小
    - buff：用作缓冲的内存大小，写入磁盘前先写到 buff ，然后集中刷到磁盘
    - cache：用作缓存的内存大小，cache 值大，说明 cache 处的文件多，如果频繁访问到的文件都能直接在 cache 处访问，那么磁盘的读 IO 会很小
- swap
    - si：每秒从交换区写到内存的大小，由磁盘调入内存
    - so：每秒写入交换区的内存大小，由内存调入磁盘
    - 注意：内存够用时，这 2个值都为 0，如果这两个值长期大于 0，系统性能会受到影响，磁盘 IO 和 CPU 资源都会被消耗
- IO（现代的 linux 版本 块的大小为 1kb，所以单位为 KB/s）
    - bi：每秒读取的块数（块设备读取的大小）
    - bo：每秒写入的块数（块设备写入的大小）
    - 注：随机磁盘读写时，这两个值越大，CPU 在 IO 等待的值也越大
- system
    - in：每秒中断次数，包括时钟中断
    - cs：每秒上下文切换数
    - 注：这两个值越大，内核消耗的 CPU 时间越大
- CPU
    - us：用户进程执行时间百分比（user time），us 的值比较高时，说明用户进程消耗的 CPU 时间多。
    - sy：内核系统进程执行时间百分比（system time）
    - wa：IO 等待时间百分比
    - id：空闲时间百分比
    - st：被虚拟机所盗用的时间百分比























