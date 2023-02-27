---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

# 下来多看看--研究一下 /pro/meminfo

[https://toutiao.io/posts/n4hzg1/preview](https://toutiao.io/posts/n4hzg1/preview)

##### MemTotal 

系统从加电开始到引导完成，firmware/BIOS要保留一些内存，kernel本身要占用一些内存，最后剩下可供kernel支配的内存就是MemTotal。这个值在系统运行期间一般是固定不变的。可参阅[解读DMESG中的内存初始化信息](http://linuxperf.com/?p=139)。 

##### MemFree 

表示系统尚未使用的内存。(MemTotal-MemFree)就是已被用掉的内存。 

##### MemAvailable

有些应用程序会根据系统的可用内存大小自动调整内存申请的多少，所以需要一个记录当前可用内存数量的统计值，MemFree并不适用，因为MemFree不能代表全部可用的内存，系统中有些内存虽然已被使用但是可以回收的，比如cache/buffer、slab都有一部分可以回收，所以这部分可回收的内存加上MemFree才是系统可用的内存，即MemAvailable。/proc/meminfo中的MemAvailable是内核使用特定的算法估算出来的，要注意这是一个估计值，并不精确。 

下来一定好好看看上面的链接，很多好的东西。
