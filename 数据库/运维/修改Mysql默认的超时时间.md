---
title: mysql修改默认的超时时间
date: 2020-03-20 21:11:24
categories:
- 数据库
tags:
- mysql 超时时间
---

## mysql修改默认的超时时间

Mysql数据库一般默认的连接超时时间是28800s（8小时）

```sql
show global variables like 'wait_timeout';
结果：
| wait_timeout                | 28800    |
```

- 方法1： 临时方法，重启MYSQL服务器会失效，恢复到默认值
  MySQL服务器关闭交互式连接前等待的秒数。通过MySQL 客户端连接数据库的是交互会话，
  set global interactive_timeout = 259200;
  MySQL服务器关闭非交互连接之前等待的秒数。通过jdbc等程序连接数据库的是非交互会话。
  set global wait_timeout = 259200;

- 方法2：修改mysql的配置文件

  此方法要谨慎使用，如果这个值设置的太大，将导致空闲连接过多，白白消耗内存；如果设置的太小，就失去了mysql超时自动重连的作用。到底需要设置多大，难以界定。

  ```sql
  在my.ini 文件添加 
  interactive_timeout=2592000
  wait_timeout=2592000
  ```


