---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

# ipcs、ipcrm使用

### **ipcs用法**

IPC资源类型选项

* ipcs -a  是默认的输出信息 打印出当前系统中所有的进程间通信方式的信息  
* ipcs -m  打印出使用共享内存进行进程间通信的信息  
* ipcs -q   打印出使用消息队列进行进程间通信的信息  
* ipcs -s  打印出使用信号进行进程间通信的信息

输出格式选项：当指定多个时，以最后一个为准

* ipcs -c,  —creator：查看IPC的创建者和所有者
* -l,  —limits：查看IPC资源的限制信息
* -p,  —pid：查看IPC资源的创建者和最后操作者的进程ID

* ipcs -t   输出最新调用IPC资源的详细时间。包括msgsnd()和msgrcv() 对message queues的操作，shame()和shmdt() 对shared memory的操作，以及semop() 对semaphores的操作

* ipcs -u  输出当前系统下ipc各种方式的状态信息(共享内存，消息队列，信号)

* Ipcs -i,  —id [id]：详细显示指定资源ID 的IPC信息。使用时需要指定资源类型，资源包括消息队列(-q)、共享内存(-m)和信号量(-s)

* ipcs -h,  —help：显示帮助信息

* ipcs -V,  —version：显示版本信息

显示大小单位控制选项：只对选项 -l ( limits ) 生效

* -b, —bytes：以字节为单位显示大小

* - -human：以可读的格式显示大小

例子：

显示共享内存指定ID的信息

ipcs -m -i 3278 

查看 IPC 的创建者和最后操作者的进程ID

ip -m -p shmid

其中，lspid 代表最近一次向消息队列中发送消息的“进程号”，lrpid 对应最近一次从消息队列中读取消息的”进程号“。

但是请注意：此处的进程号是弱进程号，既可能代表的是线程号，如果进程中是起的线程对消息队列发送、接收消息，则此处pid 对应的均是线程号。可以采用 ps -AL | grep pid 来查找该进程对应的进程 id。

### **ipcrm 命令**

移除一个消息对象。或者共享内存段，或者一个信号集，同时会将与ipc对象相关链的数据也一起移除。当然，只有超级管理员，或者ipc对象的创建者才有这项权利啦 

* ipcrm -M shmkey  移除用shmkey创建的共享内存段  

* ipcrm -m shmid    移除用shmid标识的共享内存段 

* ipcrm -Q msgkey  移除用msqkey创建的消息队列  

* ipcrm -q msqid  移除用msqid标识的消息队列  

* ipcrm -S semkey  移除用semkey创建的信号  

* ipcrm -s semid  移除用semid标识的信号
