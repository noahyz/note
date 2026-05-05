---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

#### 1. git rebase 成功之后如何撤销

```
git rebase 过程中可以使用 git --abort / --continue 来进行操作，如果是成功之后呢？
1. git reflog 查看本地记录，找到本次 rebase 之前的 commit id
2. git reset --hard commit_id 即可恢复到之前 commit id 位置
```

