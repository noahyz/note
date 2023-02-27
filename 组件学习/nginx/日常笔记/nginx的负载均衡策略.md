---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

## nginx负载均衡的 5 种策略

#### 一、轮询（默认）

每个请求按时间顺序逐一分配到不同的后端服务器，如果后端服务器down掉，能自动剔除。

```
upstream backserver {
    server 192.168.0.14;
    server 192.168.0.15;
}
```

#### 2. weight 加权轮询

指定轮询几率，weight和访问比率成正比，用于后端服务器资源性能不均的情况。权重越高，在被访问的概率越大，如上例，分别是30%，70%。

```
upstream backserver {
    server 192.168.0.14 weight=3;
    server 192.168.0.15 weight=7;
}
```

#### 3. ip_hash

在负载均衡系统中，假如用户在某台服务器上登录了，那么该用户第二次请求的时候，因为我们是负载均衡系统，每次请求都会重新定位到服务器集群中的某一个，那么已经登录某一个服务器的用户再重新定位到另一个服务器，其登录信息将会丢失，这样显然是不妥的。
我们可以采用 ip_hash 指令解决这个问题，如果客户已经访问了某个服务器，当用户再次访问时，会将该请求通过哈希算法，自动定位到该服务器。
每个请求按访问 ip 的 hash 结果分配，这样每个访客固定访问一个后端服务器，可以解决 session 的问题。

此方式主要应用于会话保持

```
upstream backserver {
    ip_hash;
    server 192.168.0.14:88;
    server 192.168.0.15:80;
}
```

#### 4. fair（第三方）

按后端服务器的响应时间来分配请求，响应时间短的优先分配。

该方式下响应快的服务器都会优先分配，接着才会分配响应速度较慢的服务器。因此此方式主要应用于后端服务器性能不均一。

```
upstream backserver {
    server server1;
    server server2;
    fair;
}
```

#### 5. url_hash（第三方）

按访问url的hash结果来分配请求，使每个url定向到同一个（对应的）后端服务器，后端服务器为缓存时比较有效。

```
upstream backserver {
    server squid1:3128;
    server squid2:3128;
    hash $request_uri;
    hash_method crc32;
}
```

#### 5. 最少连接数 least_conn

将下一个请求分配到连接数最少的那台服务器上。此方式主要应用于请求处理时间长短不一造成服务器过载的情况。

```
upstream mybalance01 {
    least_conn;
    server 172.24.10.21:9090;
    server 172.24.10.22:9090;
    server 172.24.10.23:9090;
}
```

