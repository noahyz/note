---
title: 查看linux系统/文件是32位还是64位
date: 2021-03-07 21:54:54
categories:
- linux
tags:
- 系统
---

## 查看linux 系统/文件是32位还是64位

* uname -a ：查看系统内核信息

### 1. 对于可执行文件、.o 文件、 .so文件

* 使用 file 命令查看：file temp.o
* 使用 readelf 命令：readelf -h temp.o
