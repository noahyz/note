---
title: linux上iptables的原理及使用
date: 2020-03-14 21:11:24
categories:
- linux
tags:
- iptables
---

## iptables 命令原理使用详解

iptables的主要功能是实现对网络数据包进出设备及转发的控制。当数据包需要进入设备、从设备中流出或者经该设备转发、路由时，都可以使用iptables进行控制。

### iptables名词和术语
- 容器：用来形容包含或者属于的关系
- iptables是表的容器，iptables包含多个表
- 表(tables)又是链(chains)的容器
- 链(INPUT,OUTPUT,FORWARD,PREROUTING,POSTROUTING)是规则的容器
- 规则(Policy)就是一条条过滤的语句
1. filter表
这个表是负责主机的防火墙功能的，就是过滤流入流出主机的数据包。filter表是iptables默认使用的表。这个表定义了三个链(chains)
    - INPUT: 负责过滤所有目标地址是主机地址的数据包。就是过滤进入主机的数据包
    - FORWARD: 负责转发流经主机的数据包。起转发的作用。
    - OUTPUT: 处理所有源地址是本机地址的数据包。就是处理从主机发出去的数据包
2. net表
这个表是负责网络地址转换，即来源与目的ip地址和port的转换。应用：和主机本身无关，一般用于局域网共享上网或者特殊的端口转换服务相关
这个表定义了三个链(chain),nat功能就相当于网络的 acl 控制。和网络交换机 acl 类似
    - OUTPUT: 和主机发出去的数据包有关，改变主机发出数据包的目标地址
    - PREROUTING: 在数据包到达防火墙进行路由判断之前执行的规则，作用是改变数据包的目的地址、目的端口等
    - POSTROUTING: 在数据包离开防火墙时进行路由判断之后执行的规则，作用是改变数据包的源地址、源端口等。例如：我们的笔记本或者虚拟机是192.168.30.0/24，就是出网的时候被企业路由器把源地址改成公网地址了。

### iptables中的“四表五链”及“堵通策略”
1. “四表”是指，iptables的功能——filter, nat, mangle, raw.
    - filter, 控制数据包是否允许进出及转发（INPUT、OUTPUT、FORWARD）,可以控制的链路有input, forward, output
    - nat, 控制数据包中地址转换，可以控制的链路有prerouting, input, output, postrouting
    - mangle,修改数据包中的原数据，可以控制的链路有prerouting, input, forward, output, postrouting
    - raw,控制nat表中连接追踪机制的启用状况，可以控制的链路有prerouting, output
    - 注：在centos7中，还有security表，不过这里不作介绍

2. “五链”是指内核中控制网络的NetFilter定义的五个规则链，分别为
    - PREROUTING, 路由前,用于目标地址转换(DNAT)
    - INPUT, 数据包流入口,处理输入数据包
    - FORWARD, 转发管理,处理转发数据包
    - OUTPUT, 数据包出口,处理输出数据包
    - POSTROUTING, 路由后,用于源地址转换(SNAT)

3. 堵通策略是指对数据包所做的操作，一般有两种操作——“通（ACCEPT）”、“堵（DROP）”，还有一种操作很常见REJECT.
    谈谈REJECT和DROP之间的区别，Ming写了一封信，向Rose示爱。Rose如果不愿意接受，她可以不回应Ming,这个时候Ming不确定Rose是否接到了信；Rose也可以同样写一封信，在信中明确地拒绝Ming。前一种操作就如同执行了DROP操作，而后一种操作就如同REJECT操作。

### 命令选项
-t, --table table 对指定的表进行操作，table必须是raw、nat、filter、mangle中的一个。如果不指定此选项，默认的是filter表

**通用匹配：源地址和目的地址的匹配**
-p: 指定要匹配的数据包协议类型
-s, --source [!] address[/mask]: 把指定的一个或一组地址作为源地址，按此规则进行过滤。当后面没有mask时，address是一个地址，比如：192.168.1.1；当指定mask时，可以表示一组范围内的地址，比如：192.168.1.0/255.255.255.0 或者 192.168.1.0/24。! 表示取反
-d, --destination [!] address[/mask]: 指定目的地址，和指定源地址规则一样
-i, --in-interface [!] <网络接口name>: 指定数据包来自那个网络接口，比如常见的eth0。注意：它只对 INPUT、FORWARD、PREROUTING 这三个链起作用。如果没有指定此选项，则可以来自任意一个网络接口。
-o, --out-interface [!] <网络接口name>: 指定数据包出去的网络接口。只对 OUTPUT、FORWARD、POSTROUTING 三个链起作用
--dport num 匹配目标端口号
--sport num 匹配来源端口号

