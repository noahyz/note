---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

Golang支持交叉编译，在一个平台上生成然后再去另外一个平台去执行。

### 交叉编译

#### 1. Mac下编译，Linux或者Windows下去执行

```
# linux 下去执行
CGO_ENABLED=0  GOOS=linux  GOARCH=amd64  go build main.go
# Windows 下去执行
CGO_ENABLED=0 GOOS=windows  GOARCH=amd64  go  build  main.go
```

#### 2. Linux下编译，Mac或者Windows下去执行

```
# Mac  下去执行
CGO_ENABLED=0 GOOS=darwin  GOARCH=amd64  go build main.go
# Windows 下执行
CGO_ENABLED=0 GOOS=windows  GOARCH=amd64  go build main.go
```

#### 3. Windows下编译，Mac或者Linux下去执行

需要写一个批处理程序，在里面去设置，因为windows 下的 terminal 不支持shell , 这跟 Mac 和 Linux下的有点不同

```
# Mac 下执行
SET  CGO_ENABLED=0
SET GOOS=darwin
SET GOARCH=amd64
go build main.go
```

```
# Linux 去执行
SET CGO_ENABLED=0
SET GOOS=linux
SET GOARCH=amd64
go build main.go
```

#### 参数说明

- **CGO_ENABLED** : CGO 表示golang中的工具，CGO_ENABLED 表示CGO禁用，交叉编译中不能使用CGO的

- GOOS

   : 目标平台

  - mac 对应  **darwin**
  - linux 对应 **linux**
  - windows 对应 **windows**

- GOARCH

   ：目标平台的体系架构【386，amd64,arm】, 目前市面上的个人电脑一般都是amd64架构的

  - 386 也称 x86 对应  32位操作系统
  - amd64 也称 x64 对应 64位操作系统
  - arm 这种架构一般用于嵌入式开发。 比如 Android ， IOS ， Win mobile , TIZEN 等