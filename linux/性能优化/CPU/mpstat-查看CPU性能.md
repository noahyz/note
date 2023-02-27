---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

## mpstat

sysstat 包含了常用的Linux 性能分析工具，用来监控和分析系统的性能。
mpstat 是一个常见的多核CPU性能分析工具，用来实时查看每个CPU的性能指标，以及所有CPU的平均指标
工具使用：

```shell
[root@localhost ~]# mpstat -h
Usage: mpstat [ options ] [ <interval> [ <count> ] ]
Options are:
[ -A ] [ -u ] [ -V ] [ -I { SUM | CPU | SCPU | ALL } ]
[ -P { <cpu> [,...] | ON | ALL } ]
```

- -P {cpu | ALL} 表示监控那个 CPU，cpu 在[0, cpu个数-1] 中取值；或者 ALL 监控所有CPU
- `<interval>` 相邻的两次采样的间隔时间
- `<count>` 采用次数

输出参数含义：

```shell
[root@localhost ~]# mpstat -P ALL 2 1
Linux 3.10.0-1160.el7.x86_64 (localhost.localdomain)    01/13/2022      _x86_64_        (2 CPU)

07:05:24 AM  CPU    %usr   %nice    %sys %iowait    %irq   %soft  %steal  %guest  %gnice   %idle
07:05:26 AM  all   50.25    0.00    0.00    0.00    0.00    0.00    0.00    0.00    0.00   49.75
07:05:26 AM    0   39.80    0.00    0.00    0.00    0.00    0.00    0.00    0.00    0.00   60.20
07:05:26 AM    1   60.50    0.00    0.00    0.00    0.00    0.00    0.00    0.00    0.00   39.50

Average:     CPU    %usr   %nice    %sys %iowait    %irq   %soft  %steal  %guest  %gnice   %idle
Average:     all   50.25    0.00    0.00    0.00    0.00    0.00    0.00    0.00    0.00   49.75
Average:       0   39.80    0.00    0.00    0.00    0.00    0.00    0.00    0.00    0.00   60.20
Average:       1   60.50    0.00    0.00    0.00    0.00    0.00    0.00    0.00    0.00   39.50
```

- 注意1：当 mpstat 没有参数时，输出系统启动以后所有信息的平均值。有 interval 参数时，第一块的信息是自系统启动以来的平均信息。从第二块开始，输出为前一个 interval 时间段的平均信息。
- 注意2：mpstat 的输出是从 /proc/stat 获取数据
- %usr 在 interval 时间段里，用户态的CPU时间(%)，不包含 nice 值为负的进程
- %nice 在 interval 时间段内，nice 值为负的进程的 CPU 时间(%)
- %sys 在 interval 时间段内，内核态的CPU时间(%)
- %iowait 在 interval 时间段内，磁盘IO等待时间(%)
- %irq 在 interval 时间段内，硬中断时间(%)
- %soft 在 interval 时间段内，软中断时间(%)
- %idle 在 interval 时间段内，CPU除去等待磁盘IO操作外的因为任何原因而空闲的时间(%) 