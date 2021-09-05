# mysql 字符集、字符序

https://www.cnblogs.com/chyingp/p/mysql-character-set-collation.html

# 一、mysql字符集和校对

字符集是指一种从二进制编码到某类字符符号的映射。校对是指一组用于某个字符集的排序规则。在Mysql4.1和之后的版本中，每一类编码字符都有其对应的字符集和校对规则。

### 1. Mysql如何使用字符集

Mysql服务器有默认的字符集和校对规则，每个数据库也有自己的默认值，每个表也有自己的默认值。这是一个逐层继承的默认设置，最终最靠底层的默认设置将影响你创建的对象。这些默认值，至上而下的告诉MYSQL应该使用什么字符集来存储某个列。

在这个“阶梯”的每一层，你都可以指定一个特定的字符集或者让服务器使用它的默认值。

* 创建数据库时，将根据服务器上的 character_set_server 设置来设定该数据库的默认字符集
* 创建表的时候，将根据数据库的字符集设置指定这个表的字符集设置
* 创建列的时候，将根据表的设置指定列的字符集设置
**重点：真正存放数据的是列，所以更高“阶梯”的设置只是指定默认值。一个表的默认字符集设置无法影响存储在这个表中某个列的值。只有当创建列而没有为列指定字符集的时候，列的字符集才会被指定为表的默认字符集。**

### 2. Mysql支持的字符集和字符序

Mysql 支持多种字符集与字符序。

1. 一个字符集对应至少一个字符序（一般是一对多）
2. 两个不同的字符集不能有相同的字符序
3. 每个字符集都有默认的字符序
#### 2.1 查看支持的字符集

* 方式一：show character set;

* 方式二：select * from information_schema.character_sets;
这两种方式都可以查看Mysql支持的字符集。也可以加上 where 或者 like 等关键词作为限定条件。

`show character set where charset='utf8';`

`show character set like 'utf8%';`

#### 2.2 查看支持的字符序

* 方式一：`show collation;`

* 方式二：`select * from information_schema.collations where character_set_name='latin1';`
### 3. 设定字符集和字符序

#### 3.1 字符集含义介绍

先来看都可以设定哪些字符集：`show variables like 'character_set_%';`

```
mysql> show variables like 'character_set_%';
+--------------------------+--------------------------------------+
| Variable_name            | Value                                |
+--------------------------+--------------------------------------+
| character_set_client     | utf8                                 |
| character_set_connection | utf8                                 |
| character_set_database   | latin1                               |
| character_set_filesystem | binary                               |
| character_set_results    | utf8                                 |
| character_set_server     | latin1                               |
| character_set_system     | utf8                                 |
| character_sets_dir       | /path/myenv/mysql5.6/share/charsets/ |
+--------------------------+--------------------------------------+
```

##### 1. character_set_client：Mysql服务端总是假定客户端是按照 character_set_client 设置的字符集来传输数据和SQL语句的。

##### 2. character_set_connection：当Mysql服务器收到客户端的SQL语句时，它先将其转换成字符集 character_set_connection 。它还使用这个设置来决定如何将数据转换成字符串。

##### 3. character_set_database：默认是当前所在数据库的字符集，如果没有使用use进入任何库，那么这个参数的值和 character_set_server 一样。这个变量由系统管理。Mysql5.7中不推荐使用全局变量character_set_database、collation_database系统变量。希望在将来的MySQL版本中将其删除。

##### 4. character_set_filesystem：文件系统字符集，此变量用于解释引用文件名的字符串文字。例如使用 LOAD DATA语句或LOAD_FILE()函数读取文件并以字符串形式返回内容，在文件尝试打开之前，文件名从 character_set_client 到 character_set_filesystem 字符集的转换。如果character_set_filesystem 的值为 binary，则默认不做转换。如果系统允许使用多字节的文件名，那么可以设置这个全局变量，比如可以设置utf8。

##### 5. character_set_results：当Mysql服务端返回数据或者错误信息给客户端时，它会将其转换成 character_set_results

##### 6. character_set_server：Mysql服务器的默认字符集，创建数据库的时候，将根据服务器上的character_set_server设置来设定该数据库的默认字符集。

##### 7. character_set_system：服务器用于存储标识符的字符集。该值始终为`utf8`。是个只读数据不能更改。也没多少改的意义，他是元数据的编码，相信不会有人用中文做数据库名和字段名之类的吧，这个字段和具体存储的数据无关。

