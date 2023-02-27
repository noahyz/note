---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

# 未总结--go mod使用、go管理工具vendor

go mod的使用

http://c.biancheng.net/view/5712.html

go module基本使用及goland IDE的设置

https://blog.csdn.net/fbbqt/article/details/105965896

go包管理工具vendor使用

https://blog.csdn.net/benben_2015/article/details/80614873?utm_medium=distribute.pc_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-3.control&depth_1-utm_source=distribute.pc_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-3.control



go项目组织

https://www.jianshu.com/p/627b1b1c2971



| 命令     | 说明                                                         |
| -------- | ------------------------------------------------------------ |
| download | download modules to local cache(下载依赖包)                  |
| edit     | edit go.mod from tools or scripts（编辑go.mod                |
| graph    | print module requirement graph (打印模块依赖图)              |
| init     | initialize new module in current directory（在当前目录初始化mod） |
| tidy     | add missing and remove unused modules(拉取缺少的模块，移除不用的模块) |
| vendor   | make vendored copy of dependencies(将依赖复制到vendor下)     |
| verify   | verify dependencies have expected content (验证依赖是否正确） |
| why      | explain why packages or modules are needed(解释为什么需要依赖) |

go mod 的使用
https://juejin.cn/post/6844903798658301960

