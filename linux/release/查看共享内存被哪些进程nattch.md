---
title: 查看共享内存被哪些进程nattch
date: 2020-10-25 19:11:41
categories:
- linux
tags:
- 共享内存
---

有时候，我们需要知道某块共享内存都被哪些进程 nattch 了，这有助于帮助我们解决问题

```
ipcs -m | grep shmid或shmkey
```

这可以看到这块共享内存的shmid

```
ipcs -mp | grep shmid
```

```
shmid      拥有者  cpid       lpid      
589842     root       24668      11278     
```

其中 -p 参数可以使用 ipcs 打印出创建贡献内存的进程 pid 和最后一个写共享内存的进程 pid 。

接下里我们可以使用 ps 命令查看 pid 对应的进程的详细信息。

```
grep shmid /proc/*/maps
```

```
/proc/26020/maps:7efdaea1f000-7efdaeb1f000 rw-s 00000000 00:04 589842           /SYSV2949146a (deleted)
```

还可以使用上述方法，举例得到结果，其中 26020 就是进程pid，我们 ps 查看具体信息即可。因为 linux 一切皆文件嘛

最后使用 lsof 查询也是可以的

```
lsof | head -1 && lsof | grep shmid
```

```
COMMAND     PID   TID    USER   FD      TYPE             DEVICE  SIZE/OFF       NODE NAME
cmlb_clie 26020          root  DEL       REG                0,4               589842 /SYSV2949146a
```

