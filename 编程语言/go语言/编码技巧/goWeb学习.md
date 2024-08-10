---
title: go语言Web学习
date: 2021-03-12 21:19:17
categories:
- 编程语言
tags:
- go
---

## Go Web

#### 1. Go http 代码分析

```go
package main

import (
    "fmt"
    "net/http"
)

type MyMux struct {
}

func (p *MyMux) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    if r.URL.Path == "/" {
        sayhelloName(w, r)
        return
    }
    http.NotFound(w, r)
    return
}

func sayhelloName(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Hello myroute!")
}

func main() {
    mux := &MyMux{}
    http.ListenAndServe(":9090", mux)
}
```

首先调用 Http.HandleFunc

按顺序做了几件事：

1 调用了 DefaultServeMux 的 HandleFunc

2 调用了 DefaultServeMux 的 Handle

3 往 DefaultServeMux 的 map [string] muxEntry 中增加对应的 handler 和路由规则

其次调用 http.ListenAndServe (":9090", nil)

按顺序做了几件事情：

1 实例化 Server

2 调用 Server 的 ListenAndServe ()

3 调用 net.Listen ("tcp", addr) 监听端口

4 启动一个 for 循环，在循环体中 Accept 请求

5 对每个请求实例化一个 Conn，并且开启一个 goroutine 为这个请求进行服务 go c.serve ()

6 读取每个请求的内容 w, err := c.readRequest ()

7 判断 handler 是否为空，如果没有设置 handler（这个例子就没有设置 handler），handler 就设置为 DefaultServeMux

8 调用 handler 的 ServeHttp

9 在这个例子中，下面就进入到 DefaultServeMux.ServeHttp

10 根据 request 选择 handler，并且进入到这个 handler 的 ServeHTTP

11 选择 handler：

A 判断是否有路由能满足这个 request（循环遍历 ServeMux 的 muxEntry）

B 如果有路由满足，调用这个路由 handler 的 ServeHTTP

C 如果没有路由满足，调用 NotFoundHandler 的 ServeHTTP

#### 2. JSON处理

在定义 struct tag 的时候需要注意：

- 字段的 tag 是 "-"，那么这个字段不会输出到 JSON
- tag 中带有自定义名称，那么这个自定义名称会出现在 JSON 的字段名中，例如上面例子中 serverName
- tag 中如果带有 "omitempty" 选项，那么如果该字段值为空，就不会输出到 JSON 串中
- 如果字段类型是 bool, string, int, int64 等，而 tag 中带有 ",string" 选项，那么这个字段在输出到 JSON 的时候会把该字段对应的值转换成 JSON 字符串

Marshal 函数需要注意：

- JSON 对象只支持 string 作为 key，所以要编码一个 map，那么必须是 map [string] T 这种类型 (T 是 Go 语言中任意的类型)
- Channel, complex 和 function 是不能被编码成 JSON 的
- 嵌套的数据是不能编码的，不然会让 JSON 编码进入死循环
- 指针在编码的时候会输出指针指向的内容，而空指针会输出 null

#### 3. Socket 编程

```go
// server

func checkError(err error) {
	if err != nil {
		fmt.Fprintf(os.Stderr, "Fatal error: %s", err.Error())
		os.Exit(1)
	}
}

func handleClient(conn net.Conn) {
	conn.SetDeadline(time.Now().Add(2*time.Second))
	request := make([]byte, 128)
	defer conn.Close()
	for {
		read_len, err := conn.Read(request)
		if err != nil {
			fmt.Println(err)
			break
		}
		if read_len == 0 {
			break
		}else if strings.TrimSpace(string(request[:read_len])) == "timestamp" {
			daytime := strconv.FormatInt(time.Now().Unix(), 10)
			conn.Write([]byte(daytime))
			//break
		}else {
			daytime := time.Now().String()
			conn.Write([]byte(daytime))
			//break
		}
		request = make([]byte, 128)
	}
}

func main() {
	service := ":7777"
	tcpAddr, err := net.ResolveTCPAddr("tcp4", service)
	checkError(err)
	listener, err := net.ListenTCP("tcp", tcpAddr)
	checkError(err)
	for {
		conn, err := listener.Accept()
		if err != nil {
			continue
		}
		go handleClient(conn)
	}
}
```

```go
func checkError(err error){
	if err != nil {
		fmt.Fprintf(os.Stderr,"Fatal error: %s",err.Error())
		os.Exit(1)
	}
}

func main(){
	if len(os.Args) != 2 {
		fmt.Fprintf(os.Stderr,"Usage: %s host:port", os.Args[0])
		os.Exit(1)
	}
	service := os.Args[1]
	tcpAddr,err := net.ResolveTCPAddr("tcp4",service)
	checkError(err)
	conn,err := net.DialTCP("tcp",nil,tcpAddr)
	checkError(err)
	_,err = conn.Write([]byte("HEAD / HTTP/1.0\r\n\r\n"))
	checkError(err)
	//result,err := ioutil.ReadAll(conn)
	for {
		data := make([]byte, 128)
		read_len, err := conn.Read(data)
		checkError(err)
		if read_len == 0 {
			break
		}
		fmt.Println(string(data))
	}
	conn.Close()
	os.Exit(0)
}
```

