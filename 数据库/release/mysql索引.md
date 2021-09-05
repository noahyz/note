---
title: mysql索引
date: 2020-03-28 21:11:24
categories:
- 数据库
tags:
- index
---

## mysql索引

当使用主键或者唯一键创建表时，MySQL 会自动创建一个名为 PRIMARY 的特殊索引。索引成为聚簇索引。PRIMARY索引是特殊的，因为索引本身与数据一起存储在同一个表中。聚簇索引强制执行表中的行顺序。除`PRIMARY`索引之外的其他索引称为二级索引或非聚簇索引。

#### 一、操作索引的语法

- 创建普通索引

```
1. create index indexName on table_name (column_list)
如果是char、varchar，length可以小于字段实际长度；如果是 blob、text类型，必须指定 length
2. alter table tableName add index indexName(columnName_list)
3. create table mytable(
	id int not null,
	username varchar(16) not null,
	index [idnexName] (columnName_list(length))
);
```

**注意：要查看mysql如何在内部执行此查询，在select语句的开头加上 explain **

```
explain select * from t where id = 2;
可以看到mysql执行这条语句所做的查询。
```

显示表的索引: `show indexes from table_name; ` 注意是 indexes。

- 删除索引

```
1. drop index index_name on table_name [algorithm_option | lock_option]
后面两个参数后面在看
2. drop index `primary` on table_name;
删除 primary 主键的索引
```

- 显示索引

```
show indexes from table_name in database_name;
```

- 唯一索引

要强制执行一列或多列的唯一性值，通常使用 primary key 约束。但是每个表只能有一个主键。因此，如果包含多个列或一组具有相同的值的列，则不能使用主键约束。而且 Mysql 提供了另一种指标叫做 unique 索引，可以强制执行值的唯一的一列或者多列。与 primary key 索引不同，unique 每个表可以有多个索引。

```
create unique index index_name on table_name(index_column_1, index_column_2,...);
注意：unique key 和 unique index 是同义词
```

- 前缀索引

当创建二级索引时，mysql 会将列的值存储在单独的数据结构中，如果列是字符串列，则索引将占用大量磁盘空间并可能减慢 insert 操作速度。为此，mysql 允许为字符串列的列值的前导部分创建索引。

```
create table table_name(
	column_list,
	index(column_name(length))
);
create index index_name on table_name(column_name(length));
```

- 降序索引

降序索引是以降序存储键值的索引。在Mysql 8.0 之前，可以 DESC 在索引定义中指定。但是Mysql 忽略了他。
从 mysql8.0 开始，如果 DESC 在索引定义中使用关键字，则键值将按降序存储。在查询中请求降序时，查询优化器可以利用降序索引。

```
CREATE TABLE t(
    a INT NOT NULL,
    b INT NOT NULL,
    INDEX a_asc_b_desc (a ASC, b DESC)
); 
```

- 复合索引

复合索引就是多列的索引，Mysql 允许创建一个最多包含16列的复合索引。但是如果列不形成索引的最左前缀，则查询优化器无法使用索引执行查找。

```
CREATE TABLE table_name (
    c1 data_type PRIMARY KEY,
    c2 data_type,
    c3 data_type,
    c4 data_type,
    INDEX index_name (c2,c3,c4)
); 
```

- 聚集索引

通常，索引是一个单独的数据结构，例如 B-Tree，它存储用于更快查找的键值。另一方面，聚簇索引实际上就是表。他是一个在物理上强制对表进行排序的索引。创建聚簇索引后，将根据用于创建聚簇索引的键列存储表中的行。由于聚簇索引按排序顺序存储行，因此每个表只有一个聚簇索引。

每个InnoDB表都需要一个聚簇索引，聚簇索引有助于一个InnoDB表优化的数据操作，例如：select、insert、update、delete。为 InnoDB 表定义主键时，MySQL使用主键作为聚簇索引。

如果您没有表的主键，MySQL将搜索[`UNIQUE`](https://www.begtut.com/mysql/mysql-unique.html)所有键列所在的第一个索引，`NOT NULL`并将此`UNIQUE`索引用作聚簇索引。如果InnoDB表没有主键或合适的`UNIQUE`索引，MySQL会在内部生成一个隐藏的聚簇索引`GEN_CLUST_INDEX`，索引在包含行ID值的合成列上命名。因此，每个InnoDB表始终只有一个聚簇索引。

除聚簇索引之外的所有索引都是非聚簇索引或二级索引。在InnoDB故事中，辅助索引中的每条记录都包含行的主键列以及非聚集索引中指定的列。MySQL将此主键值用于聚簇索引中的行查找。

在一个聚簇索引中引用多个column字段(a,b)，相当于 order by a, b，就是先按 a 排序，再按 b 排序。

因此，具有短主键是有利的，否则二级索引将使用更多空间。通常，[自动增量](https://www.begtut.com/mysql/mysql-sequence.html)整数列用于主键列。

- 索引基数、use index、强制索引
    后面补齐这个























