---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

# linux下进程状态解析

## 一、Linux进程状态(R、S、D、T、Z、X)

#### R(TASK_RUNNING)，可执行状态

Running or runnable (on run queue)

只有在该状态的进程才可能在CPU上运行。而同一时刻可能有多个进程处于可执行状态，这些进程的task_struct结构（进程控制块）被放入对应CPU的可执行队列中（一个进程最多只能出现在一个CPU的可执行队列中）。进程调度器的任务就是从各个CPU的可执行队列中分别选择一个进程在该CPU上运行。

很多操作系统教科书将正在CPU上执行的进程定义为RUNNING状态、而将可执行但是尚未被调度执行的进程定义为READY状态，这两种状态在linux下统一为 TASK_RUNNING状态。

#### S(TASK_INTERRUPTIBLE)，可中断的睡眠状态

Interruptible sleep (waiting for an event to complete)

处于这个状态的进程因为等待某某事件的发生（比如等待socket连接、等待信号量），而被挂起。这些进程的task_struct结构被放入对应事件的等待队列中。当这些事件发生时（由外部中断触发、或由其他进程触发），对应的等待队列中的一个或多个进程将被唤醒。

通过ps命令我们会看到，一般情况下，进程列表中的绝大多数进程都处于TASK_INTERRUPTIBLE状态（除非机器的负载很高）。毕竟CPU就这么一两个，进程动辄几十上百个，如果不是绝大多数进程都在睡眠，CPU又怎么响应得过来。

#### D(TASK_UNINTERRUPTIBLE)，不可中断的睡眠状态

Uninterruptible sleep (usually IO)

与TASK_INTERRUPTIBLE状态类似，进程处于睡眠状态，但是此刻进程是不可中断的。不可中断，指的并不是CPU不响应外部硬件的中断，而是指进程不响应异步信号。

**TASK_UNINTERRUPTIBLE状态存在的意义就在于，内核的某些处理流程是不能被打断的**。如果响应异步信号，程序的执行流程中就会被插入一段用于处理异步信号的流程（这个插入的流程可能只存在于内核态，也可能延伸到用户态），于是原有的流程就被中断了。在进程对某些硬件进行操作时（比如进程调用read系统调用对某个设备文件进行读操作，而read系统调用最终执行到对应设备驱动的代码，并与对应的物理设备进行交互），可能需要使用TASK_UNINTERRUPTIBLE状态对进程进行保护，以避免进程与设备交互的过程被打断，造成设备陷入不可控的状态。这种情况下的TASK_UNINTERRUPTIBLE状态总是非常短暂的，通过ps命令基本上不可能捕捉到。

#### T(TASK_STOPPED or TASK_TRACED)，暂停状态或跟踪状态

Stopped, either by a job control signal or because it is being traced.

向进程发送一个SIGSTOP信号，它就会因响应该信号而进入TASK_STOPPED状态（除非该进程本身处于TASK_UNINTERRUPTIBLE状态而不响应信号）。（SIGSTOP与SIGKILL信号一样，是非常强制的。不允许用户进程通过signal系列的系统调用重新设置对应的信号处理函数。）

向进程发送一个SIGCONT信号，可以让其从TASK_STOPPED状态恢复到TASK_RUNNING状态。

当进程正在被跟踪时，它处于TASK_TRACED这个特殊的状态。“正在被跟踪”指的是进程暂停下来，等待跟踪它的进程对它进行操作。比如在gdb中对被跟踪的进程下一个断点，进程在断点处停下来的时候就处于TASK_TRACED状态。而在其他时候，被跟踪的进程还是处于前面提到的那些状态。

对于进程本身来说，TASK_STOPPED和TASK_TRACED状态很类似，都是表示进程暂停下来。而TASK_TRACED状态相当于在TASK_STOPPED之上多了一层保护，处于TASK_TRACED状态的进程不能响应SIGCONT信号而被唤醒。只能等到调试进程通过ptrace系统调用执行PTRACE_CONT、PTRACE_DETACH等操作（通过ptrace系统调用的参数指定操作），或调试进程退出，被调试的进程才能恢复TASK_RUNNING状态。

