---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

# Linux中如何查看大文件大目录

搜索当前目录喜下超过800M的文件：find . -type f -size +800M

打印大文件的一些信息：find . -type f -size +800M -print0 | xargs -0 ls -lh

还可以对大文件进行排序：find . -type f -size +800M -print0 | xargs -0 du -h | sort -nr

---

搜索大目录：du -h --max-depth=1

查看大目录下的大子目录： du -h --max-depth=2 | sort -n 

还可以指定查询多少个：du -hm --max-depth=2 | sort -nr | head -10
