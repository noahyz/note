---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

# lsof 命令

介绍

lsof 可以列出当前系统打开文件的工具，因为在linux 环境下，任何事物都以文件的形式存在。因为lsof 需要访问核心内存和各种文件，所以需要root 用户执行。

命令参数：

-a：列出打开文件存在的进程

-c <进程名> ：列出指定进程所打开的文件

-g：列出GID 号进程详情

-d <文件号> ：列出占用该文件号的进程

+d <目录> ：列出目录下被打开的文件

+D <目录> ：递归列出目录下被打开的文件

-n <目录> ：列出使用NFS 的文件

-i <条件> ：列出符合条件的进程。

-p <进程号> ：列出指定进程号所打开的文件

-u ：列出UID 号进程详情

-h：显示帮助信息

-v：显示版本信息 

例如：

lsof -I : 3306 ：列出谁在使用3306 这个端口

grep 123456  /proc/*/maps
