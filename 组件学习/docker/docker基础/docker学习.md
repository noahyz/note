---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

## docker

### 简单使用容器

```
1. 进行交互式的容器
 docker run -i -t ubuntu:15.10 /bin/bash
-t：在新容器内指定一个伪终端或终端
-i：允许对容器内的标准输入（STDIN）进行交互
2. 启动容器（后台模式）
docker run -d ubuntu:15.10 /bin/sh -c "while true; do echo hello world; sleep 1; done"
输出：2b1b7a428627c51ab8810d541d759f072b4fc75487eed05812646b8534a2fe63
输出的长字符串是容器ID，
3. 容器运行
 docker ps
 container id: 容器ID
 image：使用的镜像
 command：启动容器时运行的命令
 created：容器的创建时间
 status：容器状态（created、restarting、running或up、removing、paused、exited、dead）
 ports：容器的端口信息和使用的连接类型（tcp/udp）
 names：自动分配的容器名称
 4. 停止容器
 docker stop container_id 
```

### 容器操作

```
2. 启动容器
docker run -it -d -P ubuntu /bin/bash
-d: 后台运行 docker 服务

端口 PORTS 对应关系：前面是主机IP+端口，后面容器端口
-P: 将容器内部使用的网络端口"随机"映射到我们使用的主机上
-p: 容器内部端口绑定到“指定”的主机网络地址+端口，ex：127.0.0.1:5000:5000 
默认绑定 tcp 端口，如果要绑定 UDP 端口，可以在端口后加上 /udp. ex: 127.0.0.1:5000:5000/udp 

启动一个已停止的容器: docker start container_id
重启一个容器: docker restart container_id
3. 进入容器
在使用 -d 参数时，容器启动后进行后台。此时想要进入容器，可以：
docker attach: 如果从这个容器退出，会导致容器的停止
docker exec: 推荐使用，因为退出容器终端，不会导致容器的停止 ex: docker exec -it container_id /bin/bash
4. 导出和导入容器
导出容器： docker export container_id > ubuntu.tar
导入容器： cat docker/ubantu.tar | docker import - test/ubuntu:v1
导入容器(指定url或目录): docker import http://example.com/exampleimage.tgz example/imagerepo
5. 删除容器
docker rm -f container_id
6. 查看端口的绑定情况
docker port container_id [port] 
```

### 镜像操作

```
1. 获取镜像
docker pull ubuntu
2. 列出镜像列表
docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
ubuntu              14.04               90d5884b1ee0        5 days ago          188 MB
REPOSITORY: 表示镜像的仓库源
TAG: 镜像的标签
IMAGE ID：镜像ID
CREATED：镜像创建时间
SIZE：镜像大小
3. 获取一个新的镜像
docker pull ubuntu:13.10
4. 查找镜像
docker search httpd 
5. 删除镜像
docker rmi image_name 
6. 创建镜像
构建镜像：需要一个 Dockerfile 文件，然后使用 docker build -t image_name . 
其中 -t 指定要创建的目标镜像名 
. 是 dockerfile 文件所在目录，可以指定 dockerfile 的绝对路径
7. 设置镜像标签
docker tag image_id image_name:tag_name
```

### 镜像仓库

```
1. 登录/登出
docker login [options] [server]
docker logout [options] [server]
options: -u：登录的用户名，-p：登录的密码
2. 从镜像仓库中拉取或者更新指定镜像
docker pull [options] NAME:[:TAG|@DIGEST]
options说明：-a：拉取所有tagged镜像 --disable-content-trust：忽略镜像的校验，默认开启
3. 将本地的镜像上传到镜像仓库，要先登录到镜像仓库
docker push [options] NAME[:TAG] 
options说明：--disable-content-trust: 忽略镜像的校验，默认开启
4. 从Docker Hub 查找镜像
docker search [options] term
options说明： 
--automated：只列出 automated build 类型的镜像
--no-trunc: 显示完整的镜像描述
-f <过滤条件>: 列出收藏数不小于指定值的镜像
返回说明
NAME: 镜像仓库源的名称
DESCRIPTION: 镜像的描述
OFFICIAL: 是否 docker 官方发布
stars: 类似 Github 里面的 star，表示点赞、喜欢的意思。
AUTOMATED: 自动构建。
```

### 本地镜像管理

- 1. 列出本地镜像

```
docker images [options] [repository[:tag]]
options说明：
-a：列出本地所有的镜像
--digests：显示镜像的摘要信息
-f：显示满足条件的镜像
--format：指定返回值的模版文件
--no-trunc：显示完整的镜像信息
-q：只显示镜像ID
ex：docker images ubuntu 
```

- 2. 使用 Dockerfile 创建镜像

```
docker build [options] path | url | - 
--build-arg=[] :设置镜像创建时的变量；
--cpu-shares :设置 cpu 使用权重；
--cpu-period :限制 CPU CFS周期；
--cpu-quota :限制 CPU CFS配额；
--cpuset-cpus :指定使用的CPU id；
--cpuset-mems :指定使用的内存 id；
--disable-content-trust :忽略校验，默认开启；
-f :指定要使用的Dockerfile路径；
--force-rm :设置镜像过程中删除中间容器；
--isolation :使用容器隔离技术；
--label=[] :设置镜像使用的元数据；
-m :设置内存最大值；
--memory-swap :设置Swap的最大值为内存+swap，"-1"表示不限swap；
--no-cache :创建镜像的过程不使用缓存；
--pull :尝试去更新镜像的新版本；
--quiet, -q :安静模式，成功后只输出镜像 ID；
--rm :设置镜像成功后删除中间容器；
--shm-size :设置/dev/shm的大小，默认值是64M；
--ulimit :Ulimit配置。
--squash :将 Dockerfile 中所有的操作压缩为一层。
--tag, -t: 镜像的名字及标签，通常 name:tag 或者 name 格式；可以在一次构建中为一个镜像设置多个标签。
--network: 默认 default。在构建期间设置RUN指令的网络模式
ex: docker build -t test/myapp . 
注意：后面有个点 
```





















