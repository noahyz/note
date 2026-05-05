---
title: Mysql trigger 详解
date: 2021-03-20 20:19:17
categories:
- 数据库
tags:
- trigger 
---

## mysql触发器

触发器是自动执行的存储程序，以响应特定事件，例如，在表中发生的插入，更新或者删除等

##### 1. 触发器简介

可以定义触发器在 insert、update、delete 语句更改数据之前或者之后调用。在Mysql5.7.2版本之前，可以定义最多六个触发器

- `BEFORE INSERT` - 在将数据插入表格之前激活。
- `AFTER INSERT` - 将数据插入表格后激活。
- `BEFORE UPDATE` - 在更新表中的数据之前激活。
- `AFTER UPDATE` - 更新表中的数据后激活。
- `BEFORE DELETE` - 在从表中删除数据之前激活。
- `AFTER DELETE` - 从表中删除数据后激活。

但从mysql5.7.2 之后，可以为同一触发事件和操作时间定义多个触发器
当不使用 insert、delete、update 语句来修改表中数据时，与表关联的触发器不被调用。例如：truncate 语句删除表中所有数据，但不调用与表关联的触发器。但有些语句使用 insert语句，例如：replace、load data 语句，这些会调用与表关联的触发器

触发器命名的约定：` (BEFORE | AFTER)_tableName_(INSERT | UPDATE | DELTE) ` 或者 ` tableName_(BEFORE | AFTER)_(INSERT | UPDATE | DELETE) `

##### 2. 创建触发器

```sql
CREATE TRIGGER trigger_name trigger_time trigger_event
 ON table_name
 FOR EACH ROW
 BEGIN
 ...
 END; 
```

- trigger_name：触发器的名称。命名约定如上
- trigger_time：触发激活时间，可以是 BEFORE 或 AFTER。
- trigger_event：触发事件，可以是 INSERT、UPDATE、DELETE 事件。每个事件对应一个触发器。
- table_name：触发器必须与表关联。
- BEGIN ... END：在BEGIN和END之间，可以定义触发器的逻辑。

```sql
// 例子
DELIMITER $$
CREATE TRIGGER before_employee_update 
	BEFORE UPDATE ON employees 
	FOR EACH ROW
BEGIN
	INSERT INTO employees_audit 
	SET action = 'update',
	employeeNumber = OLD.employeeNumber,
	lastname = OLD.lastname,
	changedat = NOW( );
END $$
DELIMITER ; 
```

**注意：在INSERT定义的触发器中，只能使用 NEW 关键字，无法使用 OLD 关键字。在DELETE定义的触发器中，只能使用 OLD 关键字。在UPDATE定义的触发器中，OLD引用更新前NEW的行，并在更新后引用行。**

查看当前数据库中的所有触发器，可以使用 ` SHOW TRIGGER;`

##### 3. 创建多个触发器

mysql5.7.2 之后，可以为表中相同事件创建多个触发器，事件发生时，触发器将按顺序激活。

创建第一个触发器的语法保持不变。如果在表中有相同事件的多个触发器，MYSQL 将按创建顺序调用触发器。要更改触发器的顺序，需要指定 FOLLOWS 或 PROCEDES 在 FOR EACH ROW 子句之后。

- FOLLOWS：选项允许在现有触发器之后激活新触发器
- PRECEDES：选项允许在现有触发器之前激活新触发器

```sql
DELIMITER $$
CREATE TRIGGER  trigger_name
[BEFORE|AFTER] [INSERT|UPDATE|DELETE] ON table_name
FOR EACH ROW [FOLLOWS|PRECEDES] existing_trigger_name
BEGIN
…
END$$
DELIMITER ; 
```

触发器顺序查看，使用 show triggers from tableName; 无法看到针对相同事件和操作时序触发激活的顺序。

要查找此信息，可以查询 information_schema 数据库 triggers 表中的 action_order 列。

```sql
SELECT 
    trigger_name, action_order
FROM
    information_schema.triggers
WHERE
    trigger_schema = 'tableName'
ORDER BY event_object_table , 
         action_timing , 
         event_manipulation
; 
```

##### 4. 触发器管理

通过查询 information_schema 数据库中的 triggers 表可以查看到触发器。例如：

```sql
SELECT 
    *
FROM
    information_schema.triggers
WHERE
    trigger_schema = 'database_name'
    AND trigger_name = 'trigger_name' AND event_object_table = 'table_name'
```

可以使用 show triggers来查看当前数据库的触发器。` show triggers from databaseName` 可以指定数据库。 

```sql
show triggers from databaseName where `table` = 'tableName'  
// table 在mysql 中是关键字，因此带上 `` 来包装
```

注意：执行 show triggers 语句，必须要具有 super 权限。

- 删除触发器

```sql
// 删除现有触发器
drop trigger databaseName.trigger_name;
```

**注意：要修改触发器，必须先将其删除，然后使用新代码重新创建。Mysql中没有 alter trigger语句。**