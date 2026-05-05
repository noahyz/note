---
title: sysdig 工具
---

## sysdig 工具

安装方法：

```
sudo apt install sysdig
或者
curl -s https://s3.amazonaws.com/download.draios.com/stable/install-sysdig | bash
```

sysdig 提供了 Chisels 功能，Chiesls（直译为凿子）是一组 Lua 脚本，提供高度封装的监控功能。`sysdig -cl` 命令列出当前支持的 Chiesls 列表，使用 `sysdig -c` 加上具体的 Chisels 名字即可使用。

以文件 IO 举个例子。

```
// 可以实时的按 IO 大小排列的文件名，可以很方便的定位到产出大磁盘 IO 的具体文件
sudo sysdig -c topfiles_bytes
```

文章：https://www.linuxidc.com/Linux/2014-12/110033.htm



