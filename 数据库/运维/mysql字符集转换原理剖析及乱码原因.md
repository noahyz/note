---
title: mysql字符集转换原理剖析及乱码原因
date: 2020-12-27 14:14:06
categories:
- 数据库
tags:
- mysql
---

# 一、mysql字符集和校对

字符集是指一种从二进制编码到某类字符符号的映射。校对是指一组用于某个字符集的排序规则。在Mysql4.1和之后的版本中，每一类编码字符都有其对应的字符集和校对规则。

### 1. Mysql如何使用字符集

Mysql服务器有默认的字符集和校对规则，每个数据库也有自己的默认值，每个表也有自己的默认值。这是一个逐层继承的默认设置，最终最靠底层的默认设置将影响你创建的对象。这些默认值，至上而下的告诉MYSQL应该使用什么字符集来存储某个列。

在这个“阶梯”的每一层，你都可以指定一个特定的字符集或者让服务器使用它的默认值。

- 创建数据库时，将根据服务器上的 character_set_server 设置来设定该数据库的默认字符集
- 创建表的时候，将根据数据库的字符集设置指定这个表的字符集设置
- 创建列的时候，将根据表的设置指定列的字符集设置

**重点：真正存放数据的是列，所以更高“阶梯”的设置只是指定默认值。一个表的默认字符集设置无法影响存储在这个表中某个列的值。只有当创建列而没有为列指定字符集的时候，列的字符集才会被指定为表的默认字符集。**

### 2. Mysql支持的字符集和字符序

Mysql 支持多种字符集与字符序。

1. 一个字符集对应至少一个字符序（一般是一对多）
2. 两个不同的字符集不能有相同的字符序
3. 每个字符集都有默认的字符序

#### 2.1 查看支持的字符集

- 方式一：show character set;

  ```
  mysql> show character set;
  +----------+-----------------------------+---------------------+--------+
  | Charset  | Description                 | Default collation   | Maxlen |
  +----------+-----------------------------+---------------------+--------+
  | big5     | Big5 Traditional Chinese    | big5_chinese_ci     |      2 |
  | dec8     | DEC West European           | dec8_swedish_ci     |      1 |
  | cp850    | DOS West European           | cp850_general_ci    |      1 |
  | hp8      | HP West European            | hp8_english_ci      |      1 |
  | koi8r    | KOI8-R Relcom Russian       | koi8r_general_ci    |      1 |
  | latin1   | cp1252 West European        | latin1_swedish_ci   |      1 |
  | latin2   | ISO 8859-2 Central European | latin2_general_ci   |      1 |
  | swe7     | 7bit Swedish                | swe7_swedish_ci     |      1 |
  | ascii    | US ASCII                    | ascii_general_ci    |      1 |
  | ujis     | EUC-JP Japanese             | ujis_japanese_ci    |      3 |
  | sjis     | Shift-JIS Japanese          | sjis_japanese_ci    |      2 |
  | hebrew   | ISO 8859-8 Hebrew           | hebrew_general_ci   |      1 |
  | tis620   | TIS620 Thai                 | tis620_thai_ci      |      1 |
  | euckr    | EUC-KR Korean               | euckr_korean_ci     |      2 |
  | koi8u    | KOI8-U Ukrainian            | koi8u_general_ci    |      1 |
  | gb2312   | GB2312 Simplified Chinese   | gb2312_chinese_ci   |      2 |
  | greek    | ISO 8859-7 Greek            | greek_general_ci    |      1 |
  | cp1250   | Windows Central European    | cp1250_general_ci   |      1 |
  | gbk      | GBK Simplified Chinese      | gbk_chinese_ci      |      2 |
  | latin5   | ISO 8859-9 Turkish          | latin5_turkish_ci   |      1 |
  | armscii8 | ARMSCII-8 Armenian          | armscii8_general_ci |      1 |
  | utf8     | UTF-8 Unicode               | utf8_general_ci     |      3 |
  | ucs2     | UCS-2 Unicode               | ucs2_general_ci     |      2 |
  | cp866    | DOS Russian                 | cp866_general_ci    |      1 |
  | keybcs2  | DOS Kamenicky Czech-Slovak  | keybcs2_general_ci  |      1 |
  | macce    | Mac Central European        | macce_general_ci    |      1 |
  | macroman | Mac West European           | macroman_general_ci |      1 |
  | cp852    | DOS Central European        | cp852_general_ci    |      1 |
  | latin7   | ISO 8859-13 Baltic          | latin7_general_ci   |      1 |
  | utf8mb4  | UTF-8 Unicode               | utf8mb4_general_ci  |      4 |
  | cp1251   | Windows Cyrillic            | cp1251_general_ci   |      1 |
  | utf16    | UTF-16 Unicode              | utf16_general_ci    |      4 |
  | utf16le  | UTF-16LE Unicode            | utf16le_general_ci  |      4 |
  | cp1256   | Windows Arabic              | cp1256_general_ci   |      1 |
  | cp1257   | Windows Baltic              | cp1257_general_ci   |      1 |
  | utf32    | UTF-32 Unicode              | utf32_general_ci    |      4 |
  | binary   | Binary pseudo charset       | binary              |      1 |
  | geostd8  | GEOSTD8 Georgian            | geostd8_general_ci  |      1 |
  | cp932    | SJIS for Windows Japanese   | cp932_japanese_ci   |      2 |
  | eucjpms  | UJIS for Windows Japanese   | eucjpms_japanese_ci |      3 |
  +----------+-----------------------------+---------------------+--------+
  ```

