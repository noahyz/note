---
title: git本地库操作
date: 2021-03-27 14:11:41
categories:
- 组件学习
tags:
- git
---

## git本地库操作

#### 一、版本管理

```
1. 查看仓库当前的状态
git status
2. 查看修改内容
git diff
注：git diff HEAD -- readme.txt 可以查看工作区和版本库里面最新版本的区别
3. 查看提交日志
git log, git log --pretty=oneline 
注: --pretty=oneline 参数简化输出，还可以带上文件名，专门指这个文件的修改历史
```

在 git 中，使用 HEAD 表示当前版本，也就是最新的提交。上一个版本就是 HEAD^，同理，上上一个版本就是 HEAD^^。上上100个版本可以写成 HEAD~100 。

```
1. 版本回退(回退到上一个版本)
git reset --hard HEAD^
git reset --hard 1094a  # 回退到某个版本
```

版本前进，回退版本操作失误，此时

```
1. 查看使用过的命令
git reflog
可以看到提交过的commit id
git reset --hard commit_id
```

#### 二、修改&撤销

git add 命令实际上是把提交的所有修改放到暂存区(stage)，然后，执行 git commit 就可以一次性把暂存区的所有修改提交到分支。

```
如果您还没有 git add 到暂存区，想要丢弃此时的修改，可以使用：
git checkout -- file
这里有两种情况
1. file 自修改后还没有添加到暂存区，现在，撤销修改就回到和版本库一模一样的状态
2. file 已经添加到暂存区，又做了修改，现在，撤销修改就回到添加到暂存区时的模样
总之，就是让文件回到最近一次 git commit 和 git add 时的状态
```

```
如果您已经 git add 到暂存区了，在 git commit 之前，想要丢弃修改，可以使用：
git reset HEAD file
注意：git reset 既可以回退版本，也可以把暂存区的修改回退到工作区。使用HEAD时，表示最新的版本
使用 git status 查看，会发现暂存区时干净的，工作区有修改
此时再丢弃工作区的修改，就回退到原始了
git checkout -- file
```

```
如果您已经 git commit到分支了，那就直接版本回退
git reset --hard commit_id
如果您已经git push 到远程分支了，那就先在本地版本回退，然后push 到远程仓库 带上 --force
```

```
删除文件
如果你在工作区删除了文件，此时工作区和版本库就不一致了。
如果确定要从版本库中删除该文件，就可以使用 git rm 删除，并且 git commit
git rm file; git commit -m "remove file"
如果工作区里的文件删错了，那版本库中还有，直接 git checkout -- file 即可。
```

注：git checkout 其实就是用版本库中的版本替换工作区的版本，无论工作区是修改还是删除，都可以一键还原

#### 三、从远程库到本地库

git clone、git pull、git fetch

```
1. git clone
git clone <版本库的url>
git clone <版本库的url> <本地目录名>  # 如果本地目录不想与远程仓库同名，可以自定义本地目录名

2. git pull # 拉取远程分支更新到本地仓库。git pull 相当于从远程仓库获取最新版本，然后再与本地分支 merge
因此：git pull = git fetch + git merge
git pull <远程主机名> <远程分支名>:<本地分支名>
举例：将远程主机 origin 的 master 分支拉取过来，与本地的branchtest 分支合并: git pull origin master:branchtest
如果将冒号和后面的 branchtest 去掉，则表示将远程 origin 仓库的master 分支拉取下来与本地当前分支合并

3. git fetch 更新远程代码到本地仓库
在 .git/FETCH_HEAD 文件中，其中每一行对应于远程服务器的一个分支。FEICH_HEAD 指的是：某个branch在服务器上的最新状态
当前分支指向的 FETCH_HEAD,就是这个文件第一行对应的那个分支。一般存在两种情况
1). 如果没有显式的指定远程分支，则远程分支的 master 将作为默认的 FETCH_HEAD
2). 如果指定了远程分支，就将这个远程分支作为 FETCH_HEAD
git fetch 更新本地仓库的两种方法
1). 
git fetch origin master # 从远程的 origin 仓库的 master 分支下载代码到本地的 origin master
git log -p master.. origin/master  # 比较本地的仓库和远程仓库的区别
git merge origin/master   # 把远程下载下来的代码合并到本地仓库，远程和本地的合并
2). 
git fetch origin master:tmp  # 从远程的 origin 仓库的 master 分支下载到本地并新建一个分支 temp
git diff temp  # 比较 master 分支和 temp 分支的不同
git merge temp  # 合并 temp 分支到 master 分支
git branch -d temp  # 删除 temp
```



