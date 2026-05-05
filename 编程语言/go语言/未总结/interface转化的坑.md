---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

https://zhuanlan.zhihu.com/p/53125839

go语言将json串 转为 map[string]interface{} 

会导致原来的 uint64 和 float64 类型都转换成 float64 类型

查看 json 的规范可以看到，在 json 中是没有整型和浮点型之分的，所以现在可以理解 json 包中的 Unmarshal 方法转出的数字类型为什么都是 float64 了，因为根据 json 规范，数字都是同一种类型，那么对应到 go 的类型中最接近的就是 float64 了。

