---
title: go语言操作数据库
date: 2021-03-07 20:19:17
categories:
- 编程语言
tags:
- go
---

## sqlx库

安装：go get github.com/jmoiron/sqlx

mysql 驱动：github.com/go-sql-driver/mysql

#### 关键类型

- sqlx.DB - 代表一个数据库
- sqlx.Tx - 代表一个事务
- sqlx.Rows - 代表sql查询结果的多行记录
- sqlx.Row - 代表sql查询结果的一条记录

#### 连接数据库

```go
//定义数据库对象
var pool *sqlx.DB

//定义mysql数据源，配置数据库地址，帐号以及密码， dsn格式下面会解释
dsn := "root:123456@tcp(localhost:3306)/tizi365?charset=utf8&parseTime=True&loc=Local"

//根据数据源dsn和mysql驱动, 创建数据库对象
pool, err := sqlx.Open("mysql", dsn)
if err != nil {
    panic(err)
}
```

MYSQL dsn格式：{username}:{password}@tcp({host}:{port})/{Dbname}?charset=utf8&parseTime=True&loc=Local
**注意：charset=utf8 用于设置字符集，parseTime=True表示将数据库时间类型转换成Go时间类型**

#### 数据库连接池设置

```
//设置连接池最大连接数
pool.SetMaxOpenConns(100)
//设置连接池最大空闲连接数
pool.SetMaxIdleConns(20)
```

#### sql 语句绑定参数

绑定参数可以使用占位符 ? ，定义一些参数，然后在执行 sql 语句的时候在把参数传入，还可以进行参数的安装检查和过滤，避免sql注入攻击

```
sql := "select * from tablename where cat = ? and uid = ? "
db.Queryx(sql, 101, 5)
```

#### 插入数据

Exec、MustExec 这两个函数用于执行插入、更新以及执行 DDL 语句（创建表，修改表等）
MustExec 遇到错误的时候直接抛出一个 panic 错误，程序就退出了。Exec 将错误和执行结果一起返回。

```go
//定义sql语句, 通过占位符 问号（ ? ) 定义了三个参数
countryCitySql := `INSERT INTO place (country, city, telcode) VALUES (?, ?, ?)`

//通过Exec插入数据, 这里传入了三个参数，对应sql语句定义的三个问号所在的位置
result1,err := db.Exec(countryCitySql, "中国", "香港", 852)
//错误处理
if err != nil {
    fmt.Println("插入失败!")
}
//插入成功后，获取insert id
id, _ := result.LastInsertId() 


//通过MustExec插入数据, 如果sql语句出错，则直接抛出panic错误
result2 := db.MustExec(countryCitySql, "South Africa", "Johannesburg", 27)

//插入成功后，获取插入id
id2, _ := result2.LastInsertId() 
```

注意：mysql 表如果存在自增 id ，则可以通过 Exec 返回的结果对象的 LastInsertId，查询新插入数据的ID

#### 更新数据

```go
//定义sql语句，通过问号定义了三个参数
sql := "update place set telcode=?, city=? where id=?"

//通过Exec更新数据, 这里传入了三个参数，对应sql语句定义的三个问号所在的位置
result1,err := db.Exec(sql, 100, "香港", 1)
//错误处理
if err != nil {
    fmt.Println("更新失败!")
}

//查询更新影响行数
rowsAffected, _ := result1.RowsAffected()
```

#### 查询数据

Get 函数用于查询一条记录，Select 用于查询多条记录

```go
// 查询一条记录, 并且往sql语句传入参数 1，替换sql语句中的问号，最后将查询结果保存到struct对象中
err = pool.Get(&p, "SELECT * FROM place LIMIT ?", 1)

// 通过Select查询多条记录，并且将结果保存至pp变量中
// 这里相当于将一条记录的字段值都映射到struct字段中
err = pool.Select(&pp, "SELECT * FROM place WHERE telcode > ?", 50)
```

Queryx 查询多条数据，QueryRows 查询一条记录

```go
// 查询所有的数据，这里返回的是sqlx.Rows对象
rows, err := pool.Queryx("SELECT country, city, telcode FROM place")
//错误检测
if err !=nil {
    panic(err)
}

// 循环遍历每一行记录，rows.Next()函数用于判断是否还有下一行数据
for rows.Next() {
    //这里定义三个变量用于接收每一行数据
    var country string
    var city    string
    var telcode int
    
    //调用Scan函数，将当记录的数据保存到变量中，这里参数的顺序跟上面sql语句中select后面的字段顺序一致。
    err = rows.Scan(&country, &city, &telcode)
}

// 另外，rows 对象支持将每一行数据保存到 struct、map或者数组中
//遍历数据
for rows.Next() {
    //下面演示如何将数据保存到struct、map和数组中
    //定义struct对象
    var p Place
    
    //定义map类型
    m := make(map[string]interface{})
    
    //定义slice类型
    s := make([]interface{}, 0)
    
    //使用StructScan函数将当前记录的数据保存到struct对象中
    err = rows.StructScan(&p)
    //保存到map
    err = rows.MapScan(&m)
    //保存到数组
    err = rows.SliceScan(&s)
}
```

QueryRows 返回一行数据

```go
//查询数据
row, err := pool.QueryRowx("SELECT country, city, telcode FROM place where id = ?", 1)

//定义保存数据的结构体， 默认struct字段名（小写）跟表的字段名一致。
type Place struct {
    Country       string
    City          sql.NullString 
    Telcode       int 
}

var p Place

//使用StructScan函数将当前记录的数据保存到struct对象中
err = row.StructScan(&p)
```

#### 删除数据

```go
//定义sql语句，通过问号定义了一个参数
sql := "delete from place where id=?"

//通过Exec删除数据, 这里传入了一个参数，对应sql语句定义的问号所在的位置
result1,err := pool.Exec(sql, 1)

//获取删除影响行数
rowsAffected, _ := result1.RowsAffected()

//错误处理
if err != nil {
    fmt.Println("更新失败!")
}
```

#### 事务处理

```go
//开始一个事务，返回一个事务对象tx
tx, err := pool.Beginx()

//使用事务对象tx, 执行事务
err = tx.Queryx(...)
err = tx.Exec(...)
err = tx.Exec(...)

if err != nil {
    //回滚事务
    tx.Rollback()
}

//提交事务
err = tx.Commit()
```

注意：注意上面的事务格式，使用的是事务对象tx执行sql，而不是数据库对象，数据库对象执行sql每次都会申请一个新的数据库连接，会导致事务无效。

#### 关闭数据库连接

- 程序连接数据会有连接泄漏的情况，需要及时释放连接。
- go sql 包中的Query 这个方法不会自动释放连接，只有在遍历完结果或者调用close方法才会关闭连接。QueryRow 通过调用 Scan 方法，会自动关闭连接。
- go sql 中的 ping  和 exec 方法在调用结束以后就会自动释放连接
- 忽略了函数的某个返回值不代表这个值就不存在了，如果该返回值需要close 才会释放资源，直接忽略就会导致资源的泄露
- 有close 方法的变量，在使用后要及时调用该方法，释放资源

sql 在 open 之后实际上不需要close，在调用的function 里面，具体到 db.Query 后，用 defer rows.Close() 就行了