#### 4. WebSocket

WebSocket 是 HTML5 的重要特性，它实现了基于浏览器的远程 socket，它使浏览器和服务器可以进行全双工通信，许多浏览器（Firefox、Google Chrom e 和 Safari）都已对此做了支持。

#### 5. REST

REST 就是根据不同的 method 访问同一个资源的时候实现不同的逻辑处理

REST 是一种架构风格，汲取了 WWW 的成功经验：无状态，以资源为中心，充分利用 HTTP 协议和 URI 协议，提供统一的接口定义，使得它作为一种设计 Web 服务的方法而变得流行。在某种意义上，通过强调 URI 和 HTTP 等早期 Internet 标准，REST 是对大型应用程序服务器时代之前的 Web 方式的回归。目前 Go 对于 REST 的支持还是很简单的，通过实现自定义的路由规则，我们就可以为不同的 method 实现不同的 handle，这样就实现了 REST 的架构。

#### 6. RPC

RPC（Remote Procedure Call Protocol）—— 远程过程调用协议，是一种通过网络从远程计算机程序上请求服务，而不需要了解底层网络技术的协议。它假定某些传输协议的存在，如 TCP 或 UDP，以便为通信程序之间携带信息数据。通过它可以使函数调用模式网络化。在 OSI 网络通信模型中，RPC 跨越了传输层和应用层。RPC 使得开发包括网络分布式多程序在内的应用程序更加容易。

```go
// server 
type Args struct {
	A,B int
}
type Quotient struct {
	Quo, Rem int
}

type Arith int

func (t *Arith) Multiply(args *Args, reply *int ) error {
	*reply = args.A * args.B
	return nil
}
func (t *Arith) Divide (args *Args, quo *Quotient) error {
	if args.B == 0 {
		return errors.New("divide by zero")
	}
	quo.Quo = args.A / args.B
	quo.Rem = args.A % args.B
	return nil
}

func main(){
	arith := new(Arith)
	rpc.Register(arith)
	rpc.HandleHTTP()

	err := http.ListenAndServe(":1234",nil)
	if err != nil {
		fmt.Println(err.Error())
	}
}
```

```go
// client
type Args struct {
	A,B int
}
type Quotient struct {
	Quo,Rem int
}

func main(){
	if len(os.Args) != 2 {
		fmt.Println("Usage: ", os.Args[0], "server")
		os.Exit(1)
	}
	serverAddress := os.Args[1]
	client,err := rpc.DialHTTP("tcp",serverAddress+":1234")
	if err != nil {
		log.Fatalln("dialing:",err )
	}
	args := Args{17,8}
	var reply int
	err = client.Call("Arith.Multiply", args, &reply)
	if err != nil {
		log.Fatal("arith error:", err)
	}
	fmt.Println("Arith: %d*%d=%d\n",args.A, args.B, reply)

	var quot Quotient
	err = client.Call("Arith.Divide",args,&quot)
	if err != nil {
		log.Fatal("arith error:",err)
	}
	fmt.Println("Arith: %d/%d=%d remainder %d\n", args.A, args.B, quot.Quo, quot.Rem)
}
```

#### 7. MVC

MVC 是一种将应用程序的逻辑层和表现层进行分离的结构方式

- 模型 (Model) 代表数据结构。通常来说，模型类将包含取出、插入、更新数据库资料等这些功能。
- 视图 (View) 是展示给用户的信息的结构及样式。一个视图通常是一个网页，但是在 Go 中，一个视图也可以是一个页面片段，如页头、页尾。它还可以是一个 RSS 页面，或其它类型的 “页面”，Go 实现的 template 包已经很好的实现了 View 层中的部分功能。
- 控制器 (Controller) 是模型、视图以及其他任何处理 HTTP 请求所必须的资源之间的中介，并生成网页。

#### 8. Web 中间件框架

```go
type middleware func( http.Handler ) http.Handler

type MiddleWare struct {
	middlewareChain []middleware
	m map[string]http.Handler
}

func (m *MiddleWare) NewMiddleWare() *MiddleWare {
	return &MiddleWare{}
}

func (m *MiddleWare) Use(u middleware) {
	m.middlewareChain = append(m.middlewareChain, u)
}

func (m *MiddleWare) Add(route string, h http.Handler) {
	var mergeHandler = h
	for i := len(m.middlewareChain)-1;i >= 0;i-- {
		mergeHandler = m.middlewareChain[i](mergeHandler)
	}
	m.m[route] = mergeHandler
}

type muxHandle interface {
	handler(pattern string, handler http.Handler)
}

func (m *MiddleWare) Reg(mux muxHandle) {
	for k,v := range m.m {
		mux.handler(k,v)	
	}
}
```

