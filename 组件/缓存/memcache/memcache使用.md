---
title: memcache 使用
---

### 一、安装和运行

memcache 安装

```
sudo apt install libevent libevent-dev
sudo apt install memcached
```

memcache 帮助

```
memcached -h
-d 启动一个守护进程
-m 分配给 memcache 使用的内存数量，单位是 MB
-u 运行 memcache 的用户
-l 监听的服务器 IP 地址，可以有多个地址
-p 设置 memcache 监听的端口
-c 最大运行的并发连接数，默认是 1024
-P 设置保存 memcache 的 pid 文件
-v 打印错误/警告日志
-vv 或 -vvv 打印更加详细的日志
```

memcache 运行

```
# 作为前台程序运行
memcached -p 11211 -m 64m -vv
# 作为后台程序运行
memcached -p 11211 -m 64m -u root -l 192.168.0.200 -c 256 -P /tmp/memcached.pid -d
```

使用 telnet 连接

```
telnet HOST PORT

# telnet 127.0.0.1 11211
Trying 127.0.0.1...
Connected to 127.0.0.1.
Escape character is '^]'.
^]

telnet>
set foo 0 0 3
bar
STORED
get foo
VALUE foo 0 3
bar
END
quit
Connection closed by foreign host.
```

### 二、存储命令

#### 1. set 命令

如果 set 的 key 已经存在，该命令可以更新该 key 所对应的原来的数据。语法格式如下：

```
set key flags exptime bytes [noreply]
```

- key：键值 key-value 结构中的 key，用于查找缓存值
- flags：可以包含键值对的整形参数，客户机使用它存储关于键值对的额外信息
- exptime：在缓存中保持键值对的时间长度（以秒为单位，0 表示永远）
- bytes：在缓存中存储的字节数
- noreply（可选）：该参数告知服务器不需要返回数据
- value 存储的值（始终位于第二行），也就是 key-value 结构中的 value

```
# key 为 foo
# flags 为 0
# exptime 为 900 秒
# bytes 为 11 字节
# value 为 hello_world

set foo 0 900 11 
hello_world
```

如果数据设置成功，则输出：STORED；失败则输出 ERROR

#### 2. add 命令

将 value 存储在指定的 key 中，如果 key 已经存在，则不会更新数据（过期的 key 会更新），之前的值将仍然保持相同，并且响应 NOT_STORED

```
add key flags exptime bytes [noreply]
value
```

参数含义、输出信息和 set 命令一致

#### 3. replace 命令

用于替换已经存在的 key 的 value。如果 key 不存在，则替换失败，并且响应 NOT_STORED

```
replace key flags exptime bytes [noreply]
value
```

参数含义、输出信息和 set 命令一致

#### 4. append 命令

用于向已经存在的 key 的 value 后面追加数据

```
append key flags exptime bytes [noreply]
value
```

例子如下：

```
# set root 0 900 9
memcached
STORED
# append root 0 900 6
_redis
STORED
# get root
VALUE root 0 15
memcached_redis
END
```

输出信息：

- STORED：保存成功后输出
- NOT_STORED：该键在 memcached 上不存在
- CLIENT_ERROR：执行错误

#### 5. prepend 命令

用于向已经存在的 key 的 value 前面追加数据。

```
prepend key flags exptime bytes [noreply]
value
```

输出信息和 append 命令一致

#### 6. CAS 命令

CAS（check-and-set 或 compare-and-swap）命令用于执行一个 “检查并设置” 的操作。

他仅在当前客户端最后一次取值后，该 key 对应的值没有被其他客户端修改的情况下，才能够将值写入。检查是通过 cas_token 参数进行的，这个参数是 memcached 指定给已经存在的元素的唯一的 64 位值。

```
cas key flags exptime bytes unique_cas_token [noreply]
value
```

- unique_cas_token：通过 gets 命令获取的一个唯一的 64 位值

```
# set root 0 900 9
memcached
STORED

# gets root
VALUE root 0 9 7
memcached
END

# cas root 0 900 5 7
redis
STORED

# get root
VALUE root 0 5
redis
END
```

输出信息包括：

- STORED：保存成功后输出
- ERROR：保存出错或语法错误
- EXISTS：在最后一次取值后另外一个用户也在更新该数据
- NOT_FOUND：memcached 服务器上不存在该键值

### 三、查找/删除命令

#### 1. get 命令

获取存储在 key 中的 value，如果 key 不存在，则返回空

```
get key
# 多个 key，使用空格分开
get key1 key2 key3
```

#### 2. gets 命令

获取带有 CAS 令牌存储的 value，如果 key 不存在，则返回空

```
gets key
# 多个 key，使用空格分开
gets key1 key2 key3
```

如下例子：

```
gets root
VALUE root 0 9 7    # 这里的 7 就代表 key=root 的 CAS 令牌
memcached
END
```

#### 3. incr/decr 命令

用于对已经存在的 key 的数字值进行自增或自减操作。incr 和 decr 命令**操作的数据必须是十进制的 32 位无符号整数**。

decr 减到 0 之后，在执行 decr 不会为负数，还为 0。incr 增加的值如果超过一定值后，则会报错。

如果 key 不存在返回 NOT_FOUND，如果键的值不为数字，则返回 CLIENT_ERROR，其他错误返回 ERROR

```
incr key increment_value
decr key decrement_value
```

举例如下：

```
# set root 0 900 3
001
STORED

# incr root 999999999999999999
1000000000000000000

# incr root 999999999999999999999999
CLIENT_ERROR invalid numeric delta argument

# get root
VALUE root 0 19
1000000000000000000
END

# decr root 999999999999999999999999999999
CLIENT_ERROR invalid numeric delta argument

# decr root 1000000000000000000
0

# decr root 99
0
```

#### 4. delete 命令

用于删除已经存在的 key

```
delete key [noreply]
```

#### 5. flush_all 命令

用于清理所有键值对。该命令提供了一个可选参数 time，用于在指定的时间后执行清理缓存操作。

```
flush_all [time] [noreply]
```

### 四、统计命令

stats 命令，以及子命令。

### 五、操作

使用 java 来连接 memcached 服务器

```java
public class MemcachedJava {
    public static void main(String[] args) {
        try {
            // 本地连接 Memcached 服务
            MemcachedClient mcc = new MemcachedClient(new InetSocketAddress("192.168.61.130", 11211));
            System.out.println("Connection to server successful.");

            Future<Boolean> fo = mcc.set("root", 900, "Free Education");
            System.out.println("set status: " + fo.get());
            System.out.println("root value in cache - " + mcc.get("root"));

            // 关闭连接
            mcc.shutdown();

        } catch (Exception ex) {
            System.out.println(ex.getMessage());
        }
    }
}
```