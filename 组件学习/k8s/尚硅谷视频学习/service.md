---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

## Service

定义一组Pod的访问规则

### 一、 Service 存在意义

1. 防止Pod失联（服务发现）
2. 定义一组Pod访问策略（负载均衡）

### 二、Pod和Service关系

根据 label 和 selector 标签建立关联的。通过service 实现 Pod 的负载均衡

### 三、常用的 Service 类型

1. ClusterIP：集群内部进行使用
2. NodePort：对外访问应用使用
3. LoadBalancer：对外访问应用使用，公有云

node 一般内网部署应用，外网一般不能访问的。一般找到一台可以进行外网访问机器，安装nginx，反向代理，然后手动把可以访问节点添加到nginx里面。

