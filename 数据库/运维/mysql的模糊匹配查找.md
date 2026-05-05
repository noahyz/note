---
title: Mysql模糊匹配查找
date: 2021-2-18 15:14:06
categories:
- 数据库
tags:
- mysql
---

## mysql模糊匹配查找

### SQL 匹配模式

SQL的模式匹配允许你使用“_”匹配任何单个字符，而“%”匹配任意数目字符（包括零个字符）。在MySQL中，SQL的模式缺省是忽略大小写的。
- 注意：在你使用SQL模式时，不能使用=或!=；而使用LIKE或NOT LIKE比较操作符。
- 语法：SELECT 字段 FROM 表 WHERE 某字段 Like 条件
- 其中关于条件，SQL提供了两种匹配模式：
    1、百分号（%）：表示任意个或多个字符。可匹配任意类型和长度的字符。
    2、下划线（_）：表示任意单个字符。匹配单个任意字符，它常用来限制表达式的字符长度语句：（可以代表一个中文字符）

### 正则模式
正则表达式作用是匹配文本，将一个模式（正则表达式）与一个文本进行比较。
MySQL用where子句对正则表达式提供了初步的支持，允许指定用正则表达式过滤SELECT检索出的数据。
1. MySQL正则表达式仅仅使SQL语言的一个子集，可以匹配基本的字符、字符串。
    例如：`select * from wp_posts where post_name REGEXP 'hello';` // 可以检索出列post_name中所有包含hello的行
2. . 匹配除\n之外的任意单个字符
    `select * from wp_posts where post_name REGEXP '.og';`
    注：. 是正则表达式中的一个特殊字符。它表示匹配一个字符，因此bog，cog，dog等等都能匹配。
    关于大小写的区分：MySQL中正则表达式匹配（从版本3.23.4后）不区分大小写。
    如果要区分大小写，应该使用BINARY关键字，例如：where post_name REGEXP BINARY 'Hello .000'
3. ^ 匹配字符串开始位置，如查询所有姓王的人名
    `select name from 表名 where name REGEXP '^王';`
4. $ 匹配字符串结束位置，如查询所有姓名末尾是“明”的人名
    `select name from 表名 where name REGEXP '明$';`
5. 进行OR匹配
    搜索两个串之一（或者这个串，或者为另外一个串），使用|作为OR操作符，表示匹配其中之一。可以给出两个以上的OR条件。
    例如：`select * from products where pro_id REGEXP '1000|2000';` // 1000和2000都能匹配并返回，当然，使用多个|就可以匹配多个串
6. [] 匹配任何单一字符，是另一种形式的OR语句，可缩写的OR语句
    例如，匹配范围：[0123456789]可以匹配0到9，[1-4][4-9]也是合法的范围。
    此外，范围不一定只是数值的，[a-z]匹配任意字母字符。
    例如，查询出w/z/s开头的人的人名: `SELECT prod_name FROM products WHERE prod_name REGEXP '^[wzs]';`
7. [^...]匹配不包含在[ ]的字符，如查询出chenmin之外的人名
    SELECT prod_name FROM products WHERE prod_name REGEXP '[^chenmin]';
    注：^的双重用途：在集合中（用[ ]定义），它用来否定该集合。否则，用来指串的开始
8. 匹配特殊字符使用\\进行转义
    \\为前导。即转义，正则表达式内具有特殊意义的所有字符都必须以这种方式转义。
    - \\-   表示查找-
    - \\.   表示查找.
    - \\f   表示换页
    - \\n  表示换行
    - \\r   表示回车
    - \\t   表示制表
    - \\v   表示纵向制表
    - 注：为了匹配\本身，需要使用\\\
9. 匹配字符类
    （1）[:alnum:]    任意字母和数字（同[a-zA-Z0-9]）
    （2）[:alpha:]     任意字符（同[a-zA-A]）
    （3）[:blank:]     空格和制表符（同[\\t]）
    （4）[:digit:]       任意数字（同[0-9]）
    （5）[:lower:]     任意小写字母（同[a-z]）
    （6）[:upper:]    任意大写字母（同[A-Z]）
    （7）[:space:]    包括空格在内的任意空白字符（同 [\\f\\n\\t\\r\\v]）
    （8）[:cntrl:]       ASCII控制字符（ASCII  0到31和127）
    （9）[:graph:]    与["print:]相同，但不包括空格
    （10）[:print:]     任意可打印字符
    （11）[:punct:]   既不在 [:alnum:] 又不在 [:cntrl:] 中的任意字符
    （12）[:xdigit:]  任意十六进制数字（同 [a-fA-F0-9]）
10. 匹配多个示例，关于重复元字符
    *         0个或多个匹配
    +         1个或多个匹配（等于 {1, }）
    ?         0个或1个匹配（等于 {0, 1}）
    {n}       指定数目的匹配
    {n, }     不少于指定数目的匹配
    {n ,m}    匹配数目的范围（m不超过255）
    例如：`select prod_name from products where prod_name REGEXP '[[:DIGIT:]]{4}';` 
    如前所述，[:digit:]匹配任意数字
    [[:digit:]]{4}匹配连在一起的任意4位数字，当然，上面的例子也可以这样写REGEXP '[0-9][0-9][0-9][0-9]'
11. 定位符
    ^         文本的开始
    $         文本的末尾
    [[:<:]]   词的开始
    [[:>:]]   词的结尾
    注：like匹配整个串，而REGEXP匹配子串。
### in查询
    in其实和=类似，区别在于：=后面是一个值。in后面可以是多个值。
    例1: `select * from role where name in("唐三");` // 即匹配姓名为“唐三”一行数据；
    例2: `select * from role where name in("唐三","唐三藏");` // 即匹配姓名为“唐三”，“唐三藏”一行数据；
    例3: `select * from role where name in("唐三","%行者%");` // 只匹配姓名为“唐三”一行数据；即in查询不支持模糊查询，如示例4
    例4: `select * from role where name in("%行者%");`  // 无匹配结果
    注意：in查询不支持模糊查询
### like contact模糊查询
    CONCAT(str1,str2,…) 函数返回结果为连接参数产生的字符串。
    `select * from role where name like contact("%","三","%");` // 即匹配姓名为“唐三”，“唐三藏”等类型的数据数据；
    like contact模糊查询强大的地方在于可以对传进来的参数进行某查询，比如经前端提交上的数据，赋值给参数name，则可以select * from table where name like contact("%",${name},"%")