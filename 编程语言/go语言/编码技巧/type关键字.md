---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

# type关键字

https://studygolang.com/articles/17179

```
package main

// 1. 定义结构体
type person struct {
	name string
	age int
}

func main(){
	p := person{"hello",12}
	p1 := person{"hello"}
	fmt.Println(p.age,p.name)
	fmt.Println(p1.name,p1.age)
}

// 2. 类型等价定义，相当于类型重命名
type name string

func main(){
	var myname name = "zhangyi"
	//l := []byte(myname)
	fmt.Println(myname)
}

// 3. 结构体内嵌匿名成员
type person struct {
	string
	age int
}

func main(){
	p := person{"nihao",12}
	p2 := person{string:"world",age:18}
	fmt.Println(p.string,p2.string)
}

// 4.接口类型定义
type Personer interface {
	Run()
	Name() string
}

type person struct {
	name string
	age int
}
func (person) Run(){
	fmt.Println("run")
}
func (p person) Name() string{
	return p.name
}

func main(){
	var p Personer
	fmt.Println(p)

	p = person{"hello",12}
	p.Run()
	fmt.Println(p.Name())

	var p2 person = p.(person)
	fmt.Println(p2.age)
	if p3,ok := p.(person); ok{
		fmt.Println(ok)
		fmt.Println(p3.age)
	}
}

// 5.定义函数类型
type handler func(name string) int

func (h handler) add(name string) int{
	return h(name) + 10
}

```