#### Z(TASK_DEAD - EXIT_ZOMBIE)，退出状态，进程成为僵尸进程

Defunct ("zombie") process, terminated but not reaped by its parent.

进程在退出的过程中，处于TASK_DEAD状态。在这个退出过程中，进程占有的所有资源将被回收，除了task_struct结构（以及少数资源）以外。于是进程就只剩下task_struct这么个空壳，故称为僵尸。之所以保留task_struct，是因为task_struct里面保存了进程的退出码、以及一些统计信息。而其父进程很可能会关心这些信息。比如在shell中，$?变量就保存了最后一个退出的前台进程的退出码，而这个退出码往往被作为if语句的判断条件。当然，内核也可以将这些信息保存在别的地方，而将task_struct结构释放掉，以节省一些空间。但是使用task_struct结构更为方便，因为在内核中已经建立了从pid到task_struct查找关系，还有进程间的父子关系。释放掉task_struct，则需要建立一些新的数据结构，以便让父进程找到它的子进程的退出信息。

父进程可以通过wait系列的系统调用（如wait4、waitid）来等待某个或某些子进程的退出，并获取它的退出信息。然后wait系列的系统调用会顺便将子进程的尸体（task_struct）也释放掉。子进程在退出的过程中，内核会给其父进程发送一个信号，通知父进程来“收尸”。这个信号默认是SIGCHLD，但是在通过clone系统调用创建子进程时，可以设置这个信号。

通过下面的代码能够制造一个EXIT_ZOMBIE状态的进程：

```
#include <stdlib.h>
void main()
{
	if (fork())
		while(1)
			sleep(100);
}
```

编译运行，然后ps一下：

```
root@VM-239-95-centos:test# ps aux | grep zombie | grep -v grep
root     14799  0.0  0.0   7332   380 pts/12   S    16:34   0:00 ./zombie
root     14800  0.0  0.0      0     0 pts/12   Z    16:34   0:00 [zombie] <defunct>
```

只要父进程不退出，这个僵尸状态的子进程就一直存在。那么如果父进程退出了呢，谁又来给子进程“收尸”？

当进程退出的时候，会将它的所有子进程都托管给别的进程（使之成为别的进程的子进程）。托管给谁呢？可能是退出进程所在进程组的下一个进程（如果存在的话），或者是1号进程。所以每个进程、每时每刻都有父进程存在。除非它是1号进程。

1号进程，pid为1的进程，又称init进程。

linux系统启动后，第一个被创建的用户态进程就是init进程。它有两项使命：

1、执行系统初始化脚本，创建一系列的进程（它们都是init进程的子孙）；

2、在一个死循环中等待其子进程的退出事件，并调用waitid系统调用来完成“收尸”工作；

init进程不会被暂停、也不会被杀死（这是由内核来保证的）。它在等待子进程退出的过程中处于TASK_INTERRUPTIBLE状态，“收尸”过程中则处于TASK_RUNNING状态。

#### X(TASK_DEAD - EXIT_DEAD)，退出状态，进程即将被销毁

dead (should never be seen)

进程在退出过程中也可能不会保留它的task_struct。比如这个进程是多线程程序中被detach过的进程（linux中线程可被认为特殊的进程）。或者父进程通过设置SIGCHLD信号的handler为SIG_IGN，显式的忽略了SIGCHLD信号。（这是posix的规定，尽管子进程的退出信号可以被设置为SIGCHLD以外的其他信号。）

此时，进程将被置于EXIT_DEAD退出状态，这意味着接下来的代码立即就会将该进程彻底释放。所以EXIT_DEAD状态是非常短暂的，几乎不可能通过ps命令捕捉到。

#### 补充

1. 还有一种进程状态是 W，表示的是paging，是进入内存交换状态（从内核2.6开始无效），因此可以不关注了。

