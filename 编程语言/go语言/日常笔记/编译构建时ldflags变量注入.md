## Go语言编译构建时 ldflags 变量注入

Go 语言在编译构建时，可以注入变量。如下：

```go
package main
import "fmt"

var Version = "0.0.1"
func main() {
    fmt.Println(Version)
}
```

- 如果不注入变量

    ```
    go build -o main main.go
    ./main
    0.0.1
    ```

- 注入变量。编译构建时，通过命令，注入 main 包的 Version 变量值 

    ```
    go build -ldflags "-X main.Version=0.0.9" -o main main.go
    ./main
    0.0.9
    ```

### 一、常见的写法

我们需要将编译构建的 ldflags 写到文件中，makefile 是比较常见的方式。如下示例

```
├── Makefile
├── VERSION
├── go.mod
├── main.go
└── version.go
|__ .git
```

version.go 的内容

```
package main

var (
    Version   string
    GoVersion string
    Built     string
    GitCommit string
    OSArch    string
)
```

main.go 的内容

```
package main

import (
    "flag"
    "fmt"
)

func main() {
    var v bool
    flag.BoolVar(&v, "v", false, "Show Version")
    flag.Parse()
    if v {
        fmt.Printf("Version    : %s \n", Version)
        fmt.Printf("Go Version : %s \n", GoVersion)
        fmt.Printf("Built      : %s \n", Built)
        fmt.Printf("Git Commit : %s \n", GitCommit)
        fmt.Printf("OS/Arch    : %s \n", OSArch)
    }
}
```

VERSION 文件的内容

```
0.0.9
```

Makefile 的内容

```
BIN = main

# 注入变量
VERSION = `cat VERSION`
GOVERSION = `go version`
BUILT = `date "+%F %T"`
GITCOMMIT = `git rev-parse HEAD`
OSARCH = `go env GOOS`/`go env GOARCH`

LDFLAGS = "\
	-X 'main.Version=${VERSION}' \
	-X 'main.GoVersion=${GOVERSION}' \
	-X 'main.Built=${BUILT}' \
	-X 'main.GitCommit=${GITCOMMIT}' \
	-X 'main.OSArch=${OSARCH}' "

main:
	go build -ldflags ${LDFLAGS} -o ${BIN}

clean:
	@echo "clean ..."
	@rm -f ${BIN}
	@echo "clean OK"

.PHONY: main clean
```

然后编译，运行

```
# make
go build -ldflags " -X 'main.Version=`cat VERSION`' -X 'main.GoVersion=`go version`' -X 'main.Built=`date "+%F %T"`' -X 'main.GitCommit=`git rev-parse HEAD`' -X 'main.OSArch=`go env GOOS`/`go env GOARCH`' " -o main

# ./main -v
Version    : 0.0.9 
Go Version : go version go1.15 darwin/amd64 
Built      : 2022-08-11 17:01:50 
Git Commit : d96d1a9e1d005423d2069effdc0eda32f142e7db 
OS/Arch    : darwin/amd64 
```