**查看管理命令**
-L, --list [chain] 列出链 chain 上面的所有规则，如果没有指定链，列出表上所有链的所有规则

**规则管理命令**
-A, --append chain rule-specification 在指定链 chain 的末尾插入指定的规则，就是说，这条规则会被放到最后，最后才会被执行。规则由后面的匹配来指定
-I, --insert chain [rulenum] rule-specification 在链 chain 中的指定位置插入一条或多条规则。如果指定的规则号是1，则在链的头部插入。如果没有指定规则号，默认会插入链的头部
-D, --delete chain rule-specification -D, --delete chain rulenum 在指定的链 chain 中删除一个或多个指定规则
-R num: Replays 替换/修改第几条规则

**链管理命令**(都是立即生效的)
-P, --policy chain target: 为指定的链 chain 设置策略 target。注意：只有内置的五条链才允许有策略，用户自定义的是不允许的
-F, --flush [chain] 清空指定链 chain 上面的所有规则，如果没有指定链，清空该表上所有链的所有规则
-N, --new-chain chain 用指定的名字创建一个新的链
-X, --delete-chain [chain] 删除指定的链，这个链必须没有被其他任何规则引用，而且这条链上必须没有任何规则。如果没有指定域名，则会删除该表中所有非内置的链
-E, --rename-chain old-chain new-chain 用指定的新名字去重命名指定的链。这并不会对链造成任何影响
-Z, -zero [chain] 把指定的链或者表中所有链上的所有计数器清零

-j, --jump target <指定目标> ：即满足某条件时该执行什么样的动作。target 可以是内置的目标，比如 ACCEPT，也可以是用户自定义的链。
-h：显示帮助信息

**命令选项的输入顺序**: iptables -t 表名 <-A/I/D/R> 规则链名 [规则号] <-i/o 网卡名> -p 协议名 <-s 源IP/源子网> --sport 源端口 <-d 目标IP/目标子网> --dport 目标端口 -j 动作

### 防火墙策略
iptables现在是一个服务，可以进行启动，停止的。启动，则将规则直接生效，停止，则将规则撤销。
表名包括：
    - raw ：高级功能，如：网址过滤。
    - mangle ：数据包修改（QOS），用于实现服务质量。
    - nat ：地址转换，用于网关路由器。
    - filter ：包过滤，用于防火墙规则。
动作包括：
    - ACCEPT ：接收数据包。
    - DROP ：丢弃数据包。
    - REDIRECT ：重定向、映射、透明代理。
    - SNAT ：源地址转换。
    - DNAT ：目标地址转换。
    - MASQUERADE ：IP伪装（NAT），用于ADSL。
    - LOG ：日志记录。
    - SEMARK : 添加SEMARK标记以供网域内强制访问控制（MAC）

### 实例
##### 清空当前的所有规则和计数
iptables -F  # 清空所有的防火墙规则
iptables -X  # 删除用户自定义的空链
iptables -Z  # 清空计数

##### 匹配允许 ssh 端口连接
// 22为ssh端口， -s 192.168.1.0/24表示允许这个网段的机器来连接，其它网段的ip地址是登陆不了你的机器的。 -j ACCEPT表示接受这样的请求
iptables -A INPUT -s 192.168.1.0/24 -p tcp --dport 22 -j ACCEPT 

##### 允许本地回环地址可以正常使用
iptables -A INPUT -i lo -j ACCEPT
// 本地回环地址就是那个127.0.0.1，是本机上使用的,它进与出都设置为允许
iptables -A OUTPUT -o lo -j ACCEPT

##### 设置默认的规则
iptables -P INPUT DROP # 配置默认的不让进
iptables -P FORWARD DROP # 默认的不允许转发
iptables -P OUTPUT ACCEPT # 默认的可以出去

##### 配置白名单
iptables -A INPUT -p all -s 192.168.1.0/24 -j ACCEPT  # 允许机房内网机器可以访问
iptables -A INPUT -p all -s 192.168.140.0/24 -j ACCEPT  # 允许机房内网机器可以访问
iptables -A INPUT -p tcp -s 183.121.3.7 --dport 3380 -j ACCEPT # 允许183.121.3.7访问本机的3380端口

##### 开启相应的服务端口
iptables -A INPUT -p tcp --dport 80 -j ACCEPT # 开启80端口，因为web对外都是这个端口
iptables -A INPUT -p icmp --icmp-type 8 -j ACCEPT # 允许被ping
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT # 已经建立的连接得让它进来

