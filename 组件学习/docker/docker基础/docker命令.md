## Docker的常用命令

### 一、镜像命令

#### 帮助命令

```shell
docker version  # 显示docker 版本信息
docker info # 显示docker 的系统信息，包括镜像和容器的数量
docker 命令 --help # 帮助命令
```

#### 镜像命令

docker images 查看所有本地的主机上的镜像

```shell
root@9-134-239-95:~# docker images
REPOSITORY                                                                  TAG                 IMAGE ID            CREATED             SIZE
hello-world                                                                 latest              feb5d9fea6a5        7 weeks ago         13.3kB

# 解释
REPOSITORY 镜像的仓库源
TAG 镜像的标签
IMAGE ID 镜像的ID
CREATED 镜像的创建时间
SIZE 镜像的大小

# 可选选项
-a, --all  # 列出所有镜像
-q, --quiet  # 只列出镜像的 IMAGE ID
```

docker search 搜索镜像

```shell
root@9-134-239-95:~# docker search mysql
NAME                              DESCRIPTION                                     STARS               OFFICIAL            AUTOMATED
mysql                             MySQL is a widely used, open-source relation…   11680               [OK]                
mariadb                           MariaDB Server is a high performing open sou…   4450                [OK]                
mysql/mysql-server                Optimized MySQL Server Docker images. Create…   867                                     [OK]
percona                           Percona Server is a fork of the MySQL relati…   561                 [OK]                
phpmyadmin                        phpMyAdmin - A web interface for MySQL and M…   369                 [OK]                
centos/mysql-57-centos7           MySQL 5.7 SQL database server                   91                                      
mysql/mysql-cluster               Experimental MySQL Cluster Docker images. Cr…   89                                      
centurylink/mysql                 Image containing mysql. Optimized to be link…   59                                      [OK]
databack/mysql-backup             Back up mysql databases to... anywhere!         52         

# 可选项，通过STARS 来过滤
--filter=STARS=3000  # 搜索出来的镜像就是 STARS 大于3000的
```

docker pull 下载镜像

```shell
# 下载镜像 docker pull 镜像名[:tag]
# 如果不写 tag， 默认就是 latest 
# 会分层下载，docker image 的核心（联合文件系统）
Digest：签名
docker pull docker.io/library/mysql:latest # 使用真实的地址下载也可 
```

docker rmi 删除镜像： i 就代表image 

```
docker rmi -f 镜像id 镜像id
docker rmi -f $(docker images -aq) # 删除全部的镜像 
```

### 二、容器命令

我们有了镜像才可以创建容器

#### 新建容器并启动

```
docker run [可选参数] image 

# 参数说明 
--name="Name"  容器名字 tomcat01
-d  以后台方式运行
-it  使用交互方式运行，进入容器查看内容
-p  指定容器的断开 -p 8080:8080 和主机进行映射
	-p ip:主机端口:容器端口
	-p 主机端口：容器端口（常用）
	-p 容器端口
-P   随机指定端口

docker run -it 镜像id /bin/bash
exit 退出容器命令 
```

#### 列出所有的运行的容器

```
docker ps 
-a # 列出当前正在运行的容器+带出历史运行过的容器
-n=？ # 显示最近创建的容器，个数
-q # 只显示容器的编号
```

#### 退出容器

```
exit  # 直接停止并退出容器
Ctrl + P + Q # 容器不停止退出
```

#### 删除容器

```
docker rm 容器id  # 删除指定容器,不能删除正在运行的容器，如果要强制删除，需要 -f 
docker rm -f $(docker ps -aq)  # 删除全部容器 
docker ps -a -q | xargs docker rm # 删除全部容器 
```

#### 启动和停止容器的操作

```
docker start 容器id  # 启动容器
docker restart 容器id  # 重启容器
docker stop 容器id  # 停止当前正在运行的容器
docker kill 容器id  # 强制停止当前容器 
```

### 三、常用的其他命令

#### 后台启动

```
docker run -d 镜像id
问题： docker ps，发现容器停止了
常用的坑：docker 容器使用后台运行，就必须要有一个前台进程，docker 发现没有应用，就会自动停止
# nginx，容器启动后，发现自己没有提供服务，就会立刻停止，就是没有程序了
```

#### 查看日志

```shell
docker logs 
```



