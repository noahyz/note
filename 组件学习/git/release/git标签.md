---
title: git标签
date: 2021-03-27 14:11:41
categories:
- 组件学习
tags:
- git tag
---

## git 标签

#### 一. 创建标签

```
1. 切换到要打标签的分支上
git branch dev, git checkout dev
2. 打一个新标签
git tag v1.0
3. 创建带有说明的标签,使用 -a 指定标签名, -m 指定说明文字
git tag -a v1.0 -m "version 1.0 released" 1094adb 
4. 使用命令查看所有标签
git tag
注意：标签不是按时间顺序列出，而是按字母排序。
5. 查看标签的详细信息
git show tag_name
```

注意：默认标签是打到最新提交的 commit 上的。如果想在之前提交的 commit 上打标签

```
1. 找到历史提交的commit
git log --pretty=oneline --abbrev-commit
c4c46bd (HEAD -> dev, origin/master, master) init
e06133a Update README.md
1261493 Initial commit
2. 对某个 commit 打标签
git tag v0.9 c4c46bd
```

注意：标签总是和某个 commit 挂钩。如果这个 commit 即出现在 master 分支，又出现在 dev 分支，那么这两个分支都可以看到这个标签

#### 二. 操作标签

```
1. 删除标签
git tag -d v1.0
2. 推送标签到远程
git push origin v1.0
3. 推送全部尚未推送到远程的本地标签
git push origin --tags
4. 删除远程标签
先删本地标签: git tag -d v1.0 
删除远程: git push origin :refs/tags/v1.0
```

