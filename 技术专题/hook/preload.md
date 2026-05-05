---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

hook 问题记录。（inline）

https://zhuanlan.zhihu.com/p/44132805

dlsym 注意事项：

https://blog.csdn.net/Cxinsect/article/details/100761916

https://blog.csdn.net/caspiansea/article/details/51337727

LD_PRELOAD 详解：https://blog.fesnel.com/blog/2009/08/25/preloading-with-multiple-symbol-versions/

### 问题记录

#### 1. hook 系统调用注意

在 hook 重写 malloc 类调用时，注意不要在函数内部使用 printf 等会分配内存的函数，可能会陷入无限递归的风险。也就是说，hook 函数时尽量不要调用其他系统函数。

尽量不要直接设置全局环境变量，而是将环境变量添加到要运行/调试的命令之前。

在 hook malloc 内部，必须要输出日志时，可以使用 write 来代替 printf 方法。

#### 2. LD_PRELOAD 为何不能 hook printf

简单来说，就是 gcc 可能会优化 printf 为 puts。

实践证明，对于printf的参数如果是以’\n’结束的纯字符串，printf会被优化为puts函数，而字符串的结尾’\n’符号被消除。除此之外，都会正常生成call printf指令。

详见：https://wanghenshui.github.io/2019/01/02/ld-printf-puts.html

