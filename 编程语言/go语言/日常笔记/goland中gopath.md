---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

# goland中gopath

详解地址：https://www.jianshu.com/p/cf298a0db3fa

在Jetbrains 公司的 GoLand 集成开发环境（IDE）中GOPATH分两种：

1、Global GOPATH

2、Project GOPATHGlobal GOPATH与Project GOPATH 都代表项目所使用的 GOPATH，该设置会被保存在工作目录的 .idea 目录下，不会被设置到环境变量的 GOPATH 中，但会在编译时使用到这个目录。建议在开发时只填写项目 GOPATH，每一个项目尽量只设置一个 GOPATH，不使用多个 GOPATH 和全局的 GOPATH。在IDE中如果这两个都不设置，那默认会选择GOPATH的环境变量，也就是安装Go时GOPATH被赋予的默认目录。

关于gopath的路径问题

https://www.zhihu.com/question/341965520/answer/797797375