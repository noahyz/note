## linux中的logsys 进程

## Linux 之 syslog 日志服务详解

syslog 和 rsyslog 是 Linux 下默认的日志守护进程。rsyslog 是 syslog 的升级版。同时 syslog 是标准协议，可以用来记录设备的日志。在UNIX系统，路由器、交换机等网络设备中，系统日志(System Log)记录系统中任何时间发生的大小事件。管理者可以通过查看系统记录，随时掌握系统状况。UNIX的系统日志是通过syslogd这个进程记录系统有关事件记录，也可以记录应用程序运作事件。通过适当的配置，我们还可以实现运行syslog协议的机器间通信，通过分析这些网络行为日志，藉以追踪掌握与设备和网络有关的状况。

## 一、syslog的配置文件

想要整体了解syslog，先从syslog的配置文件开始看起。 /etc/rsyslog.conf 是 rsyslog 守护进程启动时需要的配置文件。各版本内容有略微不同，但是整体大致都相同。

```
# rsyslog configuration file

# For more information see /usr/share/doc/rsyslog-*/rsyslog_conf.html
# If you experience problems, see http://www.rsyslog.com/doc/troubleshoot.html

#### MODULES ####
# 加载模块
# The imjournal module bellow is now used as a message source instead of imuxsock.
# 加载 imuxsock 模块，为本地系统登陆提供支持(例如通过logger命令)
$ModLoad imuxsock # provides support for local system logging (e.g. via logger command)
# 提供对systemd日志的访问
$ModLoad imjournal # provides access to the systemd journal
# 加载 imklog，为内核登陆提供支持
#$ModLoad imklog # reads kernel messages (the same are read from journald)
# 提供标记信息功能
#$ModLoad immark  # provides --MARK-- message capability

# 加载 UDP 模块，允许使用UDP的514端口接收采用UDP协议转发的日志
# Provides UDP syslog reception
#$ModLoad imudp
#$UDPServerRun 514

# 加载 TCP 模块，允许使用TCP的514端口接收采用TCP协议转发的日志
# Provides TCP syslog reception
#$ModLoad imtcp
#$InputTCPServerRun 514

#### GLOBAL DIRECTIVES ####
# 全局指令的配置
# Where to place auxiliary files
# 辅助文件目录
$WorkDirectory /var/lib/rsyslog

# Use default timestamp format
# 使用默认的时间戳格式
$ActionFileDefaultTemplate RSYSLOG_TraditionalFileFormat

# File syncing capability is disabled by default. This feature is usually not required,
# not useful and an extreme performance hit
# 文件同步功能，通常是被禁用的，这个功能通常不是必要的，会大幅影响性能
#$ActionFileEnableSync on

# Include all config files in /etc/rsyslog.d/
# 包含配置文件的目录，这个目录下的配置文件也是生效的
$IncludeConfig /etc/rsyslog.d/*.conf

# Turn off message reception via local log socket;
# local messages are retrieved through imjournal now.
# 通过本地消息日志套接字关闭消息接收，本地消息可以用imjournal检索
$OmitLocalLogging on

# File to store the position in the journal
# 在日志中文件用于存储的位置
$IMJournalStateFile imjournal.state

#### RULES ####
#RULES部分主要是对各种facility和level进行设置
#设置你想要接收的facility的何种level的日志消息

# Log all kernel messages to the console.
# Logging much else clutters up the screen.
# 将将所有的内核日志记录在界面，会造成屏幕混乱
#kern.*                                                 /dev/console

# Log anything (except mail) of level info or higher.
# Don't log private authentication messages!
# 将 info或者更高级别的消息送到这个文件，除了mail以外
# 其中 * 是通配符，代表任何设备，none表示不对任何级别的信息进行记录
# 同一行配置中，允许出现多个选择条件，多个选择条件使用 ; 隔开
*.info;mail.none;authpriv.none;cron.none                /var/log/messages

# The authpriv file has restricted access.
# 将 authpriv 设备的任何级别信息记录到这个文件中，这主要是一些权限相关的信息
authpriv.*                                              /var/log/secure

# Log all the mail messages in one place.
# 将 mail 设备中的任何级别的信息记录到这个文件，这主要是和电子邮件相关的信息
# 文件前的前缀表示可以避免日志的同步写入，某些时候对提升系统的性能有很大的帮助
mail.*                                                  -/var/log/maillog

# Log cron stuff
# 将 cron 设备中的任何级别的信息记录到这个文件，这主要是系统中定期执行的任务相关信息
cron.*                                                  /var/log/cron

# Everybody gets emergency messages
# 将任何级别的 emerg 级别的信息发送给所有正在系统上的用户
*.emerg                                                 :omusrmsg:*

# Save news errors of level crit and higher in a special file.
# uucp 和 news 设备的 crit 级别的信息记录到这个文件
uucp,news.crit                                          /var/log/spooler

# Save boot messages also to boot.log
# 将系统启动相关的信息记录在这个文件
local7.*                                                /var/log/boot.log

# ### begin forwarding rule ###
# 转发规则
# The statement between the begin ... end define a SINGLE forwarding
# rule. They belong together, do NOT split them. If you create multiple
# forwarding rules, duplicate the whole block!
# 远程日志可以使用 TCP 保持可靠
# Remote Logging (we use TCP for reliable delivery)
#
# 创建一个磁盘上的队列，如果远程的主机是关闭的状态，消息会先存储在磁盘中并且在远程主机启动时发送过去(TCP)
# An on-disk queue is created for this action. If the remote host is
# down, messages are spooled to disk and sent when it is up again.
# spool 文件 唯一的前缀
#$ActionQueueFileName fwdRule1 # unique name prefix for spool files
# 1gb的空间限制(尽量使用)
#$ActionQueueMaxDiskSpace 1g   # 1gb space limit (use as much as possible)
# 在关机的时候把信息存储在磁盘中
#$ActionQueueSaveOnShutdown on # save messages to disk on shutdown
# 异步运行
#$ActionQueueType LinkedList   # run asynchronously
# 如果远程主机宕机，将无限次重试
#$ActionResumeRetryCount -1    # infinite retries if host is down
# remote host is: name/ip:port, e.g. 192.168.0.1:514, port optional
# 远程的主机和端口,注意：若用UDP传输，则将@@改为@即可。
#*.* @@remote-host:514
# ### end of the forwarding rule ###
```

