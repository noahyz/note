---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

## MySQL字符集

- 字符：计算机中字母、数字、符号的统称，一个字符可以是一个中文汉字、一个英文字母、一个阿拉伯数字、一个标点符号等。计算机用二进制存储数据，显示器上看到的数字、英文、标点符号、汉字都是二进制数转换之后的结果

- 字符集：定义了字符和二进制的对应关系，为字符分配了唯一的编号。常见的字符集有ASCII、GBK、IOS-8859-1等

- 字符编码：也称为字集码，规定了如何将字符的编号存储到计算机中

  > 大部分字符集只对应一种字符编码，例如：ASCII、GBK，既表示字符集又表示字符编码。但Unicode 字符集有三种编码方案：UTF-8、UTF-6、UTF-32

- 校对规则：也称为排序规则，指同一个字符集内字符之间的比较规则。字符集和校对规则是一对多的关系，每个字符集都有一个默认的校对规则。字符集定义了MySQL存储字符串的方式，校对规则定义MySQL比较字符串的方式

```mysql
# 查看当前MySQL使用的字符集
show variables like 'character%';
```

| 名称                     | 说明                                                         |
| ------------------------ | ------------------------------------------------------------ |
| character_set_client     | MySQL 客户端使用的字符集                                     |
| character_set_connection | 连接数据库时使用的字符集                                     |
| character_set_database   | 创建数据库使用的字符集                                       |
| character_set_filesystem | MySQL 服务器文件系统使用的字符集，默认值为 binary，不做任何转换 |
| character_set_results    | 数据库给客户端返回数据时使用的字符集                         |
| character_set_server     | MySQL 服务器使用的字符集，建议由系统自己管理，不要人为定义   |
| character_set_system     | 数据库系统使用的字符集，默认值为 utf8，不需要设置            |
| character_sets_dir       | 字符集的安装目录                                             |

这三个系统变量：` character_set_filesystem、character_set_system、character_sets_dir` 不会影响乱码

 ```mysql
# 查看MySQL使用的校对规则
mysql> show variables like 'collation%';
+----------------------+-------------------+
| Variable_name        | Value             |
+----------------------+-------------------+
| collation_connection | utf8_general_ci   |  # 连接数据库时使用的校对规则
| collation_database   | latin1_swedish_ci |  # 创建数据库时使用的校对规则
| collation_server     | latin1_swedish_ci |  # MySQL服务器使用的校对规则
 ```

校对规则命令约定如下：

- 以校对规则所对应的字符集名开头
- 以国家名居中（或以general居中）
- 以 ci、cs 或 bin 结尾，ci 表示大小写不敏感，cs 表示大小写敏感，bin 表示按二进制编码值比较

### 一、MySQL字符集的转换过程

1. 在命令提示符窗口执行MySQL命令或者sql语句时，这些命令或语句从 <命令提示符窗口字符集> 转换为 <character_set_client> 定义的字符集
2. 使用命令提示符窗口成功连接MySQL服务器后，就建立了一条 <数据通信链路> ，MySQL命令或 sql 语句沿着 数据链路 传向MySQL服务器，由 character_set_client 定义的字符集转换为 character_set_connection 定义的字符集
3. MySQL服务实例收到数据通信链路中的MySQL命令或sql语句后，将MySQL命令或sql语句从 character_set_connection 定义的字符集转换为 character_set_server 定义的字符集
4. 若MySQL命令或sql语句针对某个数据库进行操作，此MySQL命令或sql语句从 character_set_server定义的字符集转换为 character_set_databases 定义的字符集
5. MySQL命令或sql语句执行结束后，将执行结果设置为 character_set_results 定义的字符集
6. 执行结果沿着打开的数据通信链路原路返回，将执行结果从 character_set_results 定义的字符集转换为 character_set_client 定义的字符集，最终转换为命令提示符窗口字符集，显示到命令提示符窗口中

### 二、查看字符集和校对规则

```mysql
# 查看字符集，Charset：字符集名称，Description：描述，Default collation：校对规则，Maxlen：字符集中一个字符占用最大字节数
mysql> show character set;
+----------+-----------------------------+---------------------+--------+
| Charset  | Description                 | Default collation   | Maxlen |
+----------+-----------------------------+---------------------+--------+
| latin1   | cp1252 West European        | latin1_swedish_ci   |      1 |
| utf8     | UTF-8 Unicode               | utf8_general_ci     |      3 |
...
# 通过 information_schema.character_set 表查询MySQL支持的字符集
select * from information_schema.character_sets;
```

