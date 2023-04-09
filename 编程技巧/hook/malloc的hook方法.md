---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

malloc_hook 方法：

```
https://stackoverflow.com/questions/17803456/an-alternative-for-the-deprecated-malloc-hook-functionality-of-glibc/17850402#17850402

https://stackoverflow.com/questions/71882426/how-to-correctly-interpose-malloc-allowing-for-ld-preload-chaining
```

获取函数的返回地址或帧地址：https://gcc.gnu.org/onlinedocs/gcc/Return-Address.html

MEM_debug：https://github.com/itaych/MEM_debug

firASAN：https://github.com/gamark/firasan

### hook malloc 问题以及方法

背景：希望 hook malloc/free 等函数，做一些业务操作。

- glibc 的 __malloc_hook和__free_hook等钩子，因为每次要调用原生malloc/free之前必须先把钩子置空，等分配完成后再把钩子改回去，这不能保证线程安全。
- pre_load方式的，要通过在main之前调用dlopen来加载原生函数指针，问题是dlopen里面也调用malloc分配了内存，而此时malloc已经被覆盖，所以在dlopen中就无限递归了

无奈的办法，在 hook 的 malloc 中，调用 memalign 或者 mmap 来申请内存

方案：

- 直接写一个 malloc 同签名的函数即可，至于如何调用原函数，可以通过符号 `__libc_malloc`，这个符号直接指向 malloc 的实现部分，通过这个符号调用就不会产生递归调用

  ```c++
  extern void *__libc_malloc(size_t size);
  void* malloc (size_t size)
  {
    // do your stuff
    {
    }
    // call the original malloc
    return __libc_malloc(size);
  }
  ```

- 使用 inline hook，汇编指令级别，只要替换目标函数入口处的指令为跳转指令即可

- C 语言可以用宏替换 malloc。`#define malloc my_malloc`。但是 c++ 不适用，重写全局 new 带来很多问题。而且这种方法一点都不优雅

- Gcc wrap，ld 中有一个选项 `-wrap`，当查找某个符号时，它优先解析 `__wrap_symbol`，解析不到才去解析 symbol。但对于 c++ 的 new 不起作用

- 
