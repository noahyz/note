---
title: linux 系统日志分析
date: 2020-10-25 14:11:24
tags:
- linux 日志
---

想要分析 linux 系统遇到的各种各样的情况，那就需要多看日志。

大部分的 linux 默认的日志守护进程是 syslog，位于 /etc/syslog 或者 /etc/syslogd 或者 /etc/rsyslog.d。默认配置文件为 /etc/syslog.conf 或者 rsyslog.conf。任何希望生成日志的程序都可以向 syslog 发送消息。

默认的配置下，日志文件通常保存在 /var/log 目录下

#### 日志类型

一些常见的日志类型，但并不是所有的 linux 发行版都包含这些类型。

| 类型          | 说明                                                         |
| :------------ | :----------------------------------------------------------- |
| auth          | 用户认证时产生的日志，如login命令、su命令。                  |
| authpriv      | 与 auth 类似，但是只能被特定用户查看。                       |
| console       | 针对系统控制台的消息。                                       |
| cron          | 系统定期执行计划任务时产生的日志。                           |
| daemon        | 某些守护进程产生的日志。                                     |
| ftp           | FTP服务。                                                    |
| kern          | 系统内核消息。                                               |
| local0.local7 | 由自定义程序使用。                                           |
| lpr           | 与打印机活动有关。                                           |
| mail          | 邮件日志。                                                   |
| mark          | 产生时间戳。系统每隔一段时间向日志文件中输出当前时间，每行的格式类似于 May 26 11:17:09 rs2 -- MARK --，可以由此推断系统发生故障的大概时间。 |
| news          | 网络新闻传输协议(nntp)产生的消息。                           |
| ntp           | 网络时间协议(ntp)产生的消息。                                |
| user          | 用户进程。                                                   |
| uucp          | UUCP子系统。                                                 |

#### 日志优先级

| 优先级  | 说明                                                       |
| :------ | :--------------------------------------------------------- |
| emerg   | 紧急情况，系统不可用（例如系统崩溃），一般会通知所有用户。 |
| alert   | 需要立即修复，例如系统数据库损坏。                         |
| crit    | 危险情况，例如硬盘错误，可能会阻碍程序的部分功能。         |
| err     | 一般错误消息。                                             |
| warning | 警告。                                                     |
| notice  | 不是错误，但是可能需要处理。                               |
| info    | 通用性消息，一般用来提供有用信息。                         |
| debug   | 调试程序产生的信息。                                       |
| none    | 没有优先级，不记录任何日志消息。                           |

#### 常见的日志文件

系统日志是由一个名为 syslog 的服务管理的，如以下日志文件都是由 syslog 日志服务驱动的：

1. /var/log/boot.log：记录了系统在引导过程中发生的事件，就是Linux系统开机自检过程显示的信息

2. /var/log/lastlog ：记录最后一次用户成功登陆的时间、登陆IP等信息

3. /var/log/messages ：记录Linux操作系统常见的系统和服务错误信息

4. /var/log/secure ：Linux系统安全日志，记录用户和工作组变坏情况、用户登陆认证情况

5. /var/log/btmp ：记录Linux登陆失败的用户、时间以及远程IP地址

6. /var/log/syslog：只记录警告信息，常常是系统出问题的信息，使用lastlog查看

7. /var/log/wtmp：该日志文件永久记录每个用户登录、注销及系统的启动、停机的事件，使用last命令查看

8. /var/run/utmp：该日志文件记录有关当前登录的每个用户的信息。如 who、w、users、finger等就需要访问这个文件

9. /var/log/syslog 或 /var/log/messages 存储所有的全局系统活动数据，包括开机信息。基于 Debian 的系统如 Ubuntu 在 /var/log/syslog 中存储它们，而基于 RedHat 的系统如 RHEL 或 CentOS 则在 /var/log/messages 中存储它们。
10. /var/log/auth.log 或 /var/log/secure 存储来自可插拔认证模块(PAM)的日志，包括成功的登录，失败的登录尝试和认证方式。Ubuntu 和 Debian 在 /var/log/auth.log 中存储认证信息，而 RedHat 和 CentOS 则在 /var/log/secure 中存储该信息。