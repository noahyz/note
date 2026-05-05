---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

# linux上mysql创建使用

csdn：https://blog.csdn.net/tanwenfang/article/details/87913495

安装

[root@node2 ~]# yum install yum-utils -y

[root@node2 ~]# rpm -ivh https://dev.mysql.com/get/mysql80-community-release-el7-1.noarch.rpm

[root@node2 ~]# yum-config-manager --disable mysql80-community

[root@node2 ~]# yum-config-manager --enable mysql57-community

[root@node2 ~]# yum install mysql-community-server -y

配置密码

[root@node2 ~]# grep password /var/log/mysqld.log

2019-01-08T08:42:53.031646Z 1 [Note] A temporary password is generated for root@localhost: y0oagT8rqV<g

[root@node2 ~]# mysql -uroot -p'y0oagT8rqV<g'

mysql> set global validate_password_policy=0;

Query OK, 0 rows affected (0.00 sec)

mysql> set global validate_password_length=1;

Query OK, 0 rows affected (0.00 sec)

mysql> ALTER USER 'root'@'localhost' IDENTIFIED BY '123456';

Query OK, 0 rows affected (0.00 sec)

mysql> flush privileges；

Query OK, 0 rows affected (0.00 sec)
