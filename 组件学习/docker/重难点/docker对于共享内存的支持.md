---
title: docker容器对共享内存的支持
---

我们在物理机时代，对于进程间通信，我们会经常想到使用共享内存，因为可以做到一块共享内存可以做到被映射到多个进程的虚拟地址空间，从而实现进程间通信比较快速。并且进程退出后，共享内存还在，并不会归还给操作系统。这样在一定程序上做到了数据的持久性。

进入 docker 时代，程序的部署、发布一般都采用 k8s、docker 等这种云上技术，本文探讨一下 docker 容器对于共享内存的支持。

### 一、提出问题

1. 不同的容器之间，“共享内存” 是否隔离？
2. 容器中创建的 “共享内存”，在宿主机中是否可见？
3. 容器退出之后，“共享内存” 还能保持嘛？容器重启后，还能找到之前创建的 “共享内存” 嘛？

我们怀抱着这些问题，先写 demo 进行测试

### 二、测试验证

#### 1. 前提准备

我们有一个程序 `shm_wr.cpp`，用于创建共享内存并且写共享内存。将一段字符串写入到共享内存中。如下展示

```c++
#include <string.h>
#include <errno.h>
#include "sys/shm.h"
#include <iostream>
#include <string>

#define SHM_KEY 20231125
#define SHM_SIZE 1024

int shm_wr(const std::string& write_str) {
    int shm_id = shmget(SHM_KEY, SHM_SIZE, IPC_CREAT | 0666);
    if (shm_id < 0) {
        std::cerr << "shmget failed, errno: " << errno << " msg: " << strerror(errno) << std::endl;
        return -1;
    }
    void* p_shm = shmat(shm_id, NULL, 0);
    if (p_shm == (void*)-1) {
        std::cerr << "shmat failed, errno: " << errno << " msg: " << strerror(errno) << std::endl;
        return -2;
    }
    char* p_str = (char*)p_shm;
    for (int i = 0; i < SHM_SIZE-1 && i < write_str.size(); i++) {
        *p_str++ = write_str[i];
    }
    *p_str = '\0';
    return 0;
}

int main(int argc, char** argv) {
    if (argc != 2) {
        std::cerr << "place input str, example: ./shm_wr abcd" << std::endl;
        return -1;
    }
    char* p_str = argv[1];
    if (shm_wr(p_str) < 0) {
        std::cout << "shm write failed" << std::endl;
        return 0;
    }
    std::cout << "shm write success" << std::endl;
    return 0;
}
```

还有一段程序 `shm_rd.cpp`，我们用于从共享内存中读出数据，如下：

```c++
#include <string.h>
#include <errno.h>
#include <iostream>
#include "sys/shm.h"

#define SHM_KEY 20231125
#define SHM_SIZE 1024

int shm_rd() {
    int shm_id = shmget(SHM_KEY, SHM_SIZE, 0666);
    if (shm_id < 0) {
        std::cerr << "shmget failed, errno: " << errno << " msg: " << strerror(errno) << std::endl;
        return -1;
    }
    void* p_shm = shmat(shm_id, NULL, 0);
    if (p_shm == (void*)-1) {
        std::cerr << "shmat failed, errno: " << errno << " msg: " << strerror(errno) << std::endl;
        return -2;
    }
    char* p_str = (char*)p_shm;
    for (int i = 0; i < SHM_SIZE-1; i++) {
        char tmp = *(p_str+i);
        if (tmp == '\0') {
            break;
        }
        std::cout << tmp << " ";
    }
    std::cout << std::endl;
    return 0;
}

int main() {
    if (shm_rd() < 0) {
        std::cout << "shm read failed" << std::endl;
        return -1;
    }
    std::cout << "shm read success" << std::endl;
    return 0;
}
```

分别将这两个程序进行编译，得到两个二进制：

```
g++ shm_wr.cpp -g -o shm_wr
g++ shm_rd.cpp -g -o shm_rd
```

然后我们再构建 docker image。如下是 Dockerfile。

```dockerfile
FROM ubuntu:22.04
MAINTAINER noahyzhang<13572252156.163.com>

COPY ./shm_wr /bin/
COPY ./shm_rd /bin/
```

接下来，使用 docker 命令：`docker build -t "shm_test:v1" ./` 

得到 docker image。此时我们就可以开始实验了。

#### 2. 测试实验

我们首先启动一个 container A，观察现象。命令：`docker run -it "shm_test:v1" /bin/bash`

