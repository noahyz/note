---
title: git远程库操作
date: 2021-03-27 14:11:41
categories:
- 组件学习
tags:
- git
---

## git远程库

#### 一、远程库操作

```
1. 查看远程库信息(仓库地址)
git remote -v
2. 本地库与远程库解除绑定
git remote rm origin
3. 修改本地关联的远程仓库地址
git remote set-url origin [new_remote_repository_address]
```

#### 二、撤销已经push到远程的commit

```
1. 本地回退到相应的版本
git reset --hard <版本号>
注意：使用 --hard 参数会抛弃当前工作区的修改,使用 --soft 参数回退到之前的版本，但是保留当前工作区的修改，可以重新提交
2. 然后提交当前的版本
git push origin <分支名>
会提示本地版本落后于远程的版本，直接覆盖远程的版本信息，使远程的仓库也回退到相应的版本，加上参数 --force
git push origin <分支名> --force
```

#### 三、同步操作

```
1. 查看远程分支
git branch -r
2. 拉取远程分支并创建本地分支
方法一（采用此种方法建立的本地分支会和远程分支建立映射关系）：
git checkout -b 本地分支名 origin/远程分支名
方法二（使用该方法会在本地新建分支，但是不会自动切换到该本地分支，需要手动checkout，且本地分支不会和远程分支建立映射关系）
git fetch origin 远程分支名 : 本地分支名
```

