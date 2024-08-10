---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

## 一、基本查询

#### 1.  and 在计算次序中优先级更高

```
select * from table where vendor_id = 1002 or vendor_id = 1003 and prod_price >= 10;
```

如上的意思为：要么 vendor_id = 10002 的数据，要么 vendor_id = 1003 且 prod_price >= 10 的数据。

#### 2. in 和 not 操作符

```
select * from table where vendor_id in (1, 2);
select * from table where vendor_id not in (1, 2);
```

in 表示在范围内的数据，not in 表示不在范围内的数据

#### 3. 通配符

like 操作符指示 MySQL 后跟的搜索模式利用通配符匹配。根据 MySQL 配置，搜索可以是区分大小写的

- % 表示任何字符出现任意次数（包括 0 个字符）。注意 % 不能匹配 NULL
- _（下划线）只能匹配一个字符

#### 4. 正则表达式

regexp 后面可以作为正则表达式。正则表达式匹配不区分大小写。

```
select * from table where prod_name regexp '.000'; // . 表示匹配任意一个字符

// like 和 regexp。如果匹配的文本在列值中出现，like 将不会找到他（除非使用通配符）；但 regexp 会找到他
select * from table where prod_name like '1000';
select * from table where prod_name regexp '1000';
```

为了区分大小写，可以使用 BINARY 关键字。`where prod_name regexp binary 'Jetpack.000';`

```
select * from table where prod_name regexp '1000 | 2000 | 3000'; // | 为正则表达式的 or 操作符。匹配其中之一

select * from table where prod_name regexp '[123] Ton'; // [123] 定义一组字符，意思为匹配 1 或 2 或 3，[] 是另一种形式的 or 语句
select * from table where prod_name regexp '1|2|3 Ton'; // 但是这种意思为 1 或 2 或 3 Ton。和上面语句有差别
select * from table where prod_name regexp '[^123] Ton'; // 匹配除了 1、2、3 之外的任何字符
select * from table where prod_name regexp '[1-3] Ton'; // 匹配 1、2、3。也可以是字母，[a-z] 表示匹配任意字母字符

select * from table where prod_name regexp '\\.'; // 配置特殊符号 . (点) ，\\ 表示转义
```

字符类

```
[:alnum:]  任意字符和数字 （同 [a-zA-Z0-9]）
[:alpha:]  任意字符(同 [a-zA-Z])
[:digit:]  任意数字(同 [0-9])
[:space:]  包括空格在内的任意空白字符(同[\\f\\n\\r\\t\\v])
```

匹配多个实例

```
*  0个或多个匹配
+  1个或多个匹配（等于{1,}）
?  0个或1个匹配（等于{0,1}）
{n}  指定数目的匹配
{n,}  不少于指定数目的匹配
{n,m}   匹配数目的范围(m 不超过255)
```

定位符

```
^    文本的开始
$    文本的结尾
[[:<:]]    词的开始
[[:>:]]    词的结尾
select * from table where prod_name regexp '^[0-9]\\.'; // 只在 . 或任意数字为串中第一个字符时才匹配他们
```

like 和 regexp 的不同之处在于，like 匹配整个串而 regexp 匹配子串。利用定位符，通过用 ^ 开始每个表达式，用 $ 结束每个表达式，可以使 regexp 的作用和 like 一样

## 二、排序数据

order by 子句可取一个或多个列的名字，据此对输出进行排序。通常，order by 子句中使用的列将是为显示所选择的列。但是，用非检索的列排序数据也是合法的

按多个列排序，只要指定列名，列名之间用逗号分开即可。

```
select * from table order by prod_price, prod_name; 
```

- 如上，仅在多个行具有相同的 prod_price 值时才对 prod_name 进行排序。

如果需要降序排序，则可以使用 desc 关键字。生序使用 ASC，默认是升序的

``` 
select * from table order by prod_price desc, prod_name;
```

- 如上，prod_price 列以降序排序，prod_name 列仍然按标准的升序排序

## 三、基本函数

```
1. concat(column1, column2, column3) 拼接字段
	select concat(vendor_name, ' (', vendor_counntry, ')') from table;
2. rtrim(column) 删除数据右侧多余的空格。  ltrim(column) 删除数据左侧多余的空格
3. as 别名
4. 执行算术运算 select quantity * item_prices as expanded_price from table; 
```

#### 1. 文本处理函数

```
left()    返回串左边的字符
right()   返回串右边的字符
length()  返回串的长度
lower()   将串转换为小写
ltrim()   去掉串左边的空格
rtrim()   去掉串右边的空格
upper()   将串转换为大写
```

#### 2. 日期和时间处理函数

```
AddData()  增加一个日志(天、周等)
AddTime()  增加一个事件(时、分等)
CurDate()  返回当前日期  2022-05-23 
CurTime()  返回当前时间  02:52:43 
Date()     返回日期时间的日期部分
DateDiff() 计算两个日期之差
Second()   返回一个时间的秒部分
```

#### 3. 聚集函数

```
avg()   返回某列的平均值  select avg(prod_price) as avg_price from table;
count()   返回某列的行数，count(*) 包含 NULL 值, count(column) 对特定列中具有值的行进行计数，忽略 NULL 值
max()   返回某列的最大值，忽略列值为 NULL 的行
min()   返回某列的最小值，忽略列值为 NULL 的行
sum()   返回某列值之和，忽略列值为 NULL 的行
distinct 去重 select avg(distinct prod_price) as avg_price from table;
```

