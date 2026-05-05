---
title: go语言ini文件的操作
date: 2021-03-07 20:19:17
categories:
- 编程语言
tags:
- go
---

## ini包使用

#### 下载安装

```javascript
特定版本
go get gopkg.in/ini.v1
最新版
go get github.com/go-ini/ini
```

#### 数据源加载

```shell
一个 数据源 可以是 []byte 类型的原始数据，或 string 类型的文件路径。您可以加载 任意多个 数据源。如果您传递其它类型的数据源，则会直接返回错误。
cfg, err := ini.Load([]byte("raw data"), "filename")
或者从一个空白的文件开始：
cfg := ini.Empty()
当您在一开始无法决定需要加载哪些数据源时，仍可以使用 Append() 在需要的时候加载它们。
err := cfg.Append("other file", []byte("other raw data"))
```

#### 操作分区

```
获取指定分区
section,err := cfg.GetSection("section name")

如果想要获取默认分区，则可以使用空字符串代替分区名
section,err := cfg.GetSection("")

当您确定某个分区是存在的，可以使用简单的办法
section := cfg.Section("")
如果不小心判断错了，要获取的分区其实是不存在的，那会发生什么呢？没事的，它会自动创建并返回一个对应的分区对象给您。

创建一个分区：
err := cfg.NewSection("new section")

获取所有分区对象或名称
sections := cfg.Sections()
names := cfg.SectionStrings()
```

#### 操作键 ( key )

```
获取某个分区下的键
key,err := cfg.Section("").GetKey("key name")
和分区一样，你可以直接取键而忽略错误处理
key := cfg.Section("").Key("key name")
判断某个键是否存在
yes := cfg.Section("").HasKey("key name")
创建一个新的键
err := cfg.Section("").NewKey("name","value")
获取分区下所有键或键名
keys := cfg.Section("").Keys()
names := cfg.Section("").KeyStrings()
获取分区下所有键值对的克隆
hash := cfg.GetSection("").KeysHash()
```

#### 操作值（Value）

```
获取一个类型为字符串(string)的值
val := cfg.Section("").Key("key name").String()

获取值的同时通过自定义函数进行处理验证
val := cfg.Section("").Key("key name").Validate(func(in string) string { 
if len(in) == 0 { return "default" } return in } )

如果您不需要任何对值的自动转变功能(例如递归读取),可以直接获取原值
val := cfg.Section("").Key("key name").Value()

判断某个原值是否存在
yes := cfg.Section("").hasValue("test value")

可以获取其他类型的值,例如
v,err := cfg.Section("").Key("INT").Int()

如果键的值有多行，例如：
[advance]
ADDRESS=""" 404 road,
NotFound, State, 5000
Earth"""
可以这样：cfg.Section("advance").Key("advance").String()
```

其他高级操作暂时就不搞了。

#### 参考：

https://godoc.org/gopkg.in/ini.v1#Key
https://cloud.tencent.com/developer/article/1066126















