## pidstat

在 sysstat 包中，pidstat 用于监控进程占用系统资源的情况。注意：pidstat 监控的是进程的指标，如果要看线程，加上 -t 选项 
工具使用：

```shell
[root@localhost ~]# pidstat -help
Usage: pidstat [ options ] [ <interval> [ <count> ] ]
Options are:
[ -d ] [ -h ] [ -I ] [ -l ] [ -r ] [ -s ] [ -t ] [ -U [ <username> ] ] [ -u ]
[ -V ] [ -w ] [ -C <command> ] [ -p { <pid> [,...] | SELF | ALL } ]
[ -T { TASK | CHILD | ALL } ]
```

- -u 默认的参数，显示各个进程的CPU使用情况
- -r 显示各个进程的内存使用情况
- -d 显示各个进程的IO使用情况
- -p 指定进程号
- -s 显示堆栈利用率
- -w 显示每个进程的上下文切换情况
- -l 显示命令名和所有参数
- -t 输出线程的指标
- interval 相邻两次采样的时间；count 采样次数

输出参数含义：

### 1. 查看各个进程的 CPU 使用情况

```shell
[root@localhost ~]# pidstat -u -l
Linux 3.10.0-1160.el7.x86_64 (localhost.localdomain)    01/13/2022      _x86_64_        (2 CPU)

07:55:39 AM   UID       PID    %usr %system  %guest    %CPU   CPU  Command
07:55:39 AM     0         1    0.01    0.01    0.00    0.02     1  /usr/lib/systemd/systemd --system --deserialize 18 
07:55:39 AM     0         6    0.00    0.01    0.00    0.01     0  ksoftirqd/0
07:55:39 AM     0         7    0.00    0.00    0.00    0.00     0  migration/0
...
```

- %usr 进程在用户空间占用的 CPU 的百分比
- %system 进程在内核空间占用的 CPU 的百分比
- %guest 进程在虚拟机占用的百分比
- %CPU 进程占用CPU的百分比

### 2. 查看各个进程的内存使用情况

```shell
[root@localhost ~]# pidstat -r -l
Linux 3.10.0-1160.el7.x86_64 (localhost.localdomain)    01/13/2022      _x86_64_        (2 CPU)

08:02:21 AM   UID       PID  minflt/s  majflt/s     VSZ    RSS   %MEM  Command
08:02:21 AM     0         1      2.45      0.00   46204   6620   0.36  /usr/lib/systemd/systemd --system --deserialize 18 
08:02:21 AM     0       493      1.44      0.00   39056   5104   0.27  /usr/lib/systemd/systemd-journald 
08:02:21 AM     0       647      0.02      0.00   55532    856   0.05  /sbin/auditd 
```

- minflt/s 任务每秒发生的次要错误，不需要从磁盘中加载页
- majflt/s 任务每秒发生的主要错误，需要从磁盘
- VSZ 虚拟内存大小，单位(KB)
- RSS 物理内存大小，单位(KB)

### 3. 查看各个进程的 IO 使用情况

```shell
[root@localhost ~]# pidstat -d -l
Linux 3.10.0-1160.el7.x86_64 (localhost.localdomain)    01/13/2022      _x86_64_        (2 CPU)

09:14:11 AM   UID       PID   kB_rd/s   kB_wr/s kB_ccwr/s  Command
09:14:11 AM     0         1     13.62    118.62     14.43  /usr/lib/systemd/systemd --system --deserialize 18 
09:14:11 AM     0        47      0.00      0.00      0.00  kworker/u256:1
09:14:11 AM     0       412      0.00      0.00      0.00  xfsaild/dm-0
```

- KB_rd/s 每秒进程从磁盘读取的数据量，单位(KB)
- KB_wr/s 每秒进程从磁盘写的数据量，单位(KB)

### 4. 查看各个进程的上下文切换情况

```shell
[root@localhost ~]# pidstat -w -l
Linux 3.10.0-1160.el7.x86_64 (localhost.localdomain)    01/13/2022      _x86_64_        (2 CPU)

09:25:14 AM   UID       PID   cswch/s nvcswch/s  Command
09:25:14 AM     0         1      0.15      0.14  /usr/lib/systemd/systemd --system --deserialize 18 
09:25:14 AM     0         2      0.01      0.00  kthreadd
09:25:14 AM     0         4      0.00      0.00  kworker/0:0H
```

- cswch/s 每秒执行任务的自愿性上下文切换的总次数；比如任务需要等待资源阻塞时，会发生自愿上下文切换
- nvcswch/s 每秒执行任务的非自愿性上下文切换的总次数；当任务在其时间片期间执行时，被迫放弃CPU，发生非自愿上下文切换；进程在争抢CPU，被强制调度