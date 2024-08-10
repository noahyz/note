---
title: mysql磁盘存储
date: 2021-03-07 20:19:17
categories:
- 数据库
tags:
- 存储
---

## Mysql磁盘存储

Mysql 的数据的访问和持久化都需要磁盘来当作存储工具

### frm、ibd文件
在mysql中当我们创建表的时候，mysql可以帮助创建一个 .frm 文件和 .ibd 文件。 其中 .frm 文件是描述表结构定义的文件，而 .ibd 文件是 Innodb 引擎特有的，用于记录 Innodb 表的数据。
一般这两个文件存在于Mysql的data目录下。而且文件名就是创建的表名。

### Innodb的文件存储格式和行存储格式
Innodb中的表是分文件存储的，表中的数据都是按照一定的格式存储在文件中的。
Innodb的文件格式由参数 innodb_file_format 指定。可以使用 `show variables like 'innodb_file_format';` 查看
Antelope文件格式是较早的，它支持的行存储格式为：Compact、Redundant
Barracuda 是新的文件存储格式，它兼容Antelope，它支持的行存储格式：Compressed、Dynamic

Innodb表的行存储格式由参数 innodb_default_row_format 指定，行存储格式表明了表中的每行数据是如何存储在文件中的，不同存储格式有不同的优缺点，也适合不同的场景，也会决定数据库的使用性能。
例如，使用 Compressed 这种格式可以使行记录有更高的压缩比，如果一个物理页能存放的行记录越多，它的索引或记录查找会更快，内存消耗也会更小，但是压缩数据本身也会带回额外的系统开销。

注意一点，在迁移数据库的时候，需要关注源实例和目标实例之间行存储格式是否匹配。比如你有一个 MyISAM 的表要迁移到 InnoDB 上，并且 MyISAM 表的 Row Format 为默认值 Fixed ，此时需要改成 Dynamic ，因为这两种格式对变长字段如 varchar/blob/text 等的处理是不一致的。

### 表空间
InnoDB 每个表都有自己独立的文件，其实是用到了它的默认行为，即使用独立表空间，它由参数 innodb_file_per_table 控制。事实上 InnoDB 包含多种表空间类型，包括系统表空间 ( System TableSpace )，独立表空间 ( File-Per-Table TableSpace ) 和通用表空间 ( General TableSpace ) 等。

系统表空间存储了 InnoDB 的数据字典（元数据信息），系统表，双写缓冲区 ( doublewrite buffer )，Change Buffer 等。如果将参数 innodb_file_per_table 置为 OFF ，即所有的表数据都存储在系统表空间中。但是在使用 InnoDB 时，更推荐的方法是将 innodb_file_per_table 置为 ON，即使用独立表空间，它有如下几个好处：
1. 当使用 Truncate Table 和 Drop Table 命令删除表时，系统会直接删除表的数据文件，即回收物理空间。而使用系统表空间则无法回收这些物理空间；
2. 和上面类似，当使用重建表的语法时，如 OPTIMIZE TABLE 或者 ALTER TABLE ENGINE = InnoDB 时，系统也能够回收物理空间；
3. 可以单独将某个表指定到对应的存储位置，这个存储位置可以不在 MySQL 的数据目录下。比如你想使用 RAID 或者 SSD 来存储某个表，当你使用独立表空间时，就可以通过 CREATE TABLE … DATA DIRECTORY 这个语法来实现。

使用独立表空间也有一些潜在的问题。例如，每个表都有自己的单独的文件，容易造成物理空间的浪费，如果数据库有很多小表的话，这种空间浪费也会比较明显。通用表空间 ( General TableSpace ) 可以缓解这个问题。通用表空间可以认为是 all-in-one (系统表空间) 和 file-per-table 的一个折中，它允许你使用 CREATE TABLESPACE 语法创建一个大的空间，然后你可以向这个空间中添加一些表的数据文件进行存储，这些表的数据文件是共享存储空间的。

参考：https://zhuanlan.zhihu.com/p/99469827 