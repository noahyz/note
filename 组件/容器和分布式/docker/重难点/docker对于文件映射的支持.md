---
title: docker对于文件映射的支持
---

文件映射相当于将一个磁盘文件映射到内存中，通过 mmap 的方式，后面我们读写此文件的时候，就可以通过读写内存来操作此文件。本文我们测试一下通过 mmap 映射磁盘文件到内存中，docker 对其的支持情况。

### 一、提出问题

- 容器重启后，映射的文件是否可以保留
- 不同容器之间，容器与宿主机之间。文件是否可见

第二个问题很好回答，我们都知道，对于不同的容器环境，文件系统已经做了隔离。宿主机和容器之间也是。

### 二、测试验证

我们先来写两个程序，分别将磁盘文件映射到内存中。一个程序用于创建磁盘文件并写入数据，另一个程序则读取数据。

mmap_wr.cpp 程序用来创建一个磁盘文件，并且写入数据。如下：

```c++
#include <sys/mman.h>
#include <sys/types.h>
#include <fcntl.h>
#include <string.h>
#include <errno.h>
#include <unistd.h>
#include <iostream>
#include <string>

#define MMAP_SIZE 1024

int mmap_wr(const std::string& str) {
    int fd = open("./mmap.txt", O_RDWR | O_CREAT, S_IRUSR | S_IWUSR);
    if (fd < 0) {
        std::cerr << "open mmap.txt failed, errno: " << errno << " msg: " << strerror(errno) << std::endl;
        return -1;
    }
    lseek(fd, 500, SEEK_CUR);
    write(fd, "\0", 1);
    lseek(fd, 0, SEEK_SET);
    char* p_mmap;
    p_mmap = (char*)mmap((void*)p_mmap, MMAP_SIZE, PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0);
    if (!p_mmap) {
        std::cerr << "mmap failed, errno: " << errno << " msg: " << strerror(errno) << std::endl;
        return -2;
    }
    close(fd);
    for (int i = 0; i < MMAP_SIZE-1 && i < str.size(); i++) {
        *(p_mmap++) = str[i];
    }
    *p_mmap = '\0';
    return 0;
}

int main(int argc, char** argv) {
    if (argc != 2) {
        std::cout << "place input param, example: ./mmap_wr hello_world" << std::endl;
        return 0;
    }
    char* p_str = argv[1];
    if (mmap_wr(p_str) < 0) {
        std::cerr << "mmap write failed" << std::endl;
        return -1;
    }
    std::cout << "mmap write success" << std::endl;
    return 0;
}
```

mmap_rd.cpp 程序，读取这个磁盘文件中的数据。如下：

```c++
#include <sys/mman.h>
#include <sys/types.h>
#include <fcntl.h>
#include <string.h>
#include <errno.h>
#include <unistd.h>
#include <iostream>

#define MMAP_SIZE 1024

int mmap_rd() {
    int fd = open("./mmap.txt", O_RDONLY);
    if (fd < 0) {
        std::cerr << "open failed, errno: " << errno << " msg: " << strerror(errno) << std::endl;
        return -1;
    }
    char* p_mmap = (char*)mmap(p_mmap, MMAP_SIZE, PROT_READ, MAP_SHARED, fd, 0);
    if (!p_mmap) {
        std::cerr << "mmap failed, errno: " << errno << " msg: " << strerror(errno) << std::endl;
        return -2;
    }
    close(fd);
    char* p_str = p_mmap;
    for (int i = 0; i < MMAP_SIZE-1; i++) {
        char tmp = *(p_str + i);
        if (tmp == '\0') {
            break;
        }
        std::cout << tmp << " ";
    }
    std::cout << std::endl;
    return 0;
}

int main() {
    if (mmap_rd() < 0) {
        std::cerr << "mmap read failed" << std::endl;
        return -1;
    }
    std::cout << "mmap read success" << std::endl;
    return 0;
}
```

然后写 dockerfile，构建 docker 环境

```
FROM ubuntu:22.04
MAINTAINER noahyzhang<13572252156.163.com>


COPY ./mmap_wr /bin/
COPY ./mmap_rd /bin/
```

我们使用命令：`docker build -t "mmap_test:v1" ./` 来创建 docker 环境。

然后使用命令：`docker run -it "mmap_test:v1" /bin/bash`  进入 docker 环境。进行操作

```
# 创建文件，并且写入
root@69082a45e066:/# mmap_wr nihao
mmap write success

# 查看创建的文件
root@69082a45e066:/# ls -l mmap.txt 
-rw------- 1 root root 501 Nov 25 12:19 mmap.txt

# 查看文件内容
root@69082a45e066:/# cat mmap.txt 
nihao

# 使用文件映射查看文件内容
root@69082a45e066:/# mmap_rd 
n i h a o 
mmap read success
```

至此，功能一切正常，我们再来看，容器重启前后，此文件是否还存在。

先执行 `docker stop` ，然后再执行 `docker start`。再来查看此文件 mmap.txt 是否存在。我们发现此文件还是存在的，并且内容也还保存着。

即说明：容器重启，通过 mmap 映射的磁盘文件还存在。

我们再来深究一下，我们在宿主机上进行查找：

```
# sudo find / -name "mmap.txt" 2>/dev/null
/var/snap/docker/common/var-lib-docker/overlay2/eead50e410dd90ba505590681d70f7de590f8437b1da22dfe6a644b33ffa56d4/diff/mmap.txt
/var/snap/docker/common/var-lib-docker/overlay2/c1d0c7de6c69610bb0706859c46b9b526cdedf4d666c0f5721c6aad2750190fe/diff/mmap.txt
```

我们发现此文件存储在容器的可写文件系统中，因此即使容器重启，该文件也不会被删除，而是作为容器文件系统的一部分。

### 三、小结

本文通过测试，我们得到这么几点结论

- 容器的重启，mmap 映射的磁盘文件不会被删除
- 容器与容器、容器与宿主机之间，文件可以做到隔离，但非要在宿主机上找容器的文件，也能找到，不过没啥必要