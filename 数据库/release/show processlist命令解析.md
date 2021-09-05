---
title: Mysql show processlist 详解
date: 2021-03-07 20:19:17
categories:
- 数据库
tags:
- show processlist
---

## Mysql show processlist 详解

### show processlist 命令
show processlist 是显示用户正在运行的线程，需要注意的是，除了 root 用户能看到所有正在运行的线程外，其他用户都只能看到自己正在运行的线程，看不到其它用户正在运行的线程。除非单独给这个用户赋予了PROCESS 权限。

show processlist 显示的信息都是来自MySQL系统库 information_schema 中的 processlist 表。所以使用下面的查询语句可以获得相同的结果：`select * from information_schema.processlist;`

如下是执行命令的结果：
```
mysql> show processlist;
+--------+------+-----------+--------------------+---------+------+-------+------------------+
| Id     | User | Host      | db                 | Command | Time | State | Info             |
+--------+------+-----------+--------------------+---------+------+-------+------------------+
| 458492 | root | localhost | information_schema | Query   |    0 | init  | show processlist |
+--------+------+-----------+--------------------+---------+------+-------+------------------+
```
- Id: 就是这个线程的唯一标识，当我们发现这个线程有问题的时候，可以通过 kill 命令，加上这个Id值将这个线程杀掉。前面我们说了show processlist 显示的信息时来自information_schema.processlist 表，所以这个Id就是这个表的主键。
- User: 就是指启动这个线程的用户。
- Host: 记录了发送请求的客户端的 IP 和 端口号。通过这些信息在排查问题的时候，我们可以定位到是哪个客户端的哪个进程发送的请求。
- DB: 当前执行的命令是在哪一个数据库上。如果没有指定数据库，则该值为 NULL 。
- Command: 是指此刻该线程正在执行的命令。
- Time: 表示该线程处于当前状态的时间。
- State: 线程的状态，和 Command 对应，下面单独解释。
- Info: 一般记录的是线程执行的语句。默认只显示前100个字符，也就是你看到的语句可能是截断了的，要看全部信息，需要使用 show full processlist。

**看一下 Command 的值**

1. Binlog Dump: 主节点正在将二进制日志 ，同步到从节点
2. Change User: 正在执行一个 change-user 的操作
3. Close Stmt: 正在关闭一个Prepared Statement 对象
4. Connect: 一个从节点连上了主节点
5. Connect Out: 一个从节点正在连主节点
6. Create DB: 正在执行一个create-database 的操作
7. Daemon: 服务器内部线程，而不是来自客户端的链接
8. Debug: 线程正在生成调试信息
9. Delayed Insert: 该线程是一个延迟插入的处理程序
10. Drop DB: 正在执行一个 drop-database 的操作
11. Execute: 正在执行一个 Prepared Statement
12. Fetch: 正在从Prepared Statement 中获取执行结果
13. Field List: 正在获取表的列信息
14. Init DB: 该线程正在选取一个默认的数据库
15. Kill : 正在执行 kill 语句，杀死指定线程
16. Long Data: 正在从Prepared Statement 中检索 long data
17. Ping: 正在处理 server-ping 的请求
18. Prepare: 该线程正在准备一个 Prepared Statement
19. ProcessList: 该线程正在生成服务器线程相关信息
20. Query: 该线程正在执行一个语句
21. Quit: 该线程正在退出
22. Refresh：该线程正在刷表，日志或缓存；或者在重置状态变量，或者在复制服务器信息
23. Register Slave： 正在注册从节点
24. Reset Stmt: 正在重置 prepared statement
25. Set Option: 正在设置或重置客户端的 statement-execution 选项
26. Shutdown: 正在关闭服务器
27. Sleep: 正在等待客户端向它发送执行语句
28. Statistics: 该线程正在生成 server-status 信息
29. Table Dump: 正在发送表的内容到从服务器
30. Time: Unused

**注意：主要需要关注 query和sleep命令。sleep是在等待prestatement（sql语句），它已经建立了connect，但是还没有开始执行，所以sleep状态多的话，那么数据库连接池就会被占用。所以：有时候sleep增多的原因可能是慢查询sql，但是sleep不是慢查询，因为它还没有开始执行。**

**看一下State的值**：

- `After create`

  当线程在创建表的函数的末尾创建表（包括内部临时表）时，会发生这种情况。即使由于某些错误而无法创建表，也会使用此状态。

- `altering table`

  服务器正在执行就地服务 [`ALTER TABLE`](https://dev.mysql.com/doc/refman/5.6/en/alter-table.html)。

- `Analyzing`

  该线程正在计算`MyISAM`表键分布（例如for [`ANALYZE TABLE`](https://dev.mysql.com/doc/refman/5.6/en/analyze-table.html)）。

- `checking permissions`

  线程正在检查服务器是否具有执行该语句所需的特权。

- `Checking table`

  线程正在执行表检查操作。

- `cleaning up`

  该线程已经处理了一条命令，并准备释放内存并重置某些状态变量。

- `closing tables`

  线程正在将已更改的表数据刷新到磁盘并关闭已使用的表。这应该是一个快速的操作。如果没有，请确认您没有完整的磁盘，并且磁盘使用率不是很高。

- ```
  Waiting for `lock_type` lock
  ```

  服务器正在等待`THR_LOCK`从元数据锁定子系统获取 锁或锁，其中 *`lock_type`*指示了锁的类型。

  此状态表示正在等待 `THR_LOCK`：

  - `Waiting for table level lock`

  这些状态指示等待元数据锁定：

  - `Waiting for event metadata lock`
  - `Waiting for global read lock`
  - `Waiting for schema metadata lock`
  - `Waiting for stored function metadata lock`
  - `Waiting for stored procedure metadata lock`
  - `Waiting for table metadata lock`
  - `Waiting for trigger metadata lock`

其他的请参考mysql官网即可：https://dev.mysql.com/doc/refman/5.6/en/general-thread-states.html

**注意：这里需要关注的是locked这种状态，我们无法操作表或者其他的时候，也许是遇到了死锁，或者加锁时间太长等**

#### 常用的检查mysql问题的sql

- 按客户端 IP 分组，看哪个客户端的链接数最多

```mysql
select client_ip,count(client_ip) as client_num from (select substring_index(host,':' ,1) as client_ip from processlist ) as connect_info group by client_ip order by client_num desc;
```

- 查看正在执行的线程，并按 Time 倒排序，看看有没有执行时间特别长的线程

```mysql
select * from information_schema.processlist where Command != 'Sleep' order by Time desc;
```

- 找出所有执行时间超过 5 分钟的线程，拼凑出 kill 语句，方便后面查杀

```mysql
select concat('kill ', id, ';') from information_schema.processlist where Command != 'Sleep' and Time > 300 order by Time desc;
```

- 检查是否有死锁，并找出具体线程名

```shell
mysql -u root -e "show processlist" | grep -i "Locked" >> locked_log.txt

for line in `cat locked_log.txt | awk '{print $1}'`
do
   echo "kill $line;" >> kill_thread_id.sql
done
```

