---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

# linux中装多个mysql服务

# 文章需要重新写：https://learnku.com/articles/43558





### 在linux 中装多个mysql服务

* 在linux中装多个mysql服务，采用端口号不同来区分。
* 在linux下创建目录 /path/myenv
* 使用源码安装，源码下载：https://downloads.mysql.com/archives/community/ 选择合适的版本下载到linux 目录 /tmp 下。
* 然后 tar -xzvf mysql5.xx.tar.gz -C /path/myenv ,解压到新创建的目录
* 进入到/path/myenv目录，对mysql5.xxx 重命名为mysql。 mv mysql5.xx mysql
* 回到/path/myenv 目录，创建 data目录，进入data目录，创建四个文件，mysql.sock、mysql.pid、error.log、my.cnf
* 前三个文件不要动，重要修改my.cnf
```
[mysqld]
pid-file=/path/myenv/data/mysql.pid
socket=/path/myenv/mysql.sock
port=13306
basedir=/path/myenv/mysql
datadir=/path/myenv/mysql/data
tmpdir=/tmp

server-id = 101

[mysqld_safe]
log-error=/path/myenv/data/error.log
```

* 解释上面这个my.cnf 文档含义    * 必须保证 pid-file 的值和linux上其他mysql服务不一样。pid-file 里面存的是mysql服务的pid号。mysql 停止服务或者重启服务就靠它了。
    * 必须保证 socket 的值和linux 上其他mysql服务不一样。这个值在我理解划定了mysql客户端要和那个mysql服务连接。
    * 必须保证port 的值不一样，不同的mysql服务端口号必须不一样。建议填10000以上的，填之前 lsof -i 端口 看一下是否端口被使用。
    * 必须保证basedir 的值不一样，这个值代表的mysql服务的安装目录
    * 必须保证datadir 的值不一样，这个值代表的mysql服务的数据文件目录
    * tmpdir 可以相同，mysql服务临时目录，可能会存放一些mysql的临时表之类的。
    * 建议使用mysqld_safe 来启动mysql服务。所以配置 [mysqld_safe]
    * log-error的值也应该不一样，存放的是mysql服务的日志信息
    * 其余的选项不用管。

* 配置完my.cnf 之后，可以去启动mysql服务了。在/path/myenv/mysql目录下执行：

./bin/mysqld_safe --defaults-file=/path/myenv/data/my.cnf --user=root --skip-grant-tables &    * 上面的命令，mysqld_safe 启动比较安全。了解更多看官方说明。--defaults-file 这个参数必须放在第一个，命令要求，意思是只去关注这个文件中的配置。注意是只。--skip-grant-tables 这个参数是登录mysql服务跳过检查。别忘了 & 后台运行。

* 之后 ps -ef | grep mysql 去查看是否启动成功。
* 此时验证mysql服务。这样登录 mysql -uroot -S /path/myenv/data/mysql.sock 便可登录，不能忘了 -S 参数选项，否则可能会登录到别的mysql服务。
密码的修改问题？？？

如何关闭mysql--mysqladmin？

```
./bin/mysqladmin shutdown -S /usr/local/mysql/config/mysql.sock 
```





```
/path/myenv/mysql/bin/mysqld --defaults-file=/path/myenv/data/my.cnf --basedir=/path/myenv/mysql --datadir=/path/myenv/mysql/data --plugin-dir=/path/myenv/mysql/lib/plugin --user=root --log-error=/path/myenv/data/error.log --pid-file=/path/myenv/data/mysql.pid --socket=/path/myenv/data/mysql.sock --port=13306
```

/usr/local/mysql/scripts/mysql_install_db

```
PLEASE REMEMBER TO SET A PASSWORD FOR THE MySQL root USER !
To do so, start the server, then issue the following commands:

  /usr/local/mysql/bin/mysqladmin -u root password 'new-password'
  /usr/local/mysql/bin/mysqladmin -u root -h Tencent-SNG password 'new-password'

Alternatively you can run:

  /usr/local/mysql/bin/mysql_secure_installation
```

```sql
insert into `user` VALUES('9.137.94.128','root','*1EADAEB11872E413816FE51216C9134766DF39F9','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','','','','',0,0,0,0,'','','N');

insert into `user` VALUES('127.0.0.1','cmlb','*1EADAEB11872E413816FE51216C9134766DF39F9','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','','','','',0,0,0,0,'','','N');

flush privileges;
set password for root@'localhost' = password('root');
GRANT ALL PRIVILEGES ON * . * TO 'root'@'localhost';
grant privilegesCode on dbName.tableName to username@host identified by "password";
create user cmlb_cc@'127.0.0.1' identified by 'cmlb_cc@sng'
drop user zhangsan@'%';
```
