---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

## python执行cmd命令

```
os.system(cmd)
```

在一个子 shell 中运行 command 命令，并返回 command 命令执行完毕后的退出状态。底层使用 C 库函数 system 实现。再执行时需要打开一个终端，并且无法保存 command 命令的执行结果。

```
os.popen(command, mode)
```

打开一个与 command 进程之间的管道。这个函数返回值是一个文件对象，可以读或者写（由 mode 决定，默认为 'r'）。比如可以调用 `read()` 来获取 command 命令的执行结果。

```
subprocess.call(command, shell=True)
```

如果 command 不是一个可执行文件，`shell=True` 不可省略。使用 subprocess 模块可以创建新的进程，可以与新建进程的输入/输出/错误管道连通，并可以获得新建进程执行的返回状态。
