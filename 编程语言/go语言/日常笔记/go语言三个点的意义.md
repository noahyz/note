---
title: go语言三个点的意义
date: 2021-03-07 20:19:17
categories:
- 编程语言
tags:
- go
---

### golang 中的  ...  的意义

- 第一个用法主要是用于函数有多个不定参数的情况，表示为可变参数，可以接受任意个数但相同类型的参数。
- 第二个用法是slice可以被打散进行传递。

第一个例子：

```go
func test1(args ...string){  // 可以接受任意个string参数
	for _,v := range args {
		fmt.Println(v)
	}
}
func main(){
	var strss = []string{
			"123",
			"234",
			"345",
	}
	test1(strss...) // 切片被打散传入
}
```

第二个例子：

```go l
var strss = []string{
	"123",
	"234",
	"345",
}
var strss2 = []string{
	"qqq",
	"adf",
	"dsa",
}
strss = append(strss,strss2...)  // strss2的元素被打散成一个个append进行strss
```

