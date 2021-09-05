---
title: Mysql表空间一级ibdata1文件过大问题
date: 2021-03-07 20:19:17
categories:
- 数据库
tags:
- ibdata1文件
---

## mysql 表空间一级ibdata1文件过大问题

https://www.cnblogs.com/youyoui/p/10554229.html

https://dev.mysql.com/doc/refman/5.6/en/innodb-system-tablespace.html

mysql官网上已经说的很清楚了

## 一、Mysql系统表空间

Mysql的系统表空间是 InnoDB数据字典，双写缓冲区、更改缓冲区和撤销日志的存储区。如果用户在系统表空间中创建表，而不是在每个表文件中创建表，则还包含用户在系统表空间创建的表信息和索引数据。

系统表空间可以具有一个或多个数据文件。默认情况下，在数据目录中创建一个名为ibdata1的系统表空间数据文件。系统表空间数据的大小和数量由innodb_data_file_path启动选项定义。

**另一种表空间：独立表空间**，独立表空间模式下，每个innodb表都有自己独立的表空间文件(.ibd文件)，存储各种表的索引和数据。

配置项：innodb_file_per_table 指定Mysql使用独立表空间，Mysql5.6以后的版本默认值为ON，Mysql5.6以前的版本默认为OFF

#### 1. 增加系统表空间的大小

增加系统表空间大小的最简单办法就是配置为自动扩展，如下：

`innodb_data_file_path=ibdata1:10M:autoextend`

然后重启Mysql服务

还可以通过添加另一个数据文件来增加系统表空间的大小，具体参考：https://dev.mysql.com/doc/refman/5.6/en/innodb-system-tablespace.html

#### 2. 减少InnoDB系统表空间的大小

不能从系统表空间中删除数据文件，要减少系统表空间大小，则

1. 使用mysqldump转储所有InnoDB表，包括模式中的InnoDB表mysql。可以这样查询

```
mysql> SELECT TABLE_NAME from INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='mysql' and ENGINE='InnoDB';
+----------------------+
| table_name           |
+----------------------+
| innodb_index_stats   |
| innodb_table_stats   |
| slave_master_info    |
| slave_relay_log_info |
| slave_worker_info    |
+----------------------+
```

2. 停止Mysql服务器

3. 删除所有的表空间文件(*.ibd)，包括ibdata1和ib_log文件，以及数据库自带的 .idb 文件

4. 然后需要删除所有的表结构描述文件 *.frm，位于数据库名称相应的文件夹下

5. 修改配置文件 my.cnf中，在 [mysqld]下添加 innodb_file_per_table=1 配置

```
[mysqld]
innodb_file_per_table=1
```

6. 重新启动Mysql服务。`mysqld_safe --defaults-file=/your/config/path/my.cnf &`

7. 导入mysqldump 备份数据

```
# 登录进入mysql
mysql -hlocalhost -uroot -pxxxxx database_name
# 导入数据
source /your/backup/file/path/dump.sql
```
## 二、独立表空间的优点

刚开始建立数据库时，就推荐使用独立表空间，`MySQL5.6.6`以后的版本默认是独立表空间。

使用独立表空间很显然能够提高存储效率，拆分表和表之间的耦合，将对数据库的操作粒度降低到表级别。

独立表空间对于存储优化，迁移，备份，恢复和监控来说，都更加灵活和强大。下面列举一些代表性的好处：

* truncate和drop表时会释放掉磁盘空间，共享表空间并不会释放而是在ibdata1中开辟新的空间
* truncate table时速度更快
* 可以将表放在不同的磁盘上（用于I/O优化等），共享表空间必须所有表都反正ibdata1中
* 可以对每个表使用`OPTIMIZE TABLE`命令进行优化和重建，回收未使用的空间
* 可以移动单个表，或者将单个表从一个实例复制到另外一个实例
* 使用`Barracuda`文件格式，至此压缩和动态行等功能
* 使用动态行(dynamic row format）可以使得存储大型BLOB和TEXT格式数据更高效
* 当文件损坏时，提高成功恢复机会，节省服务器重启或备份的时间
##### 当然独立表空间也有一些潜在的缺点：

* 由于每个表都存在为使用的空间，这些空间只能同一个表使用，可能会造成空间浪费
* fsync操作必须在每个打开的表上运行
* mysqld必须为每个表保留一个打开的文件句柄，如果表过多，可能会影响性能
* 在删除表空间的文件时会扫描缓冲池，如果缓冲池达到几十G，则需要几秒的时间，而扫描会造成锁，可能会延迟其他操作
* 如果许多表正在增长，可能会存在更多的碎片，这回妨碍删除表和扫描表的性能。
