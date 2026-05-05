---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

## 压力测试工具之 ab

ab 命令会创建多个并发访问线程，模拟多个访问者同时对某一 URL 地址进行访问

### 一、参数说明

```
Usage: ab [options] [http[s]://]hostname[:port]/path
Options are:
    -n requests     Number of requests to perform
    -c concurrency  Number of multiple requests to make at a time
    -t timelimit    Seconds to max. to spend on benchmarking
                    This implies -n 50000
    -s timeout      Seconds to max. wait for each response
                    Default is 30 seconds
    -b windowsize   Size of TCP send/receive buffer, in bytes
    -B address      Address to bind to when making outgoing connections
    -p postfile     File containing data to POST. Remember also to set -T
    -u putfile      File containing data to PUT. Remember also to set -T
    -T content-type Content-type header to use for POST/PUT data, eg.
                    'application/x-www-form-urlencoded'
                    Default is 'text/plain'
    -v verbosity    How much troubleshooting info to print
    -w              Print out results in HTML tables
    -i              Use HEAD instead of GET
    -x attributes   String to insert as table attributes
    -y attributes   String to insert as tr attributes
    -z attributes   String to insert as td or th attributes
    -C attribute    Add cookie, eg. 'Apache=1234'. (repeatable)
    -H attribute    Add Arbitrary header line, eg. 'Accept-Encoding: gzip'
                    Inserted after all normal header lines. (repeatable)
    -A attribute    Add Basic WWW Authentication, the attributes
                    are a colon separated username and password.
    -P attribute    Add Basic Proxy Authentication, the attributes
                    are a colon separated username and password.
    -X proxy:port   Proxyserver and port number to use
    -V              Print version number and exit
    -k              Use HTTP KeepAlive feature
    -d              Do not show percentiles served table.
    -S              Do not show confidence estimators and warnings.
    -q              Do not show progress when doing more than 150 requests
    -g filename     Output collected data to gnuplot format file.
    -e filename     Output CSV file with percentages served
    -r              Don't exit on socket receive errors.
    -h              Display usage information (this message)
    -Z ciphersuite  Specify SSL/TLS cipher suite (See openssl ciphers)
    -f protocol     Specify SSL/TLS protocol
                    (SSL3, TLS1, TLS1.1, TLS1.2 or ALL)
```

参数说明

```
-n：在测试会话中所执行的请求个数。默认时，仅执行一个请求。

-c：一次产生的请求个数。默认是一次一个。

-t：测试所进行的最大秒数。其内部隐含值是-n 50000，它可以使对服务器的测试限制在一个固定的总时间以内。默认时，没有时间限制。

-p：包含了需要POST的数据的文件。

-P：对一个中转代理提供BASIC认证信任。用户名和密码由一个:隔开，并以base64编码形式发送。无论服务器是否需要(即是否发送了401认证需求代码)，此字符串都会被发送。

-T：POST数据所使用的Content-type头信息。

-v：设置显示信息的详细程度-4或更大值会显示头信息，3或更大值可以显示响应代码(404,200等),2或更大值可以显示警告和其他信息。

-V：显示版本号并退出。

-w：以HTML表的格式输出结果。默认时，它是白色背景的两列宽度的一张表。

-i：执行HEAD请求，而不是GET。

-x：设置<table>属性的字符串。

-X：对请求使用代理服务器。

-y：设置<tr>属性的字符串。

-z：设置<td>属性的字符串。

-C：对请求附加一个Cookie:行。其典型形式是name=value的一个参数对，此参数可以重复。

-H：对请求附加额外的头信息。此参数的典型形式是一个有效的头信息行，其中包含了以冒号分隔的字段和值的对(如,"Accept-Encoding:zip/zop;8bit")。

-A：对服务器提供BASIC认证信任。用户名和密码由一个:隔开，并以base64编码形式发送。无论服务器是否需要(即,是否发送了401认证需求代码)，此字符串都会被发送。

-h：显示使用方法。

-d：不显示"percentage served within XX [ms] table"的消息(为以前的版本提供支持)。

-e：产生一个以逗号分隔的(CSV)文件，其中包含了处理每个相应百分比的请求所需要(从1%到100%)的相应百分比的(以微妙为单位)时间。由于这种格式已经“二进制化”，所以比'gnuplot'格式更有用。

-g：把所有测试结果写入一个'gnuplot'或者TSV(以Tab分隔的)文件。此文件可以方便地导入到Gnuplot,IDL,Mathematica,Igor甚至Excel中。其中的第一行为标题。

-i：执行HEAD请求，而不是GET。

-k：启用HTTP KeepAlive功能，即在一个HTTP会话中执行多个请求。默认时，不启用KeepAlive功能。

-q：如果处理的请求数大于150，ab每处理大约10%或者100个请求时，会在stderr输出一个进度计数。此-q标记可以抑制这些信息。
```

### 二、性能指标

#### 1. 吞吐率（requests per second）

指的是某个并发用户数下单位时间内处理的请求数。最大吞吐率，某个并发用户数下单位时间内能处理的最大请求数

注意：吞吐率是基于并发用户数的，不同的并发用户数下，吞吐率一般是不同的

#### 2. 并发连接数（The number of concurrent connections）

指的是某个时刻服务器所接受的请求数目，简单来说，就是一个会话

#### 3. 并发用户数（Concurrency Level）

