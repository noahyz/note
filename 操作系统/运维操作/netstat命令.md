---
title: linux中 netsat 命令
date: 2021-03-07 21:11:41
categories:
- linux
tags:
- netstat
---

## netstat 命令

展示打印网络连接，路由表，接口统计信息，伪装连接和多播成员身份

#### 摘要
netstat 这个工具是快要被淘汰的。
使用 `ss` 代替 `netstat`
使用 `ip route` 代替 `netstat -r`
使用 `ip -s link` 代替 `netstat -i`
使用 `ip maddr` 代替 `netstat -g`


#### 描述
`netstat` 打印linux 网络的信息，第一个参数用来控制信息的输出，第一个参数如下：
- (none)：默认的情况，netstat 展示打开的 socket 列表。如果不具体指明地址族，所有已配置的活跃的地址族都将被展示
- --route, -r: 展示内核路由表
- --groups,-g: 显示 ipv4 和 ipv6 的多播族成员信息
- --interfaces,-i: 显示所有的网络接口表
- --masquerade,-M: 展示伪装连接的所有列表
- --statistics,-s: 显示每个协议的汇总统计信息

#### 操作
1. --verbose,-v: 通过详细信息告诉用户发生了什么。特别是打印一些关于未配置的地址族的有用信息
2. --wide,-W: 不要通过使用所需宽度的输出截断IP地址。现在，此选项是可选的，以不破坏现有脚本。
3. --numeric,-n: 显示数字地址，而不是解析符号主机，端口或用户名
4. --numeric-hosts: 显示数字形式的主机但是不影响端口或用户名的解析。
5. --numeric-ports: 显示数字端口号，但是不影响主机或用户名的解析。 
6. --numeric-users: 显示数字的用户ID，但是不影响主机和端口名的解析。
7. --protocol=family , -A: 指定要显示哪些连接的地址族(也许在底层协议中可以更好地描述)。 family 以逗号分隔的地址族列表，比如 inet , unix , ipx , ax25 , netrom , 和 ddp 。 
    也可以这样使用 --inet , --unix ( -x ), --ipx , --ax25 , --netrom, 和 --ddp 选项效果相同。 
    地址族 inet 包括raw, udp 和tcp 协议套接字。 
    地址族 bluetooth(IPv4)(蓝牙) 包括 12cap、rfcomm 协议套接字
    例如：--protocol=inet 或 -A inet,unix 或 --inet 
8. -c, --continuous: 将使 netstat 不断地每秒输出所选的信息
9. -e, --extend: 显示附加信息。使用这个选项两次来获得所有细节
10. -o, --timers: 包含与网络定时器有关的信息
11. -p, --programs: 显示套接字所属进程的PID和名称
12. -l, --listening: 只显示正在侦听的套接字(这是默认的选项)
13. -a, --all: 显示所有正在或不在侦听的套接字。加上 --interfaces 选项将显示没有标记的接口。 
14. -F: 显示FIB中的路由信息。(这是默认的选项) 
15. -C: 显示路由缓冲中的路由信息。

#### 输出的信息

##### 活跃的 Internet 网络连接(TCP、UDP、raw)
1. Proto: 套接字使用的协议
2. Recv-Q: 连接此套接字的用户程序未拷贝的字节数
3. Send-Q: 远程主机未确认的字节数
4. Local Address: 套接字的本地地址(本地主机名)和端口号。除非给定-n --numeric ( -n ) 选项，否则套接字地址按标准主机名(FQDN)进行解析，而端口号则转换到相应的服务名
5. Foreign Address: 套接字的远程地址(远程主机名)和端口号
6. State: 套接字的状态。因为在RAW协议中没有状态，而且UDP也不用状态信息，所以此行留空。通常它为以下几个值之一：
    - ESTABLISHED: 套接字有一个有效连接。
    - SYN_SENT: 套接字尝试建立一个连接
    - SYN_RECV: 从网络上收到一个连接请求。
    - FIN_WAIT1: 套接字已关闭，连接正在断开。
    - FIN_WAIT2: 连接已关闭，套接字等待远程方中止。
    - TIME_WAIT: 在关闭之后，套接字等待处理仍然在网络中的分组
    - CLOSED: 套接字未用。
    - CLOSE_WAIT: 远程方已关闭，等待套接字关闭。
    - LAST_ACK: 远程方中止，套接字已关闭。等待确认。
    - LISTEN: 套接字监听进来的连接。如果不设置 --listening (-l) 或者 --all (-a) 选项，将不显示出来这些连接。
    - CLOSING: 套接字都已关闭，而还未把所有数据发出。
    - UNKNOWN: 套接字状态未知。
7. User: 套接字属主的名称或UID 
8. PID/Program name: 以斜线分隔的处理套接字程序的PID及进程名。 --program 使此栏目被显示。你需要 superuser 权限来查看不是你拥有的套接字的信息。对IPX套接字还无法获得此信息
9. Timer: man page没有，由 -o 选项控制，包含网络定时器的消息

##### 活跃的 unix 域套接字
1. Proto: 套接字所用的协议(通常是unix)
2. RefCnt: 使用数量(也就是通过此套接字连接的进程数)。
3. Flags: 显示的标志为SO_ACCEPTON(显示为 ACC ), SO_WAITDATA ( W ) 或 SO_NOSPACE ( N )。 如果相应的进程等待一个连接请求，那么SO_ACCECPTON用于未连接的套接字。其它标志通常并不重要 
4. Type: 套接字使用的一些类型：
    - SOCK_DGRAM: 此套接字用于数据报(无连接)模式。
    - SOCK_STREAM: 流模式(连接)套接字
    - SOCK_RAW: 此套接字用于RAW模式。
    - SOCK_RDM: 一种服务可靠性传递信息。
    - SOCK_SEQPACKET: 连续分组套接字。
    - SOCK_PACKET: RAW接口使用套接字。
    - UNKNOWN: 将来谁知道它的话将告诉我们，就填在这里 :-)
5. State: 此字段包含以下关键字之一：
    - FREE: 套接字未分配。
    - LISTENING: 套接字正在监听一个连接请求。除非设置 --listening (-l) 或者 --all (-a) 选项，否则不显示。
    - CONNECTING: 套接字正要建立连接。
    - CONNECTED: 套接字已连接。
    - DISCONNECTING: 套接字已断开。
    - (empty): 套接字未连。
6. PID/Program name: 进程号和进程名
7. Path: 链接到socket上的符合的进程的路径名
