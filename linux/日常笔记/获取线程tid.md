---
title: 获取线程 tid
date: 2023-01-19 11:11:41
tags:
- linux
---

## 获取线程 tid

获取线程 tid 一般有两种方式，`pthread_self()` 和 `syscall(SYS_gettid)` 。

- pthread_self 函数得到的是 pthread 库对线程的编号，而不是 linux 系统对线程的编号。比如 top 显示的是 linux 的线程号
- syscall 使用 SYS_gettid 的系统调用号去获取 linux 线程号。

实际上，每个系统调用都是有编号的，在内核中构成一个系统调用表，就是一个函数指针数组，调用号就是对应功能的数组索引。用户把调用号和参数传给内核，就可以使用系统功能了。

使用 syscall 获取线程 tid 例子

```c
static void* func(void* arg) {
    unsigned int sys_tid = syscall(SYS_gettid);
    pthread_t pthread_tid = pthread_self();

    std::cout << "pthread_self: " << pthread_tid << std::endl;
    std::cout << "syscall(SYS_gettid): " << sys_tid << std::endl;
    return nullptr;
}

void thread() {
    pthread_t tid;
    auto res = pthread_create(&tid, nullptr, func, nullptr);
    if (res < 0) {
        std::cerr << "pthread_creaet failed, error: " << strerror(errno) << std::endl;
        return;
    }
}
```

