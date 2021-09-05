---
title: linux删除n天前的日志
date: 2020-10-18 19:54:54
categories:
- 组件学习
tags:
- 删除日志
---

## linux 删除n天前的日志

删除文件命令： find 对应目录 -mtime +天数 -name "文件名" -exec rm -rf {};

例如：find /opt/soft/log -mtime +30 -name "* .log" -exec rm -rf {};

说明：将/opt/soft/log 目录下所有30天前带“.log”的文件删除

可以将这个语句写在shell脚本中，然后设置cron调度执行，让系统自动去清理想关文件。

shell 脚本如下：

#!/bin/sh

find /opt/soft/log -mtime +30 -name "*.log" -exec rm -rf {};

添加到cron中 crontab -e

10 0 * * * /opt/soft/log/auto-del-30-days-log.sh >/dev/null 2>&1

