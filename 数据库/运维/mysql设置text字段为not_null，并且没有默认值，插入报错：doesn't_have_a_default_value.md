---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

# mysql设置text字段为not null，并且没有默认值，插入报错：doesn't have a default value

https://www.cnblogs.com/jpfss/p/11190014.html

```
//创建字段abstract为text类型，默认为not null
ALTER TABLE `表名` ADD COLUMN `abstract`  text not null  after `content`;
```

这个创建语句看似没有问题，但是text类型既没有默认值，也不能为null的话，那么插入的时候，肯定会出现问题的。

这个原因就是数据库的严格模式的问题。在mysql 5.7之后，数据库默认都是采用严格模式。

关于严格模式的解释：

mysql给字段设置默认值，以及mysql的严格模式

关于严格模式这个，我并没有测试，个人感觉还是建表时候不够严谨造成的问题。关于设置字段默认值和设置not null方面不熟悉造成的。

### 总结：

1、如果字段为int 或者varchar类型，那么要设置字段类型为 not null 并且设置default

2、如果字段为text,则既不需要设置not null,也不需要手动设置default 的值

3、关于text字段不能有默认值的问题，这个只针对于手动增加的default属性，如果创建字段不设置default的话，mysql会默认加上一个默认值Null
