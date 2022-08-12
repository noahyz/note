Hive核心概念与原理详解：https://blog.51cto.com/u_10312890/2468492

#### 1. 查看 Hive 表是列存储还是行存储

行存储：TextFile、sequenceFile 

列存储：orc、parquet 

`show create table table_name` 可以查看建表时指定的方式

