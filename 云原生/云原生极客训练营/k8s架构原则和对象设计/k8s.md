
### 什么是 K8s
谷歌开源的容器集群管理系统，主要功能包括：
1. 基于容器的应用部署、维护和滚动升级
2. 负载均衡和服务发现
3. 跨机器和跨地区的集群调度
4. 自动伸缩
5. 无状态服务和有状态服务
6. 插件机制保证扩展性

框架：鼓励无状态应用

etcd: 基于 Raft 协议的分布式数据库

kubectl 的命令原理：通过读取 ～/.kube/config 配置文件，拿到访问地址、用户名和密码，然后拼接请求body，curl 访问 api_server，得到返回，然后处理返回，得到结果

kubectl get namespace
kubectl get namespace  namespaceName -oyaml 获取一个对象的细节
kubectl get ns nsName -w watch 监听某个对象，该对象的后续变化
kubectl get pod -owide  多输出几个字段，比如IP

kubectl describe 
kubectl exec -it podName -- bash 
kubectl logs -f podName 看的是容器中的标准输出/标准错误
kubectl exec -it xxx -- tail -f /xxx  看容器中的日志

