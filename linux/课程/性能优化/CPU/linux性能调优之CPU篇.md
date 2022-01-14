## Linux性能调优之CPU篇

针对于线上问题的快速定位以及程序的性能发现调优，主要通过CPU、内存、IO、网络四个方向去分析。本文针对CPU相关的指标罗列常用的工具以及排查问题的思路。
本人对Linux了解尚浅，如有错误，可指出共同学习。

### 一、平均负载

#### 1. uptime命令
```shell
root@9-134-239-95:~# uptime
 22:52:30 up 265 days, 12:54,  1 user,  load average: 0.03, 0.06, 0.05
```
命令返回：
- `22:52:30`  表示当前时间
- `up 265 days, 12:54`  表示系统运行时间
- `1 user`  表示系统正在登录的用户数
- `load average: 0.03, 0.06, 0.05`  表示过去1分钟、5分钟、15分钟的平均负载

#### 2. 平均负载概念解释
平均负载是指单位时间内，系统处于可运行状态和不可中断状态的平均进程数，也就是平均活跃进程数，它和 CPU 使用率并没有直接关系。
- 可运行状态的进程：是指正在使用 CPU 或者正在等待 CPU 的进程，也就是我们常用 ps 命令看到的，处于 R 状态（Running 或 Runnable）的进程。
- 不可中断状态的进程则是正处于内核态关键流程中的进程，并且这些流程是不可打断的，比如最常见的是等待硬件设备的 I/O 响应，也就是我们在 ps 命令中看到的 D 状态（Uninterruptible Sleep，也称为 Disk Sleep）的进程。

平均负载（load average）的三个值
- 如果最近1分钟、5分钟、15分钟的三个值基本相同，那就说明负载很平稳
- 如果最近1分钟远小于15分钟的值，说明最近1分钟的负载在降低，过去15分钟的负载稍高
- 如果最近1分钟远大于15分钟的值，说明负载在增加，如果平均负载接近或者超过CPU个数，意味着系统正在发生过载

### CPU上下文

CPU执行任务需要知道从哪里开始，也就是说，需要系统帮它设置好CPU寄存器和程序计数器。
CPU寄存器是CPU内置的容量小、速度极快的内存。程序计数器用来存储CPU正在执行的指令位置、或者即将执行的下一条指令位置。他们都是CPU在运行任务前，必须的依赖环境，也叫做CPU上下文。
那么，CPU上下文切换就是先把一个任务的CPU上下文(CPU寄存器和程序计数器)保存起来，然后加载新任务的上下文到这些寄存器和程序计数器，最后再跳转到程序计数器所指的新位置，运行新任务。
而这些保存下来的上下文，会存储在系统内核中，并在任务重新调度执行时再次加载进来。这样就保证任务原来的状态不受影响。

而根据任务的不同，CPU上下文分为：进程上下文切换、线程上下文切换以及中断上下文切换。

#### 进程上下文切换

如果让应用程序随便访问内存太危险了，因此按照CPU指令的重要程度对指令进行了分级，指令分为四个级别：Ring0-Ring3。
Linux只使用了 Ring0 和 Ring3 这两个运行级别。
进程运行在 Ring3 级别时被称为用户态，指令只能访问用户空间，被执行的代码要受到CPU很多检查；运行在 Ring0 级别时被称为内核态，可以执行任何指令，访问任何内存空间。
从用户态到内核态的转变，需要通过系统调用来完成。系统调用的过程会发生CPU上下文切换。
CPU寄存器中原来用户态的指令位置，需要先保存起来，然后更新为内核态指令的新位置，执行内核态代码；相反，从内核态切换到用户态也需要进行CPU上下文切换。因此，一次系统调用过程，发生了两次CPU上下文切换。

