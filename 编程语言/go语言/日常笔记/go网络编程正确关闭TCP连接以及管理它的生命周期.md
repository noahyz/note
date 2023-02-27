---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

### golang网络编程如何正确关闭TCP连接以及管理它的生命周期

以下讨论的 TCP 连接对象皆为 golang 的 net.conn 对象

#### 一、结论

1. Read 方法返回 EOF 错误，表示本端感知到对端已经关闭连接（本端已接收到对端发送的FIN，本端属于被动关闭，则处于CLOSE_WAIT状态）。此后如果不调用Close方法，只释放本端的连接对象，则连接处于非完全关闭状态（CLOSE_WAIT）。即文件描述符发生泄漏。
2. Write 方法返回 broken pipe 错误，表示本端感知到对端已经关闭连接（本端已接收到对端发送的RST）。此后本端可不调用Close方法。连接处于完全关闭状态
3. 由于 golang 里 net.conn 内部对文件描述符的所有 io 操作都有状态保护，所以即使在对端或本端关闭了连接之后，依然可以任意次数调用 Read、Write、Close 方法

建议：应该在Read或者Write 返回错误后调用Close，不论是主动关闭还是被动关闭，调用Close 后，不应该再 Read 或者 Write ，并尽快释放 net.conn 对象

#### 二、验证结论1

1. Client 主动连接上server 后不做任何操作，直接关闭 net.conn 对象。用于模拟主动关闭方

   ```go
   func main() {
   	conn, err := net.Dial("tcp", "0.0.0.0:9998")
   	if err != nil {
   		fmt.Println("client dial err = ", err)
   		return
   	}
   	conn.Close()
   }
   ```

2. server 在 accept 新连接之后，在新连接的处理函数中调用 Read 方法，Read 返回 io.EOF 后不调用 Close 方法，直到退出处理函数，释放连接对象

   ```go
   func process(conn net.Conn) {
   	buf := make([]byte, 1024)
   	for {
   		_, err := conn.Read(buf)
   		if strings.Contains(err.Error(), "EOF") {
   			fmt.Printf("receive EOF: %v \n", err.Error())
   			conn.Close()
   			return
   		}
   	}
   }
   
   func main() {
   	listen, err := net.Listen("tcp", "0.0.0.0:9998")
   	if err != nil {
   		fmt.Println("listen err = ", err)
   		return
   	}
   	defer listen.Close() // 延时关闭listen
   	//循环等待客户端来链接我
   	for {
   		//等待客户端链接
   		conn, err := listen.Accept()
   		if err != nil {
   			fmt.Println("Accept() err =", err)
   		} else {
   			fmt.Printf("Accept() suc con = %v 客户端 ip = %v\n", conn, conn.RemoteAddr().String())
   		}
   		//这里准备其一个协程，为客户端服务
   		go process(conn)
   	}
   }
   
   ```

结果启动server后，在启动client，server 打印出 EOF。netstat 结果

```shell
tcp        0      0 127.0.0.1:58805         127.0.0.1:9998          FIN_WAIT2   -                   
tcp6       0      0 :::9998                 :::*                    LISTEN      13374/./server      
tcp6       0      0 127.0.0.1:9998          127.0.0.1:58805         CLOSE_WAIT  13374/./server   
```

client 处于 FIN_WAIT_2 状态，说明client 发送了 FIN，并收到了 ACK

server 处于 CLOSE_WAIT 状态，说明server 收到了 FIN，并发送了 ACK。但server 没有发送 FIN 

#### 三、验证结论2

server 代码做如下修改

```go
	// 验证 Write broken pip
	buf := make([]byte, 1024)
	time.Sleep(5 * time.Second)
	n, err := conn.Write(buf)
	fmt.Println(n, err)
	time.Sleep(5 * time.Second)
	n, err = conn.Write(buf)
	fmt.Println(n, err)
```

client 不做变动，server 输出

```
1024 <nil>
0 write tcp 127.0.0.1:9998->127.0.0.1:32820: write: broken pipe
```

server 第一次 sleep 5s 是为了确保在第一次 Write 之前 client 已关闭连接

在5s秒内，netstat 观察： server 处于 CLOSE_WAIT 状态，client 处于 FIN_WAIT_2 状态

5s 之后，server 向 client 发送第一次1024字节数据后，client 向 server 回复 RST 报文。 两端都进入完全关闭状态。10s后，server并不会在发送第二次的1024 字节数据。

server 的第二次 sleep 5s 是为了确保在第一次 Write 之后，server 接收到了 RST 包。如果去掉第二次的 sleep，可能出现 server 连续发送两次数据给 client，client 回复两次 RST 给server 

#### 四、验证结论3

1. 对端关闭后，本端一直Read，则一直得到 EOF 错误。这是由于系统调用 Read 会一直返回 0 
2. 对端关闭后，本端一直 Write，则一直得到 broken pipe 错误，这是由于系统调用 Write 会一直返回 EPIPE
3. 本端关闭后，本端继续调用 Read 或 Write 或 Close，则一直得到 use of closed network connection 错误。这是由于 fd_mutex.go 中 mutexClosed 标志决定的，当文件描述符被关闭后，该标注会被设置，之后所有io 操作都会返回错误

