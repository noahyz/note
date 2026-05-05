---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

# 未总结---mysql的binlog日志

binlog 详细介绍：[https://www.cnblogs.com/kevingrace/p/6065088.html](https://www.cnblogs.com/kevingrace/p/6065088.html)

# 需要详细总结学习

---

binlog ：可以用来主从同步，也可以进行数据恢复

检测binlog 是否开启：show variables like ‘ log_* ' ;

查看所有binlog 日志列表：show master logs；

查看master状态，即最后最新一个binlog日志的编号名称，及其最后一个操作事件pos 结束点值

show master status\G

刷新log日志，自此刻开始产生一个新编号的binlog 日志文件

flush logs；

重置清空所有binlog 日志

reset master；

---

### 查看binlog

1. 使用mysqlbinlog 工具打开，如果mysql5.5以下报错，则加上 —no-default 选项

mysqlbinlog mysql-bin.00003

1. show  binlog events in log_name from pos limit offset , row_count ;
使用mysql 打开

指定查询 mysql-bin.00021 这个文件，从pos 点8224 开始，偏移2行，查询10 条

show binlog events in ' mysql-bin.000021 '  from 8224  limit  2 , 10 \G

### 具体参考：[https://www.cnblogs.com/martinzhang/p/3454358.html](https://www.cnblogs.com/martinzhang/p/3454358.html)

---

### binlog 参数

* log_bin 设置此参数表示启用binlog功能，并指定路径名称
* log_bin_index  设置此参数是指定二进制索引文件的路径与名称  
* binlog_do_db此参数表示只记录指定数据库的二进制日志  
* binlog_ignore_db此参数表示不记录指定的数据库的二进制日志  
* max_binlog_cache_size此参数表示binlog使用的内存最大的尺寸  
* binlog_cache_size此参数表示binlog使用的内存大小，可以通过状态变量binlog_cache_use和binlog_cache_disk_use来帮助测试。  
* binlog_cache_use：使用二进制日志缓存的事务数量  
* binlog_cache_disk_use:使用二进制日志缓存但超过binlog_cache_size值并使用临时文件来保存事务中的语句的事务数量 
* max_binlog_sizeBinlog最大值，最大和默认值是1GB，该设置并不能严格控制Binlog的大小，尤其是Binlog比较靠近最大值而又遇到一个比较大事务时，为了保证事务的完整性，不可能做切换日志的动作，只能将该事务的所有SQL都记录进当前日志，直到事务结束 

*  sync_binlog这个参数直接影响mysql的性能和完整性 

*  sync_binlog=0当事务提交后，Mysql仅仅是将binlog_cache中的数据写入Binlog文件，但不执行fsync之类的磁盘 同步指令通知文件系统将缓存刷新到磁盘，而让Filesystem自行决定什么时候来做同步，这个是性能最好的。 

*  sync_binlog=n，在进行n次事务提交以后，Mysql将执行一次fsync之类的磁盘同步指令，同志文件系统将Binlog文件缓存刷新到磁盘。  Mysql中默认设置sync_binlog=0，即不作任何强制性的磁盘刷新指令，这时性能是最好的，但风险也是最大的。一旦系统绷Crash，在文件系统缓存中的所有Binlog信息都会丢失

### a)自动删除binlog

show binary logs;

show variables like ‘%logs%';  # expire_logs_days 该参数表示binlog 日志自动删除/过期的天数，默认值为0，表示不自动删除

set global expire_logs_days = 3; # 表示日志保留3天。3天后自动过期被删除

或者在my.cnf 中添加 expire_logs_days =5

### B)手动删除binlog

reset master;  # 注意，这是删除master 的binlog ，即手动删除所有的binlog 日志

reset slave;  # 删除slave 的中继日志

purge master logs before '2020-09-09 19:00:00';  # 删除指定日期以前的日志索引中binlog 的日志文件

purge master logs to 'binlog.000002';  # 删除指定日志文件的日志索引中的binlog 日志文件

set sql_log_bin=1/0;       //如果用户有super权限，可以启用或禁用当前会话的binlog记录

show master logs;          //查看master的binlog日志列表

show binary logs;           //查看master的binlog日志文件大小

show master status;     //用于提供master二进制日志文件的状态信息

show slave hosts;        //显示当前注册的slave的列表。不以--report-host=slave_name选项为开头的slave不会显示在本列表中

flush logs;     //产生一个新的binlog日志文件

如果正在开启着主从同步，那在清理binlog 的时候一定要注意清理不用的。