## 四、分组

#### 1. 数据分组（group by）

```
select vend_id, count(*) as num_prods from table group by vend_id; 
```

group by 子句指示 MySQL 按 vend_id 排序并分组数据；因此会对 vend_id 而不是整个表计算 num_prods 一次，也就是说对每个组而不是整个结果集进行聚集

- 如果分组列中具有 NULL 值，则 NULL 将作为一个分组返回。如果列中有多行 NULL 值，他们将分为一组
- group by 子句必须出现在 where 子句之后，order by 子句之前

#### 2. 过滤分组（having）

where 过滤指定的是行而不是分组。where 没有分组的概念。因此可以使用 having 子句。

- where 过滤行，having 过滤组。where 支持的语法 having 都适用

```
select cust_id, count(*) as orders from table group by cust_id having count(*) >= 2;
```

- where 在数据分组前进行过滤，having 在数据分组后进行过滤。where 排除的行不包括在分组中。

```
select vend_id, count(*) as num_prods from table where prod_price >= 10 group by vend_id having count(*) >= 2;
```

- 如上，同时使用 where 和 having，where 子句过滤所有 prod_price 至少为 10 的行。然后按 vend_id 分组数据，having 子句过滤计数为 2 或 2 以上的分组。

#### 3. 分组与排序

| order by                                 | group by                                               |
| ---------------------------------------- | ------------------------------------------------------ |
| 对输出进行排序                           | 对行进行分组，输出不一定有序                           |
| 任意列都可以使用（非选择的列也可以使用） | 只能使用选择列或表达式列，而且必须使用每个选择列表达式 |
| 不一定需要                               | 如果与聚集函数一起使用列（或表达式），则必须使用       |

- 注意：group by 分组的数据不保证是有序的。如果需要排序，使用 order by 子句，如下

```
select order_name, SUM(quantity * item_price) as ordertotal from table group by order_num having SUM(quantity * item_price) >= 50 order by ordertotal; 

 select app_id, count(*) from client_list_t group by app_id  having count(*) >= 10 order by app_id desc limit 10 ;
```

## 六、联结

<img src="./image/联结.png" alt="s" style="zoom:80%;" />

```
left join  即使右表中没有匹配，也从左表返回所有的行
right join  即使左表中没有匹配，也从右表返回所有的行
inner join   如果表中有至少一个匹配，则返回行 
full outer join   只要其中一个表中存在匹配，则返回行
```

#### 1. 等值联结（内部联结）

外键：某个表中的一列，它包含了另一个表的主键值，定义了两个表之间的关系

```
// 创建联结
select vend_name, prod_name, prod_price 
from vendors, products 
where vendors.vend_id = products.vend_id 
order by vend_name, prod_name;
```

- 在引用的列可能出现二义性时，必须使用完全限定列名（用一个点分隔的表名和列名）
- 联结两个表时，将第一个表中的每一行与第二个表中的每一行配对。where 子句作为过滤条件，它只包含哪些匹配给定条件的行。没有 where 子句，第一个表中的每个行将与第二个表中的每个行配对，而不管他们逻辑上是否可以配在一起
- 笛卡尔积：由没有联结条件的表关系返回的结果为笛卡尔积。检索出来的行的数目将是第一个表中的行数乘以第二个表中的行数

上面的语句也可以用如下语句表示

```
select vend_name, prod_name, prod_price 
from vendors inner join products 
on vendors.vend_id = products.vend_id;
```

#### 2. 自联结

```
select p1.prod_id, p1.prod_name 
from products as p1, products as p2 
where p1.vend_id = p2.vend_id and p2.prod_id = 'DTINTR';
```

如上，词查询要求首先找到生产 ID 为 DINTR 的物品的供应商，然后找到这个供应商生产的其他物品。

```
select prod_id, prod_name from products 
where vend_id = (select vend_id from products where prod_id = 'DTNTR'); 
```

如上使用子查询也可以达到目的，有时候处理联结远比处理子查询快得多

#### 3. 外部联结

```
select customers.cust_id, orders.order_num 
from customers left outer join orders 
on customers.cust_id = orders.cust_id;
```

- 与内部联结不同的是，外部联结包括没有关联行的行。
- 在使用 outer join 语法时，必须使用 right 或 left 关键字指定包含其所有行的表（right 指出的是 outer join 右边的表，而 left 指出的是 outer join 左边的表）

## 七、组合查询

union：指示 MySQL 执行两条 select 语句，并把输出组合成单个查询结果集

```
select vend_id, prod_id, prod_price from products where prod_price <= 5
union
select vend_id, prod_id, prod_price from products where vend_id in (1001, 1002);
```

- 在使用 union 时，重复的行被自动取消。如果想要返回所有匹配的行，可使用 union all 

```
select vend_id, prod_id, prod_price from products where prod_price <= 5
union
select vend_id, prod_id, prod_price from products where vend_id in (1001, 1002)
order by vend_id, prod_price;
```

如上，如果要对输出用 order by 子句排序。在用 union 组合查询时，只能使用一条 order by 子句，它必须出现在最后一条 select 语句之后。因为对于结果集，不存在用一种方式排序一部分，而又用另一种方式排序另一部分的情况，因此不允许使用多条 order by 子句。