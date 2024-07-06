---
title: linux工具之curl
date: 2020-03-07 21:11:24
categories:
- linux
tags:
- curl
---

## linux工具之curl

```
curl是一个和服务器交互信息（发送和获取信息）的命令行工具，支持DICT, FILE, FTP, FTPS, GOPHER, HTTP, HTTPS, IMAP, IMAPS, LDAP, LDAPS, POP3, POP3S, RTMP, RTSP, SCP, SFTP, SMTP, SMTPS, TELNET和TFTP等协议。curl支持代理、用户认证、FTP上传、HTTP POST请求、SSL连接、cookies、文件传输、Metalink等功能。
```

#### URL

*
如果没有指定协议前缀，curl会尝试猜测协议。它默认会选择http协议，但是当遇见常用的host名字时，会选择尝试其他协议。例如ftp.xxx.com，curl会尝试ftp协议。

#### 查看http响应头

`curl -i http://www.baidu.com`

#### 查看交互过程

`curl -v http://www.baidu.com`

#### GET请求

* 当发起http请求时，curl会默认发起GET请求，也可以”-X GET”方式指定。

`curl -X GET http://www.baidu.com`
#### POST请求

* 当使用POST请求方式，需要通过指定“-d”，向服务器传递数据。

`curl -X POST http://www.example.com/posts`
#### DELETE请求

* DELETE请求用于删除服务器端的数据。

`curl -X DELETE http://www.example.com/posts/1`
#### PUT请求

* PUT请求用于修改服务器端的数据

`curl -X PUT http://www.example.com/posts/1`

### 具体应用

1. curl http://127.0.0.1:7780 ,这里解释下 127.0.0.1:7780是我本机上的一个http服务。可以用这个命令来验证你的主机是否能连接上这个网站
2. curl -o eg1.txt “<u>http://127.0.0.1:7780/object/test01</u>” 把网页中的文件输出到本地一个文件中。可以直接理解为下载一个文件，并在本地重命名。
3. curl -O “<u>http://127.0.0.1:7780/object/test02</u>” 把文件内容输出到本地，并保留文件名。可以理解为直接把文件下载到本地
4. curl -vk <u>https://www.baidu.com</u> 可以获取出你访问这个网站时的更多信息，比如说状态。
5. curl -T eg2.txt “<u>http://127.0.0.1:7780/object/test09</u>” 把文件上传到存储中。下面的500 错误请先忽略，这是程序原因，和命令无关。可以看到文件已经上传上去了
6. curl -XPOST "http://127.0.0.1:7780/object/test10" -d "测试" 上传文件到存储中。下面的500 错误请先忽略，这是程序原因，和命令无关。可以看到文件已经上传上去了。
7. curl -XGET "http://127.0.0.1:7780/object/test10" 获取网页中的内容。
8. curl -L 跟随跳转
9. 加上-v 就可以看见详细信息

### data，data-ascii、data-binary，data-raw，data-urlencode选项

curl 给 http post方法提供了若干设置数据的选项

相同点：

1.  模拟web页面中提交表单，用于POST请求
2. 默认Content-type为 application/x-www-form-urlencoded
3. 选项的value如果是@a_file_name，表示数据来自一个文件
4. 选项的value如果是 -，表示读取stdin 作为提交的数据，即从标准输入设备即时提供数据值

不同点：

1. -d, --data key=value 

   数据为纯文本数据。value 如果是 @a_file_name，表示数据来自一个文件，文件中的回车符和换行符将被转换

   ```
   curl -X POST -d mykey1=myvalue1 -d mykey2=myvalue2 http://myapi.url.com
   
   curl -X POST -d 'mykey1=myvalue1&mykey2=myvalue2' http://myapi.url.com
   
   curl -X POST -H Content-Type:application/x-www-form-urlencoded -d 'mykey1=myvalue1&mykey2=myvalue2' http://myapi.url.com
   
   curl -X POST -H Content-Type:application/json -d '{"mykey1": "myvalue1", "mykey1": "myvalue2"}' http://myapi.url.com
   
   curl -X POST -H Content-Type:application/x-www-form-urlencoded -d mykey1=@myvalue1_from_file http://myapi.url.com
   ```

2. --data-ascii <key=value> 

   完全等价于 -d

3. --data-binary key=value 

   HTTP POST 请求中的数据为纯二进制数据。value 如果是@file_name，则保留文件中的回车符和换行符，不做任何转换

4. --data-raw  key=value 

   @也作为普通字符串，不会作为文件名给出文件名的标志。即value如果是@file_name，只表示值为“@file_name” 的字符串。其他等价于 -d

5. --data-urlencode key=value

   先对数据进行URL编码，再发送给HTTP服务器，即对表单中的字段值进行URL编码后再发送。为了兼容CGI，格式为“name+分隔符+content”，如下：

   - name=content，将content进行URL编码，然后提交给HTTP服务器
   - =content，同上，只是未给出引用的name
   - content，同上，注意content中不能包含=和@符号
   - name@filename，从文件filename中读取数据（包括换行符），将读取的数据进行URL编码，然后提交给HTTP服务器
   - @filename，同上

   其他等价于 -d

### 补充

关于其他的一些命令

https://blog.csdn.net/taiyangdao/article/details/77020762