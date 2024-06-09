---
title: bazel 工具
---

安装 bazel 特定版本

```
curl -L https://github.com/bazelbuild/bazel/releases/download/0.19.2/bazel-0.19.2-installer-linux-x86_64.sh > bazel-0.19.2-installer-linux-x86_64.sh
chmod +x bazel-0.19.2-installer-linux-x86_64.sh
./bazel-0.19.2-installer-linux-x86_64.sh --user
```

使用 yum 安装 bazel

```
1. 添加存储库
centos7: yum config-manager --add-repo https://copr.fedorainfracloud.org/coprs/vbatts/bazel/repo/epel-7/vbatts-bazel-epel-7.repo
centos8: dnf config-manager --add-repo https://copr.fedorainfracloud.org/coprs/vbatts/bazel/repo/epel-8/vbatts-bazel-epel-8.repo

2. 在 centos 上安装 bazel 的命令
yum install -y bazel


```