一个用户可能同时会产生多个会话，也即连接数。在HTTP/1.1下，IE7支持两个并发连接，IE8支持6个并发连接，FireFox3支持4个并发连接，所以相应的，我们的并发用户数就得除以这个基数。

#### 4. 用户平均请求等待时间（Time per request）

计算公式：处理完成所有请求数所花费的时间/（总请求数/并发用户数）

#### 5. 服务器平均请求等待时间（Time per request:across all concurrent requests）

计算公式：处理完成所有请求数所花费的时间/总请求数，即：
Time taken for/testsComplete requests
可以看到，它是吞吐率的倒数。

同时，它也等于用户平均请求等待时间/并发用户数，即
Time per request/Concurrency Level

### 三、ab 的使用

最常使用参数 -n 和 -c 

```
// 处理 10000 个请求并每次同时运行 10 次请求 
# ab -n 10000 -c 10 http://127.0.0.1:9999/getDemo 
This is ApacheBench, Version 2.3 <$Revision: 1430300 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking 127.0.0.1 (be patient)
Completed 1000 requests
Completed 2000 requests
Completed 3000 requests
Completed 4000 requests
Completed 5000 requests
Completed 6000 requests
Completed 7000 requests
Completed 8000 requests
Completed 9000 requests
Completed 10000 requests
Finished 10000 requests


Server Software:        fasthttp
Server Hostname:        127.0.0.1
Server Port:            9999

Document Path:          /getDemo
Document Length:        17 bytes

Concurrency Level:      10
Time taken for tests:   0.409 seconds
Complete requests:      10000
Failed requests:        0
Write errors:           0
Total transferred:      1620000 bytes
HTML transferred:       170000 bytes
Requests per second:    24424.38 [#/sec] (mean)
Time per request:       0.409 [ms] (mean)
Time per request:       0.041 [ms] (mean, across all concurrent requests)
Transfer rate:          3864.01 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.0      0       0
Processing:     0    0   0.0      0       1
Waiting:        0    0   0.0      0       1
Total:          0    0   0.0      0       1

Percentage of the requests served within a certain time (ms)
  50%      0
  66%      0
  75%      0
  80%      0
  90%      0
  95%      0
  98%      1
  99%      1
 100%      1 (longest request)
```

一些信息说明下：

- **Server Software**表示被测试的Web服务器软件名称。

- **Server Hostname**表示请求的URL主机名。

- **Server Port**表示被测试的Web服务器软件的监听端口。

- **Document Path**表示请求的URL中的根绝对路径，通过该文件的后缀名，我们一般可以了解该请求的类型。

- **Document Length**表示HTTP响应数据的正文长度。

- **Concurrency Level**表示并发用户数，这是我们设置的参数之一。

- **Time taken for tests**表示所有这些请求被处理完成所花费的总时间。

- **Complete requests**表示总请求数量，这是我们设置的参数之一。

- **Failed requests**表示失败的请求数量，这里的失败是指请求在连接服务器、发送数据等环节发生异常，以及无响应后超时的情况。如果接收到的HTTP响应数据的头信息中含有2XX以外的状态码，则会在测试结果中显示另一个名为“Non-2xx responses”的统计项，用于统计这部分请求数，这些请求并不算在失败的请求中。

- **Total transferred**表示所有请求的响应数据长度总和，包括每个HTTP响应数据的头信息和正文数据的长度。注意这里不包括HTTP请求数据的长度，仅仅为web服务器流向用户PC的应用层数据总长度。

- **HTML transferred**表示所有请求的响应数据中正文数据的总和，也就是减去了Total transferred中HTTP响应数据中的头信息的长度。

- **Requests per second**吞吐率，也叫QPS，计算公式：Complete requests/Time taken for tests

- **Time per request**用户平均请求等待时间，从用户角度看，完成一个请求所需要的时间。计算公式：Time token for tests/（Complete requests/Concurrency Level）。

- **Time per requet(across all concurrent request)**服务器完成一个请求的时间，计算公式：Time taken for tests/Complete requests，正好是吞吐率的倒数。
    也可以这么统计：Time per request/Concurrency Level。

- **Transfer rate**表示网络传输速度，计算公式：Total trnasferred/ Time taken for tests，这个统计很好的说明服务器的处理能力达到极限时，其出口宽带的需求量。

    对于大文件的请求测试，这个值很容易成为系统瓶颈所在。要确定该值是不是瓶颈，需要了解客户端和被测服务器之间的网络情况，包括网络带宽和网卡速度等信息。

- **Percentage of requests served within a certain time（ms）**
    这部分数据用于描述每个请求处理时间的分布情况，比如以上测试，80%的请求处理时间都不超过2ms，这个处理时间是指前面的Time per request，即对于单个用户而言，平均每个请求的处理时间。

    这个表第一行表示有50%的请求都是在2ms内完成的，可以看到这个值是比较接近平均系统响应时间，以此类推。

- **Connection Times (ms)**

    ```
    Connection Times (ms)
                   min  mean[+/-sd] median   max
    Connect:        0    1   0.1      1       1
    Processing:     1    1   0.2      1       2
    Waiting:        1    1   0.2      1       2
    Total:          1    2   0.2      2       2
    ```

    一个请求的响应时间可以分成网络链接（Connect），系统处理（Processing）和等待（Waiting）三个部分。表中min表示最小值； mean表示平均值；[+/-sd]表示标准差（Standard Deviation） ，也称均方差（mean square error），表示数据的离散程度，数值越大表示数据越分散，系统响应时间越不稳定







