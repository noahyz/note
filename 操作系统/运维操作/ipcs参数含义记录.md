---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

## ipcs 的每一个参数都了解清楚了
展示共享内存、消息队列、信号量


-h，--help：展示帮助信息
-V，--version：展示版本信息
-i，--id：显示一个资源的完整信息通过id，这个选项需要和 -m、-q、-s 配合使用

#### 资源选项
-m, --shmems：活跃的共享内存的写信息
-q, --queues：活跃的消息队列的写信息
-s, --semaphores：活跃的信号量集合的写信息
-a, --all：以上三种资源所有的写信息

#### 输出选项
这些选项中，只有一个会生效：指定最后一个
-c, --creator：展示创建者和所有者
-l, --limits：展示资源的限制
-p, --pid：展示创建者的所有pid，和最后一个操作者
-t, --time：写的时间的信息，这个时间是最后一次操作资源的时间。消息队列：msgsnd、msgrcv，共享内存：shmat、shmdt，信号量：semop
-u, --summary：展示三种资源状态的总和摘要

#### 展示的选项
这些选项只影响 -l (--limits) 选项
-b, --bytes：使用 bytes 形式显示
--human：使用人类可读的格式展示

