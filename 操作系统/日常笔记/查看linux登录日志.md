---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

## 查看 Linux 的登录日志

### 一、lastlog：列出所有用户最近登录的信息

lastlog 使用的是 `/var/log/lastlog` 文件中的内容，包括 `login-name、port、last login time` 等

```
➜ lastlog
Username         Port     From             Latest
root             pts/7    10.21.19.45      Wed Aug 10 19:04:47 +0800 2022
mysql            pts/3                     Sun Aug  9 17:11:52 +0800 2020
user_00          pts/4                     Fri Dec  3 22:23:34 +0800 2021
noahyzhang       pts/8                     Thu Dec 16 16:22:11 +0800 2021
```

### 二、last 列出当前和曾经登入系统的用户信息

last 默认读取的是 `/var/log/wtmp` 文件的信息。输出的内容包括：用户名、终端位置、登录源信息、开始时间、结束时间、持续时间。

注意最后一行输出的是 wtmp 文件起始记录的时间。当然也可以通过 `last -f` 参数指定读取文件，可以是/var/log/btmp、/var/run/utmp

```
# last
root     pts/7        10.21.19.45      Wed Aug 10 19:04   still logged in   
root     pts/6        10.21.19.45      Wed Aug 10 17:42   still logged in   
root     pts/6        10.21.19.45      Tue Aug  9 10:58 - 00:34  (13:35)    
...   
root     pts/10       10.21.19.34      Mon Aug  1 15:45 - 23:55  (08:10)  

wtmp begins Mon Nov 18 10:46:21 2019
```

使用举例：

```
last -x ：显示系统关闭、用户登录和退出的历史
last -i：显示特定ip登录的情况
last -t  20181010120101： 显示20181010120101之前的登录信息
```

### 三、lastb 列出登录失败的信息

lastb 和 last 命令功能完全相同，只不过它默认读取的是 `/var/log/btmp` 文件的信息。

当然也可以通过 `last -f` 参数指定读取文件，可以是 `/var/log/btmp、/var/run/utmp` 

```
# lastb
root     ssh:notty    10.21.15.49      Wed Aug 10 20:04 - 20:04  (00:00)    
root     ssh:notty    10.99.17.131     Wed Aug  3 19:32 - 19:32  (00:00)    
btmp begins Wed Aug  3 19:32:53 2022
```