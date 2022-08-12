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

git fetch origin --prune #从远程拉取所有信息

#### 四、远程仓库的操作

```
1. 修改远程仓库地址
git remote set-url origin <remote-url>
2. 远程仓库路径查询
git remote -v
3. 添加远程仓库
git remote add origin <项目地址> 
4. 删除指定的远程仓库
git remote rm origin

远程分支删除、重命名
1. 删除远程分支
git 1.7 之后可以使用：git push origin --delete <branch_name> 
推送一个空分支到远程分支（相当于删除远程分支）：git push origin :<branch_name>
2. 删除 tag
git push origin --delete tag <tag_name>
git push origin :refs/tags/<tag_name>
```

 #### 五、克隆

```
// 克隆依赖的库 -- 方法一
git clone https://xxx.git
git submodule update --init --recursive 
// 克隆依赖的库 -- 方法二 
git clone --recursive https://xxx.git 
```



























