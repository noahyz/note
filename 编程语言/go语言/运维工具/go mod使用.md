---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

### module 的使用

默认情况下，GOPATH是不支持go modules 的。在 go env 中查看。设置 ` export GO111MODULE=on `

**使用goland 打开项目或创建项目的时候，需要设置 go modules 为 enable。**

使用 ` go mod init module_name` ，比如 ` go mod init github.com/objcoding/testmod `

go mod 中初始化第一行就是项目的依赖路径，通常来说该地址就是项目的仓库地址，所以需要项目包的地址都填写这个地址，无论是内部之间引用还是外部引用。

在项目启用啦 go modules 之后，引用包必须跟 go mod 文件第一行包名一样，依赖的包都会保存在 ${GOPATH}/pkg/mod 文件夹中。

go mod edit -require 可以主动修改 go.md 文件中依赖的版本号，然后通过 go mod tidy 对版本进行更新，它会自动清理掉不需要的依赖项，同时可以将依赖项更新到当前版本。

