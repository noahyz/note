---
title: 进程的栈跟踪之pstack命令
date: 2021-10-16 12:11:41
tags:
- pstack
---

### linux之pstack命令

pstack 命令用来显示进程或者线程的栈信息，可以使用pstack来确定进程或者线程挂起的位置。
此命令只有一个参数就是pid

#### 如下使用

```c++
#include <unistd.h>
#include <pthread.h>
#include <stdio.h>

void* start_run(void* arg) {
    sleep(10);
    printf("%s\n", arg);
    return NULL;
}

int main() {
    pthread_t thread1;
    int ret = pthread_create(&thread1, NULL, start_run, (char*)"hello");
    if (ret != 0) {
        printf("pthread create failed");
        return -1;
    }
    ret = pthread_join(thread1, NULL);
    if (ret != 0) {
        printf("pthread join failed");
        return -1;
    }
    return 0;
}
```

```shell
root@xxx:learn#pstack 28603
Thread 2 (Thread 0x7f8649c9c700 (LWP 28604)):
#0  0x00007f8649f668ed in nanosleep () from /usr/lib64/libc.so.6
#1  0x00007f8649f66784 in sleep () from /usr/lib64/libc.so.6
#2  0x000000000040068d in start_run(void*) ()
#3  0x00007f864a276ea5 in start_thread () from /usr/lib64/libpthread.so.0
#4  0x00007f8649f9f9fd in clone () from /usr/lib64/libc.so.6
Thread 1 (Thread 0x7f864a58c740 (LWP 28603)):
#0  0x00007f864a278017 in pthread_join () from /usr/lib64/libpthread.so.0
#1  0x00000000004006f3 in main ()
```

就可以看到每个线程当前栈信息。利于排查问题。