- 方式二：select * from information_schema.character_sets;

  ```
  mysql> select * from information_schema.character_sets;
  +--------------------+----------------------+-----------------------------+--------+
  | CHARACTER_SET_NAME | DEFAULT_COLLATE_NAME | DESCRIPTION                 | MAXLEN |
  +--------------------+----------------------+-----------------------------+--------+
  | big5               | big5_chinese_ci      | Big5 Traditional Chinese    |      2 |
  | dec8               | dec8_swedish_ci      | DEC West European           |      1 |
  | cp850              | cp850_general_ci     | DOS West European           |      1 |
  | hp8                | hp8_english_ci       | HP West European            |      1 |
  | koi8r              | koi8r_general_ci     | KOI8-R Relcom Russian       |      1 |
  | latin1             | latin1_swedish_ci    | cp1252 West European        |      1 |
  | latin2             | latin2_general_ci    | ISO 8859-2 Central European |      1 |
  | swe7               | swe7_swedish_ci      | 7bit Swedish                |      1 |
  | ascii              | ascii_general_ci     | US ASCII                    |      1 |
  | ujis               | ujis_japanese_ci     | EUC-JP Japanese             |      3 |
  | sjis               | sjis_japanese_ci     | Shift-JIS Japanese          |      2 |
  | hebrew             | hebrew_general_ci    | ISO 8859-8 Hebrew           |      1 |
  | tis620             | tis620_thai_ci       | TIS620 Thai                 |      1 |
  | euckr              | euckr_korean_ci      | EUC-KR Korean               |      2 |
  | koi8u              | koi8u_general_ci     | KOI8-U Ukrainian            |      1 |
  | gb2312             | gb2312_chinese_ci    | GB2312 Simplified Chinese   |      2 |
  | greek              | greek_general_ci     | ISO 8859-7 Greek            |      1 |
  | cp1250             | cp1250_general_ci    | Windows Central European    |      1 |
  | gbk                | gbk_chinese_ci       | GBK Simplified Chinese      |      2 |
  | latin5             | latin5_turkish_ci    | ISO 8859-9 Turkish          |      1 |
  | armscii8           | armscii8_general_ci  | ARMSCII-8 Armenian          |      1 |
  | utf8               | utf8_general_ci      | UTF-8 Unicode               |      3 |
  | ucs2               | ucs2_general_ci      | UCS-2 Unicode               |      2 |
  | cp866              | cp866_general_ci     | DOS Russian                 |      1 |
  | keybcs2            | keybcs2_general_ci   | DOS Kamenicky Czech-Slovak  |      1 |
  | macce              | macce_general_ci     | Mac Central European        |      1 |
  | macroman           | macroman_general_ci  | Mac West European           |      1 |
  | cp852              | cp852_general_ci     | DOS Central European        |      1 |
  | latin7             | latin7_general_ci    | ISO 8859-13 Baltic          |      1 |
  | utf8mb4            | utf8mb4_general_ci   | UTF-8 Unicode               |      4 |
  | cp1251             | cp1251_general_ci    | Windows Cyrillic            |      1 |
  | utf16              | utf16_general_ci     | UTF-16 Unicode              |      4 |
  | utf16le            | utf16le_general_ci   | UTF-16LE Unicode            |      4 |
  | cp1256             | cp1256_general_ci    | Windows Arabic              |      1 |
  | cp1257             | cp1257_general_ci    | Windows Baltic              |      1 |
  | utf32              | utf32_general_ci     | UTF-32 Unicode              |      4 |
  | binary             | binary               | Binary pseudo charset       |      1 |
  | geostd8            | geostd8_general_ci   | GEOSTD8 Georgian            |      1 |
  | cp932              | cp932_japanese_ci    | SJIS for Windows Japanese   |      2 |
  | eucjpms            | eucjpms_japanese_ci  | UJIS for Windows Japanese   |      3 |
  +--------------------+----------------------+-----------------------------+--------+
  ```

