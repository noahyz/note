---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

## buff 和 cache

### 一、概念

man free 得到如下

```
buffers
	Memory used by kernel buffers (Buffers in /proc/meminfo)
cache  
	Memory used by the page cache and slabs (Cached and SReclaimable in /proc/meminfo)
buff/cache
	Sum of buffers and cache
```

- Buffers 是内核缓冲区用到的内存，对应的是 /proc/meminfo 中的 Buffers 值
- Cache 是内核页缓存和 Slab 用到的内存，对应的是 /proc/meminfo 中的 Cached 与 SReclaimable 之和

 man proc 找到以下定义 

```
Buffers %lu
	Relatively temporary storage for raw disk blocks that shouldn't get tremendously large (20MB or so).

Cached %lu
	In-memory cache for files read from the disk (the page cache).  Doesn't include SwapCached.

SReclaimable %lu (since Linux 2.6.19)
	Part of Slab, that might be reclaimed, such as caches.

SUnreclaim %lu (since Linux 2.6.19)
	Part of Slab, that cannot be reclaimed on memory pressure.
```

- Buffers 是对原始磁盘块的临时存储，也就是用来缓存磁盘的数据，通常不会特别大（20MB左右）。内核就可以把分散的写集中起来，统一优化磁盘的写入，比如可以把多次小的写合并成单次大的写等等
- Cached 是从磁盘读取文件的页缓存，也就是用来缓存文件读取的数据。下次访问这些文件数据时，就可以直接从内存中快速获取，而不需要再次访问缓慢的磁盘
- SReclaimable：是 Slab 的一部分。Slab 包括两部分，其中的可回收部分，用 SReclaimable 记录；而不可回收部分，用 SUnreclaim 记录

### 二、场景分析

```
# 清理文件页、目录项、Inodes等各种缓存
$ echo 3 > /proc/sys/vm/drop_caches
```

执行以下案例时，可以先清理缓存

#### 1. 磁盘和文件写案例

写文件

- 在第一个终端执行 dd 命令，通过读取随机设备，生成一个 500MB 大小的文件

    ```
    $ dd if=/dev/urandom of=/tmp/file bs=1M count=500
    ```

- 在第二个终端执行 `vmstat 1` 查看 buff 和 cache，以及 io 中的 bi 和 bo（块设备的读取和写入的大小）

    ```
    procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
    r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
    0  0      0 7499460   1344 230484    0    0     0     0   29  145  0  0 100  0  0
     1  0      0 7338088   1752 390512    0    0   488     0   39  558  0 47 53  0  0
     1  0      0 7158872   1752 568800    0    0     0     4   30  376  1 50 49  0  0
     1  0      0 6980308   1752 747860    0    0     0     0   24  360  0 50 50  0  0
     0  0      0 6977448   1752 752072    0    0     0     0   29  138  0  0 100  0  0
     0  0      0 6977440   1760 752080    0    0     0   152   42  212  0  1 99  1  0
    ...
     0  1      0 6977216   1768 752104    0    0     4 122880   33  234  0  1 51 49  0
     0  1      0 6977440   1768 752108    0    0     0 10240   38  196  0  0 50 50  0
    ```

- 可以看到 cache 在增长，过一段时间，才会出现大量的块设备写（bo列），dd 命令结束后，cache 不再增长，但块设备写还会持续一段时间。

- 注意：此时是写文件，但是 cache 却在增长。

写磁盘

- 向磁盘分区 `/dev/sdb1` 写入 2GB 随机数据（可能会对磁盘分区造成损坏，如果有未使用的磁盘分区可以尝试）

    ```
    # 首先清理缓存
    $ echo 3 > /proc/sys/vm/drop_caches
    # 然后运行dd命令向磁盘分区/dev/sdb1写入2G数据
    $ dd if=/dev/urandom of=/dev/sdb1 bs=1M count=2048
    ```

