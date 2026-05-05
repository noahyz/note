---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

# netstat 命令

###  netstat 从整体上看，分成两个部分

* 一个 Active Internet connections，有源TCP 连接，其中“Recv-Q”和“Send-Q”指接收队列和发送队列。这些数字一般为0，如果不是表示软件包正在队列中堆积。
* 另一个是Active UNIX domain sockets，称为有源Unix 域套接口（和网络套接字一样，但是只能用于本机通信，性能可以提高一倍）。Proto 显示连接使用的协议。RefCnt 表示连接到本套接口上的进程号，Types 显示套接口的类型，State 显示套接口当前的状态，Path 表示连接到套接口的其他进程使用的路径名

### 参数

1. -a ( all ) 显示所有选项，默认不显示 LISTEN 相关
2. -t  ( tcp ) 仅显示tcp 相关选项
3. -u  ( udp ) 仅显示udp 相关选项
4. -n 拒绝显示别名，能显示数字的全部转化成数字
5. -l  仅列出有在 Listen ( 监听 ) 的服务状态
6. -p  显示建立相关链接的程序名
7. -r  显示路由信息，路由表
8. -s  按各个协议进行统计
9. -c  每隔一个固定时间，执行该 netstat 命令
