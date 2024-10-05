---
title: git学习记录
date: 2020-10-06 16:22:14
categories:
- 组件学习
tags:
- git
---

#### 基础命令

- git add <file> 注意：可反复多次使用，添加多个文件

- git diff 查看修改变动了什么,工作区和版本库中的区别

- git status 随时查看仓库、工作区当前的状态

- git log 显示从近到最远的提交日志。如果嫌信息太多，加上 --pretty=oneline,显示版本号和提交日志。

#### 版本回退、工作区、暂存区

- HEAD 指向的版本就是当前版本，因此，GIT 允许我们在版本的历史之间穿梭，使用 git reset --hard commit_id

- 穿梭前，用 git log 可以查看提交历史，以便确定要回退到那个版本

- 要重返未来，用 git reflog 查看命令历史，以便确定要回到未来的那个版本

- git add在工作区的修改会被放入暂存区，git commit只负责把暂存区的修改提交给版本库分支，比如master分支

- 每次修改，如果不用 git add 到暂存区，那就不会加入到 commit 中。

#### 撤销修改

- 直接丢弃工作区的修改时，用命令 git checkout -- file

- 丢弃暂存区的修改，先 git reset HEAD <file>,就丢弃了暂存区的东西，回到工作区再 git checkout -- file,这时也就丢弃了工作区的修改。

- 丢弃版本库中的修改，那就使用版本回退，不过前提是没有推送到远程库。

#### 删除文件

- 如果将工作区的文件commit 到版本库了，此时删除工作区的一个文件，git status 会发现那些文件被删除了。此时有两个选择

- 1.确实要删除文件，则 git rm file 删除，并且 git commit，此时版本库中的文件也删除了

- 2.删错了，此时版本库中还有，可以把版本库中文件恢复到工作区 git checkout -- file

- 注意：只能恢复文件到最新版本，会丢失最近一次提交后修改的内容

#### 远程仓库

- 要关联一个远程库，使用命令 git remote add origin git@server-name:path/repo-name.git

- 关联后，使用命令 git push -u origin master 第一次推送master分支的所有内容

- 此后，每次本地提交后，只要有必要，就可以使用命令 git push origin master 推送最新修改

- git clone 克隆远程仓库

#### 分支管理

- 查看分支 git branch

- 创建分支 git branch <name>

- 切换分支 git checkout <name> 或者 git switch <name>

- 创建+切换分支 git checkout -b <name> 或者 git switch -c <name>

- 合并某分支到当前分支 git merge <name>

- 删除分支 git branch -d <name>

- 分支冲突：例如：当dev分支修改了工作区文件，并且add commit到版本库后，切换到master后又修改了工作区文件，也并且add commit 到版本库时，这时，想要合并dev 分支就出现了冲突。必须先解决冲突。git status 会告诉我们冲突文件，我们修改文件后再提交就好了。

- 通常合并分支的时候，Git 会采用 Fast forward 模式，这种模式，删除分支后，就会丢弃分支信息，分支是和master分支在一条时间线上。如果强制禁用Fast forward模式，Git就会在merge时生成一个新的commit，这样就可以从分支历史上看出分支信息 git merge加上 --no-ff 参数。如：git merge --no-ff -m "merge with no-ff" dev。-m参数是注释。可以使用 git log --graph --pretty=oneline --abbrev-commit 来看分支历史

#### 多人协作

- 当从远程仓库克隆时，实际上Git自动把本地的master分支和远程的master分支对应起来了。并且，远程仓库的默认名称时origin。查看远程库的信息，使用 git remote或者 git remote -v
- 推送分支时，就是把该分支上的所有本地提交推送到远程库。推送时，要指定本地分支，这样，Git 就会把分支推送到远程库对应的远程分支上。例如：git push origin dev
- 当其他人从远程库clone 时，默认情况下，就只能看到本地的master分支。如果要与远程origin的dev分支建立联系，就必须创建本地的dev分支。git checkout -b dev origin/dev.
- 当多个人同时向dev 分支推送提交时，会出现冲突，这时先用 git pull 把最新的提交从 origin/dev 下抓下来，然后在本地合并，解决冲突，在推送。如果git pull 失败，是因为没有指定本地dev分支与远程origin/dev 分支的链接。`git branch --set-upstream-to=origin/dev dev`