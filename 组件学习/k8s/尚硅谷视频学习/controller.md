## Controller

#### 1. 什么是controller

在集群上管理和运行容器的对象

### 2. Pod 和 Controller 的关系

Pod 是通过controller 实现应用的运维，比如伸缩，滚动升级等等

Pod 和controller 之间通过label 标签建立关系

### 3. Deployment 控制器应用场景

1. 部署无状态应用

2. 管理Pod和 ReplicaSet
3. 部署，滚动升级等功能

一般用于 web服务，微服务

### 4. yaml 文件字段说明、使用yaml文件部署应用

1. 导出yaml文件 ` kubectl create deployment web --image=nginx --dry-run -o yaml > web.yamll `
2. 使用 yaml 文件部署应用 ` kubectl apply -f web.yamll `
3. 对外发布（暴露端口号）` kubectl expose deployment web --port=80 --type=NodePort --target-port=80 --name=web1 -o yaml > web1.yaml`
4. 对外发布 ` kubectl apply -f web1.yaml`

#### 5. Deployment 控制器部署应用

#### 6. 升级回滚

```shell
# 应用升级
kubectl set image deployment web nginx=nginx:1.15
# 查看升级版本
kubectl rollout history deployment web
# 查看升级状态
kubectl rollout status deployment web
# 回滚到上一个版本
kubectl collout undo deployment web
# 回滚到指定版本
kubectl rollout undo deployment web --to-revision=2 
```

#### 7. 弹性伸缩

```shell
kubectl scale deployment web --replicas=10 
```

### 8. 无状态和有状态应用

无状态

1. 认为pod都是一样的
2. 没有顺序要求
3. 不用考虑在那个 node 运行
4. 随意进行伸缩和扩展

有状态

1. 上面因素都需要考虑到
2. 让每个Pod独立的，保持Pod启动顺序和唯一性
3. 唯一的网络标识符，持久存储
4. 有序，比如mysql主从

#### 9. 部署有状态应用

无头 service：ClusterIP的值为none

Satefulset 部署有状态应用

#### 10. deployment 和statefuset 区别

statefueset：有身份的（唯一标识的）、根据主机名+按照一定规则生成域名

每个pod有唯一主机名、唯一域名

#### 11. 部署守护进程 DaemonSet

在每个node 上运行一个pod，新加入的node 也同样运行在一个pod里面

#### 12. job（一次性任务）

#### 13. cronjob（定时任务）