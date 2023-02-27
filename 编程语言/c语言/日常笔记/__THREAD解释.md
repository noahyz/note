---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

### __THREAD 解释

Linux/FreeBSD 内核的源文件里常会出现这个。其实并不复杂，只是简单的宏定义，可以参考以下代码

```
<sys/cdefs.h>:

/* GCC can always grok prototypes. For C++ programs we add throw() to help it optimize the function calls. But this works only with gcc 2.8.x and egcs. */
# if defined __cplusplus && (__GNUC__ >;= 3 || __GNUC_MINOR__ >;= 
# define __THROW    throw ()
# else
# define __THROW
# endif
# define __P(args)    args __THROW
	
/* This macro will be used for functions which might take C++ callback
  functions. */
# define __PMT(args)  args
# define __DOTS      , ...

像这个
static void icmp6_errcount __P((struct icmp6errstat *, int, int)); 
展开后就是
static void icmp6_errcount (struct icmp6errstat *, int, int) throw();
或者
static void icmp6_errcount (struct icmp6errstat *, int, int);
```

首先，__THROW宏是纯粹是linux平台上C库才有的东西，其他平台（如windows)上的C库里是不会有的。

在C里面，这个宏完全没有意义。当这个头文件被C++引用时，才有意义，其意义是声明这个函数支持C++里的throw异常功能