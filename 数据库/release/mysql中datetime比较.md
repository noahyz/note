---
title: mysql中datetime比较
date: 2021-03-07 20:19:17
categories:
- 数据库
tags:
- datetime
---

## mysql中datetime比较

select * from xx where begin_time >= '2010-01-11 00:00:00''

这样写不会报错，但是得出的结果不准确

不应该使用这种方法去比较

### 方法一：

使用 unix_timestamp 函数，将字符型的时间，转成unix时间戳。

select * from xx where begin_time >= unix_timestamp('2011-01-11 00:00:00' )

### 方法二：

使用 between ... and

time1 between '2011-01-11 00:00:00' and '2011-04-11 19:00:00'

### 方法三

可以将datetime类型转换成date类型在比较

convert(date,表名.datetime列名) >= convert(date,表名.datetime列名)