这两种方式都可以查看Mysql支持的字符集。也可以加上 where 或者 like 等关键词作为限定条件。

`show character set where charset='utf8';`

`show character set like 'utf8%';`

#### 2.2 查看支持的字符序

- 方式一：`show collation;`

  ```
  mysql> show collation where charset='utf8';
  +--------------------------+---------+-----+---------+----------+---------+
  | Collation                | Charset | Id  | Default | Compiled | Sortlen |
  +--------------------------+---------+-----+---------+----------+---------+
  | utf8_general_ci          | utf8    |  33 | Yes     | Yes      |       1 |
  | utf8_bin                 | utf8    |  83 |         | Yes      |       1 |
  | utf8_unicode_ci          | utf8    | 192 |         | Yes      |       8 |
  | utf8_icelandic_ci        | utf8    | 193 |         | Yes      |       8 |
  | utf8_latvian_ci          | utf8    | 194 |         | Yes      |       8 |
  | utf8_romanian_ci         | utf8    | 195 |         | Yes      |       8 |
  | utf8_slovenian_ci        | utf8    | 196 |         | Yes      |       8 |
  | utf8_polish_ci           | utf8    | 197 |         | Yes      |       8 |
  | utf8_estonian_ci         | utf8    | 198 |         | Yes      |       8 |
  | utf8_spanish_ci          | utf8    | 199 |         | Yes      |       8 |
  | utf8_swedish_ci          | utf8    | 200 |         | Yes      |       8 |
  | utf8_turkish_ci          | utf8    | 201 |         | Yes      |       8 |
  | utf8_czech_ci            | utf8    | 202 |         | Yes      |       8 |
  | utf8_danish_ci           | utf8    | 203 |         | Yes      |       8 |
  | utf8_lithuanian_ci       | utf8    | 204 |         | Yes      |       8 |
  | utf8_slovak_ci           | utf8    | 205 |         | Yes      |       8 |
  | utf8_spanish2_ci         | utf8    | 206 |         | Yes      |       8 |
  | utf8_roman_ci            | utf8    | 207 |         | Yes      |       8 |
  | utf8_persian_ci          | utf8    | 208 |         | Yes      |       8 |
  | utf8_esperanto_ci        | utf8    | 209 |         | Yes      |       8 |
  | utf8_hungarian_ci        | utf8    | 210 |         | Yes      |       8 |
  | utf8_sinhala_ci          | utf8    | 211 |         | Yes      |       8 |
  | utf8_german2_ci          | utf8    | 212 |         | Yes      |       8 |
  | utf8_croatian_ci         | utf8    | 213 |         | Yes      |       8 |
  | utf8_unicode_520_ci      | utf8    | 214 |         | Yes      |       8 |
  | utf8_vietnamese_ci       | utf8    | 215 |         | Yes      |       8 |
  | utf8_general_mysql500_ci | utf8    | 223 |         | Yes      |       1 |
  +--------------------------+---------+-----+---------+----------+---------+
  ```

