---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

## 一、redis 的使用场景

- 缓存：对于热点数据。合理的使用缓存不仅可以提供我们业务的性能，还可以大大降低数据库的压力。Redis 提供键过期功能，也提供了灵活的键淘汰策略。因此 redis 用在缓存场合非常多

- 排行榜：很多网站都有排行榜，Redis 提供的有序集合数据结构能支持各种复杂的排行榜应用

- 计数器：比如网站的浏览量、视频的播放量。为了保证数据实时性，每次浏览都要加一，并发高时请求数据库会给数据库太大压力。Redis 提供 incr 命令来实现计数器功能，内存操作，性能高，适合这种场景

- 分布式锁：分布式技术的一个挑战就是对同一个资源的并发访问，如全局ID、秒杀、减少库存这类场景。并发量不大的场景可以使用数据库的悲观锁、乐观锁解决，但并发量大的情况下，可以使用 Redis 的 setnx 功能来编写分布式锁，如果设置返回1说明获取锁成功，否则获取锁失败，实际应用中要考虑的细节要更多。

    ```java
    public static boolean getLock(String key) {
        Long flag = jedis.setnx(key, "1");
        if (flag == 1) {
            jedis.expire(key, 10);
        }
        return flag == 1;
    }
    
    public static void releaseLock(String key) {
        jedis.del(key);
    }
    ```

## 二、redis 的数据结构的使用场景

#### 1. string

字符串对象的编码可以是 int、raw 或者 embstr

- 如果一个字符串对象保存的是整数值，并且这个整数值可以用 long 类型来表示，那么字符串对象会将整数值保存在字符串对象结构的 ptr 属性里面（将 void* 转换成 long），并将字符串对象的编码设置为 int
- 如果字符串对象保存的是一个字符串值，并且这个字符串值的长度大于 39 字节，那么字符串对象将使用一个简单动态字符串（SDS）来保存这个字符串值，并将对象的编码设置 为 raw
- 如果字符串对象保存的字符串值长度小于等于 39 字节，那么字符串对象将使用 embstr 编码的方式来保存
- 可用用 long double 类型表示的浮点数在 Redis 中也是作为字符串值来保存的，先将浮点数转换为字符串再保存

常用操作命令

```
SET  key  value 			//存入字符串键值对
MSET  key  value [key value ...] 	//批量存储字符串键值对
SETNX  key  value 		//存入一个不存在的字符串键值对
GET  key 			        //获取一个字符串键值
MGET  key  [key ...]	 	//批量获取字符串键值
DEL  key  [key ...] 		//删除一个键
EXPIRE  key  seconds 		//设置一个键的过期时间(秒)
INCR  key 			    //将key中储存的数字值加1
DECR  key 			    //将key中储存的数字值减1
INCRBY  key  increment 	//将key所储存的值加上increment
DECRBY  key  decrement 	//将key所储存的值减去decrement
```

场景：

- 分布式锁，使用 setnx 命令

    ```
    SETNX  product:10001  true 		//返回1代表获取锁成功
    SETNX  product:10001  true 		//返回0代表获取锁失败
    DEL  product:10001			    //执行完业务释放锁
    SET product:10001 true  ex  10  nx	//增加一个10S的超时时间，避免程序挂了，锁一直不释放
    ```

- 计数器，利用 incr 命令实现

- 分布式系统全局ID。如果有一个大型系统，有几百张数据库表需要生成唯一ID，每张表生成一条数据之前都要调用 INCR 命令去生成一个唯一 ID，对于 redis 资源很浪费。因此我们可以每台服务器一次性分配 1000 个ID（`INCRBY orderId 1000` 一次性分配 1000 个orderId），保存到服务器自己的内存中，然后服务器内存保障这 1000 个 ID 的分配。

#### 2. hash

可以理解为一个 key 关联的 value 是一个 map。比如存储一个哈希表key的键值： `HSET key field value`

哈希对象的编码可以是 ziplist（压缩列表） 或者 hashtable（字典）

- 当哈希对象保存的所有键值对的键和值的字符串长度都小于64字节，且哈希对象保存的键值对数量小于512个时，使用 ziplist 编码
- 否则使用 hashtable 编码

常用操作命令

```
HSET  key  field  value 			//存储一个哈希表key的键值
HSETNX  key  field  value 		    //存储一个不存在的哈希表key的键值
HMSET  key  field  value [field value ...] 	//在一个哈希表key中存储多个键值对
HGET  key  field 				    //获取哈希表key对应的field键值
HMGET  key  field  [field ...] 		//批量获取哈希表key中多个field键值
HDEL  key  field  [field ...] 		//删除哈希表key中的field键值
HLEN  key				            //返回哈希表key中field的数量
HGETALL key				            //返回哈希表key中所有的键值
HINCRBY  key  field  increment 		//为哈希表key中field键的值加上增量increment
```

场景：

- 电商的购物车。假如我们以用户ID（1001）为 hash 的 key，商品ID（10088）作为某个用户的 key 里面的 field，商品数量为 field 里面的 value，那可以做如下操作：

    ```
    hset cart:1001 10088 1      //给用户1001添加商品10088，数量为1
    hincrby cart:1001 10088 1   //用户1001将商品10088购买数量+1
    hlen cart:1001              //获得用户1001购物车商品总数
    hdel cart:1001 10088        //用户1001将10088商品从购物车删除
    hgetall cart:1001           //获得用户1001购物车的所有商品以及购买数量
    ```

#### 3. list

list结构，类似一个双向队列，队两头都可以进队和出队，而且该结构还实现了阻塞队列的功能

常用操作命令

