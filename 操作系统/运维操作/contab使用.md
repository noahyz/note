---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

### Crontab 

#### 一、使用

```
crontab [-u username] // 省略用户表示操作当前用户的 crontab
-e：编辑工作表
-l：列出工作表里的命令
-r：删除工作表
```

crontab 的命令构成 时间+动作，其时间有 ` 分、时、日、月、周` 五种，操作符有

```shell
*  取值范围内的所有数字
/  每过多少个数字
-  从X到Z
,  散列函数
```

#### 二、例子

```shell
# 晚上11点到早上7点之间，每隔一小时重启
0 23-7/1 * * * /etc/init.d/smb restart

# 每天8点-11点的第3分和第15分钟执行
3,15 8-11 * * * myCommand
```





