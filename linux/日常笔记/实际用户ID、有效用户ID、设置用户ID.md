---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

# 实际用户ID、有效用户ID、设置用户ID

* 实际用户ID：RUID：用于在系统中标识一个用户是谁，当用户使用用户名和密码成功登陆后一个UNIX系统后就能确定他的RUID
* 有效用户ID：EUID：用于系统决定用户对系统资源的访问权限，通常情况下等于RUID
* 设置用户ID：SUID：用于对外权限的开放，是和RUID、EUID一样使用一个用户绑定，但是是和文件绑定而不是和用户绑定。

参考博文：https://blog.csdn.net/kc58236582/article/details/79466433
