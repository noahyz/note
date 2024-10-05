---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

### jemalloc 之设置线程的 arena

#### 一、背景介绍

在内存监控中，我们想要监控线程的内存使用。但是在 Linux 中，一个进程中的所有线程共享进程的内存空间。这就导致我们无法准确的获取线程的内存使用。比如 A 线程申请的内存，可能会被 B 线程释放。

在 jemalloc 的内存分配实现中，arena 是最顶层的内存分配单元。jemalloc 会创建一定数量的 arena，每个线程都会绑定到 arena 上。线程采用 round-robin 轮询的方式选择可用的 arena 进行内存分配，为了减少线程之间的锁竞争，默认每个 CPU 会分配 4 个 arena。

因此我们可以将线程进行分类，然后自定义将线程绑定到某个 arena 上。然后监控此 arena 申请或者释放的内存。我们便可以得到某类线程的内存状况。

#### 二、实现思路

jemalloc 提供了设置调用线程的 arena 的方法。

```c
unsigned arena_num = 1;
size_t sz = sizeof(arena_num);
mallctl("thread.arena", NULL, 0, &arena_num, &sz);
```

我们可以在创建线程时调用此方法去设置调用线程的 arena。因此就需要我们 hook pthread_create 方法。

#### 三、demo 展示

main.cpp

```cpp
void* start_routine(void* arg) {
    // pthread_hook 内部设置了使用那个 arena
    int* arena_num_ptr = static_cast<int*>(arg);

    unsigned int arena_num;
    size_t arena_num_len = sizeof(arena_num);
    int err = mallctl("thread.arena", &arena_num, &arena_num_len, NULL, 0);
    if (err != 0) {
        std::cout << "mallctl get thread.arena failed" << std::endl;
    }
    std::cout << "thread id: " << syscall(SYS_gettid) << ", arena: " << arena_num << std::endl;
}

int main() {
    pthread_t pids[20] = {0};
    // 设置线程使用那个 arena
    int arena_num = 2;
    for (size_t i = 0; i < sizeof(pids)/sizeof(pthread_t); i++) {
        pthread_create(&pids[i], NULL, start_routine, &arena_num);
    }
    for (size_t i = 0; i < sizeof(pids)/sizeof(pthread_t); i++) {
        pthread_join(pids[i], NULL);
    }
    return 0;
}
```

pthread_hook.cpp

重写 pthread_create 方法

````cpp
// 定义函数类型：pthread_create 接口
typedef int (*pthread_create_type)(pthread_t*, const pthread_attr_t*, void*(*start_routine)(void*), void*);
// 定义函数类型：线程调用 start_routine 接口
typedef void* (*start_routine_type)(void*);

// 重写线程 start_routine 函数
void* thr_func(void* arg) {
    // 解析参数
    void** origin_arg = reinterpret_cast<void**>(arg);
    start_routine_type business_func = reinterpret_cast<start_routine_type>(origin_arg[0]);
    void* business_arg = origin_arg[1];

    // 设置 arena
    unsigned int old_arena_num;
    unsigned int new_arena_num = (*static_cast<int*>(business_arg));
    size_t arena_num_len = sizeof(old_arena_num);
    int err = mallctl("thread.arena", &old_arena_num, &arena_num_len, &new_arena_num, arena_num_len);
    if (err != 0) {
        std::cout << "mallctl thread.arena failed" << std::endl;
    }

    // 调用业务原本的线程启动函数
    auto res = business_func(business_arg);
    free(origin_arg);
    return res;
}

int pthread_create(pthread_t *thread, const pthread_attr_t *attr,
    void *(*start_routine) (void *), void *arg)__THROWNL {
    static pthread_create_type real_pthread_create = NULL;
    if (!real_pthread_create) {
        real_pthread_create = reinterpret_cast<pthread_create_type>(dlsym(RTLD_NEXT, "pthread_create"));
    }
    void** new_arg = reinterpret_cast<void**>(malloc(2 * sizeof(void*)));
    new_arg[0] = reinterpret_cast<void*>(start_routine);
    new_arg[1] = arg;
    return real_pthread_create(thread, attr, thr_func, new_arg);
}
````

如上展示了 jemalloc 的线程绑定 arena 的方法。

运行结果如下：所有线程都被绑定到 arena：2 上了

```shell
 # ./main_hook
thread id: thread id: thread id: thread id: thread id: thread id: 3232432328, arena: 3233423232932332, arena: , arena: 
2
thread id: thread id: 32317thread id: 32325, arena: 2, arena: 
thread id: 32316, arena: 2
2
32320, arena: 2
32322, arena: 2
2
thread id: 32319, arena: 2
thread id: 32318thread id: , arena: 32331, arena: 22, arena: 
thread id: 
thread id: 232330thread id: 
32321, arena: , arena: thread id: 32327, arena: 2
thread id: thread id: 323353232632333, arena: , arena: 2
, arena: 2
2
2
2
, arena: 2
thread id: 32323, arena: 2
```