常见的字符集如下：

- latin1：支持西欧字符、希腊字符等
- gbk：支持中文简体字符
- big5：支持中文繁体字符
- utf8：几乎支持所有国家的字符

```mysql
# 查看字符集对应的校对规则,gbk_chinese_ci不区分大小写，gbk_bin区分大小写
mysql> show collation like 'gbk%';
+----------------+---------+----+---------+----------+---------+
| Collation      | Charset | Id | Default | Compiled | Sortlen |
+----------------+---------+----+---------+----------+---------+
| gbk_chinese_ci | gbk     | 28 | Yes     | Yes      |       1 |
| gbk_bin        | gbk     | 87 |         | Yes      |       1 |
# 通过表来查询MySQL可用的校对规则
select * from information_schema.COLLATIONS;
```

### 三、设置默认字符集和校对规则

MySQL服务器可以支持多种字符集，在同一台服务器、同一个数据库甚至同一个表的不同字段中，都可以使用不同的字符集。MySQL的字符集和校对规则有4个级别的默认设置，即服务器级、数据库级、表级和字段级，他们分别在不同的地方设置，作用也不相同。

#### 1. 设置服务器级别的字符集和校对规则

- 在my.cnf 配置文件中设置

  ```MYSQL
  [mysqld]
  character-set-server=字符集名称
  ```

- 连接MySQL服务器时指定字符集

  ```MYSQL
  mysql --default-character-set=字符集名称 -hlocalhost -uroot -p
  ```

如果没有指定服务器字符集，MySQL会默认使用 latin1 作为服务器字符集。如果只指定了字符集，没有指定校对规则，MySQL会使用该字符集对应的默认校对规则。如果要使用字符集的非默认校对规则，需要在指定字符集的同时指定校对规则。

```mysql
# 查看当前服务器的字符集
show variables like 'character_set_server';
# 查看当前字符集默认的校对规则
show variables like 'collation_server';
```

#### 2、设置数据库字符集和校对规则

数据库的字符集和校对规则在创建数据库时指定，也可以在创建完数据库后通过 ` alter database` 命令修改

重点：**如果数据库里已经存在数据，修改字符集后，已有的数据不会按照新的字符集重新存放，所以不能通过修改数据库的字符集来修改数据的内容** 

如果创建数据库时，没有指定字符集和校对规则，则使用服务器字符集和校对规则作为数据库的字符集和校对规则

```mysql
# 查看当前数据库的字符集和校对规则
show variables like 'character_set_database';
show variables like 'collation_database';
```

#### 3、设置表字符集和校对规则

表的字符集和校对规则在创建表时指定，也可以在创建完表后通过 `alter table ` 命令进行修改

重点：**如果表中已有记录，修改字符集后，原有的记录不会按照新的字符集重新存放。表中字符仍然使用原来的字符集**

如果在创建表时指定字符集和校对规则，则使用数据库字符级和校对规则作为表的字符集和校对规则

```mysql
# 查看当前表的字符集和校对规则
show create table table_name;
```

#### 4、列字符集和校对规则

针对相同表的不同字段需要使用不同字符集的情况，比较少见

列字符集和校对规则的定义可以在创建表时指定，或者在修改表时调整：

```mysql
alter table 表名 modify 列名 数据类型 character set 字符集名;
alter table student modify name varchar(100) character set gbk;
```

#### 5、连接字符集和校对规则

客户端和服务器之间交互的字符集和校对规则。

对于客户端和服务器的交互操作，MySQL提供了3个不同的参数：character_set_client、character_set_connection 和 character_set_results 分别代表客户端、连接和返回结果的字符集。通常情况下，这3个字符集是相同的，这样可以确保正确的读出用户写入的数据，尤其是中文字符。

设置客户端和服务器连接的字符集和校对规则：

- 在 my.cnf 配置文件设置

  ```MYSQL
  [mysqld]
  default-character-set=utf8
  ```

- 通过命令来设置连接的字符集和校对规则，这个命令可以同时修改以上3个参数（character_set_client、character_set_connection、character_set_results）的值

  ```mysql
  set names utf8;
  ```

  此方法可以临时一次性的修改客户端和服务器连接的字符集为utf8

