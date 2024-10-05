---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

## linux软件管理

### 一、rpm工具

rpm 是linux下软件包管理工具。rpm 也是一种打包格式，使用rpm工具进行管理，但是rpm包与包之间存在依赖，可能会出现升级某个包导致依赖的其他包版本不匹配。而yum 工具可以帮我们解决这个问题。

```
mysql-community-common-5.6.49-2.el7.x86_64
mysql: 软件名称部分
community-common: 软件组件部分
5: 主版本号
6: 次版本号
49: 修订号
2: 发布次数
el7: 平台名称，表示适用于哪种发行版
x86_64: 系统位数，i386 等表示适用于32位，x86_64 表示适用于64位，noarch 表示通用
```

rpm 命令参数

```
-q: 查询已安装的软件名称
-qa: 显示已安装的所有的软件列表
-qi: 查询指定安装软件的详细信息
-ql: 查看指定的软件包在系统中对应的目录和文件列表
-qf: 查看当前指定的文件或目录对应的软件包，比如：rpm -qf /usr/bin/vim
-qpi: 查询未安装软件的详细信息，比如：rpm -qpi tomcat-7.0.94-1.el6.noarch.rpm
-qpl: 查询未安装软件的安装路径，比如：rpm -qpl tomcat-7.0.94-1.el6.noarch.rpm
-V: 校验软件包的正确性，比如：rpm -V tomcat-7.0.94-1.el6.noarch.rpm
-Va: 校验所有软件包的正确性
-e: 需要root权限，卸载软件包。其他软件可能依赖此软件，卸载此软件之后导致其他软件不可用，如果存在依赖关系，则会显示依赖信息，如果执意要删除，可以使用忽略依赖的选项: --nodeps。例如：rpm -e --nodeps vim-enhanced
-i: 安装，需要root权限，安装前会查询已安装的相关软件，并卸载与之冲突的软件。在进行软件安装时，可能系统当中缺少某个依赖，导致无法正常安装，可以使用 --force 选项进行强制安装，但无法保证安装后能够正常使用。常规的解决办法是先安装需要的依赖软件包，再安装该软件，或者使用yum工具
-ivh: 安装一个软件。例如: rpm -ivh tomcat-7.0.94-1.el6.noarch.rpm 
-U: 升级软件，如果对应的软件包原来未安装，则直接安装，和 -i 的效果相同
-F: 升级软件，如果对应的软件原来未安装，则放弃安装
```

### 二、yum工具

yum工具是一个软件包管理器，基于 rpm 包管理，能够从指定的服务器自动下载 rpm 包并且安装，可以自动处理依赖性关系，并且一次安装所有依赖的软件包。

```
yum [options] [command] [package ...]
options: 可选，选项包括 -h(help), -y(当安装过程提示选择全部为yes), -q(不显示安装过程)
command: 要进行的操作
package: 安装的包名
```

常用命令

```
yum check-update: 列出所有可更新的软件清单
yum update: 更新所有软件命令
yum install <package_name>: 仅安装指定的软件
yum update <package_name>: 仅更新指定的软件
yum list: 列出所有可安装的软件清单
yum remove <package_name>: 删除软件包
yum search <keyword>: 查找软件包

清除缓存：
yum clean packages: 清除缓存目录下的软件包
yum clean headers: 清除缓存目录下的headers
yum clean oldheaders: 清除缓存目录下旧的 headers
yum clean, yum clean all (= yum clean packages; yum clean oldheaders): 清除缓存目录下软件包及旧的 headers 
```

更换yum源

```
首先备份 /etc/yum.repos.d/CentOS-Base.repo 
mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.backup
下载yum源放在 /etc/yum.repos.d/下 
wget http://mirrors.163.com/.help/CentOS7-Base-163.repo 
mv CentOS6-Base-163.repo CentOS-Base.repo
运行命令生成缓存
yum clean all
yum makecache 
```

