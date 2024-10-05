---
title: curl命令与其API的使用
date: 2020-11-1 18:19:17
categories:
- 组件学习
tags:
- curl
---

### 1. curl 命令的使用

curl 不到任何参数的时候，就是一般的 get 请求。curl 的参数很多，我只列举常用的。

##### 参数 -d

-d：用于发送 POST 请求的数据体。

```shell
$ curl -d'login=emma＆password=123'-X POST https://google.com/login
# 或者
$ curl -d 'login=emma' -d 'password=123' -X POST  https://google.com/login
```

使用 -d 参数之后，HTTP 请求会自动加上标头 Content-Type : application/x-www-form-urlencoded。并且会自动将请求转为 POST 方法，因为可以省略 -X POST。 -d 参数甚至可以读取本地文件的数据，向服务器发送。

```shell
curl -d '@data.txt' http://google.com
```

##### 参数 --data-urlencode

--data-urlencode 参数等同于 -d ，发送 POST 请求的数据体，区别在于会自动发送的数据进行URL编码

```shell
curl --data-urlencode 'comment=hello world 123' https://google.com/login
```

发送的数据 空格数字都会URL编码

##### 参数 -H

-H 参数添加 HTTP 请求的标头

```shell
curl -H 'Accept-Language: en-US' https://google.com
curl -H 'Accept-Language: en-US' -H 'Secret-Message: xyzzy' https://google.com
```

##### 参数 -o

-o 参数将服务器的回应保存成文件，等同于 wget 命令

```shell
curl -o tmp.html https://www.tmp.com
```

将 www.tmp.com 保存成 tmp.log 文件

> 更多有用的curl 参数参考：https://catonmat.net/cookbooks/curl

### 2. libcurl 库的安装

 curl 命令底层使用的就是 libcurl 库。因此如果要使用代码来解决 使用curl 的场景，如发送web 请求。这是就要用到 libcurl 库

```shell
1. 进入安装的目录  cd /usr/local
2. 下载curl源码 	wget https://curl.haxx.se/download/curl-7.53.0.tar.gz
3. 解压curl包		 tar -xzvf curl-7.53.0.tar.gz
4. 进入curl安装目录 cd /usr/local/curl-7.53.0
5. 编译安装 			./configure && make && make install
6. 检查是否安装成功  curl --version
```

libcurl 库的头文件，检查一下是否在 /usr/local/include/curl 下了，或者 /usr/include/curl 下了。否则将其添加到库链接目录中

检查一下 libcurl.so 或者 libcurl.a 文件是否存在与 /usr/local/lib 或者 /usr/lib 下了，没有的话就手动放一下。

在 /usr/local/curl-7.53.0/docs/example 下，可以看到 libcurl 的示例代码，还有 README 文件。可以学习一下。

### 3. libcurl 库的使用

我自己简单的使用 API 封装了一个使用 libcurl 的类

```c++
#ifndef COMM_HTTP_H
#define COMM_HTTP_H

#include <vector>
#include <string>
#include <iostream>
#include <curl/curl.h>
#include <json/json.h>
#include <string.h>

namespace COMM_HTTP{

    class Http
    {
    public:
        Http();
        ~Http();
        static size_t WriteCallback(char *contents, size_t size, size_t nmemb, void *userp);
        bool HttpPostRequest(const std::string& HttpUrl,const std::string& HttpParam,std::string& HttpResponse,std::string& ErrMsg);

    private:
        CURL* curl;
        struct curl_slist* CurlHeaders;
    };

    COMM_HTTP::Http::Http()
        : curl(NULL),
        CurlHeaders(NULL)
    {}

    COMM_HTTP::Http::~Http()
    {}

    size_t COMM_HTTP::Http::WriteCallback(char *contents, size_t size, size_t nmemb, void *userp) {
        ((std::string*)userp)->append((char*)contents, size * nmemb);
        return size * nmemb;
    }

    bool COMM_HTTP::Http::HttpPostRequest(const std::string& HttpUrl,const std::string& HttpParam,std::string& HttpResponse,std::string& ErrMsg)
    {
        /* In windows, this will init the winsock stuff */
        curl_global_init(CURL_GLOBAL_ALL);
        // for (std::vector<std::string>::const_iterator iter = HttpHeaders.begin();iter != HttpHeaders.end();iter++)
        // {
        //     CurlHeaders = curl_slist_append(CurlHeaders, iter->c_str());
        // }
        curl_slist_append(CurlHeaders, "Accept: application/json");
        curl_slist_append(CurlHeaders, "Content-Type: application/json");
        curl_slist_append(CurlHeaders, "charset: utf-8");
        curl = curl_easy_init();
        if (curl)
        {
            curl_easy_setopt(curl, CURLOPT_HTTPHEADER, CurlHeaders);
            curl_easy_setopt(curl, CURLOPT_NOSIGNAL,1L);
            curl_easy_setopt(curl, CURLOPT_POST, 1L);
            curl_easy_setopt(curl, CURLOPT_URL, HttpUrl.c_str());
            curl_easy_setopt(curl, CURLOPT_POSTFIELDS, HttpParam.c_str());
            curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, Http::WriteCallback);
            curl_easy_setopt(curl, CURLOPT_WRITEDATA, &HttpResponse);
            CURLcode ResCode = curl_easy_perform(curl);
            if (ResCode != CURLE_OK)
            {
                // std::cout << "curl_easy_perform failed, ResCode: " << ResCode << "," << curl_easy_strerror(ResCode) << std::endl;
                ErrMsg = "curl_easy_perform failed, msg: " + (std::string)curl_easy_strerror(ResCode);
                return false;
            }
            curl_easy_cleanup(curl);
            curl_slist_free_all(CurlHeaders);
        }else{
            // std::cout << "curl init failed!" << std::endl;
            ErrMsg = "curl_easy_init failed";
            return false;
        }
        curl_global_cleanup();
        return true;
    }

}

#endif //COMM_HTTP_H
```

函数 HttpPostRequest 可以向 Web 发送 POST 请求，并且接收 WEB 的响应，并且保存在 参数 HttpResponse 里面，最后 ErrMsg 是错误信息。

### 4. linux 使用 libcurl.a 在链接的时候报错

在编译的时候，发现加上 libcurl.a 后，编译报错，而且大多数是引用失败。

其实 libcurl 在链接的时候还需要依赖别的库，加上即可。 

```
-lidn -lrt -lcrypto -lssl ./lib/libcurl.a
```

**插言，后面有机会要剖析一下curl 的源码**

