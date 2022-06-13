## HTTP 和 HTTPS 区别

HTTP协议传输的数据都是未加密的，也就是明文的，因此使用HTTP协议传输隐私信息非常不安全，为了保证这些隐私数据能加密传输，于是网景公司设计了SSL（Secure Sockets Layer）协议用于对HTTP协议传输的数据进行加密，从而就诞生了HTTPS。简单来说，HTTPS协议是由SSL+HTTP协议构建的可进行加密传输、身份认证的网络协议，要比http协议安全。

1. HTTPS 协议需要申请 CA 证书
2. HTTP 时超文本传输协议，信息是明文传输，安全性差；HTTPS（SSL + HTTP）数据传输过程是加密的，安全性较好
3. HTTP 页面响应速度比 HTTPS 快，主要因为 HTTP 使用 TCP 三次握手建立连接，客户端和服务器交换 3 个包即可。而 HTTPS 除了三次握手的 3 个包之外，还需要 SSL 握手的 9 个包，所以一共是 12 个包
4. HTTP 和 HTTPS 使用的是完全不同的连接方式，用的端口分别是 80 和 443
5. HTTPS 其实就是构建在 SSL/TLS 之上的 HTTP 协议，所以 HTTPS 要比 HTTP 更耗费服务器资源

