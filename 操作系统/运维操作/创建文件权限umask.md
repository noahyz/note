---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

创建文件时，文件权限的设置

```
umask 用来设置新文件权限的掩码。当问文件被创建时，其最初的权限由文件创建掩码决定。
关系为 mode & ~umask 
umask 命令可以查看当前系统的 umask 值
在代码中使用 umask(0000); 设置之后，并不会改变系统的 umask 值，只会临时改变 umask 值。
```

