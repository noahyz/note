---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

## 一、性能测试神器 wrk 使用

wrk 底层基于 epoll 和 kqueue 实现，能充分利用 CPU 资源，降低测试工具本身性能开销对测试结果准确性的影响。支持使用 lua 脚本自定义测试逻辑

安装：linux版本： https://github.com/wg/wrk/wiki/Installing-wrk-on-Linux

使用 wrk 用法：

```shell
Usage: wrk <options> <url>                            
  Options:                                            
    -c, --connections <N>  Connections to keep open   
    -d, --duration    <T>  Duration of test           
    -t, --threads     <N>  Number of threads to use   
                                                      
    -s, --script      <S>  Load Lua script file       
    -H, --header      <H>  Add header to request      
        --latency          Print latency statistics   
        --timeout     <T>  Socket/request timeout     
    -v, --version          Print version details      
                                                      
  Numeric arguments may include a SI unit (1k, 1M, 1G)
  Time arguments may include a time unit (2s, 2m, 2h)
```

参数说明

| 参数      | 说明                       |
| --------- | -------------------------- |
| -c        | 与服务器保持的 HTTP 连接数 |
| -d        | 压测时间                   |
| -t        | 使用线程数                 |
| -s        | 自定义 lua 脚本路径        |
| -H        | 自定义 http header 请求头  |
| --latency | 打印延迟统计数据           |
| --timeout | http 超时时间              |
| --version | 打印版本信息               |

### 1. 编写 lua 测试脚本

使用 lua 脚本可以实现复杂的测试场景。如下：

```
wrk.method = "POST"
wrk.body = "foo=bar&hello=world"
wrk.headers["content-Type"] = "application/x-www-form-urlencoded"
```

执行

```
wrk -d3s -c2 -s /tmp/post.lua http://xxx.com/get 
```

wrk 是一个内置的全局 table 类型变量，不需要定义可以直接使用，修改 wrk 变量的值，会会所有请求都生效

```
wrk = {
    scheme  = "http",
    host    = "localhost",
    port    = nil,
    method  = "GET",
    path    = "/",
    headers = {},
    body    = nil,
    thread  = <userdata>
}
```

### 2. 生命周期回调函数

wrk 包含下面几个生命周期，在脚本中重新定义这些全局函数，可以修改 wrk 默认行为，实现个性化测试需求。这些函数是可选的，如果定义了就必须实现

```
global setup    -- called during thread setup
global init     -- called when the thread is starting，
global delay    -- called to get the request delay，
global request  -- called to generate the HTTP request，
global response -- called with HTTP response data，
global done     -- called with results of run
```

#### (1). 启动阶段

- setup 每个线程初始化时执行一次

     `function setup(thread)` 

    setup 方法会传入一个 thread 对象，可以修改或设置 thread 相关参数，也可以终止线程执行，这里一般做一些初始化的工作，例如读取配置文件，加载到内存（不要每次请求的时候读取一遍，这样对测试准确性影响很大）

    ```
    thread.addr             - get or set the thread's server address，获取或设置服务器地址信息
    thread:get(name)        - get the value of a global in the thread's env，获取当前线程参数
    thread:set(name, value) - set the value of a global in the thread's env，设置线程当前参数
    thread:stop()           - stop the thread，终止线程
    ```

#### (2). 执行阶段

- init 每个线程开始启动时执行一次

    `function init(args)`

    args 是通过命令行传入的参数，通过 `--` 指定

    例如: `wrk -d3s -c2 -s wrk.lua https://xxx.org/get -- test 100`

    ```
    function init(args) 
    	for i, v in ipairs(args) do 
    		print(i, v)
    	end
    end 
    ```

- delay 每次发送请求时，间隔时间（ms），每次请求执行一次

    `function delay()`

    返回值决定每次请求间隔

- request 创建 request 时（发送 request 前）执行，每次请求执行一次

    `function request()`

    一般在这里会配合 `wrk.format` 方法，动态创建请求，这里不要执行耗时的代码，否则会影响测试结果准确性

- Response http 响应时执行，每次请求执行一次

    `function response(status, headers, body)`

    http 响应处理逻辑，参数对应 http 响应的 `status`, `headers`, `body`。

    注意：解析 header 和 body 的开销比较大，如果脚本没有定义 `response` 方法，wrk 将不会解析 header 和 body，这样测试结果会更加准确（解析响应数据是客户端负责的，不能算到服务器处理时间里面）

#### (3). 结束阶段

- done 返回结果时执行，整个测试过程只执行一次，可以生成自定义测试报告，如果没有特别需求，一般不重写这个方法

    ```
    function done(summary, latency, requests)
    参数含义如下：
    
    latency.min              -- minimum value seen
    latency.max              -- maximum value seen
    latency.mean             -- average value seen
    latency.stdev            -- standard deviation
    latency:percentile(99.0) -- 99th percentile value
    latency(i)               -- raw value and count
    
    summary = {
      duration = N,  -- run duration in microseconds
      requests = N,  -- total completed requests
      bytes    = N,  -- total bytes received
      errors   = {
        connect = N, -- total socket connection errors
        read    = N, -- total socket read errors
        write   = N, -- total socket write errors
        status  = N, -- total HTTP status codes > 399
        timeout = N  -- total request timeouts
      }
    }
    ```

### 3. wrk 内置函数

- wrk.format：

    `function wrk.format(method, path, headers, body)`

    返回一个 http 请求字符串，参数会覆盖 wrk 全局配置，可以通过 format 构造出不同的 request 

- wrk.lookup：

    `function wrk.lookup(host, service)`

    返回所有可用服务器的地址信息

- wrk.connect：

    `function wrk.connect(addr)`

    测试指定的服务器地址是否能正常连接

```
local addrs = nil

function setup(thread)
  if not addrs then
      addrs = wrk.lookup(wrk.host, wrk.port or "http")
      for i = #addrs, 1, -1 do
        if not wrk.connect(addrs[i]) then
            table.remove(addrs, i)
        end
      end
  end

  thread.addr = addrs[math.random(#addrs)]
end

function init(args)
  local msg = "thread addr: %s"
  print(msg:format(wrk.thread.addr))
end
```

### 4. 例子

官方示例：

```lua
local counter = 1
local threads = {}

function setup(thread)
   thread:set("id", counter)
   table.insert(threads, thread)
   counter = counter + 1
end

function init(args)
   requests  = 0
   responses = 0

   local msg = "thread %d created"
   print(msg:format(id))
end

function request()
   requests = requests + 1
   return wrk.request()
end

function response(status, headers, body)
   responses = responses + 1
end

function done(summary, latency, requests)
   for index, thread in ipairs(threads) do
      local id        = thread:get("id")
      local requests  = thread:get("requests")
      local responses = thread:get("responses")
      local msg = "thread %d made %d requests and got %d responses"
      print(msg:format(id, requests, responses))
   end
end
```

