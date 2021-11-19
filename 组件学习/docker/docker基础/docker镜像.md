### Docker镜像

#### 镜像是什么

镜像是一种轻量级、可执行的独立软件包，用来打包软件运行环境和基于运行环境开发的软件，它包含运行某个软件所需的所有内容，包括代码、运行时、库、环境变量和配置文件

### Docker 镜像加载原理

> UnionFS（联合文件系统）

UnionFS（联合文件系统）：是一种分层、轻量级并且高性能的文件系统，它支持对文件系统的修改作为一次提供来一层层的叠加，同时可以将不同目录挂载到同一个虚拟文件系统下。Union 文件系统是Docker镜像的基础。镜像可以通过分层来进行继承，基于基础镜像（没有父镜像），可以制作各种具体的应用镜像。

特性：一次同时加载多个文件系统，但从外面看来，只能看到一个文件系统，联合加载会把各层文件系统叠加起来，这样最终的文件系统会包含所有底层的文件和目录

> Docker 镜像加载原理

docker 的镜像实际上由一层一层的文件系统组成，这种层级的文件系统UnionFS

bootfs（boot file system）主要包含 bootloader 和 kernel ，bootloader 主要是引导加载 kernel，linux 刚启动时会加载 bootfs 文件系统，在Docker 镜像的最底层是 bootfs。这一层与我们典型的 linux/Unix 系统是一样的，包含boot 加载器和内核。当 boot 加载完成之后整个内核都在内存中了，此时内存的使用权已由 bootfs 转交给内核，此时系统也会加载 bootfs。

rootfs（root file system），在bootfs 之上，包含的就是典型 Linux 系统中的 /dev、/proc、/bin、/etc 等标准目录和文件。rootfs 就是各种不同的操作系统发行版，比如 Ubuntu、centos等等

对于一个精简的OS，rootfs 可以很小，只需要包含最基本的命令，工具和程序库就可以了，因为底层直接用 Host 的 kernel，自己只需要提供 rootfs 就可以了，由此可见对于不同的 linux 发行版，bootfs 基本上是一致的，rootfs 会有差别，因此不同的发行版可以公用 bootfs

### 分层理解

> 分层的镜像

为什么 Docker 镜像要采用这种分层的结构呢？

最大的好处莫过于资源共享了，比如有多个镜像都从相同的Base镜像构建而来，那么宿主机只需在磁盘上保留一份 base 镜像，同时内存中也只需要加载一份 base 镜像，这样就可以为所有的容器服务了，而且镜像的每一层都可以被共享。

查看镜像分层的可以通过 docker image inspect 命令

