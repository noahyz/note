---
title: Inotify详解
---

## Inotify详解

inotify 可以用来监控文件或者目录的变化，确定这些被监控的对象是否发生特定的事件。

### 一、如何使用

使用 inotify API 关键步骤如下：

- 使用 `inotify_init()` 来创建一个 inotify 实例。系统调用会返回一个文件描述符
- 使用 `inotify_add_watch()` 来添加文件项到监控列表，通知内核自己感兴趣的文件以及事件。每个监控项都由路径名和相关联的位掩码组成。掩码指定了需要对路径监控的具体事件。返回一个监控描述符，用于后面的操作。此系统调用也可以执行相反的删除操作，将之前添加的监控项从 inotify 实例中删除。
- 要获得事件通知，需要对 inotify 文件描述符执行 read 操作，成功时返回一个或多个 inotify_event 结构体，每个结构体包含了一个文件的一个事件的详细信息
- 完成监控时，需要关闭 inotify 文件描述符。这样做会自动删除该 inotify 实例的所有监控项

注意：

1. inotify 机制可以监控文件和目录。当监控一个目录时，程序可以得到目录本身、以及目录下所有文件的事件通知。
2. inotify 机制不是递归的，如果程序想要监控整个目录树的事件，必须对目录树中的每个目录都调用 `inotify_add_watch()`
3. inotify 文件描述符可以使用 `select()、poll()、epoll()` 来进行监控，从 Linux 2.6.25 开始，还可以使用信号驱动 IO。如果有事件可读，这些接口就会报告 inotify 文件描述符可读。
4. inotify 对于 sysfs、procfs 文件系统支持的不够，只支持一部分事件

### 二、API 说明

```
int inotify_init(void);
int inotify_init1(int flags);
```

`inotify_init()` 成功时返回一个文件描述符，在随后的操作中使用这个句柄来访问 inotify 实例。`inotify_init(flags)` 提供一个额外的 flags 参数，可以用来修改系统调用的行为。flags 支持两个标志，IN_CLOEXEC 标志通知内核为新的文件描述符启用 close-on-exec 标志（FD_CLOEXEC）。另一个标志是 IN_NONBLOCK 标志，通知内核为底层文件描述符启用 O_NONBLOCK 标志，以后的读操作都将是非阻塞的。

```
int inotify_add_watch(int fd, const char* pathname, uint32_t mask);
// 成功返回监控描述符，出错返回 -1
```

添加或者删除一个监控项

- fd 参数是 inotify 实例的文件描述符

- pathname 参数指定要创建或修改监控项对应的文件，调用方必须对该文件具有读取权限（文件权限检查只会执行一次，也就是调用inotify_add_watch() 期间，只要监控项一直存在，调用方就会持续地收到文件通知，即使文件权限已经改变，调用方不再拥有文件的读取权限）

- mask 参数是位掩码，指定要监控的事件。

  如果 pathname 之前没有添加到 fd 描述符的监控列表，则 inotify_add_watch 会创建一个新的监控项，将其添加到监控列表中，并返回这个新创建的非负的监控描述符。在单个 inotify 实例内部，所有的监控描述符都是唯一的

  如果 pathname 之前已经添加到 fd 描述符的监控列表，则 inotify_add_watch 会修改 pathname 相应的现有的监控项的掩码，并返回该监控项的监控描述符。

```
int inotify_rm_watch(int fd, uint32_t wd);
成功返回 0，出错返回 -1
```

从 fd 指定的 inotify 实例中删除 wd 指定的监控项。wd 是一个监控描述符，之前调用 inotify_add_watch 时得到。

#### inotify 事件

inotify 事件较多，如下只列出几个常用的位掩码

- IN_CREATE：监控目录下创建了文件/目录
- IN_DELETE：监控目录下删除了文件/目录
- IN_MODIFY：文件被修改

#### 读取 inotify 事件

在监控列表注册好项目后，程序可以通过 read 读取 inotify 文件描述符，从而确定相关的文件事件。如果暂时还没有事件发生，read()会阻塞直到某个事件发生（除非对文件描述符设置了O_NONBLOCK状态标志，这时如果没有事件发生，read()会立即失败，并返回EAGAIN错误）。 

当事件发生后，每次 read 调用将返回一个缓冲区，包含一个或多个以下类型的结构体：

```
struct inotify_event {
    int wd; /* 事件发生的监控描述符 */
    uint32_t mask; /* 所发生事件的位掩码 */
    uint32_t cookie; /* 相关事件的Cookie（rename()） */
    uint32_t len; /* name域的大小 */
    char name[]; /* null终止的可选文件名 */
};
```

