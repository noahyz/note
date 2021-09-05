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

csdn%EF%BC%9Ahttps%3A%2F%2Fblog.csdn.net%2Ftanwenfang%2Farticle%2Fdetails%2F87913495%0A%0A%E5%AE%89%E8%A3%85%0A%5Broot%40node2%20~%5D%23%20yum%20install%20yum-utils%20-y%0A%5Broot%40node2%20~%5D%23%20rpm%20-ivh%20https%3A%2F%2Fdev.mysql.com%2Fget%2Fmysql80-community-release-el7-1.noarch.rpm%0A%5Broot%40node2%20~%5D%23%20yum-config-manager%20--disable%20mysql80-community%0A%5Broot%40node2%20~%5D%23%20yum-config-manager%20--enable%20mysql57-community%0A%5Broot%40node2%20~%5D%23%20yum%20install%20mysql-community-server%20-y%0A%0A%E5%85%88%E5%90%AF%E5%8A%A8mysqld%20%E6%9C%8D%E5%8A%A1%0A%E9%85%8D%E7%BD%AE%E5%AF%86%E7%A0%81%0A%5Broot%40node2%20~%5D%23%20grep%20password%20%2Fvar%2Flog%2Fmysqld.log%20%0A2019-01-08T08%3A42%3A53.031646Z%201%20%5BNote%5D%20A%20temporary%20password%20is%20generated%20for%20root%40localhost%3A%20y0oagT8rqV%3Cg%0A%5Broot%40node2%20~%5D%23%20mysql%20-uroot%20-p'y0oagT8rqV%3Cg'%0Amysql%3E%20set%20global%20validate_password_policy%3D0%3B%0AQuery%20OK%2C%200%20rows%20affected%20(0.00%20sec)%0Amysql%3E%20set%20global%20validate_password_length%3D1%3B%0AQuery%20OK%2C%200%20rows%20affected%20(0.00%20sec)%0Amysql%3E%20ALTER%20USER%20'root'%40'localhost'%20IDENTIFIED%20BY%20'123456'%3B%0AQuery%20OK%2C%200%20rows%20affected%20(0.00%20sec)%0Amysql%3E%20flush%20privileges%EF%BC%9B%0AQuery%20OK%2C%200%20rows%20affected%20(0.00%20sec)%0A%0A
