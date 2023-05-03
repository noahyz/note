---
title: pthread_cancel 和 pthread_kill 的区别
---

## pthread_cancel 和 pthread_kill 的区别

线程结束执行的方式共有 3 种，分别是：

- 线程将指定函数体中的代码执行完后自行结束
- 线程执行过程中，遇到 pthread_exit 函数结束执行
- 线程执行过程中，被同一进程中的其他线程（包括主线程）强制终止

```c++
int pthread_kill(pthread_t thread, int sig);
```

功能：向指定线程发送信号。如果信号为 0，则执行错误检查，但实际上不发送信号。

成功返回 0，失败时有如下错误返回

```
[ESRCH]   thread is an invalid thread ID.
[EINVAL]  sig is an invalid or unsupported signal number.
[ENOTSUP] thread was not created by pthread_create() and does not support being killed with pthread_kill()
```

- ESRCH：线程 ID 不合法
- EINVAL：信号是个不合法或者非法的数值
- ENOTSUP：线程没有通过 pthread_create 创建，也不支持通过 pthread_kill 杀死

```c++
int pthread_cancel(pthread_t thread);
```

功能是给线程发送取消信号，使线程从取消点返回。注意目标线程的取消是异步进行的。

根据 POSIX 标准，pthread_join、pthread_testcancel、pthread_cond_wait、pthread_cond_timedwait、sem_wait、sigwait 等函数以及 read、write 等会引起阻塞的系统调用都是取消点，其他 pthread 函数都不会引起取消动作。