- 查看 `vmstat 1` 输出的变化

    ```
    procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
     r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
    1  0      0 7584780 153592  97436    0    0   684     0   31  423  1 48 50  2  0
     1  0      0 7418580 315384 101668    0    0     0     0   32  144  0 50 50  0  0
     1  0      0 7253664 475844 106208    0    0     0     0   20  137  0 50 50  0  0
     1  0      0 7093352 631800 110520    0    0     0     0   23  223  0 50 50  0  0
     1  1      0 6930056 790520 114980    0    0     0 12804   23  168  0 50 42  9  0
     1  0      0 6757204 949240 119396    0    0     0 183804   24  191  0 53 26 21  0
     1  1      0 6591516 1107960 123840    0    0     0 77316   22  232  0 52 16 33  0
    ```

- 可以看到 buff 和 cache 都有在增长，buff 增长的快很多

#### 2. 磁盘和文件读案例

读文件

- 从文件 `/tmp/file` 中读数据写入空设备

    ```
    # 首先清理缓存
    $ echo 3 > /proc/sys/vm/drop_caches
    # 运行dd命令读取文件数据
    $ dd if=/tmp/file of=/dev/null
    ```

- 使用 `vmstat 1` 观察内存和 IO 的变化情况

    ```
    procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
     r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
     0  1      0 7724164   2380 110844    0    0 16576     0   62  360  2  2 76 21  0
     0  1      0 7691544   2380 143472    0    0 32640     0   46  439  1  3 50 46  0
     0  1      0 7658736   2380 176204    0    0 32640     0   54  407  1  4 50 46  0
     0  1      0 7626052   2380 208908    0    0 32640    40   44  422  2  2 50 46  0
    ```

- 可以看出读取文件时（也就是 bi 大于 0 时），buff 保持不变，cache 增长

读磁盘

- 从磁盘分区 `/dev/sda1` 中读取数据，写入空设备

    ```
    # 首先清理缓存
    $ echo 3 > /proc/sys/vm/drop_caches
    # 运行dd命令读取文件
    $ dd if=/dev/sda1 of=/dev/null bs=1M count=1024
    ```

- 使用 `vmstat 1` 观察内存和 IO 的变化情况

    ```
    procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
     r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
    0  0      0 7225880   2716 608184    0    0     0     0   48  159  0  0 100  0  0
     0  1      0 7199420  28644 608228    0    0 25928     0   60  252  0  1 65 35  0
     0  1      0 7167092  60900 608312    0    0 32256     0   54  269  0  1 50 49  0
     0  1      0 7134416  93572 608376    0    0 32672     0   53  253  0  0 51 49  0
     0  1      0 7101484 126320 608480    0    0 32748     0   80  414  0  1 50 49  0
    ```

- 可以看出读磁盘时（也就是 bi 大于 0 时），buff 和 cache 都在增长，buff 增长的快很多。说明读磁盘时，数据缓存到了 buff 中

### 三、总结

- buffer 既可以用作“将要写入磁盘数据的缓存”，也可以用作“从磁盘读取数据的缓存”。buffer 是对磁盘数据的缓存，包括读请求和写请求
- cache 既可以用作“从文件读取数据的页缓存“，也可以用作”写文件的页缓存“。cache 是对文件数据的缓存，包括读请求和写请求

磁盘和文件区别

- 磁盘是一个块设备，可以划分为不同的分区；在分区之上再创建文件系统，挂载到某个目录，之后才可以在这个目录中读写文件
- 在读写普通文件时，会经过文件系统，由文件系统负责与磁盘交互；而读写磁盘或者分区时，就会跳过文件系统。这两种方式使用的缓存不同，也就是 buff 和 cache 的区别

历史背景：

理论上，一个文件读首先到 Block buffer，然后到 Page Cache。有了文件系统才有了 Page Cache。在老的 Linux 上这两个 Cache 是分开的。那这样对于文件数据，会被 cache 两次。这种方案虽然简单，但是低效。后来 Linux 把这两个 Cache 统一了。对于文件，Page Cache 指向 Block Buffer，对于非文件，则是 Block Buffer。因此：文件操作只影响 Page Cache，Raw操作（直接对块设备的读写）只影响 buffer。比如一台 VM 虚拟机，就会越过文件系统，直接操作磁盘，也就是常说的 Direct IO 