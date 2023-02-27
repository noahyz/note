---
title: gperftools
date: 2023-01-19 11:11:41
tags:
- 性能测试
---

### gperftools

CpuProfile 原理：start 和 stop 的区间，用于检测 cpu 以及函数的调用。生成一个 二进制+文本(smaps) 的文件，交给 pprof 来解析

CpuProfiler 中 start 调用 EnableHandler 用于注册回调（prof_handler）。回调函数中生成具体行为，插入到 hash 中，在整体 stop 或者 flush 的时候进行计算。

触发方式：以 settimer 为基础注册调度事件，以一定方式（定期）发送某个信号；然后 sigactiion 重置对此信号的处理，以达到调用我们注册的回调函数的目的。

### HeapProfiler

在 start 和 end 之间，dump 一份内存视图，进行对比两个视图。以发现是否有内存泄漏

### 暂定方案

- 注册想要的回调函数，重置信号处理函数。以一定的时间间隔来触发信号。达到采集数据的目的。-- cpuProfiler



使用说明：https://goog-perftools.sourceforge.net/doc/heap_profiler.html

