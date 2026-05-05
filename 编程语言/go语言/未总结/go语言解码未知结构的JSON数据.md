---
title: go语言解码未知结构的JSON数据
date: 2021-03-07 20:19:17
categories:
- 编程语言
tags:
- go
---

## go语言解码未知结构的JSON数据

http://c.biancheng.net/view/4524.html

在前面介绍接口的时候，我们提到基于Go语言的面向对象特性，可以通过空接口来表示任何类型，这同样也适用于对未知结构的 JSON 数据进行解码，只需要将这段 JSON 数据解码输出到一个空接口即可。

在实际解码过程中，JSON 结构里边的数据元素将做如下类型转换：

布尔值将会转换为Go语言的 bool 类型；

数值会被转换为Go语言的 float64 类型；

字符串转换后还是 string 类型；

JSON 数组会转换为 []interface{} 类型；

JSON 对象会转换为 map[string]interface{} 类型；

null 值会转换为 nil。

在Go语言标准库 encoding/json 中，可以使用map[string]interface{}和[]interface{}类型的值来分别存放未知结构的 JSON 对象或数组。

```go
func main(){
	u3 := []byte(`{"name":"helloworld","website":"http://google.com","course":["go","php","c++","java"]}`)
	var u4 interface{}
	err := json.Unmarshal(u3,&u4)
	if err != nil{
		fmt.Println("json unmarshal failed",err)
		return
	}
	u5 := u4.(map[string]interface{})
	for k,v := range u5{
		switch v2 := v.(type) {
		case string:
			fmt.Println("string",k,v,v2)
		case int:
			fmt.Println("int",k,v,v2)
		case []interface{}:
			for i,iv := range v2 {
				fmt.Println("[]interface{}", i, iv, k, v, v2)
			}
		}
	}
}
```
