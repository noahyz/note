---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

## 事务

- 标识事务的开始

    ```
    start transaction;
    ```

- 回退（撤销）MySQL 语句 ROLLBACK 

    ```
    start transaction;
    delete from ordertotals;
    select * from ordertotals;
    rollback;
    select * from ordertotals;
    ```

- 注意：事务处理用来管理 insert、update 和 delete 语句。

- 注意：不能回退 create、drop 操作，事务处理块中可以使用这两条语句，但如果执行回退，他们不会被撤销

- 一般的 MySQL 语句都是直接针对数据库表执行和编写的，就是 隐含提交，即提交操作（写或保存）操作是自动进行的

- 在事务操作中，必须进行明确的提交，使用 commit 语句

    ```
    start transaction;
    delete from orders where order_num = 20010;
    commit;
    ```

#### 占位符

为了支持回退部分事务，可以在事务处理块中合适的位置放置占位符。这样，如果需要回退，可以回退到某个占位符。

```
savepoint delete1;
rollback to delete1;
```

使用 `set autocommit = 0;` 可以指示 MySQL 不自动提交更改。