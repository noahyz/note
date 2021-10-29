Broker 端参数

```
log.dirs: 指定Broker需要使用的若干个文件目录路径
log.dir: 表示单个路径，补充上一个参数用的
只要设置log.dirs就好，配置多个路径，中间用逗号分隔。如果有条件最好保证这些目录挂载到不同的物理磁盘上

zookeeper.connect: 指定zookerrper监听的地址
如果有两套kafka集群，分别叫kafka1，kafka2，那么这两套集群的zookeeper.connect 参数可以这样指定：zk1:2181,zk2:2181/kafka1 和 zk1:2181,zk2:2181/kafka2 就是chroot，只需要写一次，而且是加到最后的

关于Broker连接相关，即客户端程序或其他Broker如何与该Broker进行通信的设置
listeners: 学名叫监听器，其实就是告诉外部连接者要通过什么协议访问指定主机名和端口开发的kafka服务
advertised.listeners: 这组监听器是Broker用于对外发布的
host.name/port: 不要设置，过期的参数

auto.create.topics.enable: 是否允许自动创建Topic。建议设置false，当发送的事件，如果topic之前没有创建，就会自动创建一个
unclean.leader.election.enable: 是否允许Unclean Leader 选举。每个分区有多个副本需要选一个Leader副本，只有保存数据比较多的那些副本才有资格竞选，如果保存数据比较多的副本都挂了。此参数设置成false，代表不允许那些落后太多的副本竞选Leader，这样做的后果是这个分区就不可用了。此参数如果设置成true，代表kafka允许从那些“跑的慢”的副本中选一个出来当Leader，这样做的后果是数据有可能就丢失了，因为这些副本保存的数据本来就不全。这个参数推荐设置false
auto.leader.rebalance.enable: 是否允许定期进行Leader选举。有可能出现LeaderA 一直表现很好，但此参数为true，那么就有可能一段时间后LeaderB就要强行卸任换成LeaderB。换一个LeaderB的代价很高。此参数推荐为false

log.retention.{hours|minutes|ms}: 这三个都是控制一条消息数据被保存多长时间。优先级：ms设置最高，minutes次之，hours最低。默认log.retention.houts=168 保存7天的数据。
log.retention.bytes: 指定Broker为消息保存的总磁盘容量大小。默认为-1，表明想在这台Broker上保存多少数据都可。
message.max.bytes: 控制Broker能够接收的最大消息大小。默认值不到1M，太小了。

topic级别参数会覆盖全局Broker参数的值
retention.ms: 规定了该Topic消息被保存的时长。默认是7天，即该Topic只保存最近7天的消息。一旦设置此值，会覆盖Broker端的全局参数值
retention.bytes: 规定要为该Topic预留多大的磁盘空间。默认值为-1，表示可以无限使用磁盘空间
max.message.bytes: kafka Broker能够正常接收该Topic的最大消息大小

如下可以设置Topic级别的参数：在创建Topic时设置
bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic transaction --partitions 1 --replication-factor 1 --config retention.ms=15552000000 --config max.message.bytes=5242880
在修改Topic时设置参数：
bin/kafka-configs.sh --zookeeper localhost:2181 --entity-type topics --entity-name transaction --alter --add-config max.message.bytes=10485760

```

