---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

### libc.so.6 库误删了如何解决？

glibc是GNU发布的libc库，即c运行库。glibc是linux系统中最底层的api，几乎其它任何运行库都会依赖于glibc。glibc除了封装linux操作系统所提供的系统服务外，它本身也提供了许多其它一些必要功能服务的实现。由于 glibc 囊括了几乎所有的 UNIX 通行的标准，可以想见其内容包罗万象。而就像其他的 UNIX 系统一样，其内含的档案群分散于系统的树状目录结构中，像一个支架一般撑起整个作业系统。在 GNU/Linux 系统中，其C函式库发展史点出了GNU/Linux 演进的几个重要里程碑，用 glibc 作为系统的C函式库，是GNU/Linux演进的一个重要里程碑。

```
 [/usr/bin] ldd ./ls
        linux-vdso.so.1 =>  (0x00007ffc8e7e0000)
        /$LIB/libonion.so => /lib64/libonion.so (0x00007f8b6f67c000)
        libselinux.so.1 => /usr/lib64/libselinux.so.1 (0x00007f8b6f33c000)
        libcap.so.2 => /usr/lib64/libcap.so.2 (0x00007f8b6f137000)
        libacl.so.1 => /usr/lib64/libacl.so.1 (0x00007f8b6ef2e000)
        libc.so.6 => /usr/lib64/libc.so.6 (0x00007f8b6eb60000)
        libdl.so.2 => /usr/lib64/libdl.so.2 (0x00007f8b6e95c000)
        libpcre.so.1 => /usr/lib64/libpcre.so.1 (0x00007f8b6e6fa000)
        /lib64/ld-linux-x86-64.so.2 (0x00007f8b6f563000)
        libattr.so.1 => /usr/lib64/libattr.so.1 (0x00007f8b6e4f5000)
        libpthread.so.0 => /usr/lib64/libpthread.so.0 (0x00007f8b6e2d9000)
```

#### 1. LD_PRELOAD 介绍

`LD_PRELOAD` 是 `Linux` 系统的一个环境变量，它可以影响程序的运行时的链接（Runtime linker），它允许你定义在程序运行前优先加载的动态链接库。这个功能主要就是用来有选择性的载入不同动态链接库中的相同函数。通过这个环境变量，我们可以在主程序和其动态链接库的中间加载别的动态链接库，甚至覆盖正常的函数库。一方面，我们可以以此功能来使用自己的或是更好的函数（无需别人的源码），而另一方面，我们也可以以向别人的程序注入程序，从而达到特定的目的。

举一个例子来详细说明下，我们现在有一个 `libmystrcmp.so` 的文件和一个测试文件 `main.c`。如下

```
// mystrcmp.h
int mystrcmp(const char* s1, const char* s2);

// mystrcmp.c
#include "mystrcmp.h"
#include <string.h>

int mystrcmp(const char* s1, const char* s2) {
    return strcmp(s1, s2);
}

// --------------
// main.c
#include "mystrcmp.h"
#include <stdio.h>

int main(int argc, char* argv[]) {
    const char* passwd = "passwd";
    if (argc < 2) {
        printf("usage: %s <passwd\n>", argv[0]);
        return -1;
    } 
    if (!mystrcmp(passwd, argv[1])) {
        printf("correct password!\n");
        return 0;
    }
    printf("Invalid password!\n");
    return 0;
}
```

如上是代码，首先先编译生成 `libmystrcmp.so` 文件，然后可以和 `main.c` 一起测试验证下

```
# gcc -shared -fPIC mystrcmp.c -o libmystrcmp.so 
# gcc main.c -Lxxx -lmystrcmp -Wl,-rpath=xxx -o main 
# ldd main
        linux-vdso.so.1 =>  (0x00007f9787f1f000)
        /$LIB/libonion.so => /lib64/libonion.so (0x00007f9787e17000)
        libmystrcmp.so => ./libmystrcmp.so (0x00007f9787afe000)
        libc.so.6 => /usr/lib64/libc.so.6 (0x00007f9787730000)
        libdl.so.2 => /usr/lib64/libdl.so.2 (0x00007f978752c000)
        /lib64/ld-linux-x86-64.so.2 (0x00007f9787d00000)
```

可以看到此时链接的是 `libmystrcmp.so` 库，执行测试

```
 # ./main abc  
Invalid password!
# ./main passwd
correct password!
```

然后，我们重新编译一个库，用来在运行时替换 `libmystrcmp.so`。新库的名称假设叫 `libmyhack.so`。代码如下

```
// myhack.c 
#include <stdio.h>

int mystrcmp(const char* s1, const char* s2) {
    printf("hack function invoked, s1=<%s> s2=<%s>\n", s1, s2);
    return 0;
}
```

编译生成动态库，然后替换运行时的 mystrcmp 函数。

```
# gcc -shared -fPIC myhack.c -o libmyhack.so 

# LD_PRELOAD=../libmyhack.so ./main abc
hack function invoked, s1=<passwd> s2=<abc>
correct password!

# LD_PRELOAD=../libmyhack.so ./main passwd
hack function invoked, s1=<passwd> s2=<passwd>
correct password!
```

可以看到已经用 `libmyhack.so` 替换了 `libmystrcmp.so` 库文件。并且更新了 `mystrcmp` 函数的逻辑。

#### 2. 使用 LD_PRELOAD 解决 libc.so.6 丢失问题

一般情况下 libc.so.6 是一个软链接。如下

```
# ll /lib64/libc.so.6
lrwxrwxrwx 1 root root 12 May 15  2021 /lib64/libc.so.6 -> libc-2.17.so
# ll /lib/libc.so.6    
lrwxrwxrwx 1 root root 12 May 15  2021 /lib/libc.so.6 -> libc-2.17.so
```

而一般的系统命令都是引用 `libc.so.6` 这个库。而这个库是一个软链接。那么即使 `libc.so.6` 这个库丢失了，只要系统上有类似 `libc-xxx.so` 的 libc 库，我们都可以用 `LD_PRELOAD` 来设置运行时的动态链接库。比如，我们可以这样使用 ls

```
# LD_PRELOAD=/lib64/libc-2.17.so  ls              
libmystrcmp.so  main  main.c  mystrcmp.c  mystrcmp.h  other_strcmp.c
```

那么我们就可以根据 我们系统上的 `libc-version.so` 库文件，来重新链接 `libc.so.6` ，实现修复系统问题。比如

```
LD_PRELOAD=/lib64/libc-2.17.so ln -s /lib64/libc-2.17.so /lib64/libc.so.6 
```

如上的命令，注意路径，不同的系统可能会有不同的路径。