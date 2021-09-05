---
title: string与memset的问题
date: 2021-03-07 20:19:17
categories:
- 编程语言
tags:
- c++
---

### string 与memset 的问题

场景：在初始化一个结构体中使用了string 这种类型，然后使用memset 对其进行赋值，全为0，结果后面使用出现段错误

原因：memset 函数破坏了string 的空间结构。不要使用 c语言的函数来做c++ 的对象。

