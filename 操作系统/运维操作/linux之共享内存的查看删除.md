---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

# linux之共享内存的查看删除

#### 查看IPC信息的命令：ipcs [-a][-m|-q|-s]

* ipcs -m：输出所有共享内存(share memory)信息
* 上述各项含义如下：key：表示共享内存的key
* shmid：表示共享内存编号
* owner：表示创建共享内存的用户
* perms：表示共享内存的的使用权限
* bytes：表示共享内存的大小
* nattch：表示连接到共享内存的的进程数
* status：表示共享的状态（不显示则为正常使用，显示“dest”表示已被标记，但并未真正删除，详情参见备注）
备注：“dest”状态说明【引用计数】Linux下任何内容的删除操作，都会将该内容引用计数减1，最终内容是否被真正删除取决于引用计数是否为0。当用户有权限且执行删除操作时，大致流程如下：

1、内容引用计数减1去除自己占用的计数

2、待引用计数降为0，删除该内容

3、若引用计数为0，删除该内容

4、若引用计数不为0，已占用的程序仍可继续使用，但内容被设置成私有，屏蔽外部新的引用。当程序主动删除或程序退出后系统会对该内容进行回收，这将导致引用计数的下降。待引用计数降为0后，系统会将该内容真正意义上的删除掉。

【共享内存情况】对这里用共享内存来说同理，当用户调用删除某个共享内存时，此时大致流程如下：

1、共享内存引用计数减1去除自己占用的计数

2、待引用计数降为0，释放该共享内存

2.1、若引用计数为0，直接释放该段内存

2.2、若引用计数不为0，已占用的程序仍可继续使用，但共享内存被设置成私有，屏蔽外部新的引用。具体操作如下：

1)将共享内存的mode标记为SHM_DEST，标明状态

2)将共享内存的key标记为IPC_PRIVATE(即0x00000000)

3)将共享内存的status标记为dest

查看IPC限制信息的命令：ipcs -l

* ipcs -lm：输出共享内存(share memory)控制信息

这里只能查看，具体信息的修改可以修改/proc/sys/kernel的相关参数，一般系统至少有如下3个参数：
* shmall可用共享内存的总数量（字节或者页面）
* shmmax最大共享内存段尺寸（字节）
* hmmni最大共享内存段尺寸（字节）
共享内存的删除（释放）命令：ipcrm -m shm_id

如果你只知道共享内存key想删除共享内存，可以使用ipcrm [-M key | -m id]

说明：消息队列、信号量的用法与共享内存相似，只是参数不同而已

```
ipcs [-m|-q|-s]
-m 输出有关共享内存(shared memory)的信息
-q 输出有关信息队列(message queue)的信息
-s 输出有关“信号量”(semaphore)的信息
ipcrm [ -M key | -m id | -Q key | -q id | -S key | -s id ]
-M用shmkey删除共享内存
-m用shmid删除共享内存
-Q用msgkey删除消息队列
-q用msgid删除消息队列
-S用semkey删除信号灯
-s用semid删除信号灯
```
