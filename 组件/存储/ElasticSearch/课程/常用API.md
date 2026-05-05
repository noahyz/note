---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

### 常用 API

```shell
// 查看索引相关信息
GET index_name
// 查看索引的文档总数
GET index_name/_count

// 查看状态为绿的索引
GET /_cat/indices?health=green
// 按照文档个数排序
GET /_cat/indices?s=docs.count:desc
```

