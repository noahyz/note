---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

## core 文件生成配置

```
1. 设置 core 文件大小，unlimited 表示 core 文件的大小无限制
ulimit -c unlimited （只对当前 shell 生效）
放入 /etc/profile 中，对全局生效
放入 ~/.bashrc 或 ~/.bash_profile 文件，对某一用户生效

2. 设置 core 文件的目录和命名规则
默认 corefile 是生成在程序的执行目录下或者程序启动调用了 chdir 之后的目录,我们可以通过设置生成corefile的格式来控制它，让其生成在固定的目录下。
/proc/sys/kernel/core_uses_pid 可以控制产生的 core 文件的文件名中是否添加 pid 作为扩展，如果添加则文件内容为 1，否则为 0
/proc/sys/kernel/core_pattern 可以设置格式化的 core 文件保存位置或文件名，比如原来文件内容是 core-%e

控制所产生的 core 文件存放到 corefile 目录下，产生的文件名为 core-命令名-pid-时间戳
echo "/home/saneri/corefile/core-%e-%p-%t" > /proc/sys/kernel/core_pattern
或者 sysctl -w kernel.core_pattern=/corefile/core-%e-%p-%t

重启也能生效的配置，则需要写入配置文件中
echo "kernel.core_pattern=/home/saneri/corefile/core-%e-%p-%t" >> /etc/sysctl.conf 
sysctl -p /etc/sysctl.conf 
kernel.core_pattern = /home/saneri/corefile/core-%e-%p-%t
```

关于 core 文件格式控制的参数

```
%%：相当于%
%p：相当于<pid>
%u：相当于<uid>
%g：相当于<gid>
%s：相当于导致dump的信号的数字
%t：相当于dump的时间
%e：相当于执行文件的名称
%h：相当于hostname
```

