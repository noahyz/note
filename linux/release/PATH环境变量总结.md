---
title: linux中PATH环境变量总结
date: 2021-03-07 21:11:41
tags:
- 环境变量
---

## PATH环境变量总结

### 环境变量配置文件

| 用户       | 环境变量配置文件                                     |
| ---------- | ---------------------------------------------------- |
| 所有用户   | /ect/profile<br />/etc/bashrc<br /> /etc/environment |
| root用户   | ~/.bashrc <br />~/.bash-profile                      |
| 非root用户 | /home/非root用户名/.bashrc                           |

### 更新环境变量

```
source /etc/profile
or
. /etc/profile
```

### 环境变量配置方法 

export：显示当前系统定义的所有环境变量

echo $PATH：输出当前的PATH 环境变量的值

**PATH 变量定义的是运行命令的查找路径，以冒号分割不同的路径**

### 方式一：export  PATH

```
export PATH = /usr/local/src/python/bin:$PATH
或者把PATH写在前面
export PATH = $PATH:/usr/local/src/python/bin
```

**注意：**

* 生效时间：立即生效
* 生效期限：当前打开的终端有效，窗口关闭后无效
* 生效范围：当前登陆用户
* 需要加上$PATH，否则会覆盖原有路径

### 方法二：vim ~/.bashrc

```
vim ~/.bashrc
# 在最后一行加上
source ~/.bashrc
```

**注意：**

* 生效时间：需要手动生效。若没有source 则使用相同的用户打开新的终端时生效
* 生效期限：永久有效
* 生效范围：当前登陆用户
* 可能会被后续的环境变量文件覆盖了PATH 的值

### 方法三：vim ~/.bash_profile

```
vim ~/.bashrc
# 在最后一行加上
source ~/.bashrc
```

**注意：**

* 生效时间：需要手动生效。若没有source 则使用相同的用户打开新的终端时生效
* 生效期限：永久有效
* 生效范围：当前登陆用户
* 如果没有文件，则可以编辑 ~/.profile 文件或者新建一个 ~/.bash_profile

### 方式四：vim /etc/bashrc

```
# 如果 /etc/bashrc 文件不可编辑，需要修改为可编辑
chmod -v u+w /etc/bashrc
vim /etc/bashrc
# 在最后一行加上
export PATH = $PATH:/usr/local/src/python/bin
source /etc/bashrc
```

**注意：**

* 生效时间：需要手动生效。若没有source 则使用相同的用户打开新的终端时生效
* 生效期限：永久有效
* 生效范围：所有用户

### 方式五：vim /etc/profile

```
# 如果 /etc/profile 文件不可编辑，需要修改为可编辑
chmod -v u+w /etc/profile
vim /etc/profile
# 在最后一行加上
export PATH=$PATH:/usr/local/src/python/bin
source /etc/profile
```

**注意：**

* 生效时间：需要手动生效。若没有source 则使用相同的用户打开新的终端时生效
* 生效期限：永久有效
* 生效范围：所有用户

### 方式六：vim /etc/environment

```
# 如果 /etc/profile 文件不可编辑，需要修改为可编辑
chmod -v u+w /etc/environment
vim /etc/environment
# 在最后一行加上
export PATH=$PATH:/usr/local/src/python/bin
source /etc/environment
```

**注意：**

* 生效时间：需要手动生效。若没有source 则使用相同的用户打开新的终端时生效
* 生效期限：永久有效
* 生效范围：所有用户

## 环境变量加载顺序 

1. /etc/environment
2. /etc/profile
3. /etc/bashrc
4. ~/.profile
5. ~/.bashrc
