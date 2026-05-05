---
title: Mysql用户管理
date: 2021-2-18 15:14:06
categories:
- 数据库
tags:
- mysql
---

### 添加用户
以root用户登陆数据库，运行以下命令：
`create user zhangyi identified by 'password123' `;
用户为 zhangyi，密码是 password123 

### 授权
命令的格式：`grant privilegesCode on dbName.tableName to username@host identified by 'password';`
例如： 
`grant all privileges on zhangyiDB.* to zhangyi@'%' identified by 'zhangyi';`
`flush privilleges;`
上面的语句将 zhangyiDB 数据库的所有操作权限都授权给了用户zhangyi

可以通过 show grants 命令查看权限授予执行的命令
`show grants for 'zhangyi';`

privilegesCode 表示授予的权限类型，常用的有以下几种类型：
- all privileges：所有权限。
- select：读取权限。
- delete：删除权限。
- update：更新权限。
- create：创建权限。
- drop：删除数据库、数据表权限。

dbName.tableName 表示授予权限的具体库或表，常用的有以下几种选项：
- .：授予该数据库服务器所有数据库的权限。
- dbName.*：授予dbName数据库所有表的权限。
- dbName.dbTable：授予数据库dbName中dbTable表的权限。

username@host 表示授予的用户以及允许该用户登录的IP地址。其中Host有以下几种类型：
- localhost：只允许该用户在本地登录，不能远程登录。
- %：允许在除本机之外的任何一台机器远程登录。
- 192.168.52.32：具体的IP表示只允许该用户从特定IP登录。
- password 指定该用户登录时的密码。

flush privileges表示刷新权限变更。

### 修改密码
```
update mysql.user set password = password('zhangsannew') where user = 'zhangsan' and host = '%';
flush privileges;
```

### 删除用户
```
drop user zhangsan@'%'
```
drop user 命令会删除用户以及对应的权限，执行命令后会发现 mysql.user 表和 mysql.db 表的相应记录都消失了

### 常用命令组
创建用户并授予指定数据库全部权限：适用于Web应用创建 MySQL 用户
```
create user zhangsan identified by 'zhangsan';
grant all privileges on zhangsanDB.* to zhangsan@'%' identified by 'zhangsan';
flush privileges;
```
创建了用户zhangsan，并将数据库zhangsanDB 的所有权限都授予zhangsan。如果要使zhangsan可以从本机登陆，那么可以多赋予localhost 权限
```
grant all privileges on zhangsanDB.* to zhangsan@'localhost' identified by 'zhangsan';
```

