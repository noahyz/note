---
title: order by 的原理
---

我们以一个例子入手。如下定义一张表

```
CREATE TABLE `t` (
  `id` int(11) NOT NULL,
  `city` varchar(16) NOT NULL,
  `name` varchar(16) NOT NULL,
  `age` int(11) NOT NULL,
  `addr` varchar(128) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `city` (`city`)
) ENGINE=InnoDB;
```

我们在 city 字段上加了索引，而 name 字段并没有索引。有如下的查找语句：

```
select city,name,age from t where city='杭州' order by name limit 1000;
```

### 一、全字段排序

MySQL 会给每个线程分配一块内存用于排序，称为 `sort_buffer`。那么这条查询语句的执行流程应该是：

- 初始化 sort_buffer，sort_buffer 中需要放入 city、name、age 三个字段
- 从索引 city 找到第一个满足 `city='杭州'` 条件的主键 id
- 通过主键 id 索引取出整行，然后取 name、city、age 三个字段的值，存入 sort_buffer 中
- 从索引 city 取出下一个记录的主键 id，重复此过程，知道 city 的值不满足查询条件为止
- 对 sort_buffer 中的数据按照字段 name 做快速排序
- 最后将排序结果的前 1000 行返回给客户端

其中在 sort_buffer 中数据按照字段 name 做排序。可能在内存中完成，也可能需要使用外部排序。因为 sort_buffer 的内存大小有限。如果排序数据量太大，内存放不下，则会使用磁盘临时文件作为辅助进行外部排序。

外部排序一般采用归并排序，即将需要排序的数据分成多份，每一份数据单独排序后存在临时文件中，然后把这个数据有序的文件再合并成一个有序的大文件。当然了，在磁盘中排序的性能会很差。

### 二、rowid 排序

如果需要排序的字段太长，单行记录长度太大，MySQL 会采用 row_id 排序方式。我们还是以刚才的查询语句为例，简述他的执行流程：

- 初始化 sort_buffer，sort_buffer 中需要放入两个字段，分别是 name 和 id
- 从索引 city 找到第一个满足 `city='杭州'` 条件的主键 id
- 通过主键 id 索引取出整行，然后取 name、id 这二个字段的值，存入 sort_buffer 中
- 从索引 city 取出下一个记录的主键 id，重复此过程，知道 city 的值不满足查询条件为止
- 对 sort_buffer 中的数据按照字段 name 进行排序
- 遍历排序结果，取前 1000 行，并按照主键 id 的值回到原表中取出 city、name 和 age 三个字段返回给客户端

这种方式多访问了一次表的主键索引，也就是每行记录多了一次回表查询，读磁盘的次数增加了。 但是参与排序的字段变少了，可以尽可能的在内存中进行排序，性能较高。

### 三、小结

如果能够保证从 city 这个索引上取出来的行，天然就是按照 name 递增排序的。那应该是最好的方式。

#### 1. 联合索引

因此我们可以在这个表中建立一个 city 和 name 的联合索引。`alter table t add index city_user(city, name);`

这样子的话，查询语句的执行流程就变成了：

- 从联合索引 `(city, name)` 找到第一个满足 `city='杭州'` 条件的主键 id
- 到主键 id 索引取出整行，取 name、city、age 三个字段的值，作为结果集的一部分直接返回
- 从联合索引 `(city, name)` 取出下一个记录主键 id；重复此过程，直到查找第 1000 条记录，或者是不满足 `city='杭州'` 条件时循环结束

这样子，就不需要排序过程了，性能会大大提高。

#### 2. 覆盖索引

覆盖索引：索引上的信息足够满足查询条件，不需要再回到主键索引上去取数据。

我们可以创建一个 `city、name、age` 的联合索引。`alter table t add index city_user_age(city, name, age);`

此时，对于 city 字段的值相同的行来说，还是按照 name 字段的值递增排序的，此时的查询语句也就不再需要排序了。而且也不再需要回表查询了。因为覆盖索引上已经满足了所有需要的字段。

这种做法，不涉及到磁盘 IO 的读过程，也不涉及到排序的过程。性能是最好。

不过维护索引是有代价的，我们在建立索引的时候要关注业务的场景。























