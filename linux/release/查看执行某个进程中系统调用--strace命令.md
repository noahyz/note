---
title: 查看执行某个进程中系统调用--strace命令
date: 2020-10-25 15:31:24
categories:
- linux
tags:
- linux 
---

公司分配给我的机器的 /data 目录下执行 ls -l 或者 ll 的时候，偶尔发现特别慢，大概有 5s，对于我来说，实在是忍不了忍不了。

于是看了 /data 目录是一个新挂的盘，我猜测这是个网络盘。为了验证这个想法。于是去跟踪命令 ll 所进行的系统调用。

执行 ` strace ls -l ` 后，发现主要卡在 poll 这个系统调用上了。这就验证了我的猜想，果然是网络盘，负载过高，导致比较慢。

#### strace 命令

strace常用来跟踪进程执行时的系统调用和所接收的信号。 在Linux世界，进程不能直接访问硬件设备，当进程需要访问硬件设备(比如读取磁盘文件，接收网络数据等等)时，必须由用户态模式切换至内核态模式，通过系统调用访问硬件设备。strace可以跟踪到一个进程产生的系统调用,包括参数，返回值，执行消耗的时间。

##### 1. 输出参数的含义

每一行都是一条系统调用，等号左边是系统调用的函数名及其参数，右边是该调用的返回值。 strace 显示这些调用的参数并返回符号形式的值。strace 从内核接收信息，而且不需要以任何特殊的方式来构建内核。

##### 2. 参数

```shell
-c 统计每一系统调用的所执行的时间,次数和出错的次数等.
-d 输出strace关于标准错误的调试信息.
-f 跟踪由fork调用所产生的子进程.
-ff 如果提供-o filename,则所有进程的跟踪结果输出到相应的filename.pid中,pid是各进程的进程号.
-F 尝试跟踪vfork调用.在-f时,vfork不被跟踪.
-h 输出简要的帮助信息.
-i 输出系统调用的入口指针.
-q 禁止输出关于脱离的消息.
-r 打印出相对时间关于,,每一个系统调用.
-t 在输出中的每一行前加上时间信息.
-tt 在输出中的每一行前加上时间信息,微秒级.
-ttt 微秒级输出,以秒了表示时间.
-T 显示每一调用所耗的时间.
-v 输出所有的系统调用.一些调用关于环境变量,状态,输入输出等调用由于使用频繁,默认不输出.
-V 输出strace的版本信息.
-x 以十六进制形式输出非标准字符串
-xx 所有字符串以十六进制形式输出.
-a column
设置返回值的输出位置.默认 为40.
-e expr
指定一个表达式,用来控制如何跟踪.格式如下:
[qualifier=][!]value1[,value2]...
qualifier只能是 trace,abbrev,verbose,raw,signal,read,write其中之一.value是用来限定的符号或数字.默认的 qualifier是 trace.感叹号是否定符号.例如:
-eopen等价于 -e trace=open,表示只跟踪open调用.而-etrace!=open表示跟踪除了open以外的其他调用.有两个特殊的符号 all 和 none.
注意有些shell使用!来执行历史记录里的命令,所以要使用\\.
-e trace=set
只跟踪指定的系统 调用.例如:-e trace=open,close,rean,write表示只跟踪这四个系统调用.默认的为set=all.
-e trace=file
只跟踪有关文件操作的系统调用.
-e trace=process
只跟踪有关进程控制的系统调用.
-e trace=network
跟踪与网络有关的所有系统调用.
-e strace=signal
跟踪所有与系统信号有关的 系统调用
-e trace=ipc
跟踪所有与进程通讯有关的系统调用
-e abbrev=set
设定 strace输出的系统调用的结果集.-v 等与 abbrev=none.默认为abbrev=all.
-e raw=set
将指 定的系统调用的参数以十六进制显示.
-e signal=set
指定跟踪的系统信号.默认为all.如 signal=!SIGIO(或者signal=!io),表示不跟踪SIGIO信号.
-e read=set
输出从指定文件中读出 的数据.例如:
-e read=3,5
-e write=set
输出写入到指定文件中的数据.
-o filename
将strace的输出写入文件filename
-p pid
跟踪指定的进程pid.
-s strsize
指定输出的字符串的最大长度.默认为32.文件名一直全部输出.
-u username
以username 的UID和GID执行被跟踪的命令
```

#### 分析strace ls -l 输出

执行 `strace -tt -T -v -o /tmp/strace_ll.log  ls -l` 之后，分析一下 strace_ll.log 文件。

