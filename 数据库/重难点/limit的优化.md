## MySQL limit 性能优化

limit 的用法是 `limit [offset], [rows]`，其中 offset 表示偏移量，rows 表示需要返回的数据行

` select * from table_name limit 10000, 10; ` 语句的执行逻辑是：

- 从数据库表中读取第 N 条数据添加到数据集中
- 重复第一步直到 N = 10000 + 10
- 根据 offset 抛弃前面的 10000 条数据
- 返回剩余的 10 条数据

可以看出前面的 10000 条数据对本次查询没有意义，但是却占用了绝大部分的查询时间。

### 一、优化过程

#### 1. 利用自增索引

```
select * from table_name where (id >= 10000) limit 10;
```

如果有自增索引列，添加 where 条件可以把搜索从全表搜索转换为范围搜索，大大缩小搜索的范围。

#### 2. 利用子查询

先查找出需要数据的索引列（假设为 id），再通过索引列查找出需要的数据。

```
select * from table_name where id in (select id from table_name where (user = xxx)) limit 10000, 10;

select * from table_name where (use = xxx) limit 10000, 10;
```

相比较结果是（500w条数据）：第一条花费平均耗时约为第二条的 1/3 左右。

基本原理就是：

- 子查询只用到了索引列，没有取实际的数据，所以不涉及到磁盘IO，所以即使是比较大的 offset 查询速度也不会太差。
- 利用子查询的方式，把原来的基于 user 的搜索转化为基于主键（id）的搜索，主查询因为已经获得了准确的索引值，所以查询过程也相对较快。

#### 3. 使用 join

数据量较大的时候，用 in 的效率不高，可以使用 join 来替换

```
select * from table_name inner join ( select id from table_name where (user = xxx) limit 10000,10) b using (id)
```

