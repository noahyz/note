---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

## git 修改 commit 信息

主要分为三种情况：

#### 1. 修改刚刚 commit，还没有 push 的 commit 信息

```
git commit --amend  // 出现 vim 界面，修改 commit 信息完成保存后退出即可
```

#### 2. 刚刚 push，要修改最近一个 push 的 commit 信息

```
// 首先修改本地 commit 信息
git commit --amend
// 根据提示，提交到远端
git push origin xxx
```

#### 3. 修改历史 push 的 commit 信息

```
// 通过 git rebase 进入历史提交编辑界面
git rebase -i commit_id / HEAD~6 
// 需要修改那个 commit，将对应 commit 从 pick 改为 edit 后保存退出
// 根据提示，使用 git commit --amend 修改 commit 信息
// 修改完成之后需要 git push -f origin xxx 强制提交
```

