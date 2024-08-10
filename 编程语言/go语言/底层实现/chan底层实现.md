---
title: channel底层实现
date: 2023-01-19 11:11:41
tags:
- go
---

### 1. channel （go）实现

首先明确go语言的设计模块：不要通过共享内存的方式进行通信，而是应该通过通信的方式共享内存。这样在我看来让 go 语言代码更加整洁。因此 go 语言中 Goroutine 之间会通过 Channel 传递数据。基于go 1.15 版本，Channel 的实现：

#### 1.1 Channel 底层数据结构

chan 的底层数据结构如下：

```go
type hchan struct {
	qcount   uint           // 元素个数
	dataqsiz uint           // 环形队列的长度
	buf      unsafe.Pointer // 指向环形队列的指针
	elemsize uint16         // 环形队列中每个元素的大小
	closed   uint32         // chan 是否被关闭
	elemtype *_type         // 环形队列中元素的类型
	sendx    uint           // 环形队列中发送操作处理到的位置
	recvx    uint           // 环形队列中接收操作处理到的位置
	recvq    waitq          // 处于阻塞状态的接收 Goroutine 双向链表
	sendq    waitq  	    // 处于阻塞状态的发送 Goroutine 双向链表
	lock mutex	            // 互斥锁
}
```

chan 使用 make 关键字创建，可以带缓冲区的异步 Channel 和不带缓冲区的同步 Channel。这里对创建过程不做赘述。基本上分为三种情况：

1. 如果 Channel 不存在缓冲区，那么就只会给 hchan 结构体分配内存空间
2. 如果 Channel 存储的类型不是指针类型，会为当前的 Channel 和底层的缓冲区（hchan.buf）分配一块连续的内存空间
3. 其他情况会单独给 hchan 和缓冲区（hchan.buf）分配内存

#### 1.2 写数据

向 Channel 写数据，`chan <- data` 这样的操作最终会调用 `runtime.chansend` 函数，如下代码只保留了关键逻辑

```go
func chansend(c *hchan, ep unsafe.Pointer, block bool, callerpc uintptr) bool {
    // 首先会加锁
	lock(&c.lock)
    // 如果 Channel 中已经有处于接收等待状态的 Goroutine，那么会直接从接收队列 recvq 中取出最先陷入等待的 Goroutine 并直接向它发送数据
	if sg := c.recvq.dequeue(); sg != nil {
		// 发送数据，底层处理如下
        // 1. 调用 runtime.sendDirect 将发送的数据直接拷贝到 x <- c 表达式中变量 x 所在的内存地址
        // 2. 调用 runtime.goready 将等待接收数据的 Goroutine 标记为可运行，并把放到处理器的 runnext 上等待执行，该处理器会在下一次调度时唤醒它
        // 3. 解锁返回
		send(c, sg, ep, func() { unlock(&c.lock) }, 3)
		return true
	}
	// 如果 Channel 包含缓冲区并且缓冲区没有满，则将数据存储于缓冲区
	if c.qcount < c.dataqsiz {
		// 得到一个可以存储数据的位置，就是计算底层内存块的指针位置，根据存储元素的类型大小
		qp := chanbuf(c, c.sendx)
		// 内部调用 memmove 将发送的数据拷贝到缓冲区
		typedmemmove(c.elemtype, qp, ep)
        // 更新已发送操作的位置索引，因为底层内存块类似于一个环形数组，所以会判断是否回到数组开始位置
		c.sendx++
		if c.sendx == c.dataqsiz {
			c.sendx = 0
		}
        // 更新已存储的元素个数，解锁返回
		c.qcount++
		unlock(&c.lock)
		return true
	}
	// block 为 true 代表阻塞发送
    // 如果设置非阻塞发送，但是缓冲区满了，只能解锁返回false
	if !block {
		unlock(&c.lock)
		return false
	}
	// 下面代表 block为 true，阻塞写数据
	// 获取写数据使用的 Goroutine
	gp := getg()
    // 获取 runtime.sudog 的结构并设置这一次阻塞写的相关信息
	mysg := acquireSudog()
	mysg.releasetime = 0
	mysg.elem = ep
	mysg.waitlink = nil
	mysg.g = gp
	mysg.isSelect = false
	mysg.c = c
	gp.waiting = mysg
	gp.param = nil
    // 将创建并初始化的 runtime.sudog 加入到 Channel 的写阻塞等待队列中
	c.sendq.enqueue(mysg)
    // 将当前 Goroutine 陷入睡眠等待唤醒
	gopark(chanparkcommit, unsafe.Pointer(&c.lock), waitReasonChanSend, traceEvGoBlockSend, 2)
    // 被调度器唤醒后会执行一些析构的动作
	gp.waiting = nil
	gp.activeStackChans = false
	gp.param = nil
	mysg.c = nil
	releaseSudog(mysg)
	return true
}
```

如上面代码的注释，总结下写 Channel 的几种情况

