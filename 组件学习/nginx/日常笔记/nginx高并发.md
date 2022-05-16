## 一、Nginx 如何实现高并发

#### 1. 多进程的工作模式

- nginx 采用一个 master 进程和多个独立的 worker 进程的模式。master进程负责收集、分发请求，接收来自外界信号，然后向worker进程发送，每个进程都有可能处理这个连接。master 进程监控 worker 进程运行状态，worker 进程异常退出时，启动新的进程。保证可靠性
- 为了保证高可用，高可靠性，多进程之间不会相互影响，单个进程出现问题 nginx 服务不会挂掉
- worker 进程一般设置和 cpu 核心数一致，把每一个 worker 进程与某一颗 cpu 绑定在一起，更好的使用每颗 cpu 核上的 cpu 缓存，减少缓存失效的命中率，提高 nginx 处理请求的速度
- 可以采用恰当的负载均衡机制，将请求分配到负载较轻的 worker 工作进程中处理，提高 nginx 请求处理能力

#### 2. 异步非阻塞机制

nginx 使用 时间驱动模式 实现 异步非阻塞 的机制，主要是 epoll 的功能。IO多路复用可以减少大量的进程调度带来的系统开销，从而提高系统整体的处理性能

#### 2. 解决了惊群效应

使用 SO_REUSEPORT 或者加锁的方式解决惊群效应，减少内核上下文切换，提高性能。

## 二、如何优化性能？

1. Nginx运行工作进程数量，一般设置 cpu 核心数

2. Nginx最大打开文件数，这个指令是指当一个nginx进程打开的最多文件描述符数目，理论值应该是最多打开文件数（ulimit -n）与nginx进程数相除，但是nginx分配请求并不是那么均匀，所以最好与ulimit -n的值保持一致。

    ```
    worker_rlimit_nofile 65535; 
    ```

3. Nginx事件处理模型

    ```
    events { 
      use epoll; 
      worker_connections 65535; 
      multi_accept on; 
    } 
    ```

    使用 epoll 来作为事件处理模型。work_connections是单个worker进程允许客户端最大连接数，这个数值一般根据服务器性能和内存来制定，实际最大值就是worker进程数乘以work_connections。

    multi_accept 告诉nginx收到一个新连接通知后接受尽可能多的连接，默认是on，设置为on后，多个worker按串行方式来处理连接，也就是一个连接只有一个worker被唤醒，其他的处于休眠状态，设置为off后，多个worker按并行方式来处理连接，也就是一个连接会唤醒所有的worker，直到连接分配完毕，没有取得连接的继续休眠。当你的服务器连接数不多时，开启这个参数会让负载有一定的降低，但是当服务器的吞吐量很大时，为了效率，可以关闭这个参数。

4. 开启高效传输模式

    ```
    http { 
      include mime.types; 
      default_type application/octet-stream; 
      …… 
     
      sendfile on; 
      tcp_nopush on; 
      …… 
    } 
    ```

    - Include mime.types ：媒体类型,include 只是一个在当前文件中包含另一个文件内容的指令。
    - default_type application/octet-stream ：默认媒体类型足够。
    - sendfile on：开启高效文件传输模式，sendfile指令指定nginx是否调用sendfile函数来输出文件，对于普通应用设为 on，如果用来进行下载等应用磁盘IO重负载应用，可设置为off，以平衡磁盘与网络I/O处理速度，降低系统的负载。注意：如果图片显示不正常把这个改成off。
    - tcp_nopush on：必须在sendfile开启模式才有效，防止网路阻塞，积极的减少网络报文段的数量（将响应头和正文的开始部分一起发送，而不一个接一个的发送。）

5. 连接超时时间

    主要目的是保护服务器资源，CPU，内存，控制连接数，因为建立连接也是需要消耗资源的。

    ```
    keepalive_timeout 60; 
    tcp_nodelay on; 
    client_header_buffer_size 4k; 
    open_file_cache max=102400 inactive=20s; 
    open_file_cache_valid 30s; 
    open_file_cache_min_uses 1; 
    client_header_timeout 15; 
    client_body_timeout 15; 
    reset_timedout_connection on; 
    send_timeout 15; 
    server_tokens off; 
    client_max_body_size 10m; 
    ```

    - keepalived_timeout ：客户端连接保持会话超时时间，超过这个时间，服务器断开这个链接。
    - tcp_nodelay：也是防止网络阻塞，不过要包涵在keepalived参数才有效。
    - client_header_buffer_size 4k：客户端请求头部的缓冲区大小，这个可以根据你的系统分页大小来设置，一般一个请求头的大小不会超过 1k，不过由于一般系统分页都要大于1k，所以这里设置为分页大小。分页大小可以用命令getconf PAGESIZE取得。
    - open_file_cache max=102400 inactive=20s ：这个将为打开文件指定缓存，默认是没有启用的，max指定缓存数量，建议和打开文件数一致，inactive 是指经过多长时间文件没被请求后删除缓存。
    - open_file_cache_valid 30s：这个是指多长时间检查一次缓存的有效信息。
    - open_file_cache_min_uses 1 ：open_file_cache指令中的inactive 参数时间内文件的最少使用次数，如果超过这个数字，文件描述符一直是在缓存中打开的，如上例，如果有一个文件在inactive 时间内一次没被使用，它将被移除。
    - client_header_timeout ：设置请求头的超时时间。我们也可以把这个设置低些，如果超过这个时间没有发送任何数据，nginx将返回request time out的错误。
    - client_body_timeout设置请求体的超时时间。我们也可以把这个设置低些，超过这个时间没有发送任何数据，和上面一样的错误提示。
    - reset_timeout_connection ：告诉nginx关闭不响应的客户端连接。这将会释放那个客户端所占有的内存空间。
    - send_timeout ：响应客户端超时时间，这个超时时间仅限于两个活动之间的时间，如果超过这个时间，客户端没有任何活动，nginx关闭连接。
    - server_tokens ：并不会让nginx执行的速度更快，但它可以关闭在错误页面中的nginx版本数字，这样对于安全性是有好处的。
    - client_max_body_size：上传文件大小限制。

参考：Nginx在高并发下的性能优化点： https://www.51cto.com/article/614207.html





















