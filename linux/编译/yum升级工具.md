---
title: yum 升级工具
---

yum 清理缓存

```
sudo yum clean all
sudo yum makecache
sudo yum update
```

yum 升级 devtoolset-8

```
sudo yum install centos-release-scl
sudo yum install devtoolset-8
scl enable devtoolset-8 bash
source /opt/rh/devtoolset-8/enable

gcc --version
```

