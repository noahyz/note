---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

### Pod

### 1. Pod基本概念

1. 最小部署单元
2. 包含一个或多个容器（一组容器的集合）
3. 一个pod中容器共享网络命名空间
4. pod 是短暂的

#### 2. Pod存在意义

1. 创建容器使用docker，一个docker对应一个容器，一个容器有进程，一个容器运行一个应用程序
2. Pod是多进程设计，运行多个应用程序。一个Pod有多个容器，一个容器里面运行一个应用程序
3. Pod存在为了亲密性应用。两个应用之间进行交互、网络之间调用、两个应用需要频繁调用

#### 3. Pod实现机制

1. 共享网络

    容器本身之间互相隔离的（namespace、group）

    通过 Pause 容器，把其他业务容器加入到 Pause 容器里面，让所有业务容器在同一个名称空间中，可以实现网络共享

2. 共享存储

    持久化存储：Volumn 数据卷（日志数据、业务数据）

    引入数据卷的概念Volumn，使用数据卷进行持久化存储

#### 4. Pod镜像拉去策略

imagePullPolicy：三种策略

- IfNotPresent：默认值，镜像在宿主机上不存在时才拉取
- Always：每次创建Pod都会重新拉取一次镜像
- Never：Pod永远不会主动拉取镜像

#### 5. Pod资源限制

- resource：request（调度）、limit（最大）

#### 6. Pod重启策略

restartPolicy：三种策略

- Always：当容器终止退出后，总是重启容器，默认策略
- OnFailure：当容器异常退出（退出状态吗非0）时，才重启容器
- Never：当容器终止退出，从不重启容器

#### 7. 健康检查

- livenessProbe（存活检查）

    如果检查失败，将杀死容器，根据Pod的 restartPolicy 来操作

- readinessProbe（就绪检查）

    如果检查失败，kubenetes 会把Pod从service endpoints 中剔除

检查方式：Probe支持以下三种检查方式

- httpGet：发送HTTP请求，返回200-400范围状态吗为成功
- exec：执行shell命令返回状态吗是0为成功
- tcpSocket：发起 TCP socket 建立成功

#### 8. 创建Pod流程

1. 在master节点，创建pod命令出来之后，通过apiServer将其存储在 etcd上，scheduler 调度器通过调度算法将pod调度到某个node节点上
2. 在node节点，kubelet 通过apiServer 读取到etcd 拿到分配给当前节点pod的信息，然后 docker 创建容器

#### 9. Pod调度

影响调度的属性

1. Pod 资源限制对Pod调用产生影响（根据resource-request 找到足够node节点进行调度）

2. 节点选择器标签影响Pod调度（nodeSelector -> env_role: dev ）

    首先对节点创建标签（别名）

    ````shell
    kubectl label node k8s.node1 env_role=prod
    [root@localhost ~]# kubectl get nodes k8s.node1 --show-labels
    NAME        STATUS   ROLES    AGE     VERSION   LABELS
    k8s.node1   Ready    <none>   6h47m   v1.18.0   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/os=linux,env_role=prod,kubernetes.io/arch=amd64,kubernetes.io/hostname=k8s.node1,kubernetes.io/os=linux
    ````

3. 节点亲和性影响Pod调度

    节点亲和性：nodeAffinity 和之前 nodeSeletor 基本是一样的，根据节点上标签约束来决定Pod调度到那个node上

    1）硬亲和性：约束条件必须满足

    2）软亲和性：尝试满足，不保证

    支持常用操作符：In NotIn  Exists  Gt  Lt  DoesNotExists 

    3）反亲和性：

4. 污点

    Taint 污点：节点不做普通分配调度，是节点属性

    应用场景：专用节点、配置特点硬件节点、基于 Taint 驱逐

    具体演示：	

    ```shell
    # 查看污点情况
    [root@localhost ~]# kubectl describe node k8s.master | grep Taint
    Taints:             node-role.kubernetes.io/master:NoSchedule
    ```

    污点值有三个：NoSchedule（这个节点一定不被调度）、ProferNoSchdule（尽量不被调度）、NoExecute（不会调度，并且还会驱逐Node已有Pod）

    为节点添加污点： 

    ```shell
    kubectl taint node [node] key=value: 污点的三个值
    [root@localhost ~]# kubectl taint node k8s.node1 env_role=yes:NoSchedule
    node/k8s.node1 tainted
    [root@localhost ~]# kubectl describe node k8s.node1 | grep Taint
    Taints:             env_role=yes:NoSchedule
    [root@localhost ~]# kubectl describe node k8s.node2 | grep Taint
    Taints:             <none>
    [root@localhost ~]# kubectl create deployment web --image=nginx
    deployment.apps/web created
    [root@localhost ~]# kubectl get pods -o wide
    NAME                   READY   STATUS    RESTARTS   AGE   IP           NODE        NOMINATED NODE   READINESS GATES
    web-5dcb957ccc-sdncg   1/1     Running   0          8s    10.244.2.5   k8s.node2   <none>           <none>
    [root@localhost ~]# kubectl scale deployment web --replicas=5
    deployment.apps/web scaled
    [root@localhost ~]# kubectl get pods -o wide
    NAME                   READY   STATUS              RESTARTS   AGE   IP           NODE        NOMINATED NODE   READINESS GATES
    web-5dcb957ccc-4c92k   1/1     Running             0          10s   10.244.2.6   k8s.node2   <none>           <none>
    web-5dcb957ccc-4fk6s   0/1     ContainerCreating   0          10s   <none>       k8s.node2   <none>           <none>
    web-5dcb957ccc-5r97l   0/1     ContainerCreating   0          10s   <none>       k8s.node2   <none>           <none>
    web-5dcb957ccc-htzhl   1/1     Running             0          10s   10.244.2.7   k8s.node2   <none>           <none>
    web-5dcb957ccc-sdncg   1/1     Running             0          45s   10.244.2.5   k8s.node2   <none>           <none>
    ```

    删除污点

    ```shell
    [root@localhost ~]# kubectl taint node k8s.node1 env_role:NoSchedule-
    node/k8s.node1 untainted
    [root@localhost ~]# kubectl describe node k8s.node1 | grep Taint
    Taints:             <none>
    ```

5. 污点容忍

    ```yaml
    spec:
      tolerations:
      - key: "key"
        operator: "Equal"
        value: "value"
        effect: "NoSchedule"
    ```

    