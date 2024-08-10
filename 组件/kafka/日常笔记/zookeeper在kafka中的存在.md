---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

## zookeeper在kafka中的存在

**注意：kafka于 2.8 版本放弃 zookeeper，该版本将依赖于 zookeeper 的控制器改造成了基于 kafka Raft 的 Quorm 控制器**

在基于 kafka 的分布式消息队列中，zookeeper 的作用有：broker 注册、topic 注册、producer 和 consumer 负载均衡、维护 partition 与 consumer 的关系、记录消息消费的进度以及 consumer 注册等

### 一、broker 在 zookeeper 中的注册

- 为了记录 broker 的注册信息，在 ZooKeeper 上，专门创建了属于 Kafka 的一个节点，其路径为 /brokers
- Kafka 的每个 broker 启动时，都会到 ZooKeeper 中进行注册，告诉 ZooKeeper 其 broker.id，在整个集群中，broker.id 应该全局唯一，并在 ZooKeeper 上创建其属于自己的节点，其节点路径为 `/brokers/ids/{broker.id}`
- 创建完节点后，Kafka 会将该 broker 的 broker.name 及端口号记录到该节点
- 另外，该 broker 节点属性为临时节点，当 broker 会话失效时，ZooKeeper 会删除该节点，这样，我们就可以很方便的监控到broker 节点的变化，及时调整负载均衡等

### 二、topic 在 zookeeper 中的注册

kafka中，所有 topic 与 broker 的对应关系都由 ZooKeeper 进行维护，在 ZooKeeper 中，建立专门的节点来记录这些信息，其节点路径为 `/brokers/topics/{topic_name}`。

一个 topic 会有多个分区，每个分区会有多个副本，基于 zookeeper，kafka 会为每个 partition 找一个 leader 副本和多个 follower 副本；且分布于不同的 broker 中。当生产消息时，作为 leader 的 broker 会将消息写入自己的分区，同时还会将此消息复制到各个 follower，实现同步。如果某个 follower 挂掉，leader 会再找一个替代并同步消息；如果 leader 挂了，follower 们会选择一个新的 leader 替代，继续业务，这些都是 zookeeper 完成的

### 三、consumer 在 zookeeper 中的注册

##### 1. 注册新的消费者分组

当新的消费者组注册到 ZooKeeper 中时，ZooKeeper 会创建专用的节点来保存相关信息，其节点路径为 `/consumers/{group_id}`，其节点下有三个子节点，分别为 `[ids, owners, offsets]`。

- ids 节点：记录该消费组中当前正在消费的消费者；
- owners 节点：记录该消费组消费的 topic 信息；
- offsets 节点：记录每个 topic 的每个分区的 offset。

##### 2. 注册新的消费者

当新的消费者注册到 Kafka 中时，会在 `/consumers/{group_id}/ids` 节点下创建临时子节点，并记录相关信息。

##### 3. 监听消费者分组中消费者的变化

每个消费者都要关注其所属消费者组中消费者数目的变化，即监听 `/consumers/{group_id}/ids` 下子节点的变化。一单发现消费者新增或减少，就会触发消费者的负载均衡 

### 四、producer 负载均衡

对于同一个 topic 的不同 partition，kafka 会尽力将这些 partition 分布到不同的 broker 服务器上，这种均衡策略实际上是基于 zookeeper 实现的。

在一个 broker 启动时，会首先完成 broker 的注册过程，并注册一些诸如：“有哪些可订阅的 topic” 之类的元数据信息。producer 启动后也要到 zookeeper 下注册，创建一个临时节点来监听 broker 服务器列表的变化。由于在 zookeeper 下 broker 创建的也是临时节点，当 broker 发生变化时，producers 可以得到相关的通知，从而改变自己的 broker list。其他的诸如 topic 的变化以及 broker 和 topic 的关系变化，也是 zookeeper 的这种 watcher 监听实现的

### 五、consumer 负载均衡

consumer 的数量如果与 partition 数量相等，则正好有一个 consumer 消费一个 partition 的数据。
consumer 的数量如果 大于 partition 数量，则有些 consumer 不会消费该 topic 下的消息
consumer 的数量如果 小于 partition 数量，则有些 consumer 会消费多个 partition 下的消息

consumer 消费时借助 zookeeper 根据 partition 的数量和 consumer 的数量做到均衡的动态配置。

