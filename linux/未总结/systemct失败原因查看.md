---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

**journalctl 用来查询 systemd-journald 服务收集到的日志。**systemd-journald 服务是 systemd init 系统提供的收集系统日志的服务。

journalctl -xefu kubelet 