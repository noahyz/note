---
title: go语言操作protobuf
date: 2021-03-12 21:19:17
categories:
- 编程语言
tags:
- go
---

## go protobuf

#### 1. 开始

在go中使用protobuf，有两个可选用的包goprotobuf（go官方出品）和gogoprotobuf。
gogoprotobuf完全兼容google protobuf，它生成的代码质量和编解码性能均比goprotobuf高一些

protoc 是 protobuf 的编译器

- 使用 goprotobuf 

安装protobuf 库文件：go get github.com/golang/protobuf/proto
安装 goprotobuf插件：go get github.com/golang/protobuf/protoc-gen-go
生成go 文件：protoc --go_out=.  *.proto

- 使用 gogoprotobuf

gogoprotobuf有两个插件可以使用
protoc-gen-gogo：和 protoc-gen-go生成的文件差不多，性能也几乎一样(稍微快一点点)
protoc-gen-gofast：生成的文件更复杂，性能也更高(快5-7倍)

```
//gogo
go get github.com/gogo/protobuf/protoc-gen-gogo
//gofast
go get github.com/gogo/protobuf/protoc-gen-gofast
```

安装gogoprotobuf库文件

```
go get github.com/gogo/protobuf/proto
go get github.com/gogo/protobuf/gogoproto  //这个不装也没关系
```

生成 go 文件

```
//gogo
protoc --gogo_out=. *.proto
//gofast
protoc --gofast_out=. *.proto
```

#### protobuf 

```protobuf
syntax = "proto3";
package proto;

enum F00
{
  X = 0;
};

message UserInfo {
  string message = 1;
  int32 length = 2;
  int32 cnt = 3;
}
```

#### server

```go
func readMessage(conn net.Conn) {
	defer conn.Close()
	buf := make([]byte,4096,4096)
	for {
		cnt,err := conn.Read(buf)
		if err != nil {
			panic(err)
		}
		stReceive := &stProto.UserInfo{}
		pData := buf[:cnt]
		err = proto.Unmarshal(pData,stReceive)
		if err != nil {
			panic(err)
		}
		fmt.Println("receive",conn.RemoteAddr(),stReceive)
		if stReceive.Message == "stop" {
			os.Exit(1)
		}
	}
}

func main(){
	listener, err := net.Listen("tcp",":8000")
	if err != nil {
		panic(err)
	}
	for {
		conn,err := listener.Accept()
		if err != nil{
			panic(err)
		}
		fmt.Println("new connect",conn.RemoteAddr())
		go readMessage(conn)
	}
}
```

#### client

```go
func main(){
	strIP := ":8000"
	var conn net.Conn
	var err error

	for conn,err = net.Dial("tcp",strIP); err != nil; conn,err = net.Dial("tcp",strIP) {
		fmt.Println("connect",strIP,"fail")
		time.Sleep(1*time.Second)
		fmt.Println("reconnect...")
	}
	fmt.Println("connect",strIP,"success")
	defer conn.Close()
	cnt := 0
	sender := bufio.NewScanner(os.Stdin)
	for sender.Scan() {
		cnt++
		stSend := &stProto.UserInfo{
			Message: sender.Text(),
			Length: *proto.Int(len(sender.Text())),
			Cnt: *proto.Int(cnt),
		}
		pData,err := proto.Marshal(stSend)
		if err != nil {
			panic(err)
		}
		conn.Write(pData)
		if sender.Text() == "stop" {
			return
		}
	}
}
```

#### protobuf3 语法

https://colobu.com/2017/03/16/Protobuf3-language-guide/

























