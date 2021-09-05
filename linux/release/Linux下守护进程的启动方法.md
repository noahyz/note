---
title: Linux下守护进程的启动方法
date: 2020-12-02 16:19:17
categories:
- linux
tags:
- 守护进程
---

### Linux下守护进程的启动方法

守护进程类似于内核进程一样，是一直在后台运行的进程。“前台任务”和“后台任务”的本质区别就是：是否继承了标准输入。

#### 一、SIGHUP信号

用户退出session之后，“后台任务”是否还会继续，取决于一个参数。

1. 用户准备退出session
2. 系统向该 session 发送SIGHUP信号
3. session将SIGHUP信号发送所有子进程
4. 子进程收到SIGHUP信号后，自动退出

因此，“前台进程”会随着session 的退出而退出。“后台进程”的退出由shell的 huponexit 参数决定。

`shopt | grep huponexit`

huponexit 的值为 off，代表session退出时，不会把 SIGHUP 信号发给“后台任务”。所以一般来说，后台任务不会随着session一起退出

#### 二、disown命令

如果有的系统的 huponexit 参数是 on，那么就会随着session的退出而退出。

disown命令可以将指定的任务从“后台任务”列表中移除。这样session退出就不会给他发送SIGHUP信号了。

```
./process &
jobs -l
disown
jobs -l
```

可以查看到 process 进程被移出了“后台任务”。

```
# 移出最近一个正在执行的后台任务
$ disown

# 移出所有正在执行的后台任务
$ disown -r

# 移出所有后台任务
$ disown -a

# 不移出后台任务，但是让它们不会收到SIGHUP信号
$ disown -h

# 根据jobId，移出指定的后台任务
$ disown %2
$ disown -h %2
```

但是disown 命令也是有小瑕疵的，如果后台进程和标准I/O有交互，“后台任务”的标准I/O继承当前的session，如果当前session退出之后，后台任务就不能与标准I/O进行交互。因此需要这样执行

```
./process 1>output.log 2>err.log </dev/null &
disown
```

#### 三、nohup

nohup命令所做的事情

1. 阻止SIGHUP信号发送到这个进程
2. 关闭标准输入。该进程不再能够接收任何输入，即使运行在前台
3. 重定向标准输入和标准错误到文件 nohup.out

`nohup ./process &`

nohup 命令实际上将子进程与它所在的session分离了，但是还需要 & 符

#### 四、其他

还有其他很多办法命令。

screen、tmux、systemd 等，后面补上。