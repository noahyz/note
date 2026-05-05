---
title: mysql 修改 root 密码
---

### 一、默认账户密码

当我们在 ubuntu 上使用 `sudo apt install mysql-server` 指令安装 mysql 后。一般情况下，会自动为我们设置账户密码，并且放在 `/etc/mysql/debian.cnf` 文件中。

```
# sudo cat /etc/mysql/debian.cnf
[sudo] password for zhangyi83:
# Automatically generated for Debian scripts. DO NOT TOUCH!
[client]
host     = localhost
user     = debian-sys-maint
password = 4RypQP1XBTOTJpwC
socket   = /var/run/mysqld/mysqld.sock
[mysql_upgrade]
host     = localhost
user     = debian-sys-maint
password = 4RypQP1XBTOTJpwC
socket   = /var/run/mysqld/mysqld.sock
```

如上图中显示就是默认的账户和密码。我们可以使用这组账号和密码进行登录。

### 二、绕过密码登陆

我们可以设置绕过密码登陆。修改 mysql 的配置文件：  `/etc/mysql/mysql.conf.d/mysqld.cnf `

```
[mysqld]
skip-grant-tables
...
```

然后重启 mysql 服务。使用 `service mysql restart`。接着就可以绕过密码直接登陆了。

### 三、修改 mysql 用户密码

切换数据库：`use mysql`。然后修改 root 用户密码。

对于 mysql 7.5 及以下的版本，可以使用：

```
update user set password=PASSWORD("1234") where user=root;
update user set authentication_string=PASSWORD("1234") where user="root";
flush privileges;
```

mysql 8.0 以上的版本，在 user 表加了字段 `authentication_string`，修改密码前先检查 `authentication_string` 是否为空？

- 如果不为空，先置空字段后再修改密码。

```
use mysql;
flush privileges;
update user set authentication_string="" where user="root";  // 将 authentication_string 字段置空
alter user "root"@"localhost" identified with mysql_native_password by "1234";  // 修改密码
```

- 如果 `authentication_string` 为空，则直接修改密码

```
flush privileges;
alter user "root"@"localhost" identified with mysql_native_password by "1234";  // 修改密码
create user root@'%' identified  by '1234';
grant all privileges on *.* to root@'%' with grant option;
```

如果出现报错，可以先执行 `flush privileges;`