- 方式二：`select * from information_schema.collations where character_set_name='latin1';`

  ```
  mysql> select * from information_schema.collations where character_set_name='latin1';
  +-------------------+--------------------+----+------------+-------------+---------+
  | COLLATION_NAME    | CHARACTER_SET_NAME | ID | IS_DEFAULT | IS_COMPILED | SORTLEN |
  +-------------------+--------------------+----+------------+-------------+---------+
  | latin1_german1_ci | latin1             |  5 |            | Yes         |       1 |
  | latin1_swedish_ci | latin1             |  8 | Yes        | Yes         |       1 |
  | latin1_danish_ci  | latin1             | 15 |            | Yes         |       1 |
  | latin1_german2_ci | latin1             | 31 |            | Yes         |       2 |
  | latin1_bin        | latin1             | 47 |            | Yes         |       1 |
  | latin1_general_ci | latin1             | 48 |            | Yes         |       1 |
  | latin1_general_cs | latin1             | 49 |            | Yes         |       1 |
  | latin1_spanish_ci | latin1             | 94 |            | Yes         |       1 |
  +-------------------+--------------------+----+------------+-------------+---------+
  ```

### 3. 设定字符集和字符序

#### 3.1 字符集含义介绍

先来看都可以设定哪些字符集：`show variables like 'character_set_%'; `

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

 2. 查看database的字符集或字符序

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

    `SELECT SCHEMA_NAME, DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME  FROM information_schema.SCHEMATA WHERE schema_name="test";`

    或

    ```
    mysql> SHOW CREATE DATABASE test;
    +-------------+----------------------------------------------------------------------+
    | Database    | Create Database                                                      |
    +-------------+----------------------------------------------------------------------+
    | test        | CREATE DATABASE `test_schema` /*!40100 DEFAULT CHARACTER SET utf8 */ |
    +-------------+----------------------------------------------------------------------+
    ```

3. database 字符集、字符序如何确定
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

   - 明确了`charset_name`、`collation_name`，则采用`charset_name`、`collation_name`。
   - 只明确了`charset_name`，但`collation_name`未明确，则字符集采用`charset_name`，字符序采用`charset_name`对应的默认字符序。
   - 只明确了`collation_name`，但`charset_name`未明确，则字符序采用`collation_name`，字符集采用`collation_name`关联的字符集。
   - `charset_name`、`collation_name`均未明确，则采用数据库的字符集、字符序设置。

#### 3.5 column的字符集、字符序

类型为CHAR、VARCHAR、TEXT的列，可以指定字符集/字符序，语法：`col_name {CHAR | VARCHAR | TEXT} (col_length)    [CHARACTER SET charset_name]    [COLLATE collation_name]`

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

   - 如果`charset_name`、`collation_name`均明确，则字符集、字符序以`charset_name`、`collation_name`为准。
   - 只明确了`charset_name`，`collation_name`未明确，则字符集为`charset_name`，字符序为`charset_name`的默认字符序。
   - 只明确了`collation_name`，`charset_name`未明确，则字符序为`collation_name`，字符集为`collation_name`关联的字符集。
   - `charset_name`、`collation_name`均未明确，则以table的字符集、字符序为准。

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

可以使用 `set names `或者`set character set`语句来改变设置

````
set names 'charset_name'
相当于
SET character_set_client = charset_name;
SET character_set_results = charset_name;
SET character_set_connection = charset_name;
````

还需要注意：

1. 编码转换可能不是无损编码导致乱码的出现。比如utf8和gbk之间的转换就是有损编码转换。
2. Mysql的“utf8”实际上不是真正的UTF-8，Mysql的utf8 只支持每个字符最多三个字节，而真正的UTF-8 是每个字符最多四个字节。Mysql一直没有修复这个BUG，在2010年发布了“utf8mb4”的字符集用来代表真正的UTF-8。因此在Mysql或者MariaDB用户最好使用“utf8mb4”。
3. 在遇到乱码的情况下，一步一步的查询下，终端的字符集编码、Mysql服务端的字符集编码、以及表、字段的字符集编码。比如保证终端的字符集编码和Mysql服务端 character_set_client的字符集编码一致等。
4. 养成好习惯，在创建库、表、字段的时候设置字符集编码。

