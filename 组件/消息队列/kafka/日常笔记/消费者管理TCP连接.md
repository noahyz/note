---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

消费者TCP连接是在调用 KafkaConsumer.poll 方法时被创建，具体有3个时机

```
1. 发起 FindCoordinator 请求时。
当消费者程序首次调用poll方法时，它需要向kafka集群发送一个名为 FindCoordinator 的请求，希望kafka集群告诉它那个Broker是管理它的协调者。消费者程序会向集群中当前负载最小的那台Broker发送请求。(负载评估：消费者连接的所有Broker，谁的待发送请求最少，就会认为那个Broker的负载低)
2. 连接协调者时
Broker处理完上一步发送的FindCoordinator 请求之后，会返回对应的响应结果，显式告诉消费者那个Broker是真正的协调者，因此，consumer会创建向该Broker的Socket连接。只有成功连入协调者，协调者才能开启的组协调操作，比如加入组、等待组分配方案、心跳请求处理、位移获取、位移提交等等
3. 消费数据时
消费者会为每个要消费的分区创建与该分区领导者副本所在的Broker连接的TCP。
```

消费者程序会创建3类TCP连接：

```
1. 确定协调者和获取集群元数据
2. 连接协调者，令其执行组成员管理操作
3. 执行实际的消息获取
```

何时关闭TCP连接

```
1. 主动关闭：显式调用消费者API的方法去关闭消费者(KafkaConsumer.close()方法)，或者执行kill命令(kill -2 或 kill -9) 
2. 自动关闭：消费者端参数 connection.max.idle.ms 控制，默认9分钟。如果某个socket连接上连续9分钟都没有任何请求的话，那么消费者会强行杀掉这个Socket连接
注意：当第三类TCP成功创建之后，消费者程序就会废弃第一类TCP连接，之后在请求元数据时，它会改成使用第三类TCP连接。
```

