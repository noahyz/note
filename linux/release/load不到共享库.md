---
title: linux下load不到共享库
date: 2021-03-07 21:11:41
categories:
- linux
tags:
- load
---

## load不到共享库

### 问题描述

我在开发机上写好了代码，引用了jsoncpp库和curl库。新手直接将两个库放在了/usr/local/lib下，并且makefile写的是/usr/local/lib，使用的动态编译。然后将编译好的二进制文件打包到运维机器上，启动运行时，出现

`lcw: error while loading shared libraries: libjson.so.0: cannot open shared object file: No such file or directory`

### 问题解决

* 我意识到我运维机器上根本没有装这两个库。于是打包二进制文件的时候带上两个库，并且makefile库位置。
* 放在运维机器上再次运行的时候又出现了刚才的问题。于是，我想可能是执行调用该共享库的时候，程序按照默认共享库路径找不到该共享库文件。
* 将共享库路径添加到 /etc/ld.so.conf 并且ldconfig 之后，程序运行成功。
### 扩展

这种问题一般有两种原因

1. 操作系统里面的确没有该共享库(lib* .so. * ) 文件，或者共享库版本不对。
2. 已经安装了该共享库，但是执行需要调用该共享库程序的时候，程序按照默认的共享路径找不到该共享库文件
介绍一个命令

* ldconfig：主要是在默认搜寻目录(/lib和/usr/lib) 以及动态库配置文件(/etc/ld.so.conf) 内所列的目录下，搜索可共享的动态链接库(格式 lib*.so. * )，进而创建出动态装入程序 (ld.so) 所需的连接和缓存文件。缓存文件默认为 /etc/ld.so.cach，此文件保存已排好序的动态链接库名字列表。

1. 如果那个库本来在 /lib或者 /usr/lib 下，则只需要执行下 ldconfig 命令更新一下动态装入程序。
2. 如果共享库文件安装在了比如： /use/local/lib 下或者其他"非 /lib 或 非 /usr/lib" 目录下，那么执行ldconfig命令前，还要把新共享库加入到共享库配置文件 /etc/ld.so.conf 中。如下

```
cat /etc/ld.so.conf
echo "/usr/local/lib" >> /etc/ld.so.conf
ldconfig
```

3. 如果共享库文件安装到了其他“非 /lib 或者 非 /usr/lib” 目录下，但是又不想在 /etc/ld.so.conf 中加路径(或者是没有权限加路径)，那就可以export 一个全局变量 LD_LIBRARY_PATH，然后运行程序的时候就会去这个目录中找共享库。

LD_LIBRARY_PATH 告诉loader 在那个目录中可以找到共享库。可以设置多个目录，这些目录用冒号分割。

```
export LD_LIBRARY_PATH=/usr/local/mysql/lib:$LD_LIBRARY_PATH
```

这中方法只能临时使用，用于当前客户端当前客户。