##### 8. character_sets_dir：字符集的安装目录。

#### 3.2 设置字符集

1. 可以在Mysql服务启动时，指定server字符集、字符序。如不置顶，视不同版本，Mysql5.6默认的字符集和字符序分别为 latin1、latin1_swedish_ci。

`mysqld --character-set-server=latin1 --collation-server=latin1_swedish_ci`

2. Mysql服务的配置文件指定(my.cnf)

```
[client]
default-character-set=utf8

[mysql]
default-character-set=utf8

[mysqld]
collation-server = utf8_unicode_ci
init-connect='SET NAMES utf8'
character-set-server = utf8
```

3. 运行时修改【推荐，比较方便】

`set character_set_server = utf8;`

4. Mysql编译的时候，通过编译选项指定

`cmake . -DDEFAULT_CHARSET=latin1 -DDEFAULT_COLLATION=latin1_german1_ci`
#### 3.3 database 的字符集、字符集查看设定

1. 创建database或者修改database时设定字符集

`CREATE DATABASE db_name [[DEFAULT] CHARACTER SET charset_name] [[DEFAULT] COLLATE collation_name];`

1. 查看database的字符集或字符序

```
mysql> use test;
Database changed
mysql> SELECT @@character_set_database, @@collation_database;
+--------------------------+----------------------+
| @@character_set_database | @@collation_database |
+--------------------------+----------------------+
| utf8                     | utf8_general_ci      |
+--------------------------+----------------------+
```

或

`SELECT SCHEMA_NAME, DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME FROM information_schema.SCHEMATA WHERE schema_name="test";`

或

```
mysql> SHOW CREATE DATABASE test;
+-------------+----------------------------------------------------------------------+
| Database    | Create Database                                                      |
+-------------+----------------------------------------------------------------------+
| test        | CREATE DATABASE `test_schema` /*!40100 DEFAULT CHARACTER SET utf8 */ |
+-------------+----------------------------------------------------------------------+
```

2. database 字符集、字符序如何确定

    1. 创建数据库时，指定了`CHARACTER SET`或`COLLATE`，则以对应的字符集、排序规则为准。
    2. 创建数据库时，如果没有指定字符集、排序规则，则以`character_set_server`、`collation_server`为准。
#### 3.4 table的字符集、字符序

1. 创建table时设定字符集、字符序

`CREATE TABLE tbl_name (column_list) [[DEFAULT] CHARACTER SET charset_name] [COLLATE collation_name]]`

`ALTER TABLE tbl_name [[DEFAULT] CHARACTER SET charset_name] [COLLATE collation_name]`

2. 查看table的字符集或字符序

`show table status from test\G`，其中test为database名，test_table为table名

```
mysql> show table status from test\G
*************************** 1. row ***************************
           Name: test_table
         Engine: InnoDB
        Version: 10
     Row_format: Compact
           Rows: 6
 Avg_row_length: 2730
    Data_length: 16384
Max_data_length: 0
   Index_length: 0
      Data_free: 0
 Auto_increment: NULL
    Create_time: 2020-12-26 18:01:30
    Update_time: NULL
     Check_time: NULL
      Collation: latin1_swedish_ci
       Checksum: NULL
 Create_options: 
        Comment: 
```

或

```
mysql> USE test;
mysql> SELECT TABLE_COLLATION FROM information_schema.TABLES WHERE TABLE_SCHEMA = "test" AND TABLE_NAME = "test_table";
+-----------------+
| TABLE_COLLATION |
+-----------------+
| utf8_general_ci |
+-----------------+
```

或

```
mysql>  SHOW CREATE TABLE test_table;
+------------+----------------------------------------------------------------------------------------------------------------------------+
| Table      | Create Table                                                                                                               |
+------------+----------------------------------------------------------------------------------------------------------------------------+
| test_table | CREATE TABLE `test_table` (
  `id` int(11) NOT NULL,
  `title` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 |
+------------+----------------------------------------------------------------------------------------------------------------------------+
```

3. table 字符集、字符序如何确定

假设`CHARACTER SET`、`COLLATE`的值分别是`charset_name`、`collation_name`。如果创建table时：

    * 明确了`charset_name`、`collation_name`，则采用`charset_name`、`collation_name`。
    * 只明确了`charset_name`，但`collation_name`未明确，则字符集采用`charset_name`，字符序采用`charset_name`对应的默认字符序。
    * 只明确了`collation_name`，但`charset_name`未明确，则字符序采用`collation_name`，字符集采用`collation_name`关联的字符集。
    * `charset_name`、`collation_name`均未明确，则采用数据库的字符集、字符序设置。