```
LPUSH  key  value [value ...]    //将一个或多个值value插入到key列表的表头(最左边)
RPUSH  key  value [value ...]	 //将一个或多个值value插入到key列表的表尾(最右边)
LPOP  key			             //移除并返回key列表的头元素
RPOP  key			             //移除并返回key列表的尾元素
LRANGE  key  start  stop		 //返回列表key中指定区间内的元素，区间以偏移量start和stop指定
BLPOP  key  [key ...]  timeout	//从key列表表头弹出一个元素，若列表中没有元素，阻塞等待timeout秒,如果timeout=0,一直阻塞等待
BRPOP  key  [key ...]  timeout 	//从key列表表尾弹出一个元素，若列表中没有元素，阻塞等待timeout秒,如果timeout=0,一直阻塞等待
```

利用 list 实现常用数据结构

```
Stack(栈) = LPUSH + LPOP //遵循先进后出  
Queue(队列）= LPUSH + RPOP  //遵循先进先出
Blocking MQ(阻塞队列）= LPUSH + BRPOP  //遵循先进先出，出队如果没有元素会阻塞
```

场景：

- 微博或者微信公众号消息流。假如我关注了 A 这个公众号，然后 A 今天发布了一篇 ID=10080 的文档出来

    ```
    LPUSH  {订阅号消息}:{MacTalk的ID}:{我的ID}  10018  //MacTalk发了一条最新的文章
    LRANGE  {订阅号消息}:{MacTalk的ID}:{我的ID}  0  5  //查看最新的5条消息(LRANGE 会返回列表key中指定区间内的元素，区间以偏移量start和stop指定)
    ```

#### 4. set

不可重复集合

常用操作命令

```
SADD  key  member  [member ...]			//往集合key中存入元素，元素存在则忽略,若key不存在则新建
SREM  key  member  [member ...]			//从集合key中删除元素
SMEMBERS  key					        //获取集合key中所有元素
SCARD  key					            //获取集合key的元素个数
SISMEMBER  key  member			        //判断member元素是否存在于集合key中
SRANDMEMBER  key  [count]			    //从集合key中选出count个元素，元素不从key中删除
SPOP  key  [count]				        //从集合key中选出count个元素，元素从key中删除
SINTER  key  [key ...] 				    //交集运算
SINTERSTORE  destination  key  [key ..]	//将交集结果存入新集合destination中
SUNION  key  [key ..] 				    //并集运算
SUNIONSTORE  destination  key  [key ...] //将并集结果存入新集合destination中
SDIFF  key  [key ...] 				    //差集运算
SDIFFSTORE  destination  key  [key ...]	//将差集结果存入新集合destination中
```

场景：

- 微信抽奖小程序。参与抽奖者 5 人，这 5 个人的 ID 分别是 1001 - 1005 

    ```
    1) 5个人点击参与抽奖加入集合
    SADD lottery 1001 1002 1003 1004 1005
    2) 查看参与抽奖的所有用户ID
    SMEMBERS lottery
    3) 抽取3名获奖者
    SRANDMEMBER lottery 3  //可重复获奖，用户ID不会从集合中删除，可以参与下次抽奖
    SPOP lottery 3         //不可重复获奖，用户ID从集合中删除，无法参与下次抽奖
    ```

- 社交软件的点赞、收藏模型

    ```
    1) 用户1001给你这条消息点了个赞
    SADD  thumbsUp:{消息ID}  1001
    2) 用户1001取消点赞
    SREM  thumbsUp:{消息ID}  1001
    3) 检查用户1001是否点过赞
    SISMEMBER  thumbsUp:{消息ID}  1001
    4) 获取点赞的用户列表
    SMEMBERS thumbsUp:{消息ID}
    5) 获取点赞用户数 
    SCARD thumbsUp:{消息ID}
    ```

#### 5. zset

有序集合。zset 增加了一个 score 属性，这个 score 属性主要用来排名的

常见命令：

```
ZADD key score member [[score member]…]	 //往有序集合key中加入带分值元素
ZREM key member [member …]		        //从有序集合key中删除元素
ZSCORE key member 			            //返回有序集合key中元素member的分值
ZINCRBY key increment member		    //为有序集合key中元素member的分值加上increment 
ZCARD key				                //返回有序集合key中元素个数
ZRANGE key start stop [WITHSCORES]	    //正序获取有序集合key从start下标到stop下标的元素
ZREVRANGE key start stop [WITHSCORES]	//倒序获取有序集合key从start下标到stop下标的元素

//并集计算，举例（ZUNIONSTORE zset3 2 zset1 zset2）这句的意思是，zset1和zset2求并集得到的结果放入新的zset3里面
ZUNIONSTORE destkey numkeys key [key ...] 	
//交集计算，举例（ZINTERSTORE zset3 2 zset1 zset2）这句的意思是，zset1和zset2求交集得到的结果放入新的zset3里面
ZINTERSTORE destkey numkeys key [key ...]	
```

场景：

- 热搜榜或者新闻排行榜。给每一个话题都设置一个用于计数的 score

    ```
    1） 点击一次”守护香港“这个新闻，那么此新闻的score属性+1
      ZINCRBY  hotNews:20190819  1  守护香港
    2） 展示当前热搜新闻的前10名（最后的WITHSCORES代表查询出的结果包含具体的分数）
      ZREVRANGE  hotNews:20190819  0  10  WITHSCORES
    ```

    如果要做一个 7 日的新闻排名呢

    ```
     1） 首先我们需要把7天的新闻合并到"hotNews:20190813-20190819"这个zset中去
       ZUNIONSTORE  hotNews:20190813-20190819  7 hotNews:20190813  hotNews:20190814... hotNews:20190819
     2) 然后再展示7日排名前十的新闻
       ZREVRANGE hotNews:20190813-20190819  0  10  WITHSCORES
    ```

    



