- wd域告诉我们事件发生的监控描述符，它的值也就是之前某次调用inotify_add_watch()返回的描述符。当应用通过同一个inotify文件描述符监控多个文件或目录时，wd域就非常有用。应用根据wd的值可以确定发生事件的特定文件或目录（应用必须自己维护监控描述符映射到路径的数据结构）。 
- mask 返回描述事件的位掩码。也就是我们的 inotify 事件。
- cookie域用来绑定相关的事件到一起，目前这个域仅用于文件被重命名。当文件被重命名时，会对文件原来的目录触发一个IN_MOVED_FROM事件，然后对文件的新目录触发一个IN_MOVED_TO事件（如果文件只是改变名字，并不改变目录，则上面两个事件都发生在同一个目录上）。这两个事件的cookie域将是相同的唯一值，应用可以通过这个值来关联这两个事件。 
- 当监控对象是目录，当目录下的某个文件触发事件时，name域返回null终止的字符串，用于标识该文件。如果监控对象本身触发了事件，则name域未使用，同时len域的值为0。 
- len域用来指示name域中分配的字节数。这个域是必要的，因为当read()读取到多个inotify_event结构体时，前一个name域存储的字符串到下一个inotify_event结构体之间可能会存在额外的填充字节（参考图19-2）。所以单个inotify事件的大小实际上是sizeof(struct inotify_event) + len。 
- 如果传递给read()的缓冲区太小，无法存储下一个inotify_event结构体，则read()会以EINVAL错误失败。我们需要确保提供给 read 的缓冲区足够大，至少能够保存一个事件：：大小至少为(sizeof(struct inotify_event) + NAME_MAX + 1)字节，其中NAME_MAX是文件名的最大长度，最后再加上一个null终止字节

### 三、demo 演示

```c++
#include <sys/inotify.h>
#include <unistd.h>
#include <stdlib.h>
#include <stdio.h>
#include <limits.h>
#include <string.h>
#include <errno.h>

#define BUF_LEN (10*(sizeof(struct inotify_event) + NAME_MAX + 1))

static void display_inotify_event(struct inotify_event* event) {
    printf("wd = %2d; ", event->wd);
    if (event->cookie > 0) {
        printf("cookie = %4d; ", event->cookie);
    }
    printf("mask = ");
    if (event->mask & IN_CREATE) printf("IN_CREATE");
    if (event->mask & IN_DELETE) printf("IN_DELETE");
    if (event->mask & IN_MODIFY) printf("IN_MODIFY");
    printf("\n");
    if (event->len > 0) {
        printf(" name = %s\n", event->name);
    }
}

int main(int argc, char* argv[]) {
    if (argc < 2 || strcmp(argv[1], "--help") == 0) {
        printf("%s pathname...\n", argv[0]);
        return -1;
    }
    int inotify_fd = inotify_init1(IN_CLOEXEC);
    if (inotify_fd < 0) {
        printf("inotify_init failed, err: %s\n", strerror(errno));
        return -2;
    }
    for (int i = 1; i < argc; ++i) {
        int wd = inotify_add_watch(inotify_fd, argv[i], IN_ALL_EVENTS);
        if (wd < 0) {
            printf("inotify_add_watch failed, err: %s\n", strerror(errno));
            continue;
        }
        printf("watching %s using wd %d\n", argv[i], wd);
    }
    char buf[BUF_LEN];
    for (;;) {
        int event_num = read(inotify_fd, buf, BUF_LEN);
        if (event_num == 0) {
            printf("read from inotify fd return 0, err: %s\n", strerror(errno));
            return -3;
        }
        if (event_num < 0) {
            printf("read failed, err: %s\n", strerror(errno));
            return -4;
        }
        printf("read %d bytes from inotify fd\n", event_num);
        for (char* p = buf; p < buf + event_num;) {
            struct inotify_event* event = (struct inotify_event*)p;
            display_inotify_event(event);
            p += sizeof(struct inotify_event) + event->len;
        }
    }
    return 0;
}
```

### 四、监控上限配置

inotify 事件队列需要使用内核内存。因此内核对 inotify 机制设置了一些限制。root 用户可以通过 `/proc/sys/fs/inotify` 目录下的三个文件来配置这些限制：

- max_queued_events：调用inotify_init系统调用时，这个值可以设置新创建的inotify实例的事件队列的最大事件数量限制。如果达到了这个限制，就会触发IN_Q_OVERFLOW事件，并丢弃后面其余的事件。溢出事件的wd域的值总是-1。 
- max_user_instances：每个实际用户ID能够创建的inotify实例的上限
- max_user_watchers：每个实际用户ID能够创建的监控项的上限

这三个值的默认值为：16384、128、8192

### 五、与多路复用 IO 联合使用

如上的 demo 中我们看到 inotify 接口的文件描述符支持阻塞和非阻塞模式，默认我们使用 read 是阻塞的。虽然 inotify 本身是异步通知的。如果我们有多个inotify 文件描述符呢？我们就无法在一个线程中去处理他们。

所以我们可以使用 select、poll、epoll 这些多路复用 IO 来帮助我们监听多个描述符的可读、可写状态。不需要为每个描述符创建独立的线程进行阻塞读取，避免资源浪费。

### 六、其他

inotify_add_watch 报错 “No space left on device” 问题：https://askubuntu.com/questions/1088272/inotify-add-watch-failed-no-space-left-on-device