#### 3.5 column的字符集、字符序

类型为CHAR、VARCHAR、TEXT的列，可以指定字符集/字符序，语法：`col_name {CHAR | VARCHAR | TEXT} (col_length) [CHARACTER SET charset_name] [COLLATE collation_name]`

1. 新增column并指定字符集、字符序

`ALTER TABLE test_table ADD COLUMN char_column VARCHAR(25) CHARACTER SET utf8;`

2. 查看column的字符集、字符序

```
mysql> SELECT CHARACTER_SET_NAME, COLLATION_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA="test" AND TABLE_NAME="test_table" AND COLUMN_NAME="char_column";
+--------------------+-----------------+
| CHARACTER_SET_NAME | COLLATION_NAME  |
+--------------------+-----------------+
| utf8               | utf8_general_ci |
+--------------------+-----------------+
```

3. column 字符集、字符序规则确定

假设`CHARACTER SET`、`COLLATE`的值分别是`charset_name`、`collation_name`：

    * 如果`charset_name`、`collation_name`均明确，则字符集、字符序以`charset_name`、`collation_name`为准。
    * 只明确了`charset_name`，`collation_name`未明确，则字符集为`charset_name`，字符序为`charset_name`的默认字符序。
    * 只明确了`collation_name`，`charset_name`未明确，则字符序为`collation_name`，字符集为`collation_name`关联的字符集。
    * `charset_name`、`collation_name`均未明确，则以table的字符集、字符序为准。
# 二、Mysql通信过程中编码与解码

当服务器和客户端通信的时候，他们可能使用不同的字符集。这时，服务器端将进行必要的翻译转换工作。

### 1. Mysql存储数据时发生的编码转换过程

1. 在终端（可以是 bash窗口、客户端工具如iTerm、WeTERM、navicat等）中输入，输入的内容由终端Terminal根据自己的字符集进行编码。
2. 经过Terminal编码后的二进制数据流被传输到Mysql服务端，Mysql服务端总是假定客户端是按照 character_set_client 设置的字符集来传输数据和SQL语句的。因此Mysql服务端会认为这个二进制流是character_set_client 字符集编码的。
3. 接下来，Mysql服务端会将这个SQL语句从character_set_client字符集转换为character_set_connection字符集，还会使用 character_set_connection 来决定如何将数据转换成字符串。然后开始处理SQL。
4. 以character_set_connection字符集解码之后，Mysql服务端再次根据目的表，即table的字符集或column的字符集来判断是否需要字符编码转换。如果character_set_connection字符集设置和table或column定义时的character设置一致，则无需字符编码转换。否则进行转换，然后将转换后的二进制流存放到数据文件中去。
### 2. Mysql取出数据时发生的编码转换过程

1. 从数据文件中读取二进制流，将该数据流根据table或者column定义时的character设置来进行解码
2. 在使用table或column定义的character对二进制数据流进行编码之后，在Mysql服务端，需要根据character_set_result字符集对解码后的数据库流再一次进行编码，将编码之后的二进制数据库流传给client端
3. client端，即终端收到二进制流后根据自己的字符集编码来展示查询结果。
### 设置字符集和建议

可以使用 `set names`或者`set character set`语句来改变设置

```
set names 'charset_name'
相当于
SET character_set_client = charset_name;
SET character_set_results = charset_name;
SET character_set_connection = charset_name;
```

还需要注意：

1. 编码转换可能不是无损编码导致乱码的出现。比如utf8和gbk之间的转换就是有损编码转换。
2. Mysql的“utf8”实际上不是真正的UTF-8，Mysql的utf8 只支持每个字符最多三个字节，而真正的UTF-8 是每个字符最多四个字节。Mysql一直没有修复这个BUG，在2010年发布了“utf8mb4”的字符集用来代表真正的UTF-8。因此在Mysql或者MariaDB用户最好使用“utf8mb4”。
3. 在遇到乱码的情况下，一步一步的查询下，终端的字符集编码、Mysql服务端的字符集编码、以及表、字段的字符集编码。比如保证终端的字符集编码和Mysql服务端 character_set_client的字符集编码一致等。
4. 养成好习惯，在创建库、表、字段的时候设置字符集编码。