```shell
16:23:19.795706 execve("/usr/bin/ls", ["ls", "-l"], ["HOSTNAME=VM-239-95-centos", "TERM=xterm-256color", "SHELL=/bin/bash", "HISTSIZE=3000", "SSH_CLIENT=10.64.43.14 62186 360"..., "OLDPWD=/proc", "SSH_TTY=/dev/pts/9", "USER=root", "LS_COLORS=rs=0:di=38;5;27:ln=38;"..., "MAIL=/var/spool/mail/root", "PATH=/path/myenv/mysql5.6/bin:/u"..., "PWD=/tmp", "TST_HACK_BASH_SESSION_ID=7737114"..., "LANG=zh_CN.UTF-8", "HISTCONTROL=ignoredups", "SHLVL=1", "HOME=/root", "LOGNAME=root", "CVS_RSH=ssh", "SSH_CONNECTION=10.64.43.14 62186"..., "LESSOPEN=||/usr/bin/lesspipe.sh "..., "_=/usr/bin/strace"]) = 0 <0.000181>
16:23:19.796014 brk(0)                  = 0x14a9000 <0.000016>
16:23:19.796073 mmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f5d4a0eb000 <0.000016>
16:23:19.796124 access("/etc/ld.so.preload", R_OK) = 0 <0.000022>
16:23:19.796170 open("/etc/ld.so.preload", O_RDONLY|O_CLOEXEC) = 3 <0.000017>
16:23:19.796212 fstat(3, {st_dev=makedev(252, 1), st_ino=4607, st_mode=S_IFREG|0644, st_nlink=1, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=18, st_atime=2018/06/19-15:11:01, st_mtime=2016/11/22-05:07:58, st_ctime=2018/08/22-18:53:04}) = 0 <0.000015>
16:23:19.796272 mmap(NULL, 18, PROT_READ|PROT_WRITE, MAP_PRIVATE, 3, 0) = 0x7f5d4a0ea000 <0.000017>
16:23:19.796312 close(3)                = 0 <0.000015>
16:23:19.796355 readlink("/proc/self/exe", "/usr/bin/ls", 4096) = 11 <0.000020>
16:23:19.796406 open("/lib64/libonion.so", O_RDONLY|O_CLOEXEC) = 3 <0.000017>
16:23:19.796462 read(3, "\177ELF\2\1\1\0\0\0\0\0\0\0\0\0\3\0>\0\1\0\0\0`\20\0\0\0\0\0\0"..., 832) = 832 <0.000016>
16:23:19.796502 fstat(3, {st_dev=makedev(252, 1), st_ino=25620, st_mode=S_IFREG|0755, st_nlink=1, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=88, st_size=42880, st_atime=2018/06/19-15:11:01, st_mtime=2017/05/15-15:38:54, st_ctime=2018/08/22-18:53:05}) = 0 <0.000014>
16:23:19.796549 mmap(NULL, 1072448, PROT_READ|PROT_EXEC, MAP_PRIVATE|MAP_DENYWRITE, 3, 0) = 0x7f5d49fe4000 <0.000016>
16:23:19.796587 mprotect(0x7f5d49fe7000, 1048576, PROT_NONE) = 0 <0.000018>
16:23:19.796630 mmap(0x7f5d4a0e7000, 4096, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_DENYWRITE, 3, 0x3000) = 0x7f5d4a0e7000 <0.000018>
16:23:19.796672 mmap(0x7f5d4a0e8000, 7488, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_ANONYMOUS, -1, 0) = 0x7f5d4a0e8000 <0.000024>
16:23:19.796719 close(3)                = 0 <0.000015>
16:23:19.796755 munmap(0x7f5d4a0ea000, 18) = 0 <0.000019>
16:23:19.796798 open("/etc/ld.so.cache", O_RDONLY|O_CLOEXEC) = 3 <0.000020>
16:23:19.796841 fstat(3, {st_dev=makedev(252, 1), st_ino=43510, st_mode=S_IFREG|0644, st_nlink=1, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=168, st_size=82239, st_atime=2020/10/22-19:51:07, st_mtime=2020/10/22-19:51:07, st_ctime=2020/10/22-19:51:07}) = 0 <0.000015>
16:23:19.796886 mmap(NULL, 82239, PROT_READ, MAP_PRIVATE, 3, 0) = 0x7f5d49fcf000 <0.000016>
16:23:19.796925 close(3)                = 0 <0.000015>
16:23:19.796967 open("/lib64/libselinux.so.1", O_RDONLY|O_CLOEXEC) = 3 <0.000017>
16:23:19.797006 read(3, "\177ELF\2\1\1\0\0\0\0\0\0\0\0\0\3\0>\0\1\0\0\0\220j\0\0\0\0\0\0"..., 832) = 832 <0.000017>
16:23:19.797045 fstat(3, {st_dev=makedev(252, 1), st_ino=25797, st_mode=S_IFREG|0755, st_nlink=1, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=312, st_size=155744, st_atime=2020/04/30-17:31:30, st_mtime=2020/04/30-17:31:30, st_ctime=2020/07/29-10:39:58}) = 0 <0.000016>
16:23:19.797091 mmap(NULL, 2255216, PROT_READ|PROT_EXEC, MAP_PRIVATE|MAP_DENYWRITE, 3, 0) = 0x7f5d49ca4000 <0.000017>
16:23:19.797129 mprotect(0x7f5d49cc8000, 2093056, PROT_NONE) = 0 <0.000018>
16:23:19.797171 mmap(0x7f5d49ec7000, 8192, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_DENYWRITE, 3, 0x23000) = 0x7f5d49ec7000 <0.000018>
16:23:19.797218 mmap(0x7f5d49ec9000, 6512, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_ANONYMOUS, -1, 0) = 0x7f5d49ec9000 <0.000018>
16:23:19.797260 close(3)                = 0 <0.000015>
16:23:19.797301 open("/lib64/libcap.so.2", O_RDONLY|O_CLOEXEC) = 3 <0.000018>
16:23:19.797341 read(3, "\177ELF\2\1\1\0\0\0\0\0\0\0\0\0\3\0>\0\1\0\0\0 \26\0\0\0\0\0\0"..., 832) = 832 <0.000016>
16:23:19.797382 fstat(3, {st_dev=makedev(252, 1), st_ino=25067, st_mode=S_IFREG|0755, st_nlink=1, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=40, st_size=20024, st_atime=2018/06/19-15:11:01, st_mtime=2014/06/10-11:05:45, st_ctime=2018/08/22-18:53:04}) = 0 <0.000020>
16:23:19.797433 mmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f5d4a0ea000 <0.000016>
16:23:19.797472 mmap(NULL, 2114112, PROT_READ|PROT_EXEC, MAP_PRIVATE|MAP_DENYWRITE, 3, 0) = 0x7f5d49a9f000 <0.000016>
16:23:19.797510 mprotect(0x7f5d49aa3000, 2093056, PROT_NONE) = 0 <0.000020>
16:23:19.797552 mmap(0x7f5d49ca2000, 8192, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_DENYWRITE, 3, 0x3000) = 0x7f5d49ca2000 <0.000017>
16:23:19.797595 close(3)                = 0 <0.000014>
16:23:19.797635 open("/lib64/libacl.so.1", O_RDONLY|O_CLOEXEC) = 3 <0.000019>
16:23:19.797678 read(3, "\177ELF\2\1\1\0\0\0\0\0\0\0\0\0\3\0>\0\1\0\0\0\200\37\0\0\0\0\0\0"..., 832) = 832 <0.000016>
16:23:19.797716 fstat(3, {st_dev=makedev(252, 1), st_ino=24981, st_mode=S_IFREG|0755, st_nlink=1, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=80, st_size=37056, st_atime=2018/06/19-15:11:01, st_mtime=2014/06/10-16:43:26, st_ctime=2018/08/22-18:53:04}) = 0 <0.000014>
16:23:19.797760 mmap(NULL, 2130560, PROT_READ|PROT_EXEC, MAP_PRIVATE|MAP_DENYWRITE, 3, 0) = 0x7f5d49896000 <0.000017>
16:23:19.797798 mprotect(0x7f5d4989d000, 2097152, PROT_NONE) = 0 <0.000017>
16:23:19.797836 mmap(0x7f5d49a9d000, 8192, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_DENYWRITE, 3, 0x7000) = 0x7f5d49a9d000 <0.000016>
16:23:19.797886 close(3)                = 0 <0.000015>
16:23:19.797926 open("/lib64/libc.so.6", O_RDONLY|O_CLOEXEC) = 3 <0.000041>
16:23:19.798008 read(3, "\177ELF\2\1\1\3\0\0\0\0\0\0\0\0\3\0>\0\1\0\0\0\200&\2\0\0\0\0\0"..., 832) = 832 <0.000031>
16:23:19.798082 fstat(3, {st_dev=makedev(252, 1), st_ino=24989, st_mode=S_IFREG|0755, st_nlink=1, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=4248, st_size=2172544, st_atime=2019/10/21-10:47:02, st_mtime=2019/10/21-10:47:02, st_ctime=2020/07/29-10:39:57}) = 0 <0.000042>
16:23:19.798174 mmap(NULL, 3989984, PROT_READ|PROT_EXEC, MAP_PRIVATE|MAP_DENYWRITE, 3, 0) = 0x7f5d494c7000 <0.000035>
16:23:19.798249 mprotect(0x7f5d4968c000, 2093056, PROT_NONE) = 0 <0.000039>
16:23:19.798326 mmap(0x7f5d4988b000, 24576, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_DENYWRITE, 3, 0x1c4000) = 0x7f5d4988b000 <0.000036>
16:23:19.798422 mmap(0x7f5d49891000, 16864, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_ANONYMOUS, -1, 0) = 0x7f5d49891000 <0.000033>
16:23:19.798503 close(3)                = 0 <0.000032>
16:23:19.798584 open("/lib64/libdl.so.2", O_RDONLY|O_CLOEXEC) = 3 <0.000023>
16:23:19.798629 read(3, "\177ELF\2\1\1\0\0\0\0\0\0\0\0\0\3\0>\0\1\0\0\0`\16\0\0\0\0\0\0"..., 832) = 832 <0.000016>
16:23:19.798667 fstat(3, {st_dev=makedev(252, 1), st_ino=25105, st_mode=S_IFREG|0755, st_nlink=1, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=40, st_size=19336, st_atime=2019/10/21-10:47:03, st_mtime=2019/10/21-10:47:03, st_ctime=2020/07/29-10:39:57}) = 0 <0.000014>
16:23:19.798711 mmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f5d49fce000 <0.000018>
16:23:19.798755 mmap(NULL, 2109744, PROT_READ|PROT_EXEC, MAP_PRIVATE|MAP_DENYWRITE, 3, 0) = 0x7f5d492c3000 <0.000016>
16:23:19.798792 mprotect(0x7f5d492c5000, 2097152, PROT_NONE) = 0 <0.000018>
16:23:19.798831 mmap(0x7f5d494c5000, 8192, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_DENYWRITE, 3, 0x2000) = 0x7f5d494c5000 <0.000018>
16:23:19.798873 close(3)                = 0 <0.000015>
16:23:19.798916 open("/lib64/libpcre.so.1", O_RDONLY|O_CLOEXEC) = 3 <0.000031>
16:23:19.798971 read(3, "\177ELF\2\1\1\0\0\0\0\0\0\0\0\0\3\0>\0\1\0\0\0\360\25\0\0\0\0\0\0"..., 832) = 832 <0.000019>
16:23:19.799014 fstat(3, {st_dev=makedev(252, 1), st_ino=25677, st_mode=S_IFREG|0755, st_nlink=1, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=792, st_size=402368, st_atime=2019/10/21-13:58:55, st_mtime=2019/10/21-13:58:55, st_ctime=2020/07/29-10:39:57}) = 0 <0.000016>
16:23:19.799070 mmap(NULL, 2494984, PROT_READ|PROT_EXEC, MAP_PRIVATE|MAP_DENYWRITE, 3, 0) = 0x7f5d49061000 <0.000017>
16:23:19.799108 mprotect(0x7f5d490c1000, 2097152, PROT_NONE) = 0 <0.000031>
16:23:19.799169 mmap(0x7f5d492c1000, 8192, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_DENYWRITE, 3, 0x60000) = 0x7f5d492c1000 <0.000020>
16:23:19.799218 close(3)                = 0 <0.000015>
16:23:19.799261 open("/lib64/libattr.so.1", O_RDONLY|O_CLOEXEC) = 3 <0.000020>
16:23:19.799309 read(3, "\177ELF\2\1\1\0\0\0\0\0\0\0\0\0\3\0>\0\1\0\0\0\320\23\0\0\0\0\0\0"..., 832) = 832 <0.000023>
16:23:19.799356 fstat(3, {st_dev=makedev(252, 1), st_ino=25018, st_mode=S_IFREG|0755, st_nlink=1, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=40, st_size=19888, st_atime=2018/06/19-15:11:01, st_mtime=2014/06/10-12:33:35, st_ctime=2018/08/22-18:53:04}) = 0 <0.000015>
16:23:19.799411 mmap(NULL, 2113904, PROT_READ|PROT_EXEC, MAP_PRIVATE|MAP_DENYWRITE, 3, 0) = 0x7f5d48e5c000 <0.000017>
16:23:19.799449 mprotect(0x7f5d48e60000, 2093056, PROT_NONE) = 0 <0.000018>
16:23:19.799496 mmap(0x7f5d4905f000, 8192, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_DENYWRITE, 3, 0x3000) = 0x7f5d4905f000 <0.000018>
16:23:19.799542 close(3)                = 0 <0.000014>
16:23:19.799584 open("/lib64/libpthread.so.0", O_RDONLY|O_CLOEXEC) = 3 <0.000019>
16:23:19.799624 read(3, "\177ELF\2\1\1\0\0\0\0\0\0\0\0\0\3\0>\0\1\0\0\0\220m\0\0\0\0\0\0"..., 832) = 832 <0.000026>
16:23:19.799674 fstat(3, {st_dev=makedev(252, 1), st_ino=25602, st_mode=S_IFREG|0755, st_nlink=1, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=288, st_size=143664, st_atime=2019/10/21-10:47:03, st_mtime=2019/10/21-10:47:03, st_ctime=2020/07/29-10:39:57}) = 0 <0.000015>
16:23:19.799720 mmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f5d49fcd000 <0.000016>
16:23:19.799758 mmap(NULL, 2208904, PROT_READ|PROT_EXEC, MAP_PRIVATE|MAP_DENYWRITE, 3, 0) = 0x7f5d48c40000 <0.000016>
16:23:19.799796 mprotect(0x7f5d48c57000, 2093056, PROT_NONE) = 0 <0.000018>
16:23:19.799836 mmap(0x7f5d48e56000, 8192, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_DENYWRITE, 3, 0x16000) = 0x7f5d48e56000 <0.000017>
16:23:19.799877 mmap(0x7f5d48e58000, 13448, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_ANONYMOUS, -1, 0) = 0x7f5d48e58000 <0.000016>
16:23:19.799919 close(3)                = 0 <0.000015>
16:23:19.799972 mmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f5d49fcc000 <0.000015>
16:23:19.800012 mmap(NULL, 8192, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f5d49fca000 <0.000015>
16:23:19.800054 arch_prctl(ARCH_SET_FS, 0x7f5d49fca840) = 0 <0.000020>
16:23:19.800157 mprotect(0x7f5d4988b000, 16384, PROT_READ) = 0 <0.000027>
16:23:19.800234 mprotect(0x7f5d48e56000, 4096, PROT_READ) = 0 <0.000020>
16:23:19.800288 mprotect(0x7f5d4905f000, 4096, PROT_READ) = 0 <0.000016>
16:23:19.800329 mprotect(0x7f5d492c1000, 4096, PROT_READ) = 0 <0.000017>
16:23:19.800373 mprotect(0x7f5d494c5000, 4096, PROT_READ) = 0 <0.000020>
16:23:19.800427 mprotect(0x7f5d49a9d000, 4096, PROT_READ) = 0 <0.000018>
16:23:19.800469 mprotect(0x7f5d49ca2000, 4096, PROT_READ) = 0 <0.000016>
16:23:19.800515 mprotect(0x7f5d49ec7000, 4096, PROT_READ) = 0 <0.000016>
16:23:19.800560 mprotect(0x61a000, 4096, PROT_READ) = 0 <0.000016>
16:23:19.800599 mprotect(0x7f5d4a0ec000, 4096, PROT_READ) = 0 <0.000016>
16:23:19.800636 munmap(0x7f5d49fcf000, 82239) = 0 <0.000020>
16:23:19.800679 set_tid_address(0x7f5d49fcab10) = 23171 <0.000015>
16:23:19.800717 set_robust_list(0x7f5d49fcab20, 24) = 0 <0.000016>
16:23:19.800758 rt_sigaction(SIGRTMIN, {0x7f5d48c46870, [], SA_RESTORER|SA_SIGINFO, 0x7f5d48c4f640}, NULL, 8) = 0 <0.000015>
16:23:19.800805 rt_sigaction(SIGRT_1, {0x7f5d48c46900, [], SA_RESTORER|SA_RESTART|SA_SIGINFO, 0x7f5d48c4f640}, NULL, 8) = 0 <0.000014>
16:23:19.800843 rt_sigprocmask(SIG_UNBLOCK, [RTMIN RT_1], NULL, 8) = 0 <0.000016>
16:23:19.800888 getrlimit(RLIMIT_STACK, {rlim_cur=8192*1024, rlim_max=RLIM64_INFINITY}) = 0 <0.000015>
16:23:19.800948 statfs("/sys/fs/selinux", 0x7ffc4c6b4740) = -1 ENOENT (No such file or directory) <0.000022>
16:23:19.801006 statfs("/selinux", 0x7ffc4c6b4740) = -1 ENOENT (No such file or directory) <0.000015>
16:23:19.801079 brk(0)                  = 0x14a9000 <0.000017>
16:23:19.801117 brk(0x14ca000)          = 0x14ca000 <0.000017>
16:23:19.801162 open("/proc/filesystems", O_RDONLY) = 3 <0.000022>
16:23:19.801212 fstat(3, {st_dev=makedev(0, 3), st_ino=4026532028, st_mode=S_IFREG|0444, st_nlink=1, st_uid=0, st_gid=0, st_blksize=1024, st_blocks=0, st_size=0, st_atime=2020/10/25-16:23:19, st_mtime=2020/10/25-16:23:19, st_ctime=2020/10/25-16:23:19}) = 0 <0.000015>
16:23:19.801259 mmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f5d49fe3000 <0.000017>
16:23:19.801303 read(3, "nodev\tsysfs\nnodev\trootfs\nnodev\tb"..., 1024) = 374 <0.000029>
16:23:19.801358 stat("/etc/sysconfig/64bit_strstr_via_64bit_strstr_sse2_unaligned", 0x7ffc4c6b42f0) = -1 ENOENT (No such file or directory) <0.000017>
16:23:19.801409 read(3, "", 1024)       = 0 <0.000021>
16:23:19.801458 close(3)                = 0 <0.000022>
16:23:19.801501 munmap(0x7f5d49fe3000, 4096) = 0 <0.000019>
16:23:19.801542 access("/etc/selinux/config", F_OK) = 0 <0.000017>
16:23:19.801601 open("/usr/lib/locale/locale-archive", O_RDONLY|O_CLOEXEC) = 3 <0.000019>
16:23:19.801642 fstat(3, {st_dev=makedev(252, 1), st_ino=50561, st_mode=S_IFREG|0644, st_nlink=1, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=207128, st_size=106075056, st_atime=2020/07/29-10:39:55, st_mtime=2020/07/29-10:39:56, st_ctime=2020/07/29-10:39:56}) = 0 <0.000014>
16:23:19.801688 mmap(NULL, 106075056, PROT_READ, MAP_PRIVATE, 3, 0) = 0x7f5d42716000 <0.000016>
16:23:19.801727 close(3)                = 0 <0.000014>
16:23:19.801789 ioctl(1, SNDCTL_TMR_TIMEBASE or SNDRV_TIMER_IOCTL_NEXT_DEVICE or TCGETS, {c_iflags=0x500, c_oflags=0x5, c_cflags=0xbf, c_lflags=0x8a3b, c_line=0, c_cc="\x03\x1c\x7f\x15\x04\x00\x01\x00\x11\x13\x1a\x00\x12\x0f\x17\x16\x00\x00\x00"}) = 0 <0.000017>
16:23:19.801841 ioctl(1, TIOCGWINSZ, {ws_row=44, ws_col=143, ws_xpixel=100, ws_ypixel=100}) = 0 <0.000015>
16:23:19.801896 open("/usr/share/locale/locale.alias", O_RDONLY|O_CLOEXEC) = 3 <0.000019>
16:23:19.801942 fstat(3, {st_dev=makedev(252, 1), st_ino=50546, st_mode=S_IFREG|0644, st_nlink=1, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=2502, st_atime=2019/10/21-10:28:49, st_mtime=2019/10/21-10:28:49, st_ctime=2020/07/29-10:39:55}) = 0 <0.000016>
16:23:19.801991 mmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f5d49fe3000 <0.000015>
16:23:19.802029 read(3, "# Locale name alias data base.\n#"..., 4096) = 2502 <0.000017>
16:23:19.802082 read(3, "", 4096)       = 0 <0.000015>
16:23:19.802118 close(3)                = 0 <0.000020>
16:23:19.802161 munmap(0x7f5d49fe3000, 4096) = 0 <0.000018>
16:23:19.802216 open("/usr/share/locale/zh_CN.UTF-8/LC_TIME/coreutils.mo", O_RDONLY) = -1 ENOENT (No such file or directory) <0.000017>
16:23:19.802259 open("/usr/share/locale/zh_CN.utf8/LC_TIME/coreutils.mo", O_RDONLY) = -1 ENOENT (No such file or directory) <0.000016>
16:23:19.802298 open("/usr/share/locale/zh_CN/LC_TIME/coreutils.mo", O_RDONLY) = 3 <0.000018>
16:23:19.802339 fstat(3, {st_dev=makedev(252, 1), st_ino=76447, st_mode=S_IFREG|0644, st_nlink=2, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=376, st_size=190751, st_atime=2017/02/10-14:16:51, st_mtime=2017/02/10-14:16:51, st_ctime=2018/08/22-18:53:06}) = 0 <0.000021>
16:23:19.802391 mmap(NULL, 190751, PROT_READ, MAP_PRIVATE, 3, 0) = 0x7f5d49f9b000 <0.000016>
16:23:19.802440 close(3)                = 0 <0.000014>
16:23:19.802510 open("/usr/lib64/gconv/gconv-modules.cache", O_RDONLY) = 3 <0.000019>
16:23:19.802557 fstat(3, {st_dev=makedev(252, 1), st_ino=5008, st_mode=S_IFREG|0644, st_nlink=1, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=56, st_size=26254, st_atime=2020/07/29-10:39:57, st_mtime=2020/07/29-10:39:57, st_ctime=2020/07/29-10:39:57}) = 0 <0.000015>
16:23:19.802601 mmap(NULL, 26254, PROT_READ, MAP_SHARED, 3, 0) = 0x7f5d49fdd000 <0.000016>
16:23:19.802643 close(3)                = 0 <0.000015>
16:23:19.802682 futex(0x7f5d49890a80, FUTEX_WAKE_PRIVATE, 2147483647) = 0 <0.000015>
16:23:19.802725 stat("/etc/sysconfig/64bit_strstr_via_64bit_strstr_sse2_unaligned", 0x7ffc4c6b3f70) = -1 ENOENT (No such file or directory) <0.000016>
16:23:19.802791 openat(AT_FDCWD, ".", O_RDONLY|O_NONBLOCK|O_DIRECTORY|O_CLOEXEC) = 3 <0.000017>
16:23:19.802834 getdents(3, {{d_ino=393219, d_off=66071222711050786, d_reclen=32, d_name=".ICE-unix", d_type=DT_DIR} {d_ino=397731, d_off=364193898229513950, d_reclen=72, d_name="CoreFxPipe_vscode.19cdc46bf3b6d2091af5cc816bc3b39d", d_type=DT_SOCK} {d_ino=397727, d_off=964080077036503912, d_reclen=64, d_name="CoreFxPipe_ed0d0282da35423fb53ae3ff488289c3", d_type=DT_SOCK} {d_ino=790291, d_off=1135619529437458515, d_reclen=48, d_name="remote-file-71752ccfe2464e99", d_type=DT_DIR} {d_ino=397722, d_off=1329646061135803564, d_reclen=72, d_name="vscode-ipc-97bbdce4-9619-40a6-a994-989d4f0e938c.sock", d_type=DT_SOCK} {d_ino=397716, d_off=1495829360782141469, d_reclen=64, d_name="CoreFxPipe_5930c28ae6364601939b715025fe05e5", d_type=DT_SOCK} {d_ino=397699, d_off=1650305626629467143, d_reclen=72, d_name="vscode-ipc-f2bf78a8-8e5b-4433-9c38-2479e8d68fac.sock", d_type=DT_SOCK} {d_ino=393220, d_off=1707514257825697045, d_reclen=40, d_name="agent_cmd.sock", d_type=DT_SOCK} {d_ino=397726, d_off=1839295972570081672, d_reclen=72, d_name="vscode-ipc-002508c6-7968-4fac-954b-85c09bdf1287.sock", d_type=DT_SOCK} {d_ino=397717, d_off=2538150781375348769, d_reclen=72, d_name="vscode-ipc-10e12dad-79e0-483b-b3cc-817a36c00066.sock", d_type=DT_SOCK} {d_ino=790295, d_off=2651671947127860946, d_reclen=40, d_name="VSFeedbackVSRTCLogs", d_type=DT_DIR} {d_ino=397694, d_off=2830863892624495552, d_reclen=48, d_name="vscode-git-c7c751cafd.sock", d_type=DT_SOCK} {d_ino=397709, d_off=2839229431576066026, d_reclen=48, d_name="vscode-git-ec20fec18d.sock", d_type=DT_SOCK} {d_ino=393218, d_off=3238497401709217654, d_reclen=24, d_name=".", d_type=DT_DIR} {d_ino=529486, d_off=3551510631665562066, d_reclen=32, d_name="2dm-cpp", d_type=DT_DIR} {d_ino=397721, d_off=3607321771111329354, d_reclen=64, d_name="CoreFxPipe_b21e1bd335c04731bec235700fdf311c", d_type=DT_SOCK} {d_ino=394050, d_off=3857167332293830883, d_reclen=64, d_name="CoreFxPipe_48e5ec03088b41648d9c0d523593b342", d_type=DT_SOCK} {d_ino=393245, d_off=4101585867905529462, d_reclen=48, d_name="tencent_sec_webfilter_qzhttp", d_type=DT_REG} {d_ino=397730, d_off=4198518821145912746, d_reclen=64, d_name="CoreFxPipe_dee8ac007268482d9f505cd276418680", d_type=DT_SOCK} {d_ino=397715, d_off=4737155762133436614, d_reclen=48, d_name="vscode-git-11043de042.sock", d_type=DT_SOCK} {d_ino=397728, d_off=5003524080799449865, d_reclen=56, d_name="clr-debug-pipe-26492-759628703-out", d_type=DT_FIFO} {d_ino=393223, d_off=5135592277553527944, d_reclen=32, d_name=".XIM-unix", d_type=DT_DIR} {d_ino=397724, d_off=5136279442322180038, d_reclen=64, d_name="CoreFxPipe_ae926d7207da472b82db82cc029fec6d", d_type=DT_SOCK} {d_ino=397729, d_off=5183345896185079493, d_reclen=64, d_name="dotnet-diagnostic-26492-759628703-socket", d_type=DT_SOCK} {d_ino=397719, d_off=5195600624703869462, d_reclen=72, d_name="vscode-ipc-a63d8082-4ee6-4be6-b5fe-64ea13d709a9.sock", d_type=DT_SOCK} {d_ino=397713, d_off=5233154562355034691, d_reclen=64, d_name="CoreFxPipe_06df3c7e0668454db620c7fbbd6131d8", d_type=DT_SOCK} {d_ino=393222, d_off=5464394528706673886, d_reclen=32, d_name=".X11-unix", d_type=DT_DIR} {d_ino=397695, d_off=5811894089075406149, d_reclen=72, d_name="vscode-ipc-c30835c7-7d50-43fb-b251-c77924fa4d78.sock", d_type=DT_SOCK} {d_ino=397723, d_off=5883888996922303592, d_reclen=64, d_name="CoreFxPipe_c3805b7eebb541a78564ec0955e064c9", d_type=DT_SOCK} {d_ino=397718, d_off=5899249260138652868, d_reclen=72, d_name="vscode-ipc-0a1b200d-c94a-4e59-aed6-d916fbb25a30.sock", d_type=DT_SOCK} {d_ino=397732, d_off=5922843804791938993, d_reclen=40, d_name="strace_ll.log", d_type=DT_REG} {d_ino=393224, d_off=6041205501601559452, d_reclen=32, d_name=".font-unix", d_type=DT_DIR} {d_ino=393244, d_off=6095162436165446985, d_reclen=72, d_name="vscode-ipc-b2570fda-2742-4171-b21d-c3e7cb122f4e.sock", d_type=DT_SOCK} {d_ino=1054125, d_off=6592928799397525875, d_reclen=40, d_name="commandnotfound", d_type=DT_DIR} {d_ino=397689, d_off=6672420988897190016, d_reclen=32, d_name="mysql.sock", d_type=DT_SOCK} {d_ino=393221, d_off=6760494796767168247, d_reclen=32, d_name=".Test-unix", d_type=DT_DIR} {d_ino=790298, d_off=7045761086938793192, d_reclen=40, d_name="vsonline_logs", d_type=DT_DIR} {d_ino=395721, d_off=7532117049427963795, d_reclen=48, d_name="vscode-git-c117eb3d8d.sock", d_type=DT_SOCK} {d_ino=397725, d_off=7857234378425133083, d_reclen=56, d_name="clr-debug-pipe-26492-759628703-in", d_type=DT_FIFO} {d_ino=657223, d_off=8069047951813341151, d_reclen=80, d_name="appInsights-nodeAIF-d9b70cd4-b9f9-4d70-929b-a071c400b217", d_type=DT_DIR} {d_ino=397714, d_off=8653023893088420193, d_reclen=72, d_name="vscode-ipc-d936b95b-060d-4421-bb97-bd949105a3d4.sock", d_type=DT_SOCK} {d_ino=2, d_off=8890165242111957700, d_reclen=24, d_name="..", d_type=DT_DIR} {d_ino=397693, d_off=9025566493146445856, d_reclen=72, d_name="vscode-ipc-aef7e716-f3da-4ac2-a1c8-cac882fdfdea.sock", d_type=DT_SOCK} {d_ino=657451, d_off=9109926784388718580, d_reclen=40, d_name="vscode-typescript0", d_type=DT_DIR} {d_ino=397720, d_off=9223372036854775807, d_reclen=48, d_name="vscode-git-1bf11324be.sock", d_type=DT_SOCK}}, 32768) = 2408 <0.000038>
16:23:19.802927 lstat("CoreFxPipe_vscode.19cdc46bf3b6d2091af5cc816bc3b39d", {st_dev=makedev(252, 1), st_ino=397731, st_mode=S_IFSOCK|0755, st_nlink=1, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=0, st_size=0, st_atime=2020/10/25-13:06:03, st_mtime=2020/10/25-13:06:03, st_ctime=2020/10/25-13:06:03}) = 0 <0.000017>
16:23:19.802979 lgetxattr("CoreFxPipe_vscode.19cdc46bf3b6d2091af5cc816bc3b39d", "security.selinux", 0x14ba4d0, 255) = -1 ENODATA (No data available) <0.000018>
16:23:19.803026 getxattr("CoreFxPipe_vscode.19cdc46bf3b6d2091af5cc816bc3b39d", "system.posix_acl_access", 0x0, 0) = -1 ENODATA (No data available) <0.000015>
16:23:19.803066 getxattr("CoreFxPipe_vscode.19cdc46bf3b6d2091af5cc816bc3b39d", "system.posix_acl_default", 0x0, 0) = -1 ENODATA (No data available) <0.000015>
16:23:19.803113 socket(PF_LOCAL, SOCK_STREAM|SOCK_CLOEXEC|SOCK_NONBLOCK, 0) = 4 <0.000033>
16:23:19.803185 connect(4, {sa_family=AF_LOCAL, sun_path="/var/run/nscd/socket"}, 110) = 0 <0.000033>
16:23:19.803254 sendto(4, "\2\0\0\0\v\0\0\0\7\0\0\0passwd\0", 19, MSG_NOSIGNAL, NULL, 0) = 19 <0.000022>
16:23:19.803309 poll([{fd=4, events=POLLIN|POLLERR|POLLHUP}], 1, 5000) = 1 ([{fd=4, revents=POLLIN|POLLHUP}]) <0.000020>
16:23:19.803358 recvmsg(4, {msg_name(0)=NULL, msg_iov(2)=[{"passwd\0", 7}, {"\310O\3\0\0\0\0\0", 8}], msg_controllen=20, {cmsg_len=20, cmsg_level=SOL_SOCKET, cmsg_type=SCM_RIGHTS, {5}}, msg_flags=MSG_CMSG_CLOEXEC}, MSG_CMSG_CLOEXEC) = 15 <0.000021>
16:23:19.803425 mmap(NULL, 217032, PROT_READ, MAP_SHARED, 5, 0) = 0x7f5d49f66000 <0.000019>
16:23:19.803472 close(5)                = 0 <0.000016>
16:23:19.803513 close(4)                = 0 <0.000020>
16:23:19.803565 socket(PF_LOCAL, SOCK_STREAM|SOCK_CLOEXEC|SOCK_NONBLOCK, 0) = 4 <0.000018>
16:23:19.803619 connect(4, {sa_family=AF_LOCAL, sun_path="/var/run/nscd/socket"}, 110) = 0 <0.000026>
16:23:19.803678 sendto(4, "\2\0\0\0\f\0\0\0\6\0\0\0group\0", 18, MSG_NOSIGNAL, NULL, 0) = 18 <0.000022>
16:23:19.803726 poll([{fd=4, events=POLLIN|POLLERR|POLLHUP}], 1, 5000) = 1 ([{fd=4, revents=POLLIN|POLLHUP}]) <0.000019>
16:23:19.803781 recvmsg(4, {msg_name(0)=NULL, msg_iov(2)=[{"group\0", 6}, {"\310O\3\0\0\0\0\0", 8}], msg_controllen=20, {cmsg_len=20, cmsg_level=SOL_SOCKET, cmsg_type=SCM_RIGHTS, {5}}, msg_flags=MSG_CMSG_CLOEXEC}, MSG_CMSG_CLOEXEC) = 14 <0.000020>
16:23:19.803830 mmap(NULL, 217032, PROT_READ, MAP_SHARED, 5, 0) = 0x7f5d49f31000 <0.000019>
16:23:19.803875 close(5)                = 0 <0.000017>
16:23:19.803917 close(4)                = 0 <0.000020>
16:23:19.803964 lstat("CoreFxPipe_ed0d0282da35423fb53ae3ff488289c3", {st_dev=makedev(252, 1), st_ino=397727, st_mode=S_IFSOCK|0755, st_nlink=1, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=0, st_size=0, st_atime=2020/10/22-12:16:43, st_mtime=2020/10/22-12:16:43, st_ctime=2020/10/22-12:16:43}) = 0 <0.000019>
16:23:19.804025 lgetxattr("CoreFxPipe_ed0d0282da35423fb53ae3ff488289c3", "security.selinux", 0x14badd0, 255) = -1 ENODATA (No data available) <0.000020>
16:23:19.804074 getxattr("CoreFxPipe_ed0d0282da35423fb53ae3ff488289c3", "system.posix_acl_access", 0x0, 0) = -1 ENODATA (No data available) <0.000018>
16:23:19.804119 getxattr("CoreFxPipe_ed0d0282da35423fb53ae3ff488289c3", "system.posix_acl_default", 0x0, 0) = -1 ENODATA (No data available) <0.000018>
16:23:19.804164 lstat("remote-file-71752ccfe2464e99", {st_dev=makedev(252, 1), st_ino=790291, st_mode=S_IFDIR|0755, st_nlink=3, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=4096, st_atime=2020/10/16-19:55:57, st_mtime=2020/10/16-19:55:57, st_ctime=2020/10/16-19:55:57}) = 0 <0.000020>
16:23:19.804228 lgetxattr("remote-file-71752ccfe2464e99", "security.selinux", 0x14bae10, 255) = -1 ENODATA (No data available) <0.000018>
16:23:19.804272 getxattr("remote-file-71752ccfe2464e99", "system.posix_acl_access", 0x0, 0) = -1 ENODATA (No data available) <0.000018>
16:23:19.804316 getxattr("remote-file-71752ccfe2464e99", "system.posix_acl_default", 0x0, 0) = -1 ENODATA (No data available) <0.000017>
16:23:19.804361 lstat("vscode-ipc-97bbdce4-9619-40a6-a994-989d4f0e938c.sock", {st_dev=makedev(252, 1), st_ino=397722, st_mode=S_IFSOCK|0755, st_nlink=1, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=0, st_size=0, st_atime=2020/10/25-13:06:01, st_mtime=2020/10/25-13:06:01, st_ctime=2020/10/25-13:06:01}) = 0 <0.000018>
16:23:19.804425 lgetxattr("vscode-ipc-97bbdce4-9619-40a6-a994-989d4f0e938c.sock", "security.selinux", 0x14bae40, 255) = -1 ENODATA (No data available) <0.000018>
16:23:19.804471 getxattr("vscode-ipc-97bbdce4-9619-40a6-a994-989d4f0e938c.sock", "system.posix_acl_access", 0x0, 0) = -1 ENODATA (No data available) <0.000017>
16:23:19.804516 getxattr("vscode-ipc-97bbdce4-9619-40a6-a994-989d4f0e938c.sock", "system.posix_acl_default", 0x0, 0) = -1 ENODATA (No data available) <0.000018>
16:23:19.804562 lstat("CoreFxPipe_5930c28ae6364601939b715025fe05e5", {st_dev=makedev(252, 1), st_ino=397716, st_mode=S_IFSOCK|0755, st_nlink=1, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=0, st_size=0, st_atime=2020/10/22-12:16:22, st_mtime=2020/10/22-12:16:22, st_ctime=2020/10/22-12:16:22}) = 0 <0.000018>
16:23:19.804614 lgetxattr("CoreFxPipe_5930c28ae6364601939b715025fe05e5", "security.selinux", 0x14bae80, 255) = -1 ENODATA (No data available) <0.000018>
16:23:19.804659 getxattr("CoreFxPipe_5930c28ae6364601939b715025fe05e5", "system.posix_acl_access", 0x0, 0) = -1 ENODATA (No data available) <0.000018>
16:23:19.804703 getxattr("CoreFxPipe_5930c28ae6364601939b715025fe05e5", "system.posix_acl_default", 0x0, 0) = -1 ENODATA (No data available) <0.000018>
16:23:19.804748 lstat("vscode-ipc-f2bf78a8-8e5b-4433-9c38-2479e8d68fac.sock", {st_dev=makedev(252, 1), st_ino=397699, st_mode=S_IFSOCK|0755, st_nlink=1, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=0, st_size=0, st_atime=2020/10/21-22:45:56, st_mtime=2020/10/21-22:45:56, st_ctime=2020/10/21-22:45:56}) = 0 <0.000019>
16:23:19.804801 lgetxattr("vscode-ipc-f2bf78a8-8e5b-4433-9c38-2479e8d68fac.sock", "security.selinux", 0x14baec0, 255) = -1 ENODATA (No data available) <0.000018>
16:23:19.804847 getxattr("vscode-ipc-f2bf78a8-8e5b-4433-9c38-2479e8d68fac.sock", "system.posix_acl_access", 0x0, 0) = -1 ENODATA (No data available) <0.000018>
16:23:19.804892 getxattr("vscode-ipc-f2bf78a8-8e5b-4433-9c38-2479e8d68fac.sock", "system.posix_acl_default", 0x0, 0) = -1 ENODATA (No data available) <0.000017>
16:23:19.804937 lstat("agent_cmd.sock", {st_dev=makedev(252, 1), st_ino=393220, st_mode=S_IFSOCK|0777, st_nlink=1, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=0, st_size=0, st_atime=2020/09/14-15:51:40, st_mtime=2020/09/14-15:51:40, st_ctime=2020/09/14-15:51:40}) = 0 <0.000018>
16:23:19.804993 lgetxattr("agent_cmd.sock", "security.selinux", 0x14baf00, 255) = -1 ENODATA (No data available) <0.000019>
16:23:19.805042 getxattr("agent_cmd.sock", "system.posix_acl_access", 0x0, 0) = -1 ENODATA (No data available) <0.000018>
16:23:19.805087 getxattr("agent_cmd.sock", "system.posix_acl_default", 0x0, 0) = -1 ENODATA (No data available) <0.000018>
16:23:19.805132 lstat("vscode-ipc-002508c6-7968-4fac-954b-85c09bdf1287.sock", {st_dev=makedev(252, 1), st_ino=397726, st_mode=S_IFSOCK|0755, st_nlink=1, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=0, st_size=0, st_atime=2020/10/22-12:16:42, st_mtime=2020/10/22-12:16:42, st_ctime=2020/10/22-12:16:42}) = 0 <0.000019>
16:23:19.805187 lgetxattr("vscode-ipc-002508c6-7968-4fac-954b-85c09bdf1287.sock", "security.selinux", 0x14baf20, 255) = -1 ENODATA (No data available) <0.000018>
16:23:19.805232 getxattr("vscode-ipc-002508c6-7968-4fac-954b-85c09bdf1287.sock", "system.posix_acl_access", 0x0, 0) = -1 ENODATA (No data available) <0.000018>
16:23:19.805277 getxattr("vscode-ipc-002508c6-7968-4fac-954b-85c09bdf1287.sock", "system.posix_acl_default", 0x0, 0) = -1 ENODATA (No data available) <0.000018>
16:23:19.805324 lstat("vscode-ipc-10e12dad-79e0-483b-b3cc-817a36c00066.sock", {st_dev=makedev(252, 1), st_ino=397717, st_mode=S_IFSOCK|0755, st_nlink=1, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=0, st_size=0, st_atime=2020/10/16-20:00:04, st_mtime=2020/10/16-20:00:04, st_ctime=2020/10/16-20:00:04}) = 0 <0.000018>
16:23:19.805378 lgetxattr("vscode-ipc-10e12dad-79e0-483b-b3cc-817a36c00066.sock", "security.selinux", 0x14baf60, 255) = -1 ENODATA (No data available) <0.000025>
16:23:19.805431 getxattr("vscode-ipc-10e12dad-79e0-483b-b3cc-817a36c00066.sock", "system.posix_acl_access", 0x0, 0) = -1 ENODATA (No data available) <0.000018>
16:23:19.805476 getxattr("vscode-ipc-10e12dad-79e0-483b-b3cc-817a36c00066.sock", "system.posix_acl_default", 0x0, 0) = -1 ENODATA (No data available) <0.000018>
16:23:19.805522 lstat("VSFeedbackVSRTCLogs", {st_dev=makedev(252, 1), st_ino=790295, st_mode=S_IFDIR|0755, st_nlink=2, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=4096, st_atime=2020/10/16-19:55:57, st_mtime=2020/10/25-13:06:04, st_ctime=2020/10/25-13:06:04}) = 0 <0.000018>
16:23:19.805574 lgetxattr("VSFeedbackVSRTCLogs", "security.selinux", 0x14bafa0, 255) = -1 ENODATA (No data available) <0.000018>
16:23:19.805618 getxattr("VSFeedbackVSRTCLogs", "system.posix_acl_access", 0x0, 0) = -1 ENODATA (No data available) <0.000018>
16:23:19.805662 getxattr("VSFeedbackVSRTCLogs", "system.posix_acl_default", 0x0, 0) = -1 ENODATA (No data available) <0.000017>
16:23:19.805707 lstat("vscode-git-c7c751cafd.sock", {st_dev=makedev(252, 1), st_ino=397694, st_mode=S_IFSOCK|0755, st_nlink=1, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=0, st_size=0, st_atime=2020/10/16-20:00:05, st_mtime=2020/10/16-20:00:05, st_ctime=2020/10/16-20:00:05}) = 0 <0.000018>
16:23:19.805759 lgetxattr("vscode-git-c7c751cafd.sock", "security.selinux", 0x14bafc0, 255) = -1 ENODATA (No data available) <0.000017>
16:23:19.805803 getxattr("vscode-git-c7c751cafd.sock", "system.posix_acl_access", 0x0, 0) = -1 ENODATA (No data available) <0.000017>
16:23:19.805846 getxattr("vscode-git-c7c751cafd.sock", "system.posix_acl_default", 0x0, 0) = -1 ENODATA (No data available) <0.000017>
16:23:19.805891 lstat("vscode-git-ec20fec18d.sock", {st_dev=makedev(252, 1), st_ino=397709, st_mode=S_IFSOCK|0755, st_nlink=1, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=0, st_size=0, st_atime=2020/10/21-22:45:57, st_mtime=2020/10/21-22:45:57, st_ctime=2020/10/21-22:45:57}) = 0 <0.000018>
16:23:19.805943 lgetxattr("vscode-git-ec20fec18d.sock", "security.selinux", 0x14baff0, 255) = -1 ENODATA (No data available) <0.000017>
16:23:19.805987 getxattr("vscode-git-ec20fec18d.sock", "system.posix_acl_access", 0x0, 0) = -1 ENODATA (No data available) <0.000018>
16:23:19.806031 getxattr("vscode-git-ec20fec18d.sock", "system.posix_acl_default", 0x0, 0) = -1 ENODATA (No data available) <0.000018>
16:23:19.806076 lstat("2dm-cpp", {st_dev=makedev(252, 1), st_ino=529486, st_mode=S_IFDIR|0755, st_nlink=3, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=4096, st_atime=2020/08/12-14:26:29, st_mtime=2020/08/12-14:26:47, st_ctime=2020/08/22-15:16:32}) = 0 <0.000019>
16:23:19.806133 lgetxattr("2dm-cpp", "security.selinux", 0x14bb020, 255) = -1 ENODATA (No data available) <0.000018>
16:23:19.806177 getxattr("2dm-cpp", "system.posix_acl_access", 0x0, 0) = -1 ENODATA (No data available) <0.000017>
16:23:19.806220 getxattr("2dm-cpp", "system.posix_acl_default", 0x0, 0) = -1 ENODATA (No data available) <0.000017>
16:23:19.806265 lstat("CoreFxPipe_b21e1bd335c04731bec235700fdf311c", {st_dev=makedev(252, 1), st_ino=397721, st_mode=S_IFSOCK|0755, st_nlink=1, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=0, st_size=0, st_atime=2020/10/21-22:46:46, st_mtime=2020/10/21-22:46:46, st_ctime=2020/10/21-22:46:46}) = 0 <0.000019>
16:23:19.806320 lgetxattr("CoreFxPipe_b21e1bd335c04731bec235700fdf311c", "security.selinux", 0x14bb040, 255) = -1 ENODATA (No data available) <0.000018>
16:23:19.806363 getxattr("CoreFxPipe_b21e1bd335c04731bec235700fdf311c", "system.posix_acl_access", 0x0, 0) = -1 ENODATA (No data available) <0.000018>
16:23:19.806414 getxattr("CoreFxPipe_b21e1bd335c04731bec235700fdf311c", "system.posix_acl_default", 0x0, 0) = -1 ENODATA (No data available) <0.000018>
16:23:19.806460 lstat("CoreFxPipe_48e5ec03088b41648d9c0d523593b342", {st_dev=makedev(252, 1), st_ino=394050, st_mode=S_IFSOCK|0755, st_nlink=1, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=0, st_size=0, st_atime=2020/10/16-20:00:02, st_mtime=2020/10/16-20:00:02, st_ctime=2020/10/16-20:00:02}) = 0 <0.000018>
16:23:19.806511 lgetxattr("CoreFxPipe_48e5ec03088b41648d9c0d523593b342", "security.selinux", 0x14bb080, 255) = -1 ENODATA (No data available) <0.000018>
16:23:19.806555 getxattr("CoreFxPipe_48e5ec03088b41648d9c0d523593b342", "system.posix_acl_access", 0x0, 0) = -1 ENODATA (No data available) <0.000018>
16:23:19.806599 getxattr("CoreFxPipe_48e5ec03088b41648d9c0d523593b342", "system.posix_acl_default", 0x0, 0) = -1 ENODATA (No data available) <0.000018>
16:23:19.806643 lstat("tencent_sec_webfilter_qzhttp", {st_dev=makedev(252, 1), st_ino=393245, st_mode=S_IFREG|0644, st_nlink=1, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=0, st_size=0, st_atime=2020/07/28-20:55:43, st_mtime=2020/07/28-20:55:43, st_ctime=2020/10/25-16:22:05}) = 0 <0.000018>
16:23:19.806694 lgetxattr("tencent_sec_webfilter_qzhttp", "security.selinux", 0x14bb0c0, 255) = -1 ENODATA (No data available) <0.000018>
16:23:19.806738 getxattr("tencent_sec_webfilter_qzhttp", "system.posix_acl_access", 0x0, 0) = -1 ENODATA (No data available) <0.000017>
16:23:19.806780 getxattr("tencent_sec_webfilter_qzhttp", "system.posix_acl_default", 0x0, 0) = -1 ENODATA (No data available) <0.000018>
16:23:19.806824 lstat("CoreFxPipe_dee8ac007268482d9f505cd276418680", {st_dev=makedev(252, 1), st_ino=397730, st_mode=S_IFSOCK|0755, st_nlink=1, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=0, st_size=0, st_atime=2020/10/23-09:53:47, st_mtime=2020/10/23-09:53:47, st_ctime=2020/10/23-09:53:47}) = 0 <0.000017>
16:23:19.806877 lgetxattr("CoreFxPipe_dee8ac007268482d9f505cd276418680", "security.selinux", 0x14bb0f0, 255) = -1 ENODATA (No data available) <0.000018>
16:23:19.806920 getxattr("CoreFxPipe_dee8ac007268482d9f505cd276418680", "system.posix_acl_access", 0x0, 0) = -1 ENODATA (No data available) <0.000018>
16:23:19.806964 getxattr("CoreFxPipe_dee8ac007268482d9f505cd276418680", "system.posix_acl_default", 0x0, 0) = -1 ENODATA (No data available) <0.000018>
16:23:19.807009 lstat("vscode-git-11043de042.sock", {st_dev=makedev(252, 1), st_ino=397715, st_mode=S_IFSOCK|0755, st_nlink=1, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=0, st_size=0, st_atime=2020/10/22-12:16:21, st_mtime=2020/10/22-12:16:21, st_ctime=2020/10/22-12:16:21}) = 0 <0.000018>
16:23:19.807060 lgetxattr("vscode-git-11043de042.sock", "security.selinux", 0x14bb130, 255) = -1 ENODATA (No data available) <0.000018>
16:23:19.807103 getxattr("vscode-git-11043de042.sock", "system.posix_acl_access", 0x0, 0) = -1 ENODATA (No data available) <0.000017>
16:23:19.807156 getxattr("vscode-git-11043de042.sock", "system.posix_acl_default", 0x0, 0) = -1 ENODATA (No data available) <0.000019>
16:23:19.807208 lstat("clr-debug-pipe-26492-759628703-out", {st_dev=makedev(252, 1), st_ino=397728, st_mode=S_IFIFO|0700, st_nlink=1, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=0, st_size=0, st_atime=2020/10/25-13:06:02, st_mtime=2020/10/25-13:06:02, st_ctime=2020/10/25-13:06:02}) = 0 <0.000019>
16:23:19.807261 lgetxattr("clr-debug-pipe-26492-759628703-out", "security.selinux", 0x14bb160, 255) = -1 ENODATA (No data available) <0.000019>
16:23:19.807306 getxattr("clr-debug-pipe-26492-759628703-out", "system.posix_acl_access", 0x0, 0) = -1 ENODATA (No data available) <0.000017>
16:23:19.807349 getxattr("clr-debug-pipe-26492-759628703-out", "system.posix_acl_default", 0x0, 0) = -1 ENODATA (No data available) <0.000018>
16:23:19.807402 lstat("CoreFxPipe_ae926d7207da472b82db82cc029fec6d", {st_dev=makedev(252, 1), st_ino=397724, st_mode=S_IFSOCK|0755, st_nlink=1, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=0, st_size=0, st_atime=2020/10/16-20:00:05, st_mtime=2020/10/16-20:00:05, st_ctime=2020/10/16-20:00:05}) = 0 <0.000019>
16:23:19.807456 lgetxattr("CoreFxPipe_ae926d7207da472b82db82cc029fec6d", "security.selinux", 0x14bb190, 255) = -1 ENODATA (No data available) <0.000018>
16:23:19.807500 getxattr("CoreFxPipe_ae926d7207da472b82db82cc029fec6d", "system.posix_acl_access", 0x0, 0) = -1 ENODATA (No data available) <0.000018>
16:23:19.807543 getxattr("CoreFxPipe_ae926d7207da472b82db82cc029fec6d", "system.posix_acl_default", 0x0, 0) = -1 ENODATA (No data available) <0.000017>
16:23:19.807588 lstat("dotnet-diagnostic-26492-759628703-socket", {st_dev=makedev(252, 1), st_ino=397729, st_mode=S_IFSOCK|0600, st_nlink=1, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=0, st_size=0, st_atime=2020/10/25-13:06:02, st_mtime=2020/10/25-13:06:02, st_ctime=2020/10/25-13:06:02}) = 0 <0.000018>
16:23:19.807640 lgetxattr("dotnet-diagnostic-26492-759628703-socket", "security.selinux", 0x14bb1d0, 255) = -1 ENODATA (No data available) <0.000018>
16:23:19.807683 getxattr("dotnet-diagnostic-26492-759628703-socket", "system.posix_acl_access", 0x0, 0) = -1 ENODATA (No data available) <0.000018>
16:23:19.807727 getxattr("dotnet-diagnostic-26492-759628703-socket", "system.posix_acl_default", 0x0, 0) = -1 ENODATA (No data available) <0.000018>
16:23:19.807772 lstat("vscode-ipc-a63d8082-4ee6-4be6-b5fe-64ea13d709a9.sock", {st_dev=makedev(252, 1), st_ino=397719, st_mode=S_IFSOCK|0755, st_nlink=1, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=0, st_size=0, st_atime=2020/10/21-22:46:45, st_mtime=2020/10/21-22:46:45, st_ctime=2020/10/21-22:46:45}) = 0 <0.000018>
16:23:19.807826 lgetxattr("vscode-ipc-a63d8082-4ee6-4be6-b5fe-64ea13d709a9.sock", "security.selinux", 0x14bb210, 255) = -1 ENODATA (No data available) <0.000019>
16:23:19.807872 getxattr("vscode-ipc-a63d8082-4ee6-4be6-b5fe-64ea13d709a9.sock", "system.posix_acl_access", 0x0, 0) = -1 ENODATA (No data available) <0.000018>
16:23:19.807916 getxattr("vscode-ipc-a63d8082-4ee6-4be6-b5fe-64ea13d709a9.sock", "system.posix_acl_default", 0x0, 0) = -1 ENODATA (No data available) <0.000018>
16:23:19.807961 lstat("CoreFxPipe_06df3c7e0668454db620c7fbbd6131d8", {st_dev=makedev(252, 1), st_ino=397713, st_mode=S_IFSOCK|0755, st_nlink=1, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=0, st_size=0, st_atime=2020/10/21-22:45:57, st_mtime=2020/10/21-22:45:57, st_ctime=2020/10/21-22:45:57}) = 0 <0.000019>
16:23:19.808014 lgetxattr("CoreFxPipe_06df3c7e0668454db620c7fbbd6131d8", "security.selinux", 0x14bb250, 255) = -1 ENODATA (No data available) <0.000018>
16:23:19.808058 getxattr("CoreFxPipe_06df3c7e0668454db620c7fbbd6131d8", "system.posix_acl_access", 0x0, 0) = -1 ENODATA (No data available) <0.000017>
16:23:19.808101 getxattr("CoreFxPipe_06df3c7e0668454db620c7fbbd6131d8", "system.posix_acl_default", 0x0, 0) = -1 ENODATA (No data available) <0.000018>
16:23:19.808147 lstat("vscode-ipc-c30835c7-7d50-43fb-b251-c77924fa4d78.sock", {st_dev=makedev(252, 1), st_ino=397695, st_mode=S_IFSOCK|0755, st_nlink=1, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=0, st_size=0, st_atime=2020/10/16-19:58:54, st_mtime=2020/10/16-19:58:54, st_ctime=2020/10/16-19:58:54}) = 0 <0.000018>
16:23:19.808206 lgetxattr("vscode-ipc-c30835c7-7d50-43fb-b251-c77924fa4d78.sock", "security.selinux", 0x14bb290, 255) = -1 ENODATA (No data available) <0.000019>
16:23:19.808252 getxattr("vscode-ipc-c30835c7-7d50-43fb-b251-c77924fa4d78.sock", "system.posix_acl_access", 0x0, 0) = -1 ENODATA (No data available) <0.000018>
16:23:19.808297 getxattr("vscode-ipc-c30835c7-7d50-43fb-b251-c77924fa4d78.sock", "system.posix_acl_default", 0x0, 0) = -1 ENODATA (No data available) <0.000017>
16:23:19.808343 lstat("CoreFxPipe_c3805b7eebb541a78564ec0955e064c9", {st_dev=makedev(252, 1), st_ino=397723, st_mode=S_IFSOCK|0755, st_nlink=1, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=0, st_size=0, st_atime=2020/10/25-13:06:02, st_mtime=2020/10/25-13:06:02, st_ctime=2020/10/25-13:06:02}) = 0 <0.000018>
16:23:19.808394 lgetxattr("CoreFxPipe_c3805b7eebb541a78564ec0955e064c9", "security.selinux", 0x14bb2d0, 255) = -1 ENODATA (No data available) <0.000020>
16:23:19.808451 getxattr("CoreFxPipe_c3805b7eebb541a78564ec0955e064c9", "system.posix_acl_access", 0x0, 0) = -1 ENODATA (No data available) <0.000018>
16:23:19.808495 getxattr("CoreFxPipe_c3805b7eebb541a78564ec0955e064c9", "system.posix_acl_default", 0x0, 0) = -1 ENODATA (No data available) <0.000018>
16:23:19.808539 lstat("vscode-ipc-0a1b200d-c94a-4e59-aed6-d916fbb25a30.sock", {st_dev=makedev(252, 1), st_ino=397718, st_mode=S_IFSOCK|0755, st_nlink=1, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=0, st_size=0, st_atime=2020/10/23-09:53:44, st_mtime=2020/10/23-09:53:44, st_ctime=2020/10/23-09:53:44}) = 0 <0.000018>
16:23:19.808591 lgetxattr("vscode-ipc-0a1b200d-c94a-4e59-aed6-d916fbb25a30.sock", "security.selinux", 0x14bb310, 255) = -1 ENODATA (No data available) <0.000017>
16:23:19.808635 getxattr("vscode-ipc-0a1b200d-c94a-4e59-aed6-d916fbb25a30.sock", "system.posix_acl_access", 0x0, 0) = -1 ENODATA (No data available) <0.000018>
16:23:19.808679 getxattr("vscode-ipc-0a1b200d-c94a-4e59-aed6-d916fbb25a30.sock", "system.posix_acl_default", 0x0, 0) = -1 ENODATA (No data available) <0.000016>
16:23:19.808722 lstat("strace_ll.log", {st_dev=makedev(252, 1), st_ino=397732, st_mode=S_IFREG|0644, st_nlink=1, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=88, st_size=43192, st_atime=2020/10/25-16:11:29, st_mtime=2020/10/25-16:23:19, st_ctime=2020/10/25-16:23:19}) = 0 <0.000017>
16:23:19.808773 lgetxattr("strace_ll.log", "security.selinux", 0x14bb350, 255) = -1 ENODATA (No data available) <0.000018>
16:23:19.808815 getxattr("strace_ll.log", "system.posix_acl_access", 0x0, 0) = -1 ENODATA (No data available) <0.000033>
16:23:19.808889 getxattr("strace_ll.log", "system.posix_acl_default", 0x0, 0) = -1 ENODATA (No data available) <0.000027>
16:23:19.808960 lstat("vscode-ipc-b2570fda-2742-4171-b21d-c3e7cb122f4e.sock", {st_dev=makedev(252, 1), st_ino=393244, st_mode=S_IFSOCK|0755, st_nlink=1, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=0, st_size=0, st_atime=2020/10/16-19:44:01, st_mtime=2020/10/16-19:44:01, st_ctime=2020/10/16-19:44:01}) = 0 <0.000027>
16:23:19.809034 lgetxattr("vscode-ipc-b2570fda-2742-4171-b21d-c3e7cb122f4e.sock", "security.selinux", 0x14bb370, 255) = -1 ENODATA (No data available) <0.000023>
16:23:19.809083 getxattr("vscode-ipc-b2570fda-2742-4171-b21d-c3e7cb122f4e.sock", "system.posix_acl_access", 0x0, 0) = -1 ENODATA (No data available) <0.000016>
16:23:19.809122 getxattr("vscode-ipc-b2570fda-2742-4171-b21d-c3e7cb122f4e.sock", "system.posix_acl_default", 0x0, 0) = -1 ENODATA (No data available) <0.000015>
16:23:19.809162 lstat("commandnotfound", {st_dev=makedev(252, 1), st_ino=1054125, st_mode=S_IFDIR|0755, st_nlink=2, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=4096, st_atime=2020/10/23-20:09:11, st_mtime=2020/10/23-20:09:11, st_ctime=2020/10/23-20:09:11}) = 0 <0.000015>
16:23:19.809211 lgetxattr("commandnotfound", "security.selinux", 0x14bb3b0, 255) = -1 ENODATA (No data available) <0.000016>
16:23:19.809249 getxattr("commandnotfound", "system.posix_acl_access", 0x0, 0) = -1 ENODATA (No data available) <0.000016>
16:23:19.809291 getxattr("commandnotfound", "system.posix_acl_default", 0x0, 0) = -1 ENODATA (No data available) <0.000024>
16:23:19.809341 lstat("mysql.sock", {st_dev=makedev(252, 1), st_ino=397689, st_mode=S_IFSOCK|0777, st_nlink=1, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=0, st_size=0, st_atime=2020/08/08-20:20:47, st_mtime=2020/08/08-20:20:47, st_ctime=2020/08/08-20:20:47}) = 0 <0.000016>
16:23:19.809388 lgetxattr("mysql.sock", "security.selinux", 0x14bb3d0, 255) = -1 ENODATA (No data available) <0.000020>
16:23:19.809430 getxattr("mysql.sock", "system.posix_acl_access", 0x0, 0) = -1 ENODATA (No data available) <0.000015>
16:23:19.809468 getxattr("mysql.sock", "system.posix_acl_default", 0x0, 0) = -1 ENODATA (No data available) <0.000016>
16:23:19.809526 lstat("vsonline_logs", {st_dev=makedev(252, 1), st_ino=790298, st_mode=S_IFDIR|0755, st_nlink=2, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=4096, st_atime=2020/10/16-19:56:00, st_mtime=2020/10/16-19:56:00, st_ctime=2020/10/16-19:56:00}) = 0 <0.000020>
16:23:19.809576 lgetxattr("vsonline_logs", "security.selinux", 0x14bb3f0, 255) = -1 ENODATA (No data available) <0.000016>
16:23:19.809613 getxattr("vsonline_logs", "system.posix_acl_access", 0x0, 0) = -1 ENODATA (No data available) <0.000015>
16:23:19.809651 getxattr("vsonline_logs", "system.posix_acl_default", 0x0, 0) = -1 ENODATA (No data available) <0.000015>
16:23:19.809690 lstat("vscode-git-c117eb3d8d.sock", {st_dev=makedev(252, 1), st_ino=395721, st_mode=S_IFSOCK|0755, st_nlink=1, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=0, st_size=0, st_atime=2020/10/16-19:44:01, st_mtime=2020/10/16-19:44:01, st_ctime=2020/10/16-19:44:01}) = 0 <0.000025>
16:23:19.809745 lgetxattr("vscode-git-c117eb3d8d.sock", "security.selinux", 0x14bb410, 255) = -1 ENODATA (No data available) <0.000016>
16:23:19.809792 getxattr("vscode-git-c117eb3d8d.sock", "system.posix_acl_access", 0x0, 0) = -1 ENODATA (No data available) <0.000015>
16:23:19.809829 getxattr("vscode-git-c117eb3d8d.sock", "system.posix_acl_default", 0x0, 0) = -1 ENODATA (No data available) <0.000015>
16:23:19.809867 lstat("clr-debug-pipe-26492-759628703-in", {st_dev=makedev(252, 1), st_ino=397725, st_mode=S_IFIFO|0700, st_nlink=1, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=0, st_size=0, st_atime=2020/10/25-13:06:02, st_mtime=2020/10/25-13:06:02, st_ctime=2020/10/25-13:06:02}) = 0 <0.000017>
16:23:19.809918 lgetxattr("clr-debug-pipe-26492-759628703-in", "security.selinux", 0x14bb440, 255) = -1 ENODATA (No data available) <0.000016>
16:23:19.809956 getxattr("clr-debug-pipe-26492-759628703-in", "system.posix_acl_access", 0x0, 0) = -1 ENODATA (No data available) <0.000022>
16:23:19.810002 getxattr("clr-debug-pipe-26492-759628703-in", "system.posix_acl_default", 0x0, 0) = -1 ENODATA (No data available) <0.000015>
16:23:19.810041 lstat("appInsights-nodeAIF-d9b70cd4-b9f9-4d70-929b-a071c400b217", {st_dev=makedev(252, 1), st_ino=657223, st_mode=S_IFDIR|0755, st_nlink=2, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=4096, st_atime=2020/10/16-20:26:05, st_mtime=2020/10/23-22:00:00, st_ctime=2020/10/23-22:00:00}) = 0 <0.000016>
16:23:19.810087 lgetxattr("appInsights-nodeAIF-d9b70cd4-b9f9-4d70-929b-a071c400b217", "security.selinux", 0x14bb470, 255) = -1 ENODATA (No data available) <0.000016>
16:23:19.810127 getxattr("appInsights-nodeAIF-d9b70cd4-b9f9-4d70-929b-a071c400b217", "system.posix_acl_access", 0x0, 0) = -1 ENODATA (No data available) <0.000016>
16:23:19.810165 getxattr("appInsights-nodeAIF-d9b70cd4-b9f9-4d70-929b-a071c400b217", "system.posix_acl_default", 0x0, 0) = -1 ENODATA (No data available) <0.000015>
16:23:19.810204 lstat("vscode-ipc-d936b95b-060d-4421-bb97-bd949105a3d4.sock", {st_dev=makedev(252, 1), st_ino=397714, st_mode=S_IFSOCK|0755, st_nlink=1, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=0, st_size=0, st_atime=2020/10/22-12:16:20, st_mtime=2020/10/22-12:16:20, st_ctime=2020/10/22-12:16:20}) = 0 <0.000015>
16:23:19.810249 lgetxattr("vscode-ipc-d936b95b-060d-4421-bb97-bd949105a3d4.sock", "security.selinux", 0x14bb4c0, 255) = -1 ENODATA (No data available) <0.000016>
16:23:19.810291 getxattr("vscode-ipc-d936b95b-060d-4421-bb97-bd949105a3d4.sock", "system.posix_acl_access", 0x0, 0) = -1 ENODATA (No data available) <0.000015>
16:23:19.810330 getxattr("vscode-ipc-d936b95b-060d-4421-bb97-bd949105a3d4.sock", "system.posix_acl_default", 0x0, 0) = -1 ENODATA (No data available) <0.000016>
16:23:19.810370 lstat("vscode-ipc-aef7e716-f3da-4ac2-a1c8-cac882fdfdea.sock", {st_dev=makedev(252, 1), st_ino=397693, st_mode=S_IFSOCK|0755, st_nlink=1, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=0, st_size=0, st_atime=2020/10/16-19:45:17, st_mtime=2020/10/16-19:45:17, st_ctime=2020/10/16-19:45:17}) = 0 <0.000015>
16:23:19.810424 lgetxattr("vscode-ipc-aef7e716-f3da-4ac2-a1c8-cac882fdfdea.sock", "security.selinux", 0x14bb500, 255) = -1 ENODATA (No data available) <0.000015>
16:23:19.810462 getxattr("vscode-ipc-aef7e716-f3da-4ac2-a1c8-cac882fdfdea.sock", "system.posix_acl_access", 0x0, 0) = -1 ENODATA (No data available) <0.000015>
16:23:19.810500 getxattr("vscode-ipc-aef7e716-f3da-4ac2-a1c8-cac882fdfdea.sock", "system.posix_acl_default", 0x0, 0) = -1 ENODATA (No data available) <0.000015>
16:23:19.810538 lstat("vscode-typescript0", {st_dev=makedev(252, 1), st_ino=657451, st_mode=S_IFDIR|0755, st_nlink=2, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=4096, st_atime=2020/10/02-11:37:09, st_mtime=2020/10/24-02:55:53, st_ctime=2020/10/24-02:55:53}) = 0 <0.000016>
16:23:19.810585 lgetxattr("vscode-typescript0", "security.selinux", 0x14bb540, 255) = -1 ENODATA (No data available) <0.000021>
16:23:19.810628 getxattr("vscode-typescript0", "system.posix_acl_access", 0x0, 0) = -1 ENODATA (No data available) <0.000015>
16:23:19.810665 getxattr("vscode-typescript0", "system.posix_acl_default", 0x0, 0) = -1 ENODATA (No data available) <0.000015>
16:23:19.810703 lstat("vscode-git-1bf11324be.sock", {st_dev=makedev(252, 1), st_ino=397720, st_mode=S_IFSOCK|0755, st_nlink=1, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=0, st_size=0, st_atime=2020/10/25-13:06:02, st_mtime=2020/10/25-13:06:02, st_ctime=2020/10/25-13:06:02}) = 0 <0.000015>
16:23:19.810748 lgetxattr("vscode-git-1bf11324be.sock", "security.selinux", 0x14bb560, 255) = -1 ENODATA (No data available) <0.000016>
16:23:19.810787 getxattr("vscode-git-1bf11324be.sock", "system.posix_acl_access", 0x0, 0) = -1 ENODATA (No data available) <0.000015>
16:23:19.810824 getxattr("vscode-git-1bf11324be.sock", "system.posix_acl_default", 0x0, 0) = -1 ENODATA (No data available) <0.000016>
16:23:19.810863 getdents(3, {}, 32768)  = 0 <0.000015>
16:23:19.810900 close(3)                = 0 <0.000018>
16:23:19.810988 open("/usr/share/locale/zh_CN.UTF-8/LC_MESSAGES/coreutils.mo", O_RDONLY) = -1 ENOENT (No such file or directory) <0.000016>
16:23:19.811027 open("/usr/share/locale/zh_CN.utf8/LC_MESSAGES/coreutils.mo", O_RDONLY) = -1 ENOENT (No such file or directory) <0.000022>
16:23:19.811071 open("/usr/share/locale/zh_CN/LC_MESSAGES/coreutils.mo", O_RDONLY) = 3 <0.000017>
16:23:19.811108 fstat(3, {st_dev=makedev(252, 1), st_ino=76447, st_mode=S_IFREG|0644, st_nlink=2, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=376, st_size=190751, st_atime=2017/02/10-14:16:51, st_mtime=2017/02/10-14:16:51, st_ctime=2018/08/22-18:53:06}) = 0 <0.000015>
16:23:19.811173 mmap(NULL, 190751, PROT_READ, MAP_PRIVATE, 3, 0) = 0x7f5d49f02000 <0.000017>
16:23:19.811212 close(3)                = 0 <0.000015>
16:23:19.811270 fstat(1, {st_dev=makedev(0, 10), st_ino=12, st_mode=S_IFCHR|0620, st_nlink=1, st_uid=0, st_gid=5, st_blksize=1024, st_blocks=0, st_rdev=makedev(136, 9), st_atime=2020/10/25-16:23:19, st_mtime=2020/10/25-16:23:19, st_ctime=2020/10/25-14:22:45}) = 0 <0.000015>
16:23:19.811316 mmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f5d49fdc000 <0.000017>
16:23:19.811358 write(1, "\346\200\273\347\224\250\351\207\217 72\n", 13) = 13 <0.000043>
16:23:19.811443 open("/etc/localtime", O_RDONLY|O_CLOEXEC) = 3 <0.000021>
16:23:19.811490 fstat(3, {st_dev=makedev(252, 1), st_ino=1875, st_mode=S_IFREG|0644, st_nlink=5, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=388, st_atime=2018/06/19-15:11:03, st_mtime=2016/12/05-14:43:44, st_ctime=2018/06/19-15:11:01}) = 0 <0.000015>
16:23:19.811540 fstat(3, {st_dev=makedev(252, 1), st_ino=1875, st_mode=S_IFREG|0644, st_nlink=5, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=388, st_atime=2018/06/19-15:11:03, st_mtime=2016/12/05-14:43:44, st_ctime=2018/06/19-15:11:01}) = 0 <0.000014>
16:23:19.811585 mmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f5d49fdb000 <0.000016>
16:23:19.811623 read(3, "TZif2\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\2\0\0\0\2\0\0\0\0"..., 4096) = 388 <0.000023>
16:23:19.811675 lseek(3, -240, SEEK_CUR) = 148 <0.000016>
16:23:19.811712 read(3, "TZif2\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\3\0\0\0\3\0\0\0\0"..., 4096) = 240 <0.000016>
16:23:19.811751 close(3)                = 0 <0.000018>
16:23:19.811789 munmap(0x7f5d49fdb000, 4096) = 0 <0.000020>
16:23:19.811851 write(1, "drwxr-xr-x 3 root root  4096 8\346\234"..., 52) = 52 <0.000027>
16:23:19.811905 stat("/etc/localtime", {st_dev=makedev(252, 1), st_ino=1875, st_mode=S_IFREG|0644, st_nlink=5, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=388, st_atime=2018/06/19-15:11:03, st_mtime=2016/12/05-14:43:44, st_ctime=2018/06/19-15:11:01}) = 0 <0.000020>
16:23:19.811959 write(1, "srwxrwxrwx 1 root root     0 9\346\234"..., 59) = 59 <0.000025>
16:23:19.812010 stat("/etc/localtime", {st_dev=makedev(252, 1), st_ino=1875, st_mode=S_IFREG|0644, st_nlink=5, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=388, st_atime=2018/06/19-15:11:03, st_mtime=2016/12/05-14:43:44, st_ctime=2018/06/19-15:11:01}) = 0 <0.000017>
16:23:19.812061 write(1, "drwxr-xr-x 2 root root  4096 10\346"..., 101) = 101 <0.000024>
16:23:19.812122 stat("/etc/localtime", {st_dev=makedev(252, 1), st_ino=1875, st_mode=S_IFREG|0644, st_nlink=5, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=388, st_atime=2018/06/19-15:11:03, st_mtime=2016/12/05-14:43:44, st_ctime=2018/06/19-15:11:01}) = 0 <0.000022>
16:23:19.812190 write(1, "prwx------ 1 root root     0 10\346"..., 78) = 78 <0.000026>
16:23:19.812240 stat("/etc/localtime", {st_dev=makedev(252, 1), st_ino=1875, st_mode=S_IFREG|0644, st_nlink=5, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=388, st_atime=2018/06/19-15:11:03, st_mtime=2016/12/05-14:43:44, st_ctime=2018/06/19-15:11:01}) = 0 <0.000017>
16:23:19.812290 write(1, "prwx------ 1 root root     0 10\346"..., 79) = 79 <0.000024>
16:23:19.812339 stat("/etc/localtime", {st_dev=makedev(252, 1), st_ino=1875, st_mode=S_IFREG|0644, st_nlink=5, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=388, st_atime=2018/06/19-15:11:03, st_mtime=2016/12/05-14:43:44, st_ctime=2018/06/19-15:11:01}) = 0 <0.000017>
16:23:19.812390 write(1, "drwxr-xr-x 2 root root  4096 10\346"..., 60) = 60 <0.000025>
16:23:19.812450 stat("/etc/localtime", {st_dev=makedev(252, 1), st_ino=1875, st_mode=S_IFREG|0644, st_nlink=5, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=388, st_atime=2018/06/19-15:11:03, st_mtime=2016/12/05-14:43:44, st_ctime=2018/06/19-15:11:01}) = 0 <0.000018>
16:23:19.812502 write(1, "srwxr-xr-x 1 root root     0 10\346"..., 88) = 88 <0.000025>
16:23:19.812553 stat("/etc/localtime", {st_dev=makedev(252, 1), st_ino=1875, st_mode=S_IFREG|0644, st_nlink=5, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=388, st_atime=2018/06/19-15:11:03, st_mtime=2016/12/05-14:43:44, st_ctime=2018/06/19-15:11:01}) = 0 <0.000017>
16:23:19.812601 write(1, "srwxr-xr-x 1 root root     0 10\346"..., 88) = 88 <0.000024>
16:23:19.812651 stat("/etc/localtime", {st_dev=makedev(252, 1), st_ino=1875, st_mode=S_IFREG|0644, st_nlink=5, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=388, st_atime=2018/06/19-15:11:03, st_mtime=2016/12/05-14:43:44, st_ctime=2018/06/19-15:11:01}) = 0 <0.000018>
16:23:19.812702 write(1, "srwxr-xr-x 1 root root     0 10\346"..., 88) = 88 <0.000025>
16:23:19.812755 stat("/etc/localtime", {st_dev=makedev(252, 1), st_ino=1875, st_mode=S_IFREG|0644, st_nlink=5, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=388, st_atime=2018/06/19-15:11:03, st_mtime=2016/12/05-14:43:44, st_ctime=2018/06/19-15:11:01}) = 0 <0.000018>
16:23:19.812809 write(1, "srwxr-xr-x 1 root root     0 10\346"..., 88) = 88 <0.000025>
16:23:19.812861 stat("/etc/localtime", {st_dev=makedev(252, 1), st_ino=1875, st_mode=S_IFREG|0644, st_nlink=5, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=388, st_atime=2018/06/19-15:11:03, st_mtime=2016/12/05-14:43:44, st_ctime=2018/06/19-15:11:01}) = 0 <0.000017>
16:23:19.812910 write(1, "srwxr-xr-x 1 root root     0 10\346"..., 88) = 88 <0.000024>
16:23:19.812958 stat("/etc/localtime", {st_dev=makedev(252, 1), st_ino=1875, st_mode=S_IFREG|0644, st_nlink=5, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=388, st_atime=2018/06/19-15:11:03, st_mtime=2016/12/05-14:43:44, st_ctime=2018/06/19-15:11:01}) = 0 <0.000017>
16:23:19.813007 write(1, "srwxr-xr-x 1 root root     0 10\346"..., 88) = 88 <0.000024>
16:23:19.813055 stat("/etc/localtime", {st_dev=makedev(252, 1), st_ino=1875, st_mode=S_IFREG|0644, st_nlink=5, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=388, st_atime=2018/06/19-15:11:03, st_mtime=2016/12/05-14:43:44, st_ctime=2018/06/19-15:11:01}) = 0 <0.000017>
16:23:19.813105 write(1, "srwxr-xr-x 1 root root     0 10\346"..., 88) = 88 <0.000024>
16:23:19.813153 stat("/etc/localtime", {st_dev=makedev(252, 1), st_ino=1875, st_mode=S_IFREG|0644, st_nlink=5, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=388, st_atime=2018/06/19-15:11:03, st_mtime=2016/12/05-14:43:44, st_ctime=2018/06/19-15:11:01}) = 0 <0.000017>
16:23:19.813206 write(1, "srwxr-xr-x 1 root root     0 10\346"..., 88) = 88 <0.000024>
16:23:19.813254 stat("/etc/localtime", {st_dev=makedev(252, 1), st_ino=1875, st_mode=S_IFREG|0644, st_nlink=5, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=388, st_atime=2018/06/19-15:11:03, st_mtime=2016/12/05-14:43:44, st_ctime=2018/06/19-15:11:01}) = 0 <0.000017>
16:23:19.813304 write(1, "srwxr-xr-x 1 root root     0 10\346"..., 95) = 95 <0.000024>
16:23:19.813351 stat("/etc/localtime", {st_dev=makedev(252, 1), st_ino=1875, st_mode=S_IFREG|0644, st_nlink=5, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=388, st_atime=2018/06/19-15:11:03, st_mtime=2016/12/05-14:43:44, st_ctime=2018/06/19-15:11:01}) = 0 <0.000017>
16:23:19.813406 write(1, "srw------- 1 root root     0 10\346"..., 85) = 85 <0.000025>
16:23:19.813458 stat("/etc/localtime", {st_dev=makedev(252, 1), st_ino=1875, st_mode=S_IFREG|0644, st_nlink=5, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=388, st_atime=2018/06/19-15:11:03, st_mtime=2016/12/05-14:43:44, st_ctime=2018/06/19-15:11:01}) = 0 <0.000017>
16:23:19.813510 write(1, "srwxrwxrwx 1 root root     0 8\346\234"..., 55) = 55 <0.000024>
16:23:19.813559 stat("/etc/localtime", {st_dev=makedev(252, 1), st_ino=1875, st_mode=S_IFREG|0644, st_nlink=5, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=388, st_atime=2018/06/19-15:11:03, st_mtime=2016/12/05-14:43:44, st_ctime=2018/06/19-15:11:01}) = 0 <0.000019>
16:23:19.813610 write(1, "drwxr-xr-x 3 root root  4096 10\346"..., 73) = 73 <0.000024>
16:23:19.813658 stat("/etc/localtime", {st_dev=makedev(252, 1), st_ino=1875, st_mode=S_IFREG|0644, st_nlink=5, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=388, st_atime=2018/06/19-15:11:03, st_mtime=2016/12/05-14:43:44, st_ctime=2018/06/19-15:11:01}) = 0 <0.000017>
16:23:19.813707 write(1, "-rw-r--r-- 1 root root 43192 10\346"..., 58) = 58 <0.000024>
16:23:19.813754 stat("/etc/localtime", {st_dev=makedev(252, 1), st_ino=1875, st_mode=S_IFREG|0644, st_nlink=5, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=388, st_atime=2018/06/19-15:11:03, st_mtime=2016/12/05-14:43:44, st_ctime=2018/06/19-15:11:01}) = 0 <0.000019>
16:23:19.813806 write(1, "-rw-r--r-- 1 root root     0 7\346\234"..., 73) = 73 <0.000025>
16:23:19.813854 stat("/etc/localtime", {st_dev=makedev(252, 1), st_ino=1875, st_mode=S_IFREG|0644, st_nlink=5, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=388, st_atime=2018/06/19-15:11:03, st_mtime=2016/12/05-14:43:44, st_ctime=2018/06/19-15:11:01}) = 0 <0.000017>
16:23:19.813905 write(1, "srwxr-xr-x 1 root root     0 10\346"..., 71) = 71 <0.000026>
16:23:19.813955 stat("/etc/localtime", {st_dev=makedev(252, 1), st_ino=1875, st_mode=S_IFREG|0644, st_nlink=5, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=388, st_atime=2018/06/19-15:11:03, st_mtime=2016/12/05-14:43:44, st_ctime=2018/06/19-15:11:01}) = 0 <0.000017>
16:23:19.814003 write(1, "srwxr-xr-x 1 root root     0 10\346"..., 71) = 71 <0.000024>
16:23:19.814050 stat("/etc/localtime", {st_dev=makedev(252, 1), st_ino=1875, st_mode=S_IFREG|0644, st_nlink=5, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=388, st_atime=2018/06/19-15:11:03, st_mtime=2016/12/05-14:43:44, st_ctime=2018/06/19-15:11:01}) = 0 <0.000018>
16:23:19.814098 write(1, "srwxr-xr-x 1 root root     0 10\346"..., 71) = 71 <0.000023>
16:23:19.814145 stat("/etc/localtime", {st_dev=makedev(252, 1), st_ino=1875, st_mode=S_IFREG|0644, st_nlink=5, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=388, st_atime=2018/06/19-15:11:03, st_mtime=2016/12/05-14:43:44, st_ctime=2018/06/19-15:11:01}) = 0 <0.000019>
16:23:19.814197 write(1, "srwxr-xr-x 1 root root     0 10\346"..., 71) = 71 <0.000023>
16:23:19.814245 stat("/etc/localtime", {st_dev=makedev(252, 1), st_ino=1875, st_mode=S_IFREG|0644, st_nlink=5, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=388, st_atime=2018/06/19-15:11:03, st_mtime=2016/12/05-14:43:44, st_ctime=2018/06/19-15:11:01}) = 0 <0.000018>
16:23:19.814297 write(1, "srwxr-xr-x 1 root root     0 10\346"..., 71) = 71 <0.000024>
16:23:19.814345 stat("/etc/localtime", {st_dev=makedev(252, 1), st_ino=1875, st_mode=S_IFREG|0644, st_nlink=5, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=388, st_atime=2018/06/19-15:11:03, st_mtime=2016/12/05-14:43:44, st_ctime=2018/06/19-15:11:01}) = 0 <0.000018>
16:23:19.814393 write(1, "srwxr-xr-x 1 root root     0 10\346"..., 97) = 97 <0.000026>
16:23:19.814453 stat("/etc/localtime", {st_dev=makedev(252, 1), st_ino=1875, st_mode=S_IFREG|0644, st_nlink=5, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=388, st_atime=2018/06/19-15:11:03, st_mtime=2016/12/05-14:43:44, st_ctime=2018/06/19-15:11:01}) = 0 <0.000017>
16:23:19.814503 write(1, "srwxr-xr-x 1 root root     0 10\346"..., 97) = 97 <0.000024>
16:23:19.814553 stat("/etc/localtime", {st_dev=makedev(252, 1), st_ino=1875, st_mode=S_IFREG|0644, st_nlink=5, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=388, st_atime=2018/06/19-15:11:03, st_mtime=2016/12/05-14:43:44, st_ctime=2018/06/19-15:11:01}) = 0 <0.000017>
16:23:19.814608 write(1, "srwxr-xr-x 1 root root     0 10\346"..., 97) = 97 <0.000024>
16:23:19.814655 stat("/etc/localtime", {st_dev=makedev(252, 1), st_ino=1875, st_mode=S_IFREG|0644, st_nlink=5, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=388, st_atime=2018/06/19-15:11:03, st_mtime=2016/12/05-14:43:44, st_ctime=2018/06/19-15:11:01}) = 0 <0.000016>
16:23:19.814703 write(1, "srwxr-xr-x 1 root root     0 10\346"..., 97) = 97 <0.000024>
16:23:19.814750 stat("/etc/localtime", {st_dev=makedev(252, 1), st_ino=1875, st_mode=S_IFREG|0644, st_nlink=5, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=388, st_atime=2018/06/19-15:11:03, st_mtime=2016/12/05-14:43:44, st_ctime=2018/06/19-15:11:01}) = 0 <0.000016>
16:23:19.814798 write(1, "srwxr-xr-x 1 root root     0 10\346"..., 97) = 97 <0.000025>
16:23:19.814848 stat("/etc/localtime", {st_dev=makedev(252, 1), st_ino=1875, st_mode=S_IFREG|0644, st_nlink=5, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=388, st_atime=2018/06/19-15:11:03, st_mtime=2016/12/05-14:43:44, st_ctime=2018/06/19-15:11:01}) = 0 <0.000017>
16:23:19.814898 write(1, "srwxr-xr-x 1 root root     0 10\346"..., 97) = 97 <0.000024>
16:23:19.814945 stat("/etc/localtime", {st_dev=makedev(252, 1), st_ino=1875, st_mode=S_IFREG|0644, st_nlink=5, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=388, st_atime=2018/06/19-15:11:03, st_mtime=2016/12/05-14:43:44, st_ctime=2018/06/19-15:11:01}) = 0 <0.000016>
16:23:19.814995 write(1, "srwxr-xr-x 1 root root     0 10\346"..., 97) = 97 <0.000024>
16:23:19.815045 stat("/etc/localtime", {st_dev=makedev(252, 1), st_ino=1875, st_mode=S_IFREG|0644, st_nlink=5, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=388, st_atime=2018/06/19-15:11:03, st_mtime=2016/12/05-14:43:44, st_ctime=2018/06/19-15:11:01}) = 0 <0.000018>
16:23:19.815094 write(1, "srwxr-xr-x 1 root root     0 10\346"..., 97) = 97 <0.000024>
16:23:19.815177 stat("/etc/localtime", {st_dev=makedev(252, 1), st_ino=1875, st_mode=S_IFREG|0644, st_nlink=5, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=388, st_atime=2018/06/19-15:11:03, st_mtime=2016/12/05-14:43:44, st_ctime=2018/06/19-15:11:01}) = 0 <0.000021>
16:23:19.815242 write(1, "srwxr-xr-x 1 root root     0 10\346"..., 97) = 97 <0.000024>
16:23:19.815291 stat("/etc/localtime", {st_dev=makedev(252, 1), st_ino=1875, st_mode=S_IFREG|0644, st_nlink=5, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=388, st_atime=2018/06/19-15:11:03, st_mtime=2016/12/05-14:43:44, st_ctime=2018/06/19-15:11:01}) = 0 <0.000019>
16:23:19.815344 write(1, "srwxr-xr-x 1 root root     0 10\346"..., 97) = 97 <0.000024>
16:23:19.815393 stat("/etc/localtime", {st_dev=makedev(252, 1), st_ino=1875, st_mode=S_IFREG|0644, st_nlink=5, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=388, st_atime=2018/06/19-15:11:03, st_mtime=2016/12/05-14:43:44, st_ctime=2018/06/19-15:11:01}) = 0 <0.000017>
16:23:19.815450 write(1, "drwxr-xr-x 2 root root  4096 10\346"..., 63) = 63 <0.000024>
16:23:19.815498 stat("/etc/localtime", {st_dev=makedev(252, 1), st_ino=1875, st_mode=S_IFREG|0644, st_nlink=5, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=388, st_atime=2018/06/19-15:11:03, st_mtime=2016/12/05-14:43:44, st_ctime=2018/06/19-15:11:01}) = 0 <0.000017>
16:23:19.815545 write(1, "drwxr-xr-x 2 root root  4096 10\346"..., 64) = 64 <0.000025>
16:23:19.815596 stat("/etc/localtime", {st_dev=makedev(252, 1), st_ino=1875, st_mode=S_IFREG|0644, st_nlink=5, st_uid=0, st_gid=0, st_blksize=4096, st_blocks=8, st_size=388, st_atime=2018/06/19-15:11:03, st_mtime=2016/12/05-14:43:44, st_ctime=2018/06/19-15:11:01}) = 0 <0.000018>
16:23:19.815646 write(1, "drwxr-xr-x 2 root root  4096 10\346"..., 58) = 58 <0.000024>
16:23:19.815698 close(1)                = 0 <0.000015>
16:23:19.815734 munmap(0x7f5d49fdc000, 4096) = 0 <0.000019>
16:23:19.815774 close(2)                = 0 <0.000015>
16:23:19.815823 exit_group(0)           = ?
16:23:19.815922 +++ exited with 0 +++
```

我们可以看到在 152 行可以看到执行了 poll 系统调用，去等对端回送数据。而如果操作的是物理机，那么其实也就是 opendir 、write 再加上鉴权那几个系统调用。

