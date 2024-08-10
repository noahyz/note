---
title: go语言[]interface 与其他[]类型的转换
date: 2021-03-07 20:19:17
categories:
- 编程语言
tags:
- go
---

go语言 []interface{} 和 其他 []type 之间的转换

https://stackoverflow.com/questions/27689058/convert-string-to-interface 

```golang
package main

import "fmt"

func main() {

    x := []string{"a", "b", "c", "d"}
    fmt.Printf("%T: %v\n", x, x)

    //converting a []string to a []interface{}
    y := make([]interface{}, len(x))
    for i, v := range x {
        y[i] = v
    }
    fmt.Printf("%T: %v\n", y, y)

    //converting a []interface{} to a []string
    z := make([]string, len(y))
    for i, v := range y {
        z[i] = fmt.Sprint(v)
    }
    fmt.Printf("%T: %v\n", z, z)

}
```
