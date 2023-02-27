---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

http://jartto.wang/2016/09/28/check-the-system-port-of-mac/

### lsof 
#命令格式：lsof -i :端口
lsof -i:8080

### netstat
#列出所有端口
netstat 

#列出所有 tcp 端口 
netstat -at

#显示网络接口列表
netstat -i

#显示网络工作信息统计表
netstat -s

#显示伪装的网络连线
netstat -m

#显示核心路由信息
netstat -r

#显示合并的信息
netstat -rs
routing:
       	0 bad routing redirects
       	0 dynamically created routes
       	0 new gateways due to redirects
       	4294944612 destinations found unreachable
       	0 uses of a wildcard route
       	8 routes not in table but not freed