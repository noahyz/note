---
title: 设置 core_pattern
---

## 设置 core_pattern

我们的程序 core 之后，我们想要得到 core dump 文件。一般需要设置 core 文件大小；然后设置 core 文件位置。

使用 `ulimit -c` 查看 core 文件大小。使用 `ulimit -c unlimited` 设置允许 core 文件的大小。

设置 core 文件位置。在 ubuntu 上，

```
cat /etc/sysctl.conf
向这个文件写入
kernel.core_pattern = ./core.%e.%p.%t
sudo sysctl -p
```

在 ubuntu 上，系统的 apport 服务将其自身注册为系统的核心转储处理程序，他强制覆盖用户在 `/etc/sysctl.conf` 中指定的设置，并且不使用 `/etc/sysctl.d` 。apport 的功能是上报内部错误，关闭后不影响 ubuntu 系统的正常工作。因此我们手动关闭 apport 服务

Ubuntu 18.04

```
sudo systemctl stop apt-daily.timer
sudo systemctl stop apt-daily.service

sudo systemctl stop apt-daily-upgrade.timer
sudo systemctl stop apt-daily-upgrade.service

sudo systemctl disable apt-daily.service
sudo systemctl disable apt-daily.timer
sudo systemctl disable apt-daily-upgrade.timer
sudo systemctl disable apt-daily-upgrade.service

systemctl stop apport.service
systemctl disable apport.service
sed -i 's@enabled=1@enabled=0@g' /etc/default/apport  # 永久关闭

sysctl -p
```

