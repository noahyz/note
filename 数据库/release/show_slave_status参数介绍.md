---
title: Mysql show slave status 
date: 2021-03-07 20:19:17
categories:
- 数据库
tags:
- show slave status
---

## show slave status\G 参数介绍

```
Slave_IO_State: Waiting for master to send event  等待 master 发生事件
Master_Host: 10.173.1.203            当前的主服务器主机
Master_User: backup         被用于连接主服务器的当前用户
Master_Port: 3306           当前的主服务器接口
Connect_Retry: 60            选项的当前值
Master_Log_File: mysql-bin.000010     SLAVE中的I/O线程当前正在读取的主服务器二进制日志文件的名称
Read_Master_Log_Pos: 188793146        在当前的主服务器二进制日志中，SLAVE中的I/O线程已经读取的位置
Relay_Log_File: mysql-relay-bin.000002  SQL线程当前正在读取和执行的中继日志文件的名称
Relay_Log_Pos: 186655308      在当前的中继日志中，SQL线程已读取和执行的位置
Relay_Master_Log_File: mysql-bin.000010   由SQL线程执行的包含多数近期事件的主服务器二进制日志文件的名称
Slave_IO_Running: Yes         I/O线程是否被启动并成功地连接到主服务器上 
Slave_SQL_Running: Yes         SQL线程是否被启动 
Replicate_Do_DB:           replicate-do-db选项的当前值
Replicate_Ignore_DB: mysql        replicate-ignore-db选项的当前值
Replicate_Do_Table:           replicate-do-table选项的当前值
Replicate_Ignore_Table:           replicate-ignore-table选项的当前值
Replicate_Wild_Do_Table:           replicate-wild-do-table选项的当前值
Replicate_Wild_Ignore_Table:           replicate-wild-ignore_table选项的当前值
Last_Errno: 0          最近一次错误码
Last_Error:           最近一次错误内容   
Skip_Counter: 0          最近被使用的用于SQL_SLAVE_SKIP_COUNTER的值
Exec_Master_Log_Pos: 188793146      来自主服务器的二进制日志的由SQL线程执行的上一个时间的位置（Relay_Master_Log_File）。在主服务器的二进制日志中的(Relay_Master_Log_File,Exec_Master_Log_Pos)对应于在中继日志中(Relay_Log_File,Relay_Log_Pos)   
Relay_Log_Space: 186655464  所有原有的中继日志结合起来的总大小
Until_Condition: None     如果没有指定UNTIL子句，则没有值。如果从属服务器正在读取，直到达到主服务器的二进制日志的给定位置为止，则值为Master。如果从属服务器正在读取，直到达到其中继日志的给定位置为止，则值为Relay
Until_Log_File:       用于指示日志文件名，日志文件名和位置值定义了SQL线程在哪个点中止执行
Until_Log_Pos: 0      用于指示日志位置值，日志文件名和位置值定义了SQL线程在哪个点中止执行
Master_SSL_Allowed: No      如果允许对主服务器进行SSL连接，则值为Yes。如果不允许对主服务器进行SSL连接，则值为No。如果允许SSL连接，但是从属服务器没有让SSL支持被启用，则值为Ignored。
Master_SSL_CA_File:        master-ca选项的当前值
Master_SSL_CA_Path:        master-capath选项的当前值
Master_SSL_Cert:        master-cert选项的当前值
Master_SSL_Cipher:        master-cipher选项的当前值
Master_SSL_Key:        master-key选项的当前值
Seconds_Behind_Master: 0      本字段是从属服务器“落后”多少的一个指示。当从属SQL线程正在运行时（处理更新），本字段为在主服务器上由此线程执行的最近的一个事件的时间标记开始，已经过的秒数。当此线程被从属服务器I/O线程赶上，并进入闲置状态，等待来自I/O线程的更多的事件时，本字段为零。总之，本字段测量从属服务器SQL线程和从属服务器I/O线程之间的时间差距，单位以秒计。如果主服务器和从属服务器之间的网络连接较快，则从属服务器I/O线程会非常接近主服务器，所以本字段能够十分近似地指示，从属服务器SQL线程比主服务器落后多少。如果网络较慢，则这种指示不准确；从属SQL线程经常会赶上读取速度较慢地从属服务器I/O线程，因此，Seconds_Behind_Master经常显示值为0。即使I/O线程落后于主服务器时，也是如此。换句话说，本列只对速度快的网络有用。即使主服务器和从属服务器不具有相同的时钟，时间差计算也会起作用（当从属服务器I/O线程启动时，计算时间差。并假定从此时以后，时间差保持不变）。如果从属SQL线程不运行，或者如果从属服务器I/O线程不运行或未与主服务器连接，则Seconds_Behind_Master为NULL（意义为“未知”）。举例说明，如果在重新连接之前，从属服务器I/O线程休眠了master-connect-retry秒，则显示NULL，因为从属服务器不知道主服务器正在做什么，也不能有把握地说落后多少。本字段有一个限制。时间标记通过复制被保留，这意味着，如果一个主服务器M1本身是一个从属服务器M0，则来自M1的binlog的任何事件（通过复制来自M0的binlog的事件而产生），与原事件具有相同的时间标记。这可以使MySQL成功地复制TIMESTAMP。但是，Seconds_Behind_Master的缺点是，如果M1也收到来自客户端的直接更新，则值会随机变化，因为有时最近的M1时间来自M0，有时来自直接更新，最近的时间标记也是如此。
Master_SSL_Verify_Server_Cert: No
Last_IO_Errno: 0
Last_IO_Error: 
Last_SQL_Errno: 0
Last_SQL_Error: 
Replicate_Ignore_Server_Ids: 
Master_Server_Id: 1       主服务器的server-ID值
```