##### 保存规则到配置文件中
cp /etc/sysconfig/iptables /etc/sysconfig/iptables.bak # 任何改动之前先备份，请保持这一优秀的习惯
iptables-save > /etc/sysconfig/iptables
cat /etc/sysconfig/iptables

##### 列出已设置的规则
iptables -L [-t 表名] [链名]
    - 四个表名 raw，nat，filter，mangle
    - 五个规则链名 INPUT、OUTPUT、FORWARD、PREROUTING、POSTROUTING
    - filter表包含INPUT、OUTPUT、FORWARD三个规则链
iptables -L -t nat                  # 列出 nat 上面的所有规则
    - -t 参数指定，必须是 raw， nat，filter，mangle 中的一个
iptables -L -t nat  --line-numbers  # 规则带编号
iptables -L INPUT
iptables -L -nv  # 查看，这个列表看起来更详细

##### 清除已有规则
iptables -F INPUT  # 清空指定链 INPUT 上面的所有规则
iptables -X INPUT  # 删除指定的链，这个链必须没有被其它任何规则引用，而且这条上必须没有任何规则。
                   # 如果没有指定链名，则会删除该表中所有非内置的链。
iptables -Z INPUT  # 把指定链，或者表中的所有链上的所有计数器清零。

##### 删除已添加的规则
添加一条规则: iptables -A INPUT -s 192.168.1.5 -j DROP
将所有iptables以序号标记显示，执行：iptables -L -n --line-numbers
比如要删除INPUT里序号为8的规则，执行：iptables -D INPUT 8

##### 开放指定的端口
iptables -A INPUT -s 127.0.0.1 -d 127.0.0.1 -j ACCEPT               #允许本地回环接口(即运行本机访问本机)
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT    #允许已建立的或相关连的通行
iptables -A OUTPUT -j ACCEPT         #允许所有本机向外的访问
iptables -A INPUT -p tcp --dport 22 -j ACCEPT    #允许访问22端口
iptables -A INPUT -p tcp --dport 80 -j ACCEPT    #允许访问80端口
iptables -A INPUT -p tcp --dport 21 -j ACCEPT    #允许ftp服务的21端口
iptables -A INPUT -p tcp --dport 20 -j ACCEPT    #允许FTP服务的20端口
iptables -A INPUT -j reject       #禁止其他未允许的规则访问
iptables -A FORWARD -j REJECT     #禁止其他未允许的规则访问

##### 屏蔽IP
iptables -A INPUT -p tcp -m tcp -s 192.168.0.8 -j DROP  # 屏蔽恶意主机（比如，192.168.0.8
iptables -I INPUT -s 123.45.6.7 -j DROP       #屏蔽单个IP的命令
iptables -I INPUT -s 123.0.0.0/8 -j DROP      #封整个段即从123.0.0.1到123.255.255.254的命令
iptables -I INPUT -s 124.45.0.0/16 -j DROP    #封IP段即从123.45.0.1到123.45.255.254的命令
iptables -I INPUT -s 123.45.6.0/24 -j DROP    #封IP段即从123.45.6.1到123.45.6.254的命令是

##### 指定数据包出去的网络接口
只对 OUTPUT，FORWARD，POSTROUTING 三个链起作用。
iptables -A FORWARD -o eth0

##### 查看已添加的规则
iptables -L -n -v

##### 启动网络转发规则
公网210.14.67.7让内网192.168.188.0/24上网
iptables -t nat -A POSTROUTING -s 192.168.188.0/24 -j SNAT --to-source 210.14.67.127

##### 端口映射
本机的 2222 端口映射到内网 虚拟机的22 端口
iptables -t nat -A PREROUTING -d 210.14.67.127 -p tcp --dport 2222  -j DNAT --to-dest 192.168.188.115:22

##### 字符串匹配
比如，我们要过滤所有TCP连接中的字符串test，一旦出现它我们就终止这个连接，我们可以这么做：
iptables -A INPUT -p tcp -m string --algo kmp --string "test" -j REJECT --reject-with tcp-reset

##### 阻止Windows蠕虫的攻击
iptables -I INPUT -j DROP -p tcp -s 0.0.0.0/0 -m string --algo kmp --string "cmd.exe"

##### 防止SYN洪水攻击
iptables -A INPUT -p tcp --syn -m limit --limit 5/second -j ACCEPT

##### iptables 服务启动关闭
service iptables restart/start/...
service iptables save 保存设置

参考：https://wangchujiang.com/linux-command/c/iptables.html