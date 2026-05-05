---
title: mysql终端无法输入中文问题
date: 2021-03-07 20:19:17
categories:
- 数据库
tags:
- 输入中文
---

## Mysql终端无法输入中文问题

1、首先应该考虑本地终端是否可以输入中文，本地如果无法输入中文，mysql 终端肯定不可以。

使用命令 env，查看环境变量中的 LANG 属性

export LANG=en_US.UTF-8 

2、mysql 控制台如何查看数据库中文乱码，此时则需要修改数据库的字符集\

show variables like ‘%char%';

如果database connection client 字符集不是 utf8 的情况，则修改他们的属性即可。

set character_set_database = utf8;

set character_set_server = utf8;

set character_set_results='utf8’; 

3、在mysql 控制台输入 \s 可以查看当前链接情况