1. 如果 Channel 的接收队列上存在已经被阻塞的 Goroutine，那么会直接将数据发送给这个 Goroutine，并设置其为下一个可运行的 Goroutine
2. 如果 Channel 存在缓冲区并且还有空闲的容量，则将数据存储在缓冲区
3. 如果不满足上述条件。设置为非阻塞，直接返回；设置为阻塞，则会创建一个 runtime.sudog 结构并加入 Channel 的发送队列中，当前 Goroutine 陷入阻塞等待其他 Goroutine 从 Channel 接收数据。

#### 1.3 读数据

从 Channel 读数据，`i <- chan` 这样的操作最终会调用 `runtime.chanrecv` 函数，如下代码只保留了关键逻辑

```go
func chanrecv(c *hchan, ep unsafe.Pointer, block bool) (selected, received bool) {
	// 首先加锁
	lock(&c.lock)
	// 当 Channel 中发送阻塞队列中包含处于等待状态的 Goroutine 时，取出队列头部等待的 Goroutine，接收其数据
	if sg := c.sendq.dequeue(); sg != nil {
		// 如果 Channel 不存在缓冲区，则将发送队列中 Goroutine 存储的数据拷贝到目标内存地址
        // 如果 Channel 存在缓冲区，先将队列中的数据拷贝到接收方的内存地址，再将发送队列头的数据拷贝到缓冲区，释放一个阻塞的发送方 Goroutine 
		recv(c, sg, ep, func() { unlock(&c.lock) }, 3)
		return true, true
	}
	// 当缓冲区包含数据
	if c.qcount > 0 {
		// 获取 Channel 中当前可以接收数据的位置
		qp := chanbuf(c, c.recvx)
		// 将缓冲区的数据拷贝到内存
		if ep != nil {
			typedmemmove(c.elemtype, ep, qp)
		}
        // 清理队列中的数据并完成收尾工作，解锁返回
		typedmemclr(c.elemtype, qp)
		c.recvx++
		if c.recvx == c.dataqsiz {
			c.recvx = 0
		}
		c.qcount--
		unlock(&c.lock)
		return true, true
	}
	// block 为 true 表示阻塞
    // 如果 block 设置为不阻塞的话，直接解锁退出
	if !block {
		unlock(&c.lock)
		return false, false
	}
	// 当 Channel 的发送队列中不存在等待的 Goroutine 并且缓冲区也不存在任何数据时，且设置为阻塞，执行如下
	gp := getg()
    // 创建一个 runtime.sudog 结构并初始化一些阻塞读的相关信息
	mysg := acquireSudog()
	mysg.releasetime = 0
	mysg.elem = ep
	mysg.waitlink = nil
	gp.waiting = mysg
	mysg.g = gp
	mysg.isSelect = false
	mysg.c = c
	gp.param = nil
    // 将创建并初始化的 runtime.sudog 加入到 Channel 的读阻塞等待队列中
	c.recvq.enqueue(mysg)
    // 将当前 Goroutine 陷入睡眠等待唤醒
	gopark(chanparkcommit, unsafe.Pointer(&c.lock), waitReasonChanReceive, traceEvGoBlockRecv, 2)
    // 被调度器唤醒后会执行一些析构的动作
	gp.waiting = nil
	gp.activeStackChans = false
	closed := gp.param == nil
	gp.param = nil
	mysg.c = nil
	releaseSudog(mysg)
	return true, !closed
}
```

读操作主要逻辑如上代码，总结下读 Channel 的几种情况：

1. 如果 Channel 的发送队列中存在挂起的 Goroutine，则会将接收位置索引所在的数据拷贝到接收变量所在的内存空间，并将发送队列中的头部 Goroutine 的数据拷贝到缓冲区，且释放这个 Goroutine
2. 如果 Channel 的缓冲区中包含数据，则直接拷贝接收位置索引对应的数据
3. 如果 Channel 的缓冲区无数据且为阻塞模式，则挂起当前 Goroutine，将 runtime.sudog 结构加入接收队列并陷入睡眠等待调度器的唤醒

#### 1.4 总结 Channel

从 Channel 的实现可以看出，Channel 是一个多读多写的线程安全队列。通过使用 Channel 来同步对内存的访问，实际上就是在使用锁。而对比测试 sync 包中的互斥锁和 Channel，使用 Go 内置的基准测试，得出如下数据：

```shell
BenchmarkSimpleSet-8 3000000 391 ns/op          # mutex
BenchmarkSimpleChannelSet-8 1000000 1699 ns/op  # buffer channel
BenchmarkSimpleChannelSet-8 1000000 2252 ns/op  # no buffer channel
```

数据来自：https://bravenewgeek.com/go-is-unapologetically-flawed-heres-why-we-use-it/

 就 Channel 单纯从线程安全队列的实现角度来看的话，应该还有很大的提升空间。尤其是锁的范围太大，Golang 开发者也应该是这样想的，可以解释为什么在Golang 的标准库，比如“net/http”的实现中几乎找不到 Channel，几乎全是 Mutex。 不过 Channel 更适合做一种协调模式，一种用通信来解决共享内存的安全性的方法。大部分场景使用 Channel 已经完全可以应付或解决多线程安全性问题。如果对性能特别特别敏感，那就要考虑清楚使用 Channel 了。
