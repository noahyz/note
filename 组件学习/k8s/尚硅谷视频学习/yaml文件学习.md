---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

### 一、yaml文件

#### 1. 语法格式

1. 使用空格做为缩进，通过缩进表示层级关系，一般开头两个空格，字符后一个空格，比如冒号，逗号等后面
2.  缩进的空格数目不重要，只要相同层级的元素左侧对齐即可
3. 低版本缩进时不允许使用 Tab 键，只允许使用空格
4. 使用#标识注释，从这个字符一直到行尾，都会被解释器忽略
5. 使用 --- 表示新的 yaml 文件开始

#### 2. yaml文件组成部分

1. 控制器定义
2. 被控制对象

```yaml
# 控制器定义
apiVersion: apps/v1
kind: Deployment
metadata: 
  name: nginx-deployment
  namespace: default
spec: 
  replicas: 3
  selector:
    matchLabels: 
      app: nginx
    # 被控制器定义
    template:
      metadata: 
        labels: 
          app: nginx
        spec: 
          containers: 
          - name: nginx
            image: nginx:latest 
            ports: 
```

### 二、如何快速编写yaml文件

1. 使用 kubectl create 命令生产 yaml 文件

    ```shell
    # -o 生成yaml文件   -dry-run 尝试运行，只是检测yaml是否正确
    [root@localhost ~]# kubectl create deployment web --image=nginx -o yaml --dry-run
    W1127 00:09:35.337675   34208 helpers.go:535] --dry-run is deprecated and can be replaced with --dry-run=client.
    ```

    ```yaml
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      creationTimestamp: null
      labels:
        app: web
      name: web
    spec:
      replicas: 1
      selector:
        matchLabels:
          app: web
      strategy: {}
      template:
        metadata:
          creationTimestamp: null
          labels:
            app: web
        spec:
          containers:
          - image: nginx
            name: nginx
            resources: {}
    status: {}
    ```

2. 使用 kubectl get 命令导出 yaml 文件 

    ```shell
    # 已经部署好的资源将 yaml 文件导出来
    kubectl get deploy nginx -o=yaml --export > m2.yaml
    ```