consumers 在启动时会到 ZooKeeper 下以自己的 conusmer-id 创建临时节点 `/consumer/[group-id]/ids/[conusmer-id]`，并对 `/consumer/[group-id]/ids` 注册监听事件，当消费者发生变化时，同一 group 的其余消费者会得到通知。当然，消费者还要监听 broker 列表的变化。kafka 通常会将 partition 进行排序后，根据消费者列表，进行轮流的分配

### 六、记录消费进度 offset

在 consumer 对指定消息 partition 的消息进行消费的过程中，需要定时地将 partition 消息的消费进度 Offset 记录到 ZooKeeper上，以便在该 consumer 进行重启或者其它 consumer 重新接管该消息分区的消息消费权后，能够从之前的进度开始继续进行消息消费。Offset 在 ZooKeeper 中由一个专门节点进行记录，其节点路径为：

```
#节点内容就是Offset的值。
/consumers/[group_id]/offsets/[topic]/[broker_id-partition_id]
```

不过，kafka 推荐将 consumer 的 offset 信息保存在 kafka 内部的 topic 中，即：

```
__consumer_offsets(/brokers/topics/__consumer_offsets)
```

并且默认提供了 `kafka_consumer_groups.sh` 脚本供用户查看consumer 信息（命令：`sh kafka-consumer-groups.sh –bootstrap-server * –describe –group *`）。offset 存储方式要么存储在本地文件中，要么存储在 broker 端，具体的存储方式取决 `offset.store.method` 的配置，默认是存储在 broker 端。

### 七、记录 partition 与 consumer 的关系

consumer group 下有多个 consumer（消费者），对于每个消费者组（consumer group），Kafka都会为其分配一个全局唯一的 group ID，group 内部的所有消费者共享该 ID。订阅的 topic 下的每个分区只能分配给某个 group 下的一个consumer（当然该分区还可以被分配给其它 group）。同时，Kafka 为每个消费者分配一个 consumer ID，通常采用 `hostname:UUID` 形式表示。

在Kafka中，规定了每个 partition 只能被同组的一个消费者进行消费，因此，需要在 ZooKeeper 上记录下 partition 与 consumer 之间的关系，每个 consumer 一旦确定了对一个 partition 的消费权力，需要将其 consumer ID 写入到 ZooKeeper 对应消息分区的临时节点上。比如

```
/consumers/[group_id]/owners/[topic]/[broker_id-partition_id]
```

其中，[`broker_id-partition_id`] 就是一个消息分区的标识，节点内容就是该消息分区 消费者的 consumer ID

## kafka 为什么抛弃 zookeeper

首先从集群运维角度来看，kafka 本身就是一个分布式系统，但它又依赖另一个开源的分布式系统，而这个系统又是 Kafka 系统本身的核心。这就要求集群的研发和维护人员需要同时了解这两个开源系统，需要对其运行原理以及日常的运维（比如参数配置、扩缩容、监控告警等）都有足够的了解和运营经验。否则在集群出现问题的时候无法恢复，是不可接受的。所以，ZooKeeper 的存在增加了运维的成本。

其次，从集群规模的角度来看，限制 Kafka 集群规模的一个核心指标就是集群可承载的分区数。集群的分区数对集群的影响主要有两点：ZooKeeper 上存储的元数据量和控制器变动效率。

Kafka 集群依赖于一个单一的 Controller 节点来处理绝大多数的 ZooKeeper 读写和运维操作，并在本地缓存所有 ZooKeeper 上的元数据。分区数增加，ZooKeeper 上需要存储的元数据就会增加，从而加大 ZooKeeper 的负载，给 ZooKeeper 集群带来压力，可能导致 Watch 的延时或丢失

当 Controller 节点出现变动时，需要进行 Leader 切换、Controller 节点重新选举等行为，分区数越多需要进行越多的 ZooKeeper 操作：比如当一个 Kafka 节点关闭的时候，Controller 需要通过写 ZooKeeper 将这个节点的所有 Leader 分区迁移到其他节点；新的 Controller 节点启动时，首先需要将所有 ZooKeeper 上的元数据读进本地缓存，分区越多，数据量越多，故障恢复耗时也就越长

Kafka 单集群可承载的分区数量对于一些业务来说，又特别重要

---

参考：https://gitbook.cn/books/5ae1e77197c22f130e67ec4e/index.html#:~:text=%E5%9C%A8%E5%9F%BA%E4%BA%8EKafka%20%E7%9A%84%E5%88%86%E5%B8%83,%E8%BF%9B%E5%BA%A6%E4%BB%A5%E5%8F%8Aconsumer%20%E6%B3%A8%E5%86%8C%E7%AD%89%E3%80%82



















