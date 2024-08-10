---
title: Mysql导入数据
date: 2021-03-07 20:19:17
categories:
- 数据库
tags:
- 导入数据
---

## mysql 的导入数据

### 一、mysql命令导入数据

使用 mysql 命令导入语法格式为：

```shell
mysql -h `host` -P `port` -u `user` -p `passwd`  <  data.sql
```

### 二、source 命令导入

```shell
mysql> create database abc;      # 创建数据库
mysql> use abc;                  # 使用已创建的数据库 
mysql> set names utf8;           # 设置编码
mysql> source /home/abc/abc.sql  # 导入备份数据库
```

注意：可以将source命令的输出结果重定向到一个文件中，这样就可以避免不停的在控制台输出了。`source D:/test.sql > output.log`

### 三、使用 LOAD DATA 导入数据

```mysql
LOAD DATA LOCAL '通过该命令导入本地文件'
    INFILE 'file_name' '本地文件的路径，包含文件地址和文件名。'
    [REPLACE | IGNORE] '导入数据遇到主键重复时用当前数据覆盖已有数据或者自动忽略失败行'
    INTO TABLE table_name 'MySQL中的目标表名'
    [{FIELDS | COLUMNS}
        [TERMINATED BY 'string'] '定义每行数据的列分隔符，默认为\t，与MySQL一致。'
        [[OPTIONALLY] ENCLOSED BY 'char'] '定义每列数据的enclosed符号'
    ]
    [LINES
        [TERMINATED BY 'string'] '定义行分隔符，默认为\n。'
    ]
    [IGNORE number {LINES | ROWS}] '设置导入数据时忽略开始的某几行'
    [(column_name_or_user_var
    [, column_name_or_user_var] ...)] '设置导入的列，如果不设置，默认按照列的顺序来导入数据'      

```

参数详解：

- `LOAD DATA LOCAL INFILE`：表示要进行本地文件导入操作。

  如果指定LOCAL关键词，则表明从客户主机上按路径读取文件。如果没有指定，则文件在服务器上按路径读取文件。

- `file_name`：要导入MySQL的本地文件的路径，包含文件地址和文件名。

  **说明：** 如果`file_name`使用相对路径，则是相对于客户端程序启动时的路径。

- `table_name`：MySQL中的目标表名。

  **说明** 表名前无需携带数据库名。

- `REPLACE`：导入数据时，遇到主键重复则强制用当前数据覆盖已有数据。

- `IGNORE`：导入数据时，遇到主键重复或者数据问题时则自动忽略失败行，部分行导入失败但不影响其他行导入。

- `[FIELDS] TERMINATED BY 'string'`：定义每行数据的列分隔符，默认为`\t`，与MySQL一致。

- `[FIELDS] ENCLOSED BY 'char'` :  定义每列数据的enclosed符号。

  例如，某一列数据为`"a"`，定义`enclosed by '"'`后，导入数据时先将`"a"`前后的`"`移除，然后导入数据。

- `[LINES] TERMINATED BY 'string'`：定义行分隔符，默认为`\n`。

- `IGNORE number LINES`：设置导入数据时忽略开始的某几行。例如`IGNORE 1 LINES`，导入数据时忽略第一行数据，即第一行数据不会导入AnalyticDB for MySQL。

- `(column_name_or_user_var,...)`：设置导入的列，如果不设置，默认按照列的顺序来导入数据。

  - 如果导入列数 > 目标表的列数，则系统自动忽略多余的列。
  - 如果导入列数 < 目标表的列数，则后续缺少的列将自动填充默认值。

注意：两个命令的 FIELDS 和 LINES 子句的语法是一样的。两个子句都是可选的，但是如果两个同时被指定，FIELDS 子句必须出现在 LINES 子句之前。

1. 如果用户指定一个 FIELDS 子句，它的子句 （TERMINATED BY、[OPTIONALLY] ENCLOSED BY 和 ESCAPED BY) 也是可选的，不过，用户必须至少指定它们中的一个。

```mysql
 LOAD DATA LOCAL INFILE 'dump.txt' INTO TABLE mytbl FIELDS TERMINATED BY ':' LINES TERMINATED BY '\r\n';
```

2. LOAD DATA 默认情况下是按照数据文件中列的顺序插入数据的，如果数据文件中的列与插入表中的列不一致，则需要指定列的顺序。在数据文件中的列顺序是 a,b,c，但在插入表的列顺序为b,c,a，则数据导入语法如下：

```mysql
LOAD DATA LOCAL INFILE 'dump.txt'  INTO TABLE mytbl (b, c, a);
```

**注意事项**

- 客户端开启 local-file

  以mysql-client为例，需要在`my.cnf`文件中增加以下配置开启`local-file`功能。

  ```shell
  cat ~/.my.cnf
  [mysqld]
  local-infile
  [mysql]
  local-infile                    
  ```

- 导入数据时无法保证操作的原子性。

  - 在`IGNORE`模式下，忽略导入失败的数据行。
  - 在`REPLACE`模式下，一旦有数据行导入失败，系统将中止后续`INSERT`操作，因此可能存在部分行数据导入，部分行数据未导入的情况。

- 支持通过`SHOW WARNINGS`命令，查看失败行的错误信息。

### 四、mysqlimport 导入数据

暂未使用到，后面有使用了补上