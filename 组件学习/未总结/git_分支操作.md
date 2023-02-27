---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

# git 分支操作

Git 本地仓库有三大区域：工作区、暂存区、版本区

#### 添加 SSH 关联授权

* 为了在 git push 的时候不用输入用户名和密码。可以在系统中创建 SSH 公私钥，并将公钥放在 github 指定位置。
* 在linux 下执行命令 ssh-keygen，生成 公私钥。可以发现 公钥放在 ~/.ssh/id_rsa.pub 文件中，使用cat 命令将公钥复制出来。
* 在 github 网页上添加公钥，title 自定义即可
* 后边git clone 的时候，就可以使用 SSH 的地址。【只有使用这种 git 开头的地址克隆仓库，SSH关联才会起作用】
* 作用：免密推送、数据传输速度快
#### 为 Git 命令设置别名

* git 可以命令设置别名，以便简化他们的使用，命令： git config --global alias.[ 别名 ] [ 原命令 ]
* 注意：如果原命令有选项，需要加上引号。设置后，原命令和别名具有同等作用。
* 例如： git config --global alias.br 'branch -avv'
* 可以在 ~/.gitconfig 中查看自定义的命令，或者使用命令 git config -l 命令查看
#### git fetch 刷新本地分支信息

* 如果在 github 页面上对文件进行了修改并增加了一次提交。此时不进行任何操作，git branch -avv 分支信息没有任何变化。
* 此时执行 git fetch 命令，刷新保存在本地仓库的远程分支信息。
* 在执行 git branch -avv 会发现远程分支的版本号发生了变化，现可执行 git rebase origin/master 来实现“使本地 master 分支基于远程仓库的 master 分支”
#### 创建新的分支

* 使用 git branch [分支名] 可以创建新的分支，可以执行 git checkout [分支名] 切换分支
* git checkout -b [分支名] 可以创建新的分支并且切换到新创建的分支
* git push 主机名 本地分支名：远程分支名 ：即可将本地分支推送到远程仓库的分支中。如果冒号前后的分支名是相同的，则可以省略 :[远程分支名] 。如果远程分支不存在，会自动创建。例如：git push origin dev : dev 。
#### 本地分支跟踪远程分支

* git branch -u 主机名/远程分支名 本地分支名 ： 将本地分支与远程分支关联，或者说使本地分支跟踪远程分支。如果是设置当前所在分支跟踪远程分支，最后一个参数本地分支名可以省略不写。
* 其中 -u 选项是 --set -upstream 的缩写。
* 撤销本地分支对远程分支的跟踪，执行 git branch --unset -upstream 分支名 ：即可撤销该分支对远程分支的跟踪，同样地，如果撤销当前所在的分支的跟踪，分支名可以不写。
* git push -u origin dev ： 在推送的时候就自动跟踪远程分支。 -u 的全称 --set -upstream 。
#### 删除远程分支

* git push 主机名：远程分支名。如果一次性删除多个：git push 主机名：远程分支名 ：远程分支名 ：远程分支名。此命令的原理是将空分支推送到远程分支，
* git push 主机名 --delete 远程分支名 ： 也可以删除远程分支。
* 举例：git push origin --delete dev
* 注意：删除远程分支的命令可以在任意本地分支中执行
#### 删除本地分支

* git branch -D 分支名 ： 删除本地分支。此命令也可以一次删除多个
* git branch -m 原分支名 新分支名。给本地分支改名，若修改当前所在分支的名字，原分支名可以不写
* 注意：当前所在的分支不能删除
