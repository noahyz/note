---
title: popen 和 system 函数
date: 2023-01-19 11:11:41
tags:
- linux
---

### 一、popen 函数

函数定义：`FILE * popen( const char * command,const char * type);`

说明：popen 会调用 fork 产生子进程，然后从子进程中调用 `/bin/sh -c` 来执行参数 command 的指令。参数 type 可使用 r 代表读取，w 代表写入。依照此 type 值，popen() 会建立管道连到子进程的标准输出设备或标准输入设备，然后返回一个文件指针。随后进程便可利用此文件指针来读取子进程的输出设备或是写入到子进程的标准输入设备中。此外，所有使用文件指针 (FILE*) 操作的函数也都可以使用，除了 fclose() 以外。

返回值：若成功则返回文件指针，否则返回NULL，错误原因存于errno中。

注意：在编写具SUID/SGID权限的程序时请尽量避免使用popen()，popen()会继承环境变量，通过环境变量可能会造成系统安全的问题

```
    FILE *fp;
    char buffer[80];
    fp = popen("cat /etc/passwd", "r");
    fgets(buffer, sizeof(buffer), fp);
    printf("%s", buffer);
    pclose(fp);
```

### 二、system 函数

可以使用 system 函数运行命令行命令，但是只能得到该命令行的 int 型返回值，并不能获取显示结果。例如：`system(ls)` 只能得到 0 或者 非0。

popen 和 system 系统调用的差异：https://blog.csdn.net/liuxingen/article/details/47057539

