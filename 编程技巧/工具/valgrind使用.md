---
title: valgrind使用
date: 2023-01-19 11:11:41
tags:
- 性能检测
---

### 一、使用 valgrind 检测 c++ 内存泄露

```
#include <malloc.h>
int main() {
    int *array = (int*)malloc(sizeof(int));
    return 0;
}
```

编译时加上 `-g` 选项。

```
# valgrind --tool=memcheck --leak-check=full ./main
==20819== Memcheck, a memory error detector
==20819== Copyright (C) 2002-2022, and GNU GPL'd, by Julian Seward et al.
==20819== Using Valgrind-3.21.0.GIT and LibVEX; rerun with -h for copyright info
==20819== Command: ./main
==20819== 
==20819== 
==20819== HEAP SUMMARY:
==20819==     in use at exit: 4 bytes in 1 blocks
==20819==   total heap usage: 1 allocs, 0 frees, 4 bytes allocated
==20819== 
==20819== 4 bytes in 1 blocks are definitely lost in loss record 1 of 1
==20819==    at 0x4C330C5: malloc (vg_replace_malloc.c:393)
==20819==    by 0x10865B: main (main.cpp:4)
==20819== 
==20819== LEAK SUMMARY:
==20819==    definitely lost: 4 bytes in 1 blocks
==20819==    indirectly lost: 0 bytes in 0 blocks
==20819==      possibly lost: 0 bytes in 0 blocks
==20819==    still reachable: 0 bytes in 0 blocks
==20819==         suppressed: 0 bytes in 0 blocks
==20819== 
==20819== For lists of detected and suppressed errors, rerun with: -s
==20819== ERROR SUMMARY: 1 errors from 1 contexts (suppressed: 0 from 0)
```

输出信息中的 HEAP SUMMARY，它表示程序在堆上分配内存的情况，其中的 `1 allocs` 表示分配了一次内存，`0 frees` 表示程序释放了 0 次内存，`4 bytes allocated` 表示分配了 4 个字节的内存。

另外，valgrind 也可以报告程序在那个位置发生内存泄漏。如上，清晰的指出了 main.cpp 的第 4 行发生了内存泄露

---

需要注意的是，如下这个例子

```cpp
int main() {
    auto ptr = new std::string("Hello, World!");
    delete ptr;
    return 0;
}
```

使用 valgrind 分析这段程序时，可能会出现如下

```
$ valgrind --tool=memcheck --leak-check=full --show-leak-kinds=all ./main_cpp
==31438== Memcheck, a memory error detector
==31438== Copyright (C) 2002-2017, and GNU GPL'd, by Julian Seward et al.
==31438== Using Valgrind-3.13.0 and LibVEX; rerun with -h for copyright info
==31438== Command: ./main_cpp
==31438==
==31438==
==31438== HEAP SUMMARY:
==31438==     in use at exit: 72,704 bytes in 1 blocks
==31438==   total heap usage: 2 allocs, 1 frees, 72,736 bytes allocated
==31438==
==31438== 72,704 bytes in 1 blocks are still reachable in loss record 1 of 1
==31438==    at 0x4C2DBF6: malloc (vg_replace_malloc.c:299)
==31438==    by 0x4EC3EFF: ??? (in /usr/lib/x86_64-linux-gnu/libstdc++.so.6.0.21)
==31438==    by 0x40104E9: call_init.part.0 (dl-init.c:72)
==31438==    by 0x40105FA: call_init (dl-init.c:30)
==31438==    by 0x40105FA: _dl_init (dl-init.c:120)
==31438==    by 0x4000CF9: ??? (in /lib/x86_64-linux-gnu/ld-2.23.so)
==31438==
==31438== LEAK SUMMARY:
==31438==    definitely lost: 0 bytes in 0 blocks
==31438==    indirectly lost: 0 bytes in 0 blocks
==31438==      possibly lost: 0 bytes in 0 blocks
==31438==    still reachable: 72,704 bytes in 1 blocks
==31438==         suppressed: 0 bytes in 0 blocks
==31438==
==31438== For counts of detected and suppressed errors, rerun with: -v
==31438== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
```

这个程序并没有发生内存泄漏，但是从`HEAP SUMMARY`可以看到，程序分配了 2 次内存，但却只释放了 1 次内存。实际上这是由于 c++ 在分配内存时，为了提高效率，使用了它自己的内存池。当程序终止时，内存池的内存才会被操作系统回收，所以 valgrind 会将这部分内存报告为 reachable 的，需要注意，reachable 的内存不代表内存泄露。

### 二、检查其他

检测越界访问、检测未初始化的内存等等



文档：https://valgrind.org/docs/manual/mc-manual.html

https://ivanzz1001.github.io/records/post/cplusplus/2018/11/14/cpluscplus-valgrind_usage