```shell
root@9-134-239-95:~# docker image inspect nginx:latest
[
    {
        "Id": "sha256:04661cdce5812210bac48a8af672915d0719e745414b4c322719ff48c7da5b83",
        "RepoTags": [
            "nginx:latest"
        ],
        "RepoDigests": [
            "nginx@sha256:dfef797ddddfc01645503cef9036369f03ae920cac82d344d58b637ee861fda1"
        ],
        "Parent": "",
        "Comment": "",
        "Created": "2021-11-10T01:37:48.339919326Z",
        "Container": "3413c3ba78f227779d058881a3c295f060fdb434fd4d12dfc76f03caa38a1499",
        "ContainerConfig": {
            "Hostname": "3413c3ba78f2",
            "Domainname": "",
            "User": "",
            "AttachStdin": false,
            "AttachStdout": false,
            "AttachStderr": false,
            "ExposedPorts": {
                "80/tcp": {}
            },
            "Tty": false,
            "OpenStdin": false,
            "StdinOnce": false,
            "Env": [
                "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
                "NGINX_VERSION=1.21.4",
                "NJS_VERSION=0.7.0",
                "PKG_RELEASE=1~bullseye"
            ],
            "Cmd": [
                "/bin/sh",
                "-c",
                "#(nop) ",
                "CMD [\"nginx\" \"-g\" \"daemon off;\"]"
            ],
            "Image": "sha256:adf31590f026f172117cf6a21418523d4e8fe40f910255a0ba848eedd4a679f2",
            "Volumes": null,
            "WorkingDir": "",
            "Entrypoint": [
                "/docker-entrypoint.sh"
            ],
            "OnBuild": null,
            "Labels": {
                "maintainer": "NGINX Docker Maintainers <docker-maint@nginx.com>"
            },
            "StopSignal": "SIGQUIT"
        },
        "DockerVersion": "20.10.7",
        "Author": "",
        "Config": {
            "Hostname": "",
            "Domainname": "",
            "User": "",
            "AttachStdin": false,
            "AttachStdout": false,
            "AttachStderr": false,
            "ExposedPorts": {
                "80/tcp": {}
            },
            "Tty": false,
            "OpenStdin": false,
            "StdinOnce": false,
            "Env": [
                "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
                "NGINX_VERSION=1.21.4",
                "NJS_VERSION=0.7.0",
                "PKG_RELEASE=1~bullseye"
            ],
            "Cmd": [
                "nginx",
                "-g",
                "daemon off;"
            ],
            "Image": "sha256:adf31590f026f172117cf6a21418523d4e8fe40f910255a0ba848eedd4a679f2",
            "Volumes": null,
            "WorkingDir": "",
            "Entrypoint": [
                "/docker-entrypoint.sh"
            ],
            "OnBuild": null,
            "Labels": {
                "maintainer": "NGINX Docker Maintainers <docker-maint@nginx.com>"
            },
            "StopSignal": "SIGQUIT"
        },
        "Architecture": "amd64",
        "Os": "linux",
        "Size": 141468644,
        "VirtualSize": 141468644,
        "GraphDriver": {
            "Data": {
                "LowerDir": "/var/lib/docker/overlay2/fbb3e1d9a02fbf026fa7d52de6df6d3d50c29bc0a5f57bd3cf6ddb229e9d349b/diff:/var/lib/docker/overlay2/5d8daf1b88dfbef72dcb7d8d67c318f2c3607727bf9d4acff67341f5494e2f34/diff:/var/lib/docker/overlay2/5507e879d75026c5aaddb86428f802e4be2ed5794b713e073e8e9e33f95cb7c7/diff:/var/lib/docker/overlay2/1cbe7241431c8819ac67eeb7cdcb2c8fba8c1ed42a5fa8732faea6f7611b2f73/diff:/var/lib/docker/overlay2/de820af03e458740277fa88d6044a541394fee65e8589ee229ab529d71afa016/diff",
                "MergedDir": "/var/lib/docker/overlay2/6e4a9a5875c55ed06083551c504e04708e79fc01deebe5476b2747d0ffe554be/merged",
                "UpperDir": "/var/lib/docker/overlay2/6e4a9a5875c55ed06083551c504e04708e79fc01deebe5476b2747d0ffe554be/diff",
                "WorkDir": "/var/lib/docker/overlay2/6e4a9a5875c55ed06083551c504e04708e79fc01deebe5476b2747d0ffe554be/work"
            },
            "Name": "overlay2"
        },
        "RootFS": {
            "Type": "layers",
            "Layers": [
                "sha256:e8b689711f21f9301c40bf2131ce1a1905c3aa09def1de5ec43cf0adf652576e",
                "sha256:ea56d6ebf7e573953c89f2e0a0a30e825cd6bd18843a3d07cabf056ea4b3e5b6",
                "sha256:38aec0f8e5ed9d566721f8a8fa24aeb65b2e9e3643e788f6edaee28b12a83ffc",
                "sha256:fc199aaed79a9fc0685fb04a7c6d799e94a65790eaab74e129b34470a6f677c1",
                "sha256:921ee7f55927436cca232d123d448915c359129c19d678f7c83aa2008aa1c5ca",
                "sha256:280fbd619253bce6a85998c4609713d407ee15ef8469e891ac90a17e93a8293d"
            ]
        },
        "Metadata": {
            "LastTagTime": "0001-01-01T00:00:00Z"
        }
    }
]
```



