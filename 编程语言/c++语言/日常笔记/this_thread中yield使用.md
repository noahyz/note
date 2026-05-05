---
title: 对 std::this_thread::yield 的理解
date: 2023-01-19 11:11:41
tags:
- linux
---

## 对 std::this_thread::yield 的理解

`std::this_thread::yield()` 是将当前线程所抢到的 CPU 时间片让给其他线程，其他线程会抢此时间片，且当前线程不参与争抢。

因此适用于那种 “忙等待” 的场景。比如自旋锁。