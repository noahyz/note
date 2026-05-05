---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

## Docker 命令需要 sudo 的问题

### 一、问题的由来

Docker 的守护线程绑定的是 unix socket。这个套接字默认属于 root，其他用户可以通过 sudo 去访问这个套接字文件。所以 docker 服务进程都是以 root 账户运行

### 二、解决问题

创建 docker 用户组，把用户加入到 docker 用户组里面。只要 docker 组里的用户都可以执行 docker 命令

1. 查看是否有 docker 用户组

   ```
   cat /etc/group | grep docker
   ```

2. 如果没有 docker 用户组，则创建

   ```
   sudo groupadd docker
   ```

3. 将用户加入到用户组

   ```
   sudo usermod -aG docker 用户名
   cat /etc/group    # 检查是否加入成功
   ```

4. 重启 dockerd

   ```
   sudo systemctl restart docker
   ```

5. 给 docker.sock 添加权限

   ```
   sudo chmod a+rw /var/run/docker.sock 
   ```

   