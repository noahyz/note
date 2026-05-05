---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

#### 一、导入其他 proto 文件

```
import "protobuf/import/header.proto"
```

导入后则通过`被导入文件包名.结构体名`使用。具体和 `--proto_path` 组合起来

```
protoc --proto_path=. --proto_path=/xxx/xxx --cpp_out=.  xxx.proto
```

