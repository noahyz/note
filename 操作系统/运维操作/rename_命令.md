---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

# rename 命令

rename main1.c main.c main1.c

参数

1. 原字符串：文件名需要替换的字符串
2. 目标字符串：将文件名中含有的原字符替换成目标字符串
3. 文件：指定要改变文件名的文件列表
支持通配符

？可替代单个字符

* 可替代多个字符
[charset] 可替代 charset 集合中的任意单个字符

文件夹中有这些文件foo1, ..., foo9, foo10, ..., foo278

如果使用rename foo foo0 foo?，会把foo1到foo9的文件重命名为foo01到foo09，重命名的文件只是有4个字符长度名称的文件，文件名中的foo被替换为foo0。

如果使用rename foo foo0 foo??，foo01到foo99的所有文件都被重命名为foo001到foo099，只重命名5个字符长度名称的文件，文件名中的foo被替换为foo0。

如果使用rename foo foo0 foo* ，foo001到foo278的所有文件都被重命名为foo0001到foo0278，所有以foo开头的文件都被重命名。

如果使用rename foo0 foo foo0[2]* ，从foo0200到foo0278的所有文件都被重命名为foo200到foo278，文件名中的foo0被替换为foo。

rename支持正则表达式

字母的替换

rename "s/AA/aa/" * //把文件名中的AA替换成aa

修改文件的后缀

rename "s//.html//.php/" * //把.html 后缀的改成 .php后缀

批量添加文件后缀

rename "s/$//.txt/" * //把所有的文件名都以txt结尾

批量删除文件名

rename "s//.txt//" * //把所有以.txt结尾的文件名的.txt删掉
