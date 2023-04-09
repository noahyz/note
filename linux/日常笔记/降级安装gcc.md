---
title: ubuntu 降级安装 gcc/g++
---

## ubuntu 降级安装 gcc/g++

ubuntu 默认安装的 gcc 版本可能比较高，或者我们需要较低版本的 gcc 编译器，与其他版本并存。

如下是在 ubuntu 上安装老版 gcc 的过程。

第一步：指定版本安装 gcc

```
# 在软件源中查找是否包含了我们需要安装的版本
sudo apt-cache search gcc-4.8

# 安装
sudo apt install gcc-4.8
```

第二步：将指定版本 gcc 添加到 gcc 的候选列表中

```
# 查看已有的 gcc 版本，确认下 4.8 版本有没有安装成功
ll /usr/bin/gcc* 

# 将某个版本加入 gcc 候选中，最后的数字是优先级，设置为 100
sudo update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-4.8 100
```

第三步：设置默认 gcc 版本

```
# 设置默认的 gcc 版本
sudo update-alternatives --config gcc

noahyzhang@ubuntu2004:/tmp/hello$ sudo update-alternatives --config gcc
[sudo] password for noahyzhang:
There are 2 choices for the alternative gcc (providing /usr/bin/gcc).

  Selection    Path            Priority   Status
------------------------------------------------------------
* 0            /usr/bin/gcc-7   90        auto mode
  1            /usr/bin/gcc-7   90        manual mode
  2            /usr/bin/gcc-9   80        manual mode

Press <enter> to keep the current choice[*], or type selection number:
```

