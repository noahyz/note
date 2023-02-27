---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

## panic 和 recover

- panic 能够改变程序的控制流，调用 panic 后会立刻停止执行当前函数的剩余代码，并在当前 Goroutine 中递归执行调用方的 defer
- recover 可以中止 panic 造成的程序崩溃。该函数只能在 defer 中发挥作用，在其他作用域中调用不会发挥作用

### 一、现象

- panic 只会触发当前 Goroutine 的 defer
- recover 只有在 defer 中调用才会生效
- panic 允许在 defer 中嵌套多次调用

#### 1. 跨协程失效

panic 只会触发当前 Goroutine 的延迟调用函数（defer）

```go
func main() {
    defer println("in main")
    go func() {
       defer println("in goroutine")
       panic("panic in goroutine")
    }()
    time.Sleep(1 * time.Second)
}
输出：
in goroutine
panic: panic in goroutine
```

defer 关键字对应的 `runtime.deferproc` 会将延迟调用函数与调用方所在的 Goroutine 进行关联。

- 当程序发生崩溃时，只会调用当前 Goroutine 的延迟调用函数。
- 多个 Goroutine 之间没有太多关联，一个 Goroutine 在触发 panic 时也不应该执行其他 Goroutine 的延迟函数

#### 2. recover 只有在 defer 中调用才能生效

```go
func main() {
    defer println("in main")
    if err := recover(); err != nil {
        println(err)
    }
    panic("panic")
}
```

recover 是在 panic 之前调用的，并不满足生效的条件，所以需要在 defer 中使用 recover 关键字

#### 3. 嵌套崩溃

```go
func main() {
  defer fmt.Println("in main")
  defer func() {
      defer func() {
          panic("panic again and again")
      }()
      panic("panic again")
  }()

  panic("panic once")
}
输出：
in main
panic: panic once
        panic: panic again
        panic: panic again and again

```

程序多次执行 panic 也不会影响 defer 函数的正常执行。

### 二、底层实现

panic 关键字在 Go 语言源码中由 `runtime._panic` 实现。

```
type _panic struct {
	argp      unsafe.Pointer
	arg       interface{}
	link      *_panic
	recovered bool
	aborted   bool
	pc        uintptr
	sp        unsafe.Pointer
	goexit    bool
}
```

- argp 是指向 defer 调用时参数的指针
- arg 是调用 panic 时传入的参数
- link 是链表，指向更早调用的 `runtime._panic` 结构。panic 函数可以被连续多次调用，他们之间通过 link 可以组成链表
- recovered 表示当前 `runtime._panic` 是否被 recover 恢复
- aborted 表示当前 panic 是否被强行终止
- 结构体中的 3 个字段 pc、sp 和 goexit 都是为了修复 `runtime.Goexit` 带来的问题。`runtime.Goexit` 能够只结束该函数的 Goroutine 而不影响其他 Goroutine，但是该函数会被 defer 中的 panic 和 recover 取消，引入这 3 个字段就是为了保证该函数一定会生效

#### 程序崩溃和恢复的过程

- 编译器会负责转换关键字：
    - 将 panic 和 recover 分别转换成 `runtime.gopanic` 和 `runtime.gorecover`
    - 将 defer 转换成 `runtime.deferproc` 函数
    - 在调用 defer 的函数末尾调用 `runtime.deferreturn` 函数
- 在运行过程中遇到 `runtime.gopanic` 方法时，会从 Goroutine 的链表依次取出 `runtime._defer` 结构体并执行
- 如果调用延迟执行函数时遇到 `runtime.gorecover`，就会将 `runtime._panic.recovered` 标记成 true 并返回 panic 的参数
    - 在这次调用结束之后，`runtime.gopanic` 会从 `runtime._defer` 结构体中取出程序计数器 pc 和栈指针 sp，并调用 `runtime.recovery` 函数执行恢复程序
    - `runtime.recovery`会根据传入的 pc 和 sp 跳转回 `runtime.deferproc` 
    - 编译器自动生成的代码会发现 `runtime.deferproc` 的返回值不为 0 ，这时会跳回 `runtime.deferreturn` 并恢复到正常的执行流程
- 如果没有遇到 `runtime.gorecover`，就会依次遍历所有 `runtime._defer`，在最后调用 `runtime.fatalpanic` 中止程序、打印 panic 的参数并返回错误码