---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

## linux 中修改文件或目录的用户组和访问权限

### 一、修改某个目录或者文件的用户名和用户组

```
chown 用户名:组名 文件路径
```

1. 修改data目录下的html文件夹的用户名和用户组为root和root（仅更改html）

    ```
    chown root:root /data/html 
    ```

2. 修改data目录下的html下的所有文件的用户名和用户组为root和root。使用 -R 进行递归操作子目录和文件

    ```
    chown -R root:root /data/html
    ```

### 二、修改某个目录或文件的访问权限

```
chmod [who] [+/-/=] [mode] 文件名 
```

参数 `who` 是其中一个用户或者用户的组合

- u 表示“用户（user）”，即文件或目录的所有者
- g 表示“同组（group）用户”，即与文件属主有相同组 ID 的所有用户
- o 表示“其他（others）用户”
- a 表示“所有（all）用户”。他是系统默认值

参数操作符号：

- +：添加某个权限
- -：取消某个权限
- =：赋予给定权限并取消其他所有权限

参数 mode 用来表示权限组合

- r/w/x：读/写/可执行





