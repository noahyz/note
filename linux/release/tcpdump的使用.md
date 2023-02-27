---
title: tcpdump的使用
date: 2020-11-07 14:11:41
tags:
- tcpdump
---

### tcpdump的使用

wireshark 和 tcpdump 类似，都是抓包工具，不过 wireshark 有图形化界面。但是在现网排查问题，使用 tcpdump 查询更加方便快速一点。由于网络包太多，因此学习tcpdump 就是要知道如何从很多包中过滤出我们想要的包。由于tcpdump 的参数很难理解，因此我们慢慢来解释。

#### 1. 开篇

##### 1.1 举个例子

1. host：通过指定 host 参数指定 host ip 进行过滤

   ```
   tcpdump host 9.134.239.95
   ```

   还可以加上限定词，来缩小过滤的范围，src、dst 就是源、目的的意思。

   ```
   tcpdump src host 9.134.239.95
   ```

   当然了，还可以在加上一层限定词，tcp、udp、icmp 就是包是什么协议的包

   ```
   tcpdump tcp src host 9.134.239.95
   ```

   因此tcpdump 的参数组成是困难的

##### 1.2 tcpudmp 协议的构成【重要】

```
tcpdump option proto dir type
```

- opention：是可选的参数
- proto：是过滤器，可以根据协议进行过滤，例如：tcp、udp、icmp、ip、ip6、arp 等等包的协议
- dir：过滤器，根据数据流向进行过滤，可识别的关键词有 src、dst，也可以是 src or dst
- type：过滤器，范围较广，host、net、port、portrange，这些词后面还需接参数

#### 2. tcpdump协议的输出

```
14:57:53.010561 IP 9.135.14.255.36000 > 10.64.43.20.55557: Flags [P.], seq 1942144:1942368, ack 65, win 10694, options [nop,nop,TS val 2681924276 ecr 608552721], length 224
```

- 第一列：时分秒+毫秒
- 第二列：网络协议 IP
- 第三列：发送端的IP地址+端口号
- 第四列：数据流向
- 第五列：接收端的IP地址+端口号
- 第六列：数据包的内容，Flags 标识符、seq号、ack号、win 窗口、数据操作、数据长度

##### 2.1 Flags 标识符

- [S]：SYN（开始连接）
- [P]：PSH（推送数据）
- [F]：FIN（结束连接）
- [R]：RST（重置连接）
- [.]：没有Flag，不确定，可能是ACK或者URG

#### 3. type 过滤器的过滤规则

##### 3.1 基于IP地址过滤：host

使用 host 指定 host ip 进行过滤

```
tcpdump host 9.134.239.95
```

扩展：数据包的IP 可以分为源IP和目标IP两种

```
tcpdump -i eth1 src 9.134.239.95
tcpdump -i eth1 dst 9.134.239.95
```

##### 3.2 基于网段进行过滤：net

比如 IP 范围是一个网段，可以直接这样指定

```
tcpdump net 9.134.239.95/24
```

网段可以再细分为源网段和目标网段

```
tcpdump src net 9.134
tcpdump dst net 9.134
```

##### 3.3 基于端口进行过滤：port

```
tcpdump port 8888
```

端口也可分为源端口和目的端口，也可以指定两个端口，或者一个范围，对于一些常见协议的端口，也可以使用协议名，而不用具体的端口号

```
tcpdump src port 8888
tcpdump dst port 8888
tcpdump port 80 or port 8888 或 tcpdump port 80 or 8888
tcpdump portrange 8000-8080
tcpdump src portrange 8000-8080
tcpdump dst portrange 8000-8080
tcpdump tcp port http
```

#### 4. proto过滤器的过滤规则

常见的网络协议：tcp、udp、icmp、http、ip、ipv6等

```
tcpdump tcp
```

上面的查询 tcp 的包是不精准的，因为tcp 的下一层是ip协议，而IP协议有IPv4、IPv6，因此

