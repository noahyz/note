---
title: eventfd 原理与实践
---

## eventfd 原理与实践

事件驱动是一种高效的通信机制，在 linux 中，eventfd 是一个用来通知事件的文件描述符，timerfd 是定时器事件的文件描述符。二者都是内核向用户空间的应用发送通知的机制，可以高效的用来实现用户空间的事件/通知驱动的应用程序。

用于进程间通信和同步。他的主要作用是通过文件描述符来实现进程间的时间通知机制，类似于信号量或者条件变量，但比他们更加高效和简单。如下的使用场景：

- 线程同步：可以用 eventfd 实现线程间的同步，其中一个线程向 `eventfd` 写入数据，另一个线程从 `eventfd` 中读取数据，实现数据传输和同步。
- 进程间通信：可以用 `eventfd` 实现进程间通信，其中一个进程向 `eventfd` 写入数据，另一个进程从 `eventfd` 中读取数据，实现进程间数据传输和同步。
- 异步事件通知：可以用 `eventfd` 实现异步事件通知机制，例如，当一个文件描述符上有数据可读时，可以将该事件通知给另一个进程，从而实现进程间的异步通信。
- 多路复用：可以将 `eventfd` 的文件描述符添加到 epoll 或 select 中，从而实现多路复用，监控多个事件的状态，以便进一步处理。

使用 eventfd 来触发事件通知，timerfd 来触发将来的事件通知。是从 linux 2.6.22 版本加入内核。

### 一、eventfd 详解

```
int eventfd(unsigned int initval, int flags);
```

 创建一个 eventfd 对象，该对象是一个内核维护的整数计数器。初始值为 initval 值。flags 可以取如下的几个标志位的“或”的结果：

- EFD_CLOEXEC：fork 子进程时不继承，一般需要设置
- EFD_NONBLOCK：非阻塞
- EFD_SEMAPHORE：提供类似于信号量的语义

如下举例子，实现进程之间的通信：

```c++
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <stdint.h>
#include <sys/eventfd.h>
#include <sys/epoll.h>

int main()
{
    // Create an eventfd object with initial value 0
    int efd = eventfd(0, 0);
    if (efd == -1) {
        perror("eventfd");
        exit(EXIT_FAILURE);
    }

    pid_t pid = fork();
    if (pid == -1) {
        perror("fork");
        exit(EXIT_FAILURE);
    }

    if (pid == 0) {
        // Child process: wait for data from eventfd and print it to stdout
        printf("Child process started\n");

        // Create an epoll object to monitor the eventfd file descriptor
        int epfd = epoll_create1(0);
        if (epfd == -1) {
            perror("epoll_create1");
            exit(EXIT_FAILURE);
        }

        struct epoll_event ev;
        ev.events = EPOLLIN;
        ev.data.fd = efd;
        if (epoll_ctl(epfd, EPOLL_CTL_ADD, efd, &ev) == -1) {
            perror("epoll_ctl: efd");
            exit(EXIT_FAILURE);
        }

        // Start a loop to wait for the eventfd object to be signaled
        while (1) {
            struct epoll_event events[1];
            int n = epoll_wait(epfd, events, 1, -1);
            if (n == -1) {
                perror("epoll_wait");
                exit(EXIT_FAILURE);
            }

            // Read the value from the eventfd object and print it to stdout
            uint64_t val;
            if (read(efd, &val, sizeof(val)) == -1) {
                perror("read");
                exit(EXIT_FAILURE);
            }
            printf("Child process received data: %lu\n", val);
            fflush(stdout);
        }

        // Cleanup
        close(epfd);
        close(efd);
        exit(EXIT_SUCCESS);
    } else {
        // Parent process: read data from stdin and send it to eventfd
        printf("Parent process started\n");

        // Start a loop to read data from stdin and signal the eventfd object
        printf("Enter data to send to child process (or 'q' to quit): ");
        fflush(stdout);
        char input[256];
        while (fgets(input, sizeof(input), stdin) != NULL) {
            // Exit the loop if the user enters 'q'
            if (input[0] == 'q') {
                break;
            }

            // Convert the input to an integer value
            uint64_t data = atoi(input);

            // Signal the eventfd object by writing a value to its file descriptor
            if (write(efd, &data, sizeof(data)) == -1) {
                perror("write");
                exit(EXIT_FAILURE);
            }

            // Prompt for the next input
            printf("Enter data to send to child process (or 'q' to quit): ");
            fflush(stdout);
        }

        // Cleanup
        close(efd);
        exit(EXIT_SUCCESS);
    }
}
```

