---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

# hugepage 大页总结

在 cat /proc/meminfo 里面可以查看大页信息

```
HugePages_Total:      16     //预留HugePages的总个数
HugePages_Free:       16     //池中尚未分配的 HugePages 数量，真正空闲的页数等于HugePages_Free - HugePages_Rsvd
HugePages_Rsvd:        0     //表示池中已经被应用程序分配但尚未使用的 HugePages 数量
HugePages_Surp:        0     //这个值得意思是当开始配置了20个大页，现在修改配置为16，那么这个参数就会显示为4，一般不修改配置，这个值都是0
Hugepagesize:    1048576 kB //每个大页的大小
```

### 临时配置：

Hugepage 能够动态预留，执行命令：

` echo 1024 > /sys/kernel/mm/hugepages/hugepages-2048kB/nr_hugepages`

上面通过没有节点关联的系统分配内存页，如果希望强制分配给指定的 NUMA 节点，必须这样做：

`echo 1024 >/sys/devices/system/node/node0/hugepages/hugepages-2048kB/nr_hugepages `

`echo 1024 > /sys/devices/system/node/node1/hugepages/hugepages-2048kB/nr_hugepages `

hugepages-2048kB指预留2M的大小为1024个，一共2*1024M，hugepages-1048576kB指预留1G的大小

来自：[https://blog.csdn.net/shaoyunzhe/article/details/54614077](https://blog.csdn.net/shaoyunzhe/article/details/54614077)