```
IPv4的 tcp 包：
tcpdump 'ip proto tcp'
tcpdump ip proto 6 # 数字6表示tcp在IP报文中的编号
IPv6的 tcp 包：
tcpdump 'ip6 proto tcp'
tcpdump ip6 proto 6 # 数字6表示tcp在IP报文中的编号
```

#### 5. option可选参数的的解析

##### 5.1 设置不解析域名提升速度

- -n：不把IP转化成域名，直接显示IP，避免执行DNS lookups 的过程，速度会快很多
- -nn：不把协议和端口号转换成名字，速度也会快很多
- -N：不打印出 host 域名部分

##### 5.2 将过滤结果输出到文件中

使用 -w 参数后接一个以 .pcap 后缀命令的文件名，可以将 tcpdump 抓到的数据保存到文件中

```
tcpdump 'ip proto tcp' -w tcp.pcap
```

##### 5.3 从文件中读取包数据

使用 -r 是从文件中读取数据，读取出来的数据我们依然可以使用 tcpdump 的过滤规则来过滤分析

```
tcpdump ip proto 6 -r tcp.pcap
```

##### 5.4 控制内容输出

- -v：产生详细的输出，比如包的 TTL、id标识、数据包长度、IP包的一些选项。同时还会打开一些附加的包完整性检测
- -vv：产生比 -v 更详细的输出
- -vvv：比 -vv 更详细的输出，这两个选项没有尝试，使用到了在补上

##### 5.5 控制时间的输出

- -t：在每行的输出中不输出时间
- -tt：在每行的输出中会输出时间戳
- -ttt：输出每两行打印的时间间隔（以毫秒为单位）
- -tttt：在每行打印的时间戳之前添加时间的打印

##### 5.6 显示数据包的头部

- -x：以16进制的形式打印每个包的头部数据（但不包括数据链路层的头部）
- -xx：以16进制的形式打印每个包的头部数据（包括数据链路层的头部）
- -X：以16进制和 ASCII码形式打印出每个包的数据(但不包括数据链路层的头部)，这在分析一些新协议的数据包很方便。
- -XX：以16进制和 ASCII码形式打印出每个包的数据(包括数据链路层的头部)，这在分析一些新协议的数据包很方便。

##### 5.7 过滤指定网卡的数据包

- -i：指定要过滤的网卡接口，如果要查看所有网卡，可以 -i any

##### 5.8 过滤特定流向的数据包

- -Q：选择入方向还是出方向的数据包，可选项有：in、out、inout

##### 5.9 其他常用的参数

- -A：以ASCII码方式显示每一个数据包(不显示链路层头部信息). 在抓取包含网页数据的数据包时, 可方便查看数据
- -l：基于行的输出，便于保存查看，或者交给其他工具分析
- -q：简洁的打印输出，即打印很少的协议相关信息，从而输出行都比较简短
- -c：捕获 count 个包 tcpdump 就退出
- -s：tcpdump 默认只会截取前 `96` 字节的内容，要想截取所有的报文内容，可以使用 `-s number`， `number` 就是你要截取的报文字节数，如果是 0 的话，表示截取报文全部内容
- -S：使用绝对序列号，而不是相对序列号
- -C：file-size，tcpdump 在把原始数据包直接保存到文件中之前, 检查此文件大小是否超过file-size. 如果超过了, 将关闭此文件,另创一个文件继续用于原始数据包的记录. 新创建的文件名与-w 选项指定的文件名一致, 但文件名后多了一个数字.该数字会从1开始随着新创建文件的增多而增加. file-size的单位是百万字节(nt: 这里指1,000,000个字节,并非1,048,576个字节, 后者是以1024字节为1k, 1024k字节为1M计算所得, 即1M=1024 ＊ 1024 ＝ 1,048,576)
- -F：使用file 文件作为过滤条件表达式的输入，此时命令行上的输入将被忽略

##### 5.10 对输出内容进行控制的参数

