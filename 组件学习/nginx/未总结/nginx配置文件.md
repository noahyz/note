## nginx配置文件

- worker_processes 8;

    定义worker进程的个数，每个worker进程都是单线程的进程，他们会调用各个模块实现不同的功能。如果这些模块确定不会出现阻塞式的调用，那么，有多少CPU内核就应该配置多少个进程；反之，如果有可能出现阻塞式调用，那么需要配置稍多一些的worker进程。

- ```
    events {
        worker_connections  1024;
    }
    ```

    定义每个worker进程可以同时处理的最大连接数

- http 模块

    - server模块

        - listen80; listen 参数决定Nginx服务如何监听端口。在listen后可以只加 IP 地址、端口和主机名

            ```
            listen 127.0.0.1:8000;
            listen 127.0.0.1;  # 注意：不加端口时，默认监听80端口
            listen 8000;
            listen *:8000;
            listen localhost:8000;
            ```

        - server_name www.testtweb.com; server_name 后可以跟多个主机名称

            在开始处理一个HTTP请求时，Nginx会取出header头重的Host，与每个server中的server_name进行匹配，以此决定到底哪个server块来处理这个请求。

        - location 会尝试根据用户请求中的URI来匹配上面的 /uri 表达式，如果可以匹配，就选择 location{} 块中的配置来处理用户请求。

            - = 表示把 URI 作为字符串，以便与参数中的 uri 做完全匹配
            - ～ 表示匹配 URI 时是字母大小写敏感的
            - ～* 表示匹配 URI 时忽略字母大小写问题
            - ^～ 表示匹配 URI 时只需要其前半部分与 uri 参数匹配即可

            location 是有顺序的，当一个请求有可能匹配多个location时，实际上这个请求会被第一个location处理。

            location / { # / 可以匹配所有请求 }

            - root path; 以 root 方式设置资源路径

                ```
                # 例如
                location /download/ {
                	root /opt/web/html/;
                }
                如果有一个请求的 URI 是/download/index/test.html,那么web服务器将会返回服务器上 /opt/web/html/download/index/test.html 文件的内容
                ```

            - index index.html; 访问首页，有时，访问网站站点的 URI 是 / ，这时一般是返回网站的首页。会使用root路径下的配置的index文件

        - error_page code uri; 根据HTTP返回码重定向页面

            当对于某个请求返回错误码时，如果匹配上来 error_page 中设置的 code，则重定向到新的 URI 中。

    - sendfile 系统调用，可以启用 Linux 上的 sendfile 系统调用来发送文件，它减少了内核态与用户态之间的两次内存复制，这样就会从磁盘中读取文件后直接在内核态发送到网卡设置，提高了发送文件的效率。

    - upstream 模块

    ```
    #负载均衡配置
    upstream jh.w3cschool.cn {
     
        #upstream的负载均衡，weight是权重，可以根据机器配置定义权重。weigth参数表示权值，权值越高被分配到的几率越大。
        server 192.168.80.121:80 weight=3;
        server 192.168.80.122:80 weight=2;
        server 192.168.80.123:80 weight=3;
    
        #nginx的upstream目前支持4种方式的分配
        #1、轮询（默认）
        #每个请求按时间顺序逐一分配到不同的后端服务器，如果后端服务器down掉，能自动剔除。
        #2、weight
        #指定轮询几率，weight和访问比率成正比，用于后端服务器性能不均的情况。
        #例如：
        #upstream bakend {
        #    server 192.168.0.14 weight=10;
        #    server 192.168.0.15 weight=10;
        #}
        #2、ip_hash
        #每个请求按访问ip的hash结果分配，这样每个访客固定访问一个后端服务器，可以解决session的问题。
        #例如：
        #upstream bakend {
        #    ip_hash;
        #    server 192.168.0.14:88;
        #    server 192.168.0.15:80;
        #}
        #3、fair（第三方）
        #按后端服务器的响应时间来分配请求，响应时间短的优先分配。
        #upstream backend {
        #    server server1;
        #    server server2;
        #    fair;
        #}
        #4、url_hash（第三方）
        #按访问url的hash结果来分配请求，使每个url定向到同一个后端服务器，后端服务器为缓存时比较有效。
        #例：在upstream中加入hash语句，server语句中不能写入weight等其他的参数，hash_method是使用的hash算法
        #upstream backend {
        #    server squid1:3128;
        #    server squid2:3128;
        #    hash $request_uri;
        #    hash_method crc32;
        #}
    
        #tips:
        #upstream bakend{#定义负载均衡设备的Ip及设备状态}{
        #    ip_hash;
        #    server 127.0.0.1:9090 down;
        #    server 127.0.0.1:8080 weight=2;
        #    server 127.0.0.1:6060;
        #    server 127.0.0.1:7070 backup;
        #}
        
        #在需要使用负载均衡的server中增加 proxy_pass http://bakend/;
    
        #每个设备的状态设置为:
        #1.down表示单前的server暂时不参与负载
        #2.weight为weight越大，负载的权重就越大。
        #3.max_fails：允许请求失败的次数默认为1.当超过最大次数时，返回proxy_next_upstream模块定义的错误
        #4.fail_timeout:max_fails次失败后，暂停的时间。
        #5.backup： 其它所有的非backup机器down或者忙的时候，请求backup机器。所以这台机器压力会最轻。
    
        #nginx支持同时设置多组的负载均衡，用来给不用的server来使用。
        #client_body_in_file_only设置为On 可以讲client post过来的数据记录到文件中用来做debug
        #client_body_temp_path设置记录文件的目录 可以设置最多3层目录
        #location对URL进行匹配.可以进行重定向或者进行新的代理 负载均衡
    }
    ```

    