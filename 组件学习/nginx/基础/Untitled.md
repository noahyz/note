### nginx的基础

正向代理：安装在客户端，客户端的访问通过代理去请求

反向代理：安装在服务端，所有客户端的请求先到代理，由代理去负载均衡到后端某个服务器

负载均衡

动态分离：静态资源直接由nginx返回，不用到达后端服务器

access.log：记录每一条http请求信息

error.log：错误日志

### 常用命令

```shell
# 启动
./nginx
# 停止 
./nginx -s stop
# 安全退出
./nginx -s quit
# 重新加载配置文件
./nginx -s reload
# 重新开始记录日志文件：
./nginx -s reopen 
# 帮助
./nginx -h 
使用指定的配置文件： -c
指定运行命令： -p
测试配置文件是否有语法错误： -t -T 
打印nginx的版本信息、编译信息等:-v -V
# 热部署，nginx 版本升级
先替换nginx二进制，然后发送信号 kill -USR2 pid 
会先使用新的二进制启动新的nginx master、worker进程，然后老的worker进程不再监听端口。老的master进程依然在，供我们版本回退
# 日志切割
先备份老的日志，然后在 kill -USR1 pid 或 ./nginx -s reopen 命令即可
```

### 编译

configure --help 可以看到编译选项

### 配置文件

```
http {
	# 日志的格式
	log_format main '$remote_addr' - $remote_user [$time_local] "$request" '
					'$status $body_bytes_sent "$http_referer" '
					'"$http_user_agent" "$http_x_forwarded_for"';
	
    gzip on; # 打开gzip压缩
	gzip_min_length 1; # 如果大小小于1就不压缩
	gzip_comp_level 2; # 压缩级别
	gzip_types text/plain application/x-javascript image/png;  # 什么类型的才压缩

	upstream local {
		server 127.0.0.1:8080;
	}

    server {
    	listen 127.0.0.1:8080; # 只能本机访问8080端口，公网无法访问
    	access_log logs/geek.access.log main; # 日志的位置以及日志格式
        localtion / {
			autoindex on; # 可以显示 / 下的目录以及目录下的文件
			set $limie_rate 1K; # 限制访问速度，没秒传输1K字节的数据 
		}
}
```