父进程等待从标准输入中读取数据，并将读取到的数据通过 write 函数写入到 eventfd 文件描述符中，子进程通过 epoll_wait 函数等待 eventfd 文件描述符被标记为刻度，并通过 read 函数读取文件描述符中的函数，然后将其打印到标准输出上。

### 二、timerfd 详解

```c++
int timerfd_create(int clockid, int flags);
int timerfd_settime(int fd, int flags,
                           const struct itimerspec *new_value,
                           struct itimerspec *old_value);
int timerfd_gettime(int fd, struct itimerspec *curr_value);
```

clockid 可以指定时钟的种类，比如：CLOCK_REALTIME、CLOCK_MONOTONIC。

timerfd_settime 函数用来设置定时器的过期时间

```
struct timespec {
    time_t tv_sec;                /* Seconds */
    long   tv_nsec;               /* Nanoseconds */
};
struct itimerspec {
    struct timespec it_interval;  /* Interval for periodic timer */
    struct timespec it_value;     /* Initial expiration */
};
```

其中 it_value 是指第一次过期时间，it_interval 是指第一次到期之后的周期性触发到期的间隔时间。old_value 如果不为 null，将会用调用时间来更新 old_value 所指的 itimerspec 结构对象。

### 三、运用场景

在信号通知的场景下，相比pipe有非常大的资源和性能优势。其根本在于counter（计数器）和channel（数据信道）的区别。

- 第一，是打开文件数量的巨大差别。由于pipe是半双工的传统IPC方式，所以两个线程通信需要两个pipe文件，而用eventfd只要打开一个文件。众所周知，文件描述符可是系统中非常宝贵的资源，linux的默认值也只有1024而已。那开发者可能会说，1相比2也只节省了一半嘛。要知道pipe只能在两个进程/线程间使用，并且是面向连接（类似TCP socket）的，即需要之前准备好两个pipe；而eventfd是广播式的通知，可以多对多的。如上面的NxM的生产者-消费者例子，如果需要完成全双工的通信，需要NxMx2个的pipe，而且需要提前建立并保持打开，作为通知信号实在太奢侈了，但如果用eventfd，只需要在发通知的时候瞬时创建、触发并关闭一个即可。
- 第二，是内存使用的差别。eventfd是一个计数器，内核维护几乎成本忽略不计，大概是自旋锁+唤醒队列（后续详细介绍），8个字节的传输成本也微乎其微。但pipe可就完全不是了，一来一回数据在用户空间和内核空间有多达4次的复制，而且更糟糕的是，内核还要为每个pipe分配至少4K的虚拟内存页，哪怕传输的数据长度为0。
- 第三，对于timerfd，还有精准度和实现复杂度的巨大差异。由内核管理的timerfd底层是内核中的hrtimer（高精度时钟定时器），可以精确至纳秒（1e-9秒）级，完全胜任实时任务。而用户态要想实现一个传统的定时器，通常是基于优先队列/二叉堆，不仅实现复杂维护成本高，而且运行时效率低，通常只能到达毫秒级。

所以，第一个最佳实践法则：当pipe只用来发送通知（传输控制信息而不是实际数据），放弃pipe，放心地用eventfd/timerfd，"in all cases"。

另外一个重要优势就是eventfd/timerfd被设计成与epoll完美结合，比如支持非阻塞的读取等。事实上，二者就是为epoll而生的（但是pipe就不是，它在Unix的史前时代就有了，那时不仅没有epoll连Linux都还没诞生）。应用程序可以在用epoll监控其他文件描述符的状态的同时，可以“顺便“”一起监控实现了eventfd的内核通知机制，何乐而不为呢？

所以，第二个最佳实践法则：eventfd配上epoll才更搭哦。

来自于：https://zhuanlan.zhihu.com/p/40572954