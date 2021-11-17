## Redis 入门

#### 概述

> Redis 是什么？

Redis（Remote Dictionary Server），即远程字典服务

是一种开源的使用 C 语言编写、支持网络、可基于内存亦可持久化的日志型、Key-Value 数据库，并提供多种语言的API

Redis 会周期性的把更新的数据写入磁盘或者把修改操作写入追加的记录文件，并且在基础上实现 master-slave主从同步

> Redis 能干什么

1. 内存存储、持久化，内存中是断电即失、所以持久化很重要（rdb、aof）
2. 效率高，可以用于高速缓存
3. 发布订阅系统
4. 地图信息分析
5. 计时器、计数器（浏览量）
6. 。。。。

> 特性

1. 多样的数据类型
2. 持久化
3. 集群
4. 事务
5. 。。。。

redis 的中文网站：http://www.redis.cn/

#### 安装redis

1. 下载 redis 源码
2. make && make install 
3. 默认安装路径：/usr/local/bin/ 下
4. redis 默认不是后台启动，配置中 daemonize 改为 yes
5. 启动 redis-server ../etc/redis.conf
6. redis-cli -p 6379 使用 redis 客户端连接 redis-server 

关闭redis 服务，redis cli 中直接 shutdown 就可以关闭 redis-server 

#### 测试性能

redis-benchmark 命令测试工具

```
# 测试： 100个并发连接 100000 请求
redis-benchmark -h localhost -p 6379 -c 100 -n 100000
```

### 基础的知识

redis 默认有16个数据库，默认使用第0个。在配置文件中 `databases 16`

```
select 3 # 切换到第三个数据库
DBSIZE # 查看数据库大小
keys * # 查看当前数据库所有的key
flushdb # 清除当前数据库
flushall # 清除所有数据库
```

> Redis 是单线程的

Redis 基于内存操作，CPU不是redis 性能瓶颈，Redis 的瓶颈是根据机器的内存和网络带宽，既然可以使用单线程，就没有必要使用多线程。

核心：redis 是将所有的数据全部放在内存中的，所以说使用单线程去操作效率是最高的，多线程（CPU上下文切换：耗时的操作），对于内存系统来说，如果没有上下文切换效率就是最高的！多次读写都是一个CPU上的，在内存情况下，这个就是最佳的方案。