然后在容器中，我们执行 shm_wr 这个二进制，创建共享内存，并且写入数据。命令：`shm_wr hello_world`。执行完此命令后，终端输出写入成功。然后我们在容器中查看共享内存是否创建。使用：`ipcs -m`

```
root@62e8cbc0e106:/# shm_wr hello_world
shm write success
root@62e8cbc0e106:/# ipcs -m

------ Shared Memory Segments --------
key        shmid      owner      perms      bytes      nattch     status      
0x0134b3d5 0          root       666        1024       0                       
```

我们看到共享内存创建成功。然后使用 shm_rd 去读取此共享内存。

```
root@62e8cbc0e106:/# shm_rd
h e l l o _ w o r l d 
shm read success
```

到这里，我们验证了共享内存的正常使用。

##### (1). 验证容器之间共享内存的隔离性

我们再启动一个 container B，命令依然是：`docker run -it "shm_test:v1" ./` 

进入容器后，先看看是否存在共享内存。通过 ipcs 命令和 shm_rd 二进制查看。

```
root@2c7572cba938:/# ipcs -m

------ Shared Memory Segments --------
key        shmid      owner      perms      bytes      nattch     status

root@2c7572cba938:/# shm_rd
shmget failed, errno: 2 msg: No such file or directory
shm read failed
```

发现并没有共享内存。然后在 container B 中，我们创建共享内存，并且写入数据。如下：

```
root@2c7572cba938:/# shm_wr nihao
shm write success
root@2c7572cba938:/# shm_rd
n i h a o
shm read success
root@2c7572cba938:/# ipcs -m

------ Shared Memory Segments --------
key        shmid      owner      perms      bytes      nattch     status
0x0134b3d5 0          root       666        1024       0
```

我们发现，容器 A 和 容器 B 的共享内存互相之间不可见。也就是说**容器之间共享内存是隔离的**。

##### (2). 宿主机是否可以看到容器中创建的共享内存

我们在宿主机中使用 ipcs 命令，或者 shm_rd 程序去读取共享内存。很明显，是读不到的

```
# ipcs -m
------ Shared Memory Segments --------
key        shmid      owner      perms      bytes      nattch     status

# ./shm_rd
shmget failed, errno: 2 msg: No such file or directory
shm read failed
```

说明**容器中创建的共享内存对宿主机不可见**

##### (3). 容器重启，共享内存是否还存在

我们对容器进行重启。然后查看共享内存是否存在

```
# 查看当前处于运行中的容器
$ docker ps
CONTAINER ID   IMAGE          COMMAND       CREATED       STATUS       PORTS     NAMES
2c7572cba938   b7fb738ad243   "/bin/bash"   2 hours ago   Up 2 hours             loving_curie
62e8cbc0e106   b7fb738ad243   "/bin/bash"   2 hours ago   Up 2 hours             jovial_ganguly

# 停止这两个容器
# docker stop 2c7572cba938
2c7572cba938
# docker stop 62e8cbc0e106
62e8cbc0e106

# 开始这两个容器
# docker start 2c7572cba938
2c7572cba938
# docker start 62e8cbc0e106
62e8cbc0e106

# 查看容器已经运行起来了
# docker ps
CONTAINER ID   IMAGE          COMMAND       CREATED       STATUS         PORTS     NAMES
2c7572cba938   b7fb738ad243   "/bin/bash"   2 hours ago   Up 8 seconds             loving_curie
62e8cbc0e106   b7fb738ad243   "/bin/bash"   2 hours ago   Up 2 seconds             jovial_ganguly

# 链接容器
# docker attach 2c7572cba938
# 进入到了容器中了
root@2c7572cba938:/# ipcs -m
------ Shared Memory Segments --------
key        shmid      owner      perms      bytes      nattch     status

root@2c7572cba938:/# shm_rd
shmget failed, errno: 2 msg: No such file or directory
shm read failed
```

此时我们发现重启后的容器已经没有这个共享内存的对象了。也就是说，当容器 stop 后，就相当于我们物理机关机，docker 将该容器对应的共享内存资源给清理的。**容器重启后，之前创建的共享内存会被清理**。

### 三、小结

同时，我们在以上的测试中。也发现，在不同的容器中，使用同一个 SHM_KEY，创建的共享内存的 key 是相同的，这是因为使用了相同的计算 key 的算法。如果在单个容器中，共享内存的 key 会保证唯一。

本文我们验证了 docker 对共享内存的支持。有三个结论：

- 不同容器之间，共享内存是隔离的
- 容器与宿主机之间，共享内存是隔离的
- 容器重启后，之前创建的共享内存会被清理

docker 是如何实现对共享内存的支持，我们后面再来对原理进行深究。