- Mysql 命令 临时修改 MySQL当前会话的字符集和校对规则

  ```mysql
  set character_set_client = gbk;
  set character_set_connection = gbk;
  set character_set_database = gbk;
  set character_set_results = gbk;
  set character_set_server = gbk;
  set collation_connection = gbk_chinese_ci;
  set collation_database = gbk_chinese_ci;
  set collation_server = gbk_chinese_ci;
  ```

### 四、修改MySQL字符集

在不能丢弃原来数据的情况下，修改数据表的字符集。需要先将数据导出，经过调整后，在重新导入

如下，模拟将 gb2312 字符集的数据库修改成 gbk 字符集的数据库的过程：

1. 创建数据表，设置字符集为 gb2312，并添加数据

   ```MYSQL
   create table test.character_test(name varchar(20) default NULL) charset=gb2312;
   insert into character_test values('你好');
   insert into character_test values('世界');
   ```

2. 导出表结构

   ```mysql
   # --default-character-set=gbk 表示以什么字符集连接
   # -d 表示只导出表结构，不导出数据
   mysqldump -uroot -p --default-character-set=gbk -d test character_set > ./character_set.sql
   ```

3. 打开 character_set.sql 文件，修改表结构定义中的字符集为新的字符集，如下：

   ```MYSQL
   root@9-134-239-95:test# cat character_test.sql 
   /*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
   /*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
   /*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
   /*!40101 SET NAMES gbk */;
   /*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
   /*!40103 SET TIME_ZONE='+00:00' */;
   /*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
   /*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
   /*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
   /*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
   
   DROP TABLE IF EXISTS `character_test`;
   /*!40101 SET @saved_cs_client     = @@character_set_client */;
   /*!40101 SET character_set_client = utf8 */;
   CREATE TABLE `character_test` (
     `name` varchar(20) DEFAULT NULL
   ) ENGINE=InnoDB DEFAULT CHARSET=gb2312; # 修改此处
   /*!40101 SET character_set_client = @saved_cs_client */;
   /*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
   
   /*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
   /*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
   /*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
   /*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
   /*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
   /*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
   /*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
   ```

   修改表定义变成 charset=gbk

4. 确保表中的记录不在更新，导出所有记录

   ```mysql
   # --quick 该选项用于存储记录多的表，它强制mysqldump 从服务器一次一行的查询表中的行，而不是查询所有行，并在输出前将它缓存到内存中
   # --extended-insert 使用insert插入多行数据语法。可以使文件更小，导入文件时加速插入
   # --no-create-info 不导出表的 create table 语句
   # --default-character-set=gb2312 按照原有的字符集导出所有数据。这样导出的文件中，所有中文都是可见的，不会保存成乱码
   mysqldump -uroot -p --quick --no-create-info --extend-insert --default-character-set=gb2312 test character_test > ./data.sql 
   ```

5. 打开 data.sql，将 ` set names gb2312` 修改为 ` set names gbk`

   ```MYSQL
   root@9-134-239-95:test# cat data.sql 
   /*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
   /*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
   /*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
   /*!40101 SET NAMES gb2312 */;  # 修改此处
   /*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
   /*!40103 SET TIME_ZONE='+00:00' */;
   /*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
   /*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
   /*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
   /*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
   
   LOCK TABLES `character_test` WRITE;
   /*!40000 ALTER TABLE `character_test` DISABLE KEYS */;
   INSERT INTO `character_test` VALUES ('你好'),('世界');
   /*!40000 ALTER TABLE `character_test` ENABLE KEYS */;
   UNLOCK TABLES;
   /*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
   
   /*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
   /*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
   /*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
   /*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
   /*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
   /*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
   /*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
   ```

6. 使用新的字符集创建新的数据库表

   ```mysql
   create database test2 default charset gbk;
   mysql -uroot -p test2 < ./character_set.sql
   mysql -uroot -p test2 < ./data.sql
   ```

7. 注意：选择目标字符集的时候，要注意最好是原字符集的超集，或者确定比原字符集的字库更大，否则如果目标字符集的字库小于原字符集的字库，那么目标字符集中不支持的字符导入后会变成乱码，丢失一部分数据。