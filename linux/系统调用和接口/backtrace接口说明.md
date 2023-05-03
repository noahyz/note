---
title: backtrace 接口详细说明
---

## backtrace 接口详细说明

我们经常会有需求来获取调用的堆栈，来排查一些问题，或者实现一些需求。本文来介绍 `backtrace()` 和 `backtrace_symbols()` 函数的使用。

```c++
#include <execinfo.h>

int backtrace(void **buffer, int size);
char **backtrace_symbols(void *const *buffer, int size);
void backtrace_symbols_fd(void *const *buffer, int size, int fd);
```

- `backtrace()` 获取函数调用堆栈数据，数据放在 buffer 中，参数 size 用来指定 buffer 中可以保存多少个 `void*` 元素（每个栈帧的地址）。如果回溯的函数调用个数大于 size，则只有 size 个函数调用地址被返回。因此保证一个适当的 buffer 和 size 的大小

  返回通过 buffer 返回的地址个数，这个数目小于等于 size。

- `backtrace_symbols()` 参数 buffer 是从 `backtrace()` 函数获取的数组指针，size 是该数组中的元素个数（`backtrace()`函数的返回值）。

  该函数的主要功能是：将从 `backtrace()` 函数获取的地址转为描述这些地址的字符串数组。每个地址的字符串信息包含对应函数的名字、在函数内的十六进制偏移地址、以及实际的返回地址（十六进制）。

  需要注意的是，当前只有使用 ELF 二进制文件格式的程序才能获取函数名称和偏移地址，此外，为支持函数名功能，可能需要添加相应的编译选项如：`-rdynamic`；否则只有十六进制的返回能被获取。

  该函数返回值是一个字符串指针，是通过 malloc 函数申请的空间，需要调用者将其释放。

  注意：如果不能为字符串获取足够的空间，该函数的返回值为 NULL

- `backtrace_symbols_fd()` 函数与 `backtrace_symbols()` 函数具有相同的功能，不同的是他不会给调用者返回字符串数组，而是将结果写入文件描述符为 fd 的文件中，每个函数对应一行，他不会调用 malloc 函数。

注意事项：

这些函数对函数返回地址如何保存在栈中有一些假设，注意如下：

- 忽略栈帧指针（由 gcc 的非零优化级别处理）可能引起这些假设的混乱
- 内联函数没有栈帧
- Tail-call（尾调用）优化会导致栈帧被其他调用覆盖
- 为支持函数名功能，可能需要添加相应的编译链接选项如 `-rdynamic`；否则，只有十六进制的返回地址能被获取
- "static" 函数名是不会导出的，也不会出现在函数调用列表中，即使指定了 `-rdynamic` 链接选项

如下用代码举个例子：

```c++
#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>
#include <signal.h>
#include <execinfo.h>
#include <errno.h>
#include <string.h>

void dump() {
    void* buffer[100];
    int nptrs = backtrace(buffer, 100);
    fprintf(stdout, "backtrace() returned %d addressed\n", nptrs);

    char** strings = backtrace_symbols(buffer, nptrs);
    if (strings == nullptr) {
        fprintf(stderr, "backtrace_symbols: %s\n", strerror(errno));
        exit(EXIT_FAILURE);
    }
    for (int i = 0; i < nptrs; ++i) {
        fprintf(stdout, " [%02d] %s\n", i, strings[i]);
    }
    free(strings);
}

void printSigno(int signo) {
    static int i = 0;
    fprintf(stdout, "\n ========> catch signal %d (%s) i = %d <=====\n", signo, (char*)strsignal(signo), i++);
    fprintf(stdout, "Dump stack start...\n");
    dump();
    fprintf(stdout, "Dump stack end....\n");
}

void handler(int signo) {
    fprintf(stdout, "\n=========> catch signal %d (%s) <=========\n", signo, (char*)strsignal(signo));
    fprintf(stdout, "Dump stack start....\n");
    dump();
    fprintf(stdout, "Dump stack end....\n");

    // 恢复并发送信息
    signal(signo, SIG_DFL);
    raise(signo);
}

void func_03() {
    // 为 SIGINT 安装信号处理函数，通过 ctrl + C 发出该信息
    signal(SIGINT, handler);
    signal(SIGSEGV, handler);
    signal(SIGUSR1, printSigno);

    // 打印当前堆栈
    fprintf(stdout, "Current function calls list is: \n");
    fprintf(stdout, "---------------------------------\n");
    dump();
    fprintf(stdout, "----------------------------------\n");

    // 通过 ctrl + C 发送 SIGINT 信号来结束程序的运行
    for (;;) {}
}

// 使用 static 修改，表明不导出这个符号
// 即使使用 -rdynamic 选项，看到的只是个地址
static void func_02() {
    func_03();
}

void func_01(int ncalls) {
    if (ncalls > 1) {
        func_01(ncalls - 1);
    } else {
        func_02();
    }
}

int main(int argc, char* argv[]) {
    if (argc != 2) {
        fprintf(stderr, "%s num-calls\n", argv[0]);
        exit(EXIT_FAILURE);
    }
    func_01(atoi(argv[1]));
    return 0;
}
```

编译：`g++ xxx.cpp -rdynamic -g -O0 -o main`

运行如下：

```
Current function calls list is: 
---------------------------------
backtrace() returned 9 addressed
 [00] ./main(_Z4dumpv+0x30) [0xaaaacfa40f34]
 [01] ./main(_Z7func_03v+0x90) [0xaaaacfa4124c]
 [02] ./main(+0x1280) [0xaaaacfa41280]
 [03] ./main(_Z7func_01i+0x2c) [0xaaaacfa412b8]
 [04] ./main(_Z7func_01i+0x24) [0xaaaacfa412b0]
 [05] ./main(_Z7func_01i+0x24) [0xaaaacfa412b0]
 [06] ./main(main+0x64) [0xaaaacfa41328]
 [07] /lib/aarch64-linux-gnu/libc.so.6(__libc_start_main+0xe8) [0xffff81987e10]
 [08] ./main(+0xe34) [0xaaaacfa40e34]
----------------------------------
^C
=========> catch signal 2 (Interrupt) <=========
Dump stack start....
backtrace() returned 11 addressed
 [00] ./main(_Z4dumpv+0x30) [0xaaaacfa40f34]
 [01] ./main(_Z7handleri+0x6c) [0xaaaacfa41174]
 [02] linux-vdso.so.1(__kernel_rt_sigreturn+0) [0xffff81b0a5c0]
 [03] ./main(_Z7func_03v+0xb4) [0xaaaacfa41270]
 [04] ./main(+0x1280) [0xaaaacfa41280]
 [05] ./main(_Z7func_01i+0x2c) [0xaaaacfa412b8]
 [06] ./main(_Z7func_01i+0x24) [0xaaaacfa412b0]
 [07] ./main(_Z7func_01i+0x24) [0xaaaacfa412b0]
 [08] ./main(main+0x64) [0xaaaacfa41328]
 [09] /lib/aarch64-linux-gnu/libc.so.6(__libc_start_main+0xe8) [0xffff81987e10]
 [10] ./main(+0xe34) [0xaaaacfa40e34]
Dump stack end....
```

多说一点：

在产生 `Segmentation Fault` 错误时，一般会产生一个 SIGSEGV 信号。利用这个机制，上述问题传统的做法是，在程序中安装SIGSEGV信号，然后在该信号处理函数中，回溯函数调用列表，从而分析定位错误，一劳永逸。

当然产生的 core 文件也可以使用，但是对于大型程序，出现 Segmentation Fault 错误时，其分析定位，比较棘手。