进程的上下文包括虚拟内存、栈、全局变量等用户空间的资源，还包括了内核堆栈、寄存器等内核空间的状态。
而保存上下文和恢复上下文的过程是需要内核在CPU上运行才能完成的。而根据 Tsuna (https://blog.tsunanet.net/2010/11/how-long-does-it-take-to-make-context.html) 的测试报告，每次上下文切换都需要几十纳秒到数微妙的CPU时间。因此，如果进程上下文切换次数较多的情况下，很容易导致CPU将大量时间耗费在寄存器、内核栈以及虚拟内存等资源的保存和恢复上，进而大大缩短了真正运行进程的时间。

Linux 下每个CPU都有一个就绪队列，将活跃进程(即正在运行和正在等待CPU的进程)按照优先级和等待CPU的时间排序，然后选择最需要CPU的进程，也就是优先级最高和等待CPU时间最长的进程来运行。

进程调度的场景：
1. CPU时间片，当某个进程的时间片耗尽了，就会被系统挂起，切换到其他正在等待CPU的进程运行
2. 进程需要等待资源时候，也会被挂起，并由系统调度其他进程运行
3. 当进程通过类似睡眠函数(sleep)这样的方法将自己主动挂起，也会重新调度
4. 当有高优先级进程需要运行时，当前进程会被挂起，由高优先级进程来运行
5. 发生硬件中断时，CPU上的进程会被中断挂起，转而执行内核中的中断服务服务

#### 线程上下文切换

线程时调度的基本单位，进程则是资源拥有的基本单位。因此
1. 如果切换的线程属于两个不同的进程，则此切换过程和进程上下文切换是一样的
2. 如果切换的线程属于同一个进程，则切换时，只需要切换线程的私有数据、寄存器等不共享的数据即可

#### 中断上下文切换

中断上下文只包括内核态中断服务程序执行所必需的状态，包括CPU寄存器、内核堆栈、硬件中断参数等。
对同一个CPU来说，中断处理比进程拥有更高的优先级，所以中断上下文切换并不会与进程上下文切换同时发生。


### 二、压力测试工具

#### 1. stress

```shell
[root@localhost ~]# stress 
`stress' imposes certain types of compute stress on your system

Usage: stress [OPTION [ARG]] ...
 -?, --help         show this help statement
     --version      show version statement
 -v, --verbose      be verbose
 -q, --quiet        be quiet
 -n, --dry-run      show what would have been done
 -t, --timeout N    timeout after N seconds
     --backoff N    wait factor of N microseconds before work starts
 -c, --cpu N        spawn N workers spinning on sqrt()
 -i, --io N         spawn N workers spinning on sync()
 -m, --vm N         spawn N workers spinning on malloc()/free()
     --vm-bytes B   malloc B bytes per vm worker (default is 256MB)
     --vm-stride B  touch a byte every B bytes (default is 4096)
     --vm-hang N    sleep N secs before free (default none, 0 is inf)
     --vm-keep      redirty memory instead of freeing and reallocating
 -d, --hdd N        spawn N workers spinning on write()/unlink()
     --hdd-bytes B  write B bytes per hdd worker (default is 1GB)

Example: stress --cpu 8 --io 4 --vm 2 --vm-bytes 128M --timeout 10s

Note: Numbers may be suffixed with s,m,h,d,y (time) or B,K,M,G (size).
```
- -t, --timeout N 指定运行N秒后结束
  - --backoff N 等待N微妙后开始运行
- -c, --cpu N 产生 N 个进程都反复计算随机数的平方根
- -i, --io N 产生 N 个进程，每个进程反复调用 sync(),sync() 用于将内存上的内容写到硬盘上 
- -m, --vm N 产生 N 个进程，每个进程不断调用内存分配 malloc 和 内存释放 free 函数
  - --vm-bytes B 指定每次 malloc 内存字节数(默认为 256M) 
  - --vm-hang N 指定 free 之前等待 N 秒
- -d, --hdd N 产生 N 个执行 write/unlink 的进程
  - -hdd-bytes B 指定每次写的字节数(默认为1G)


### 三、查看状态工具

#### 1. mpstat
sysstat 包含了常用的Linux 性能分析工具，用来监控和分析系统的性能。
mpstat 是一个常见的多核CPU性能分析工具，用来实时查看每个CPU的性能指标，以及所有CPU的平均指标
工具使用：
```shell
[root@localhost ~]# mpstat -h
Usage: mpstat [ options ] [ <interval> [ <count> ] ]
Options are:
[ -A ] [ -u ] [ -V ] [ -I { SUM | CPU | SCPU | ALL } ]
[ -P { <cpu> [,...] | ON | ALL } ]
```
- -P {cpu | ALL} 表示监控那个 CPU，cpu 在[0, cpu个数-1] 中取值；或者 ALL 监控所有CPU
- <interval> 相邻的两次采样的间隔时间
- <count> 采用次数

输出参数含义：
```shell
[root@localhost ~]# mpstat -P ALL 2 1
Linux 3.10.0-1160.el7.x86_64 (localhost.localdomain)    01/13/2022      _x86_64_        (2 CPU)

07:05:24 AM  CPU    %usr   %nice    %sys %iowait    %irq   %soft  %steal  %guest  %gnice   %idle
07:05:26 AM  all   50.25    0.00    0.00    0.00    0.00    0.00    0.00    0.00    0.00   49.75
07:05:26 AM    0   39.80    0.00    0.00    0.00    0.00    0.00    0.00    0.00    0.00   60.20
07:05:26 AM    1   60.50    0.00    0.00    0.00    0.00    0.00    0.00    0.00    0.00   39.50

Average:     CPU    %usr   %nice    %sys %iowait    %irq   %soft  %steal  %guest  %gnice   %idle
Average:     all   50.25    0.00    0.00    0.00    0.00    0.00    0.00    0.00    0.00   49.75
Average:       0   39.80    0.00    0.00    0.00    0.00    0.00    0.00    0.00    0.00   60.20
Average:       1   60.50    0.00    0.00    0.00    0.00    0.00    0.00    0.00    0.00   39.50
```
- 注意1：当 mpstat 没有参数时，输出系统启动以后所有信息的平均值。有 interval 参数时，第一块的信息是自系统启动以来的平均信息。从第二块开始，输出为前一个 interval 时间段的平均信息。
- 注意2：mpstat 的输出是从 /proc/stat 获取数据
- %usr 在 interval 时间段里，用户态的CPU时间(%)，不包含 nice 值为负的进程
- %nice 在 interval 时间段内，nice 值为负的进程的 CPU 时间(%)
- %sys 在 interval 时间段内，内核态的CPU时间(%)
- %iowait 在 interval 时间段内，磁盘IO等待时间(%)
- %irq 在 interval 时间段内，硬中断时间(%)
- %soft 在 interval 时间段内，软中断时间(%)
- %idle 在 interval 时间段内，CPU除去等待磁盘IO操作外的因为任何原因而空闲的时间(%) 

#### 2. pidstat
在 sysstat 包中，pidstat 用于监控进程占用系统资源的情况。
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
- interval 相邻两次采样的时间；count 采样次数

输出参数含义：
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

