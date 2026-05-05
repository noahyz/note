---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

# linux中删除干净mysql

1. 使用命令查看当前安装mysql 情况

`rpm -qa | grep -i mysql`

1. 停止mysql服务、删除之前安装的mysql

`rpm -ev 包名 `

如果有依赖包错误，可以加上 --nodeps 参数

如果提示 scriptlet failed 错误，可以加上 --noscripts

1. 查找之前老版本mysql的目录、并且删除老版本mysql的文件和库

Find / -name mysql

酌情删除，卸载后 my.cnf 不会被删，因此注意

1. 再次查找机器是否安装mysql

rpm -qa | grep -i mysql
