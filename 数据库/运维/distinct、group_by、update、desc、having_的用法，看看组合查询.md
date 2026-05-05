---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

# 未总结---distinct、group by、update、desc、having 的用法，看看组合查询

https://www.codenong.com/141562/

group by

https://www.jianshu.com/p/8f35129dd2ab

update

要在原字段上做一个修改操作，可以使用concat函数用来字符串之间的连接

------

### DISTINCT
用于返回唯一不同的值
例如：`SELECT DISTINCT column_name,column_name FROM table_name;`

### GROUP BY
根据一个或多个列对结果集进行分组
在分组的列上可以使用count、sum、avg等函数
例如
`SELECT name, COUNT(*) FROM   employee_tbl GROUP BY name;`

### UPDATE
`UPDATE table_name SET field1=new-value1, field2=new-value2 [WHERE Clause]`

### having 
having 字句可以筛选分组后的各组数据
```
SELECT column_name, aggregate_function(column_name)
FROM table_name
WHERE column_name operator value
GROUP BY column_name
HAVING aggregate_function(column_name) operator value;
```
