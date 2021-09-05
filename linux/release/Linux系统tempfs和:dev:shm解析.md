---
title: Linux系统tempfs和/dev/shm解析
date: 2020-12-20 13:19:17
categories:
- linux
tags:
- tempfs /dev/shm
---

# Linux系统tempfs和/dev/shm解析

## 一、tempfs文件系统

文件系统有两种变体，称为*shm*和 *tmpfs*。它们都共享核心功能，并且主要用途不同。内核使用`shm`为匿名页面创建文件支持，并为`shmge()`创建的区域提供支持。该文件系统由`kern_mount（）`挂载这样它就可以在内部安装并且对用户不可见。`tmpfs`是一个临时文件系统，可以选择将其安装在/tmp/上，以具有基于RAM的快速临时文件系统。`tmpfs`的第二个用途 是将其安装在 /dev/shm/ 上。tmpfs文件系统中`mmap()`文件的进程将能够在它们之间共享信息，以作为System V IPC机制的替代方法。

tempfs是驻留在内存或交换分区中的临时文件系统。将目录挂载为tempfs是加快对其文件访问速度的有效方法。传统的虚拟磁盘是一个块设备，但tempfs是一个文件系统，而不是块设备，只需要安装它，就可以使用了。

tempfs的用途

- 总会有一个内核内部挂载，也许我们看不到，可能用于共享内存等
- 这个文件系统的大小可以动态调整
- tempfs因为驻留在内存或者交换分区中，因此它的读写比磁盘要快很多
- 有一个缺点：tempfs数据在系统重启后不会保留，因此应该注意根据不同场景做一些恰当的操作

## 二、/dev/shm目录

/dev/shm也是属于tempfs文件系统，存在于内存中。默认情况下，这个目录占用大小是内存大小的一半。但是并不是一直占有内存的一半，如果/dev/shm下没有任何文件，它占有的内存实际就是0字节；如果他最大为2G，现在只存在100M的文件，那剩余的1900M仍然可以被其他程序所使用。同时，他占用的100M内存是不会被系统回收的。

使用 df -h 命令可以看到/dev/shm目录。使用 df -k /dev/shm 可以看到此目录的大小

```
文件系统         1K-块  已用    可用 已用% 挂载点
tmpfs          8046096     0 8046096    0% /dev/shm
```

#### 1.修改/dev/shm目录大小

默认的最大一般内存的大小可能在某些场景下并不适用，并且默认的innode数量很低一般需要调高一点，可以使用mount命令来管理

```
mount -o size=1500M -o nr_inodes=1000000 -o noatime,nodiratime -o remount /dev/shm
```

将他的大小调到1.5G，并且将inode数量调到1000000，这意味着大致可以存最多一百万个大小为大约为1K的小文件。

如果需要永久修改/dev/shm的值，则需要修改/etc/fstab

```
tmpfs /dev/shm tmpfs defaults,size=1.5G 0 0  #/etc/fstab中增加该行
# 保存并关闭文件，为了使更改立即生效，可以重新安装/dev/shm
mount -o remount /dev/shm
# 验证是否生效
df -h
```