/etc/rsyslog.conf 的修改只是在 rsyslog 守护进程重新启动后才会生效。

该文件由不同程序或者消息分类的单个条目组成，每个占一行，对每类消息提供一个选择域和一个动作域。这些域由 tab 隔开：

* 选择域指明消息的类型和优先级

* 动作域指明 syslog 接收到一个与选择标准相匹配的消息时所执行的动作。

  | kern  | 内核                                     |
  | ----- | ---------------------------------------- |
  | user  | 用户程序                                 |
  | Damon | 系统守护进程                             |
  | Mail  | 电子邮件系统                             |
  | Auth  | 与安全权限相关的命令                     |
  | Lpr   | 打印机                                   |
  | News  | 新闻组信息                               |
  | Uucp  | Uucp程序                                 |
  | Cron  | 记录当前登陆的每个用户信息               |
  | wtmp  | 一个用户每次登陆进入和退出时间的永久记录 |

  补充：Authpriv：授权信息

  | emerg   | 最高的紧急程度状态 |
  | ------- | ------------------ |
  | alert   | 紧急状态           |
  | Cirt    | 重要信息           |
  | Warning | 警告               |
  | err     | 临界状态           |
  | notice  | 出现不寻常的事情   |
  | info    | 一般性消息         |
  | Debug   | 调试级信息         |
  | None    | 不记录任何日志信息 |

rsyslog 还有一个启动选项。在 /etc/sysconfig/rsyslog 里面，但是从rsysconfig v3就不推荐使用了，如果要使用，可以加上选项 -c2。

* -r：将当前主机作为日志服务器，监听514端口上进来的UDP包，接收远程系统的信息。没有该选项，将不会接收来自远程系统的信息。
* -m **：将默认的时间戳标记信息出现频率变为自己指定的值【eg： -m240，表示每240分钟在日志文件中增加一行时间戳消息】
* -x：表示不希望让中央日志服务器解析其他机器的FQDN（完全合格域名，指的是主机名+全路径）
例如：SYSLOGD_OPTIONS="-r -x -m 240 -c 5"

## 二、syslog 协议

Syslog协议[2]是一种用来在互联网协议（TCP/IP）的网络中传递记录档讯息的标准，属于一种主从式协议：syslog发送端发送一条文字信息到syslog接收端。

syslog消息格式：syslog消息主要分为 Priority、Head和Message三个部分

##### 1. Priority

##### 其中Priority是由两个部分组成---Facility、Level

