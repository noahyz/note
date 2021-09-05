---
title: go语言单元测试
date: 2021-03-21 12:19:17
categories:
- 编程语言
tags:
- go
---

## go语言单元测试

#### 1. go test 工具

- go test 运行整个项目的测试文件
- go test math_test.go math.go 只运行某个测试文件。（math_test.go、math.go是一对，缺一不可，前后顺序可对调）
- go test -v  math_test.go math.go 加上 -v 可以查看详细的结果
- go test -v -run='TestAdd' 只测试某个函数，-run 支持正则
- go test -v -run='TestAdd' -c 生成 test 的二进制文件，加上 -c 参数
- go test -v -o math.test  执行这个 test 测试文件，加上 -o 参数
- go test -i  只测试安装/重新安装 依赖包，而不运行代码，加上 -i 参数

#### 2. 单元测试框架要求

- 单元测试代码的go文件必须以 _test.go 结尾，而前面最好是测试的文件名（不过并不是强制的）
- 单元测试的函数名必须以 Test 开头，后面直接跟要测试的函数名。比如要测试 Add 函数，单元测试的函数名就得是 TestAdd
- 单元测试的函数必须接收一个指向 testing.T 类型的参数，并且不能返回任何值

#### 3. 表组测试

```go
// 对于多种输入场景的测试，可以同时在一个测试函数中测试
func TestAdd(t *testing.T) {
    sum:=Add(1,2)
    if sum == 3 {
        t.Log("the result is ok")
    } else {
        t.Fatal("the result is wrong")
    }

    sum=Add(2,4)
    if sum == 6 {
        t.Log("the result is ok")
    } else {
        t.Fatal("the result is wrong")
    }
}

// 表格测试法
type TestTable struct {
    xarg int
    yarg int
}

func TestAdd(t *testing.T){
    tables := []TestTable{
        {1,2},
        {2,4},
        {4,8},
        {5,10},
        {6,12},
    }

    for _, table := range tables{
        result := Add(table.xarg, table.yarg)
        if result == (table.xarg + table.yarg){
            t.Log("the result is ok")
        } else {
            t.Fatal("the result is wrong")
        }
    }
}
```

#### 4. 性能测试

- 前缀是 Benchmark 并且拥有一个 ` *testing.B` 参数。
- 使用 go test -bench=Add，或者使用 go test -bench=. 模式 . 使他匹配包中的所有基准测试函数。

```go
func BenchmarkAdd(b *testing.B) {
	for i:=0;i <b.N;i++{
		Add(1,2)
	}
}
goos: darwin
goarch: amd64
pkg: package_learn/unitTest
BenchmarkAdd
BenchmarkAdd-12    	1000000000	         0.254 ns/op
PASS
```

- 基准测试名称的数字后缀12代表 GOMAXPROCS 的值，后面是调用 1000000000 次的平均值。
- 参数 -benchmem 表示内存分配统计数据。

#### 5. Exacple 函数

- 这是 go test 的第三种函数，名字以 Example 开头，没有参数也没有结果。
- 有三种目的，一是作为文档，二是可以通过 go test 运行的可执行测试，三是提供手动实验代码。