2. 我们使用ps 通常看到的是这样的
```
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root     16328  0.0  0.0  22620  4160 ?        Ss   9月14 106:44 /usr/local/sa/agent/plugins/sap1007
root     16337  0.0  0.0  31776  9984 ?        Ss   9月14  66:49 /usr/local/sa/agent/plugins/sap1010
root     16340  0.0  0.0 285372  4956 ?        Sl   9月14 115:21 /usr/local/sa/agent/plugins/sap1012
root     16374  0.0  0.0  39332  3292 ?        Ss   9月14  63:38 /usr/local/sa/agent/plugins/sap1015
root     16521  0.0  0.0      0     0 ?        S<   7月29   0:00 [kworker/2:1H]
root     17156  0.0  0.0 115496  1344 ?        Ss+  8月18   0:00 /bin/bash
root     17751  0.0  0.0  82424  2832 ?        Ss   11月04   0:00 login -- root
root     17753  0.0  0.0      0     0 ?        S    04:48   0:00 [kworker/7:1]
root     18636  0.1  0.0 1003112 7924 ?        Sl   11月26  43:36 ./simple_example
root     19427  0.0  0.0 115124  2728 tty1     Ss+  11月04   0:01 -bash
root     19454  0.0  0.0      0     0 ?        S    16:49   0:00 [kworker/5:1]
root     19542  0.0  0.0      0     0 ?        S<   7月29   0:00 [kworker/3:1H]
root     19549  0.0  0.1 1233392 16136 ?       Sl   11月26   9:57 ./telegraf -config agent.conf
```

可以看到，其中STAT的状态不尽是上面提到的。<、+ 等这些符号是什么意思呢？

* < ：high-priority (not nice to other users)。代表高优先级
* N：low-priority (nice to other users)。代表低优先级
* s：is a session leader。代表会话首进程
* l：is multi-threaded (using CLONE_THREAD, like NPTL pthreads do)。代表这个进程中有多个线程
* +：is in the foreground process group。在前台进程组中
# 二、进程状态变迁

#### 进程的初始状态

进程是通过fork系列的系统调用（fork、clone、vfork）来创建的，内核（或内核模块）也可以通过kernel_thread函数创建内核进程。这些创建子进程的函数本质上都完成了相同的功能，将调用进程复制一份，得到子进程。（可以通过选项参数来决定各种资源是共享、还是私有。）

那么既然调用进程处于TASK_RUNNING状态（否则，它若不是正在运行，又怎么进行调用？），则子进程默认也处于TASK_RUNNING状态。

另外，在系统调用调用clone和内核函数kernel_thread也接受CLONE_STOPPED选项，从而将子进程的初始状态置为 TASK_STOPPED。

#### 进程状态变迁

进程自创建以后，状态可能发生一系列的变化，直到进程退出。而尽管进程状态有好几种，但是进程状态的变迁却只有两个方向——从TASK_RUNNING状态变为非TASK_RUNNING状态、或者从非TASK_RUNNING状态变为TASK_RUNNING状态。

也就是说，如果给一个TASK_INTERRUPTIBLE状态的进程发送SIGKILL信号，这个进程将先被唤醒（进入TASK_RUNNING状态），然后再响应SIGKILL信号而退出（变为TASK_DEAD状态）。并不会从TASK_INTERRUPTIBLE状态直接退出。

进程从非TASK_RUNNING状态变为TASK_RUNNING状态，是由别的进程（也可能是中断处理程序）执行唤醒操作来实现的。执行唤醒的进程设置被唤醒进程的状态为TASK_RUNNING，然后将其task_struct结构加入到某个CPU的可执行队列中。于是被唤醒的进程将有机会被调度执行。

而进程从TASK_RUNNING状态变为非TASK_RUNNING状态，则有两种途径：

1、响应信号而进入TASK_STOPED状态、或TASK_DEAD状态；

2、执行系统调用主动进入TASK_INTERRUPTIBLE状态（如nanosleep系统调用）、或TASK_DEAD状态（如exit系统调用）；或由于执行系统调用需要的资源得不到满足，而进入TASK_INTERRUPTIBLE状态或TASK_UNINTERRUPTIBLE状态（如select系统调用）。

显然，这两种情况都只能发生在进程正在CPU上执行的情况下。