* Facility表明该日志消息是由谁产生的，是内核kern？还是用户user？又或是邮件mail？不同的facility对应不同的代号，可通过man 3 syslog查看：
```
LOG_AUTHPRIV          security/authorization messages (private)
LOG_CRON              clock daemon (cron and at)
LOG_DAEMON            system daemons without separate facility value
LOG_FTP               ftp daemon
LOG_KERN              kernel messages (these can’t be generated from user processes)
LOG_LOCAL0 through LOG_LOCAL7		reserved for local use
LOG_LPR               line printer subsystem
LOG_MAIL              mail subsystem
LOG_NEWS              USENET news subsystem
LOG_SYSLOG            messages generated internally by syslogd(8)
LOG_USER (default)    generic user-level messages
LOG_UUCP              UUCP subsystem
```

* Level表明该日志消息的重要程度，是导致系统不能正常使用了的紧急级别emerg？还是需要被及时处理的警告级别alert？又或仅仅是需要调试的debug级别的信息？同样可通过man 3 syslog查看：
```
LOG_EMERG      system is unusable
LOG_ALERT      action must be taken immediately
LOG_CRIT       critical conditions
LOG_ERR        error conditions
LOG_WARNING    warning conditions
LOG_NOTICE     normal, but significant, condition
LOG_INFO       informational message
LOG_DEBUG      debug-level message
```

Facility和level分别定义了不同的代号，其各自的宏定义可见/usr/include/sys/syslog.h头文件，它们两者的组合构成了Priority头的值。而该priority的值也恰恰是syslog函数的第一个参数的值。

##### 2、Head

包括 时间戳、Host等等

##### 3、Message

消息内容

## 三、使用syslog接口调用syslog服务

#### 1、syslog API

linux C 中提供了一套系统日志写入的接口，主要涉及三个函数openlog，syslog，closelog。

* 打开一个syslog连接

```
#include <syslog.h>
void openlog(const char *ident, int option, int facility);
```

参数：

    * ident 指定的字符串会放入到相应的消息日志中


​    
    * option有如下选项
```
LOG_CONS              Write directly to system console if there is an error while sending to system logger.
LOG_NDELAY            Open the connection immediately
LOG_NOWAIT            Don’t  wait for child processes that may have been created while logging the message.
LOG_ODELAY            The converse of LOG_NDELAY; opening of the connection is delayed until syslog() is called.
LOG_PERROR            (Not in POSIX.1-2001.)  Print to stderr as well.
LOG_PID               Include PID with each message.打印的每一条日志信息包含当前进程的PID
```

    * facility 上面介绍了，下面是常用选项
```
LOG_USER：打印的每一条日志信息包含当前用户的等级信息
```

* 产生一条日志消息以特定的规则分发出去

```
#include <syslog.h>
void syslog(int priority, const char *format, ...);
```

参数:

    * priority 优先级，由facility和level的或运算组成；
    * format 格式化输出，类似于printf函数中的format参数。

* 关闭用来写日志记录的文件描述符

```
#include <syslog.h>
void closelog(void);
```
#### 2、一个简单的syslog例子

```
#include <stdio.h>
#include <syslog.h>
#include <stdlib.h>
int main(int argc,char* argv[])
{
    openlog(argv[0],LOG_CONS | LOG_PID, LOG_USER);
    int count = 0;
    while(1)
    {
        syslog(LOG_INFO, "%d, log info test ...", count);
        count++;
      	sleep(1);
    }
    closelog();
    return 0;
}
```

在 rsyslog 配置文件中添加一行内容如下

```
user.*			/var/log/user_message.log
```

重启 rsyslog 服务 systemctl restart rsyslog

执行这个syslog 例子。

cat user_message.log 就可以看到发送的消息内容

## 其他

扩展：也可以将这台机器上syslog日志发送到另一台机器的syslog进程并存储起来，只需要配置一下即可

注意：重点是学习syslog的配置文件，搞清楚系统日志，便于我们查找系统问题。

Linux下的syslog，它出现的目的并不是为了提供用户每个进程的日志输出，syslog只是用来作为对于服务管理的整套机制，它针对的是一类服务，用来做日志服务器，实现对整个系统网络中日志的维护（对日志的维护，实际上就是对整个计算机群的维护）。同时，真正的工程中，并不会使用syslog作为全套的日志管理工具，在Linux下有提供了很多完整的日志库工具，比如log4cplus、zlog等。
