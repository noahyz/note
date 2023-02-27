---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

### 一、动手编译 asan 库

https://zhuanlan.zhihu.com/p/71564723 

官方文档：https://github.com/google/sanitizers/wiki/AddressSanitizer

源码剖析-INTERCEPTION：https://zhuanlan.zhihu.com/p/372460482

firasan：

````
https://zhuanlan.zhihu.com/p/452363685
https://github.com/gamark/firasan
````

GNU Checker：https://www.gnu.org/software/checker/

参数使用：https://blog.csdn.net/hanlizhong85/article/details/78076668

LLVM Compiler-RT + modified Asan ：https://github.com/introspection-libc/compiler-rt

```
asan_lib=${top_dir}/lib/libasan.so
PAVARO_ENV="${PAVARO_ENV} LD_PRELOAD=${asan_lib}"
export ASAN_OPTIONS="quarantine_size_mb=15:malloc_context_size=5:detect_leaks=false:alloc_dealloc_mismatch=0:max_redzone=1024:report_globals=0" 
```

