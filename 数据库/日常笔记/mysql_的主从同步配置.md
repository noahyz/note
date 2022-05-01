# mysql 的主从同步配置

### mysql的主从同步配置

* mysql的主从同步，当主机和从机建立同步关系之后，主机的数据库所做出的修改会记录在binlog日志中，这个日志中存的其实是操作数据库的命令，并且带有编号。于是主机与从机之间就通过日志中带有编号的操作数据库的信息来同步主机与从机的数据库数据。
* 在做主从同步的时候，最好保证主机与从机之间数据库版本是一致的。因为在做mysql主从同步主要需要mysqlbinlog这个mysql组件去解析主机产生的binlog日志，而 mysql5.5版本（包含5.5）以下的mysqlbinlog这个组件是3.2版本的，mysql5.6版本以上的mysqlbinlog组件是3.4版本的，因此会mysql5.5版本以下的和mysql5.6版本以上的在主从的时候会出现解析失败，错误提示主机或者从机的binlog日志损坏。
#### 配置前准备

* 设置允许远程连接到mysql 服务器    * 登陆到mysql之后，做如下操作：
    * use mysql; # 使用mysql这个库
    * update user set host='%' where user='root'; # 允许任意主机连接
#### 配置主机主库

* 授权给从库数据库服务器    * GRANT REPLICATION SLAVE ON _._ TO ‘从机用户’@‘从机ip’ identified by ‘从机密码’；
    * flush privileges； # 刷新一下权限

* 修改主机mysql配置文件，一般是在 /etc/my.cnf 里面。如果自己设置了请自行打开    * 在该配置文件中 【mysqld】下面添加如下内容
```
[mysqld]
log-bin=/var/lib/mysql/binlog  # 要同步的日志路径及文件名，添加前先去看一下，这个目录和文件mysql需要有权限去写入
server-id=1 # 主机段的ID号，要保证和从机的不一致
binlog-do-db=test  # 要同步的数据库
binlog-ignore-db=mysql  # 不同步的数据库，以上两者可选添加
```

    * 修改完配置文件，如果要生效，必要重启mysqld，


​    
​    `service mysqld restart`或者`systemctl restart mysqld`
​    * 如果启动失败，请查看日志解决问题。一般mysql日志在 `/var/log/mysql.log`

* 查看当前主服务器的二进制日志名和偏移量，配置好之后从库即从这个偏移点去同步数据。    * show master status\G
    * 记录File和Position的值。

* 主服务器此时配置好了
#### 配置从机从库

* 首先关闭slave 进程    * slave stop；

* 开始如下配置操作：    * CHANGE MASTER TO MASTER_HOST='主机ip', MASTER_PORT=主机端口, MASTER_USER='主机用户名', MASTER_PASSWORD='主机密码', MASTER_LOG_FILE='主机的File文件的值', MASTER_LOG_POS=主机Position的值 ;
    * 当然也可以设置 REPLICATION_DO_DB 要同步的数据库，REPLICATE_IGNORE_DB 不需要同步的数据库。可以精确到表(数据库.表)。最好保证与主机一致，除非你知道你在干什么。
    * 除了这样配置外，也可以去配置文件/etc/my.cnf配置：
```
server-id=2 # 需要和主库的id不一样
master-host=192.168.8.10 # 主库的IP
master-user=root # 主库mysql的用户名
master-password=1234 # 主库mysql的密码
master-port=3306 # 主库mysql的端口
replicate-do-db=test.table # 要同步的数据库，可以精确到表
replicate-ignore-db=test.table # 不用同步的数据库,可以精确到表
```

* 启动slave进程    * slave start;

* 查看slave进程的状态    * show slave status\G
    * 如果 Slave_IO_Running 和 Slave_SQL_Running 的值都为 Yes。则表示配置是好的。

### 主库同步已有的数据到从库

#### 主库操作

* 首先锁住表，停止主库的数据更新操作，只允许读数据库。    * flush tables with read lock;

* 在shell中将主数据库的数据进行备份    * mysqldump -u mysql用户名 -p mysql密码 test(要备份的数据库) > xxx.sql(要保存的路径和文件名)

* 将备份文件传到从库，有多种方法，下面的只是一种    * scp xxx.sql root(从库机器用户名)@从库机器ip:/root/
    * 例：scp xxx.sql root@192.168.1.2:/root/

* 主库解锁    * unlock tables;
#### 从库操作

* 首先停止从库的同步    * slave stop;

* 新建要同步的数据库    * create database test(数据库名) default charset utf8;

* 将数据导入从库数据库    * 在shell上执行：mysql -uroot(mysql用户名) -p mysql密码 要导入的数据库 < xxx.sql
    * 例如：mysql -uroot -p1234 test < xxx.sql

* 查看从库已有数据库和表
这时，就可以验证了，在主机数据库中添加表，或者数据，验证从库是否保持一致的改变。对主库的增删改查操作，从库会自动进行同步操作。

CHANGE MASTER TO MASTER_HOST='9.218.17.212', MASTER_PORT=3306, MASTER_USER='cmlb_cc', MASTER_PASSWORD='cmlb_cc@sng', MASTER_LOG_FILE='mysql-bin.002046', MASTER_LOG_POS= 61407856;

insert into server_list_t(svr_id, svr_ip, idc_id, set_id, port_base, port_step, port_num, weight, app_id, work_mode) values(109120043, "11.148.162.13", 20001, 0,9001, 1,1,100, 10912, 2),(109120042, "11.148.162.16", 20001, 0,9001, 1,1,100, 10912, 2),(109120040, "9.208.243.104", 20001, 0,9001, 1,1,100, 10912, 2),(109120041, "9.208.243.107", 20001, 0,9001, 1,1,100, 10912, 2);