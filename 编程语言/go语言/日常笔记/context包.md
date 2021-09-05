# context包

https://segmentfault.com/a/1190000024441501

func WithCancel(parent Context) (ctx Context, cancel CancelFunc)

func WithDeadline(parent Context, deadline time.Time) (Context, CancelFunc)

func WithTimeout(parent Context, timeout time.Duration) (Context, CancelFunc)

func WithValue(parent Context, key, val interface{}) Context

```
func main(){
	ctx,cancel := context.WithTimeout(context.Background(),10*time.Second)
	defer cancel()
	go Monitor(ctx)
	time.Sleep(20*time.Second)
}
func Monitor(ctx context.Context){
	select {
	case <- ctx.Done():
		fmt.Println(ctx.Err())
	case <- time.After(20*time.Second):
		fmt.Println("stop monitor")
	}
}
```

这篇学习：https://segmentfault.com/a/1190000024441501

## 上下文 Context 包详解

context.Context 接口定义了四个需要实现的方法，包括：

1. Deadline：返回 context.Context 被取消的时间，也就是完成工作的截止日期
2. Done：返回一个Channel，这个Channel 会在当前工作完成或者上下文被取消后关闭，多次调用Done方法会返回同一个 Channel
3. Err：返回context.Context 结束的原因，它只会在Done方法对应的Channel关闭时返回非空的值
    1. 如果 context.Context 被取消，会返回 Canceled 错误
    2. 如果 context.Context 超时，会返回 DeadlineExceeded 错误
4. Value：从context.Context 中获取键对应的值，对于同一个上下文来说，多次调用Value 并传入相同的 Key 会返回相同的结果，该方法用来传递请求特定的数据。

```go
type Context interface {
	Deadline() (deadline time.Time, ok bool)
	Done() <-chan struct{}
	Err() error
	Value(key interface{}) interface{}
}
```

##### 1. 默认上下文

context.Background 和 context.TODO 互为别名，没有太大差别。

- context.Background 是上下文的默认值，所有其他的上下文都应该从它衍生出来
- context.TODO 应该仅在不确定应该使用那种上下文时使用

在多数情况下，如果当前函数没有上下文作为入参，我们都会使用 [`context.Background`](https://draveness.me/golang/tree/context.Background) 作为起始的上下文向下传递。

##### 2. 取消信号

- context.WithCancel 

```go
func main()  {
    ctx,cancel := context.WithCancel(context.Background())
    defer cancel()
    go Speak(ctx)
    time.Sleep(10*time.Second)
}

func Speak(ctx context.Context)  {
    for range time.Tick(time.Second){
        select {
        case <- ctx.Done():
            return
        default:
            fmt.Println("balabalabalabala")
        }
    }
}
```

我们使用`withCancel`创建一个基于`Background`的ctx，然后启动一个讲话程序，每隔1s说一话，`main`函数在10s后执行`cancel`，那么`speak`检测到取消信号就会退出。

- context.WithDeadline

```go
func main()  {
    now := time.Now()
    later,_:=time.ParseDuration("10s")
    ctx,cancel := context.WithDeadline(context.Background(),now.Add(later))
    defer cancel()
    go Monitor(ctx)
    time.Sleep(20 * time.Second)
}
func Monitor(ctx context.Context)  {
    select {
    case <- ctx.Done():
        fmt.Println(ctx.Err())
    case <-time.After(20*time.Second):
        fmt.Println("stop monitor")
    }
}
```

设置一个监控`goroutine`，使用WithTimeout创建一个基于Background的ctx，其会当前时间的10s后取消

- context.WithTimeout

```go
func main()  {

    ctx,cancel := context.WithTimeout(context.Background(),10 * time.Second)
    defer cancel()
    go Monitor(ctx)
    time.Sleep(20 * time.Second)
}
func Monitor(ctx context.Context)  {
    select {
    case <- ctx.Done():
        fmt.Println(ctx.Err())
    case <-time.After(20*time.Second):
        fmt.Println("stop monitor")
    }
}
```

##### 3. 传值方法

1. context.WithValue

```go
type key string

func main()  {
    ctx := context.WithValue(context.Background(),key("asong"),"Golang梦工厂")
    Get(ctx,key("asong"))
    Get(ctx,key("song"))
}

func Get(ctx context.Context,k key)  {
    if v, ok := ctx.Value(k).(string); ok {
        fmt.Println(v)
    }
}
```

为了避免多个包同时使用context 而带来冲突，key不建议使用string或者其他内置类型，所以建议自定义key类型。

 



