- -D：显示所有可用网络接口的列表
- -e：每行的打印输出中将包含数据包数据链路层头部信息
- -E : 揭秘IPSEC数据
- -L ：列出指定网络接口所支持的数据链路层的类型后退出
- -Z：后接用户名，在抓包时会受到权限的限制。如果以root用户启动tcpdump，tcpdump将会有超级用户权限。
- -d：打印出易读的包匹配码
- -dd：以C语言的形式打印出包匹配码.
- -ddd：以十进制数的形式打印出包匹配码

#### 6. 过滤规则组合

- and：所有的条件都需要满足，也可以表示为 &&
- or：只要有一个条件满足就可以，也可以表示为 ||
- not：取反，也可以使用 !

```
tcpdump src 9.134.239.95 and dst port 3306
```

当在使用多个过滤器进行组合时，有可能需要用到括号，而括号在 shell 中是特殊符号，因为需要使用引号将其包括

```
tcpdump 'src 9.134.239.95 and (dst port 3306 or 22)'
```

而在单个过滤器里，常常会判断一条件是否成立，这时候，就要使用下面两个符号

- =：判断二者相等
- ==：判断二者相等
- !=：判断二者不相等

当你使用这两个符号时，tcpdump 还提供了一些关键字的接口来方便我们进行判断，比如

- if：表示网卡接口名、
- proc：表示进程名
- pid：表示进程 id
- svc：表示 service class
- dir：表示方向，in 和 out
- eproc：表示 effective process name
- epid：表示 effective process ID

举例：我现在要过滤来自进程名为 nc 发出的流经 eth0 网卡的数据包，或者不流经 eth0 的入方向数据包

```
tcpdump "(if=eth1 and proc = nc) || (if != eht1 and dir=in)"
```

#### 7. 抓包实战

##### 7.1 提取HTTP 的User-Agent

```
tcpdump -nn -A -s1500 -l | grep "User-Agent"
```

##### 7.2 抓取HTTP GET和 POST 请求

```
tcpdump -vvAls0 | grep 'GET'
tcpdump -vvAls0 | grep 'POST'
```

##### 7.3 找出发包数最多的IP

```
tcpdump -nnn -t -c 200 | cut -f 1,2,3,4 -d '.' | sort | uniq -c | sort -nr | head -n 20
```

- cut -f 1,2,3,4 -d '.' ：以 . 为分隔符，打印出每行的前四列。即 IP 地址
- sort | uniq -c ：排序并计数
- sort -nr：按照数值大小逆向排序

##### 7.4 抓去DNS请求和响应

DNS 的默认端口是 53，因此可以通过进行过滤

```
tcpdump -i any -s0 port 53
```

##### 7.5 切割 pcap 文件

当抓取大量数据并写入文件时，可以自动切割为多个大小相同的文件。

每3600秒创建一个新文件 capture-(hour).pcap，每个文件大小不超过 200*1000000 字节

```
tcpdump -w /tmp/capture-%H.pcap -G 3600 -C 200
```

这些文件 24 小时之后，之前的文件就会被覆盖

##### 7.6 抓去HTTP POST 请求中的秘密

```
tcpdump -s 0 -A -n -l | grep -i "POST /|pwd=|passwd=|password=|Host:"
```

##### 7.7 结合Wireshark 进行分析

通常 wireshark 比 tcpdump 更容易分析应用层协议，一般的做法是在远程服务器上先使用 tcpdump 抓取数据并写入文件，然后在将文件拷贝到本地用 wireshark 分析

还有一种高效的方法，可以通过ssh 连接将抓取到的数据实时发送给 wireshark 进行分析，可以通过 brew cask install wireshark 来安装，然后通过下面的命令来分析。

```
ssh root@remotesystem 'tcpdump -s0 -c 1000 -nn -w - not port 22' | /Applications/Wireshark.app/Contents/MacOS/Wireshark -k -i
```

参考博文：https://www.cnblogs.com/wongbingming/p/13212306.html

