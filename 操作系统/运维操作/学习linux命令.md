---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

# 学习linux命令

mysqldump

rsync

gcc命令

makefile

学习sql，了解底层

学习正则表达式

学习shell脚本

change master to change master to master_host='10.0.3.49',master_user='slave',master_password='slavepass',master_log_file='mysql-bin.000003',master_log_pos=1927;

rsync命令是一个远程数据同步工具，可通过LAN/WAN快速同步多台主机间的文件。rsync使用所谓的“rsync算法”来使本地和远程两个主机之间的文件达到同步，这个算法只传送两个文件的不同部分，而不是每次都整份传送，因此速度相当快。

https://man.linuxde.net/rsync

gcc 预处理-->汇编-->编译-->链接

-E 将源文件预处理成为 .i 文件。 -S 将源文件汇编成为 .s 文件。 -c 将源文件编译输出 .o 文件。-o 将源文件链接成为可执行文件。

其中 -O1 指的时优化等级，级别为1--3，级别越大，优化效果越好，但编译时间越长。

mysqldump%0Arsync%0Agcc%E5%91%BD%E4%BB%A4%0Amakefile%0A%E5%AD%A6%E4%B9%A0sql%EF%BC%8C%E4%BA%86%E8%A7%A3%E5%BA%95%E5%B1%82%0A%E5%AD%A6%E4%B9%A0%E6%AD%A3%E5%88%99%E8%A1%A8%E8%BE%BE%E5%BC%8F%0A%E5%AD%A6%E4%B9%A0shell%E8%84%9A%E6%9C%AC%0A%0A%0Achange%20master%20to%20change%20master%20to%20master_host%3D'10.0.3.49'%2Cmaster_user%3D'slave'%2Cmaster_password%3D'slavepass'%2Cmaster_log_file%3D'mysql-bin.000003'%2Cmaster_log_pos%3D1927%3B%0A%0A%0Arsync%E5%91%BD%E4%BB%A4%E6%98%AF%E4%B8%80%E4%B8%AA%E8%BF%9C%E7%A8%8B%E6%95%B0%E6%8D%AE%E5%90%8C%E6%AD%A5%E5%B7%A5%E5%85%B7%EF%BC%8C%E5%8F%AF%E9%80%9A%E8%BF%87LAN%2FWAN%E5%BF%AB%E9%80%9F%E5%90%8C%E6%AD%A5%E5%A4%9A%E5%8F%B0%E4%B8%BB%E6%9C%BA%E9%97%B4%E7%9A%84%E6%96%87%E4%BB%B6%E3%80%82rsync%E4%BD%BF%E7%94%A8%E6%89%80%E8%B0%93%E7%9A%84%E2%80%9Crsync%E7%AE%97%E6%B3%95%E2%80%9D%E6%9D%A5%E4%BD%BF%E6%9C%AC%E5%9C%B0%E5%92%8C%E8%BF%9C%E7%A8%8B%E4%B8%A4%E4%B8%AA%E4%B8%BB%E6%9C%BA%E4%B9%8B%E9%97%B4%E7%9A%84%E6%96%87%E4%BB%B6%E8%BE%BE%E5%88%B0%E5%90%8C%E6%AD%A5%EF%BC%8C%E8%BF%99%E4%B8%AA%E7%AE%97%E6%B3%95%E5%8F%AA%E4%BC%A0%E9%80%81%E4%B8%A4%E4%B8%AA%E6%96%87%E4%BB%B6%E7%9A%84%E4%B8%8D%E5%90%8C%E9%83%A8%E5%88%86%EF%BC%8C%E8%80%8C%E4%B8%8D%E6%98%AF%E6%AF%8F%E6%AC%A1%E9%83%BD%E6%95%B4%E4%BB%BD%E4%BC%A0%E9%80%81%EF%BC%8C%E5%9B%A0%E6%AD%A4%E9%80%9F%E5%BA%A6%E7%9B%B8%E5%BD%93%E5%BF%AB%E3%80%82%0Ahttps%3A%2F%2Fman.linuxde.net%2Frsync%0A%0Agcc%20%E9%A2%84%E5%A4%84%E7%90%86--%3E%E6%B1%87%E7%BC%96--%3E%E7%BC%96%E8%AF%91--%3E%E9%93%BE%E6%8E%A5%0A-E%20%E5%B0%86%E6%BA%90%E6%96%87%E4%BB%B6%E9%A2%84%E5%A4%84%E7%90%86%E6%88%90%E4%B8%BA%20.i%20%E6%96%87%E4%BB%B6%E3%80%82%20-S%20%E5%B0%86%E6%BA%90%E6%96%87%E4%BB%B6%E6%B1%87%E7%BC%96%E6%88%90%E4%B8%BA%20.s%20%E6%96%87%E4%BB%B6%E3%80%82%20-c%20%E5%B0%86%E6%BA%90%E6%96%87%E4%BB%B6%E7%BC%96%E8%AF%91%E8%BE%93%E5%87%BA%20.o%20%E6%96%87%E4%BB%B6%E3%80%82-o%20%E5%B0%86%E6%BA%90%E6%96%87%E4%BB%B6%E9%93%BE%E6%8E%A5%E6%88%90%E4%B8%BA%E5%8F%AF%E6%89%A7%E8%A1%8C%E6%96%87%E4%BB%B6%E3%80%82%0A%E5%85%B6%E4%B8%AD%20-O1%20%E6%8C%87%E7%9A%84%E6%97%B6%E4%BC%98%E5%8C%96%E7%AD%89%E7%BA%A7%EF%BC%8C%E7%BA%A7%E5%88%AB%E4%B8%BA1--3%EF%BC%8C%E7%BA%A7%E5%88%AB%E8%B6%8A%E5%A4%A7%EF%BC%8C%E4%BC%98%E5%8C%96%E6%95%88%E6%9E%9C%E8%B6%8A%E5%A5%BD%EF%BC%8C%E4%BD%86%E7%BC%96%E8%AF%91%E6%97%B6%E9%97%B4%E8%B6%8A%E9%95%BF%E3%80%82%0A%0A%0A%E6%95%B0%E6%8D%AE%E5%BA%93%E5%AF%BC%E5%87%BA%E6%95%B0%E6%8D%AE%EF%BC%9A%0A%24%20mysqldump%20-u%20root%20-p%20RUNOOB%20runoob_tbl%20%3E%20dump.txt%0A%24%20mysqldump%20-u%20root%20-p%20RUNOOB%20%3E%20database_dump.txt%0A%E5%A4%87%E4%BB%BD%E6%89%80%E6%9C%89%E6%95%B0%E6%8D%AE%E5%BA%93%3A%0A%24%20mysqldump%20-u%20root%20-p%20--all-databases%20%3E%20database_dump.txt%0A%E5%AF%BC%E5%85%A5%E6%95%B0%E6%8D%AE%EF%BC%9A(%E5%89%8D%E6%8F%90%E6%98%AF%E6%95%B0%E6%8D%AE%E5%BA%93%E6%98%AF%E5%AD%98%E5%9C%A8%E7%9A%84)%0A%24%20mysql%20-u%20root%20-p%20database_name%20%3C%20dump.txt%0A%E8%BF%9C%E7%A8%8B%E5%AF%BC%E5%85%A5%E6%95%B0%E6%8D%AE%EF%BC%88%E4%B8%A4%E5%8F%B0%E6%9C%8D%E5%8A%A1%E5%99%A8%E4%BA%92%E9%80%9A%EF%BC%8C%E5%8F%AF%E4%BB%A5%E4%BA%92%E7%9B%B8%E8%AE%BF%E9%97%AE%EF%BC%89%0A%24%20mysqldump%20-u%20root%20-p%20database_name%20%7C%20mysql%20-h%20other-host.com%20database_name%0Asource%20%2Fhome%2Fabc%2Fabc.sql%20%20%23%20%E5%AF%BC%E5%85%A5%E5%A4%87%E4%BB%BD%E6%95%B0%E6%8D%AE%E5%BA%93
