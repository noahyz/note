---
title: /proc/kcore文件解释
date: 2020-10-25 15:11:24
tags:
- linux 
---

当有一天，我看到 Linux 下 /proc/kcore 文件有 128T 的时候，直接惊呆。

找到原文去看了看。

```
/proc/kcore is like an "alias" for the memory in your computer. Its size is the same as the amount of RAM you have, and if you read it as a file, the kernel does memory reads.
```

就是说 kcore 相当于内存的别名，变相代表着内存，可以当做内存文件执行内存读取，其实通过不同的命令查看该文件所显示的大小也是不一致的，比如：

```shell
ls -lh /proc/kcore
du -sh /proc/kcore
```

使用 ls 得到的是 128T，但是使用 du -sh 得到的是 0



更多的 kcore 想关内容参考：https://stackoverflow.com/questions/21170795/proc-kcore-file-is-huge

后面会补上 kcore 具体是什么东西。

