---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

## C 语言中 errno 及其相关用法

errno 在 `<errno.h>` 头文件中定义。如下：

```c
#ifndef errno
extern int errno;
#endif
```

在 linux 中使用 c 语言编程，errno 可以把最后一次调用系统调用的错误代码保留。errno 是在调用库函数之前先清零，然后再进行检查。

#### 1. strerror 使用

strerror 返回一个错误消息字符串的指针。

```
char* strerror(int errno);
```

#### 2. perror 使用

```
void perror(const char* s);
```

函数 perror 用来将上一个函数发生错误的原因输出到标准错误（stderr）中。参数 s 所指向的字符串会先打印出来，后面再加上错误原因字符串。此错误原因依照全局变量 errno 的值来决定要输出的字符串。

另外，并不是所有的 C 函数调用发生的错误信息都会修改 errno，例如 gethostbyname 函数

#### 3. errno 的线程安全性

errno 是支持线程安全的。 一般而言，编译器会自动保证 errno 的安全性

