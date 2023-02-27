---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

# curl 的命令使用和API 使用

问题：curl 不支持 https（Protocol https not supported or disabled in libcurl）

https://silence-linhl.github.io/blog/2019/10/21/prob1/

https://curl.haxx.se/docs/faq.html#configure_doesn_t_find_OpenSSL_e

https://curl.haxx.se/docs/install.html

https://www.ruanyifeng.com/blog/2019/09/curl-reference.html

linux c++ 使用libcurl 访问http 编程

https://blog.csdn.net/wcc27857285/article/details/86529034

https://www.cnblogs.com/bugutian/p/4868167.html

https://stackoverflow.com/questions/44994203/how-to-get-the-http-response-string-using-curl-in-c/45017565

https://stackoverflow.com/questions/11973994/json-requests-in-c-using-libcurl/12938692#12938692

curl 的get 请求的参数拼接要加转义fu hao

windows 平台 使用curl 发送get 请求携带多个参数正确命令：

curl -s "http://localhost:8080/get?name=zhangsan&age=12&sex=1"

linux 平台 使用curl 发送get 请求携带多个参数正确命令：

curl http://localhost:8080/get?name=zhangsan&age=12&sex=1

### 1. curl 命令的使用

curl 不到任何参数的时候，就是一般的 get 请求。curl 的参数很多，我只列举常用的。

##### 参数 -d

-d：用于发送 POST 请求的数据体。

```
$ curl -d'login=emma＆password=123'-X POST https://google.com/login
# 或者
$ curl -d 'login=emma' -d 'password=123' -X POST  https://google.com/login
```

使用 -d 参数之后，HTTP 请求会自动加上标头 Content-Type : application/x-www-form-urlencoded。并且会自动将请求转为 POST 方法，因为可以省略 -X POST。 -d 参数甚至可以读取本地文件的数据，向服务器发送。

```
curl -d '@data.txt' http://google.com
```

##### 参数 --data-urlencode

--data-urlencode 参数等同于 -d ，发送 POST 请求的数据体，区别在于会自动发送的数据进行URL编码

```
curl --data-urlencode 'comment=hello world 123' https://google.com/login
```

发送的数据 空格数字都会URL编码

##### 参数 -H

-H 参数添加 HTTP 请求的标头

```
curl -H 'Accept-Language: en-US' https://google.com
curl -H 'Accept-Language: en-US' -H 'Secret-Message: xyzzy' https://google.com
```

##### 参数 -o

-o 参数将服务器的回应保存成文件，等同于 wget 命令

```
curl -o tmp.html https://www.tmp.com
```

将 www.tmp.com 保存成 tmp.log 文件

> 更多有用的curl 参数参考：https://catonmat.net/cookbooks/curl

### 2. libcurl 库的安装

curl 命令底层使用的就是 libcurl 库。因此如果要使用代码来解决 使用curl 的场景，如发送web 请求。这是就要用到 libcurl 库

```
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

```
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

%E9%97%AE%E9%A2%98%EF%BC%9Acurl%20%E4%B8%8D%E6%94%AF%E6%8C%81%20https%EF%BC%88Protocol%20https%20not%20supported%20or%20disabled%20in%20libcurl%EF%BC%89%0Ahttps%3A%2F%2Fsilence-linhl.github.io%2Fblog%2F2019%2F10%2F21%2Fprob1%2F%0Ahttps%3A%2F%2Fcurl.haxx.se%2Fdocs%2Ffaq.html%23configure_doesn_t_find_OpenSSL_e%0Ahttps%3A%2F%2Fcurl.haxx.se%2Fdocs%2Finstall.html%0A%0A%0Ahttps%3A%2F%2Fwww.ruanyifeng.com%2Fblog%2F2019%2F09%2Fcurl-reference.html%0A%0Alinux%20c%2B%2B%20%E4%BD%BF%E7%94%A8libcurl%20%E8%AE%BF%E9%97%AEhttp%20%E7%BC%96%E7%A8%8B%20%0Ahttps%3A%2F%2Fblog.csdn.net%2Fwcc27857285%2Farticle%2Fdetails%2F86529034%0A%0Ahttps%3A%2F%2Fwww.cnblogs.com%2Fbugutian%2Fp%2F4868167.html%0A%0Ahttps%3A%2F%2Fstackoverflow.com%2Fquestions%2F44994203%2Fhow-to-get-the-http-response-string-using-curl-in-c%2F45017565%0Ahttps%3A%2F%2Fstackoverflow.com%2Fquestions%2F11973994%2Fjson-requests-in-c-using-libcurl%2F12938692%2312938692%0A%0Acurl%20%E7%9A%84get%20%E8%AF%B7%E6%B1%82%E7%9A%84%E5%8F%82%E6%95%B0%E6%8B%BC%E6%8E%A5%E8%A6%81%E5%8A%A0%E8%BD%AC%E4%B9%89%E7%AC%A6%E5%8F%B7%0Awindows%20%E5%B9%B3%E5%8F%B0%20%E4%BD%BF%E7%94%A8curl%20%E5%8F%91%E9%80%81get%20%E8%AF%B7%E6%B1%82%E6%90%BA%E5%B8%A6%E5%A4%9A%E4%B8%AA%E5%8F%82%E6%95%B0%E6%AD%A3%E7%A1%AE%E5%91%BD%E4%BB%A4%EF%BC%9A%0A%20%20%20%20curl%20-s%20%22http%3A%2F%2Flocalhost%3A8080%2Fget%3Fname%3Dzhangsan%26age%3D12%26sex%3D1%22%0Alinux%20%20%E5%B9%B3%E5%8F%B0%20%20%E4%BD%BF%E7%94%A8curl%20%E5%8F%91%E9%80%81get%20%E8%AF%B7%E6%B1%82%E6%90%BA%E5%B8%A6%E5%A4%9A%E4%B8%AA%E5%8F%82%E6%95%B0%E6%AD%A3%E7%A1%AE%E5%91%BD%E4%BB%A4%EF%BC%9A%0A%20%20%20%20curl%20%20http%3A%2F%2Flocalhost%3A8080%2Fget%3Fname%3Dzhangsan%5C%26age%3D12%5C%26sex%3D1%0A%0A%0A%23%23%23%201.%20curl%20%E5%91%BD%E4%BB%A4%E7%9A%84%E4%BD%BF%E7%94%A8%0A%0Acurl%20%E4%B8%8D%E5%88%B0%E4%BB%BB%E4%BD%95%E5%8F%82%E6%95%B0%E7%9A%84%E6%97%B6%E5%80%99%EF%BC%8C%E5%B0%B1%E6%98%AF%E4%B8%80%E8%88%AC%E7%9A%84%20get%20%E8%AF%B7%E6%B1%82%E3%80%82curl%20%E7%9A%84%E5%8F%82%E6%95%B0%E5%BE%88%E5%A4%9A%EF%BC%8C%E6%88%91%E5%8F%AA%E5%88%97%E4%B8%BE%E5%B8%B8%E7%94%A8%E7%9A%84%E3%80%82%0A%0A%23%23%23%23%23%20%E5%8F%82%E6%95%B0%20-d%0A%0A-d%EF%BC%9A%E7%94%A8%E4%BA%8E%E5%8F%91%E9%80%81%20POST%20%E8%AF%B7%E6%B1%82%E7%9A%84%E6%95%B0%E6%8D%AE%E4%BD%93%E3%80%82%0A%0A%60%60%60shell%0A%24%20curl%20-d'login%3Demma%EF%BC%86password%3D123'-X%20POST%20https%3A%2F%2Fgoogle.com%2Flogin%0A%23%20%E6%88%96%E8%80%85%0A%24%20curl%20-d%20'login%3Demma'%20-d%20'password%3D123'%20-X%20POST%20%20https%3A%2F%2Fgoogle.com%2Flogin%0A%60%60%60%0A%0A%E4%BD%BF%E7%94%A8%20-d%20%E5%8F%82%E6%95%B0%E4%B9%8B%E5%90%8E%EF%BC%8CHTTP%20%E8%AF%B7%E6%B1%82%E4%BC%9A%E8%87%AA%E5%8A%A8%E5%8A%A0%E4%B8%8A%E6%A0%87%E5%A4%B4%20Content-Type%20%3A%20application%2Fx-www-form-urlencoded%E3%80%82%E5%B9%B6%E4%B8%94%E4%BC%9A%E8%87%AA%E5%8A%A8%E5%B0%86%E8%AF%B7%E6%B1%82%E8%BD%AC%E4%B8%BA%20POST%20%E6%96%B9%E6%B3%95%EF%BC%8C%E5%9B%A0%E4%B8%BA%E5%8F%AF%E4%BB%A5%E7%9C%81%E7%95%A5%20-X%20POST%E3%80%82%20-d%20%E5%8F%82%E6%95%B0%E7%94%9A%E8%87%B3%E5%8F%AF%E4%BB%A5%E8%AF%BB%E5%8F%96%E6%9C%AC%E5%9C%B0%E6%96%87%E4%BB%B6%E7%9A%84%E6%95%B0%E6%8D%AE%EF%BC%8C%E5%90%91%E6%9C%8D%E5%8A%A1%E5%99%A8%E5%8F%91%E9%80%81%E3%80%82%0A%0A%60%60%60shell%0Acurl%20-d%20'%40data.txt'%20http%3A%2F%2Fgoogle.com%0A%60%60%60%0A%0A%23%23%23%23%23%20%E5%8F%82%E6%95%B0%20--data-urlencode%0A%0A--data-urlencode%20%E5%8F%82%E6%95%B0%E7%AD%89%E5%90%8C%E4%BA%8E%20-d%20%EF%BC%8C%E5%8F%91%E9%80%81%20POST%20%E8%AF%B7%E6%B1%82%E7%9A%84%E6%95%B0%E6%8D%AE%E4%BD%93%EF%BC%8C%E5%8C%BA%E5%88%AB%E5%9C%A8%E4%BA%8E%E4%BC%9A%E8%87%AA%E5%8A%A8%E5%8F%91%E9%80%81%E7%9A%84%E6%95%B0%E6%8D%AE%E8%BF%9B%E8%A1%8CURL%E7%BC%96%E7%A0%81%0A%0A%60%60%60shell%0Acurl%20--data-urlencode%20'comment%3Dhello%20world%20123'%20https%3A%2F%2Fgoogle.com%2Flogin%0A%60%60%60%0A%0A%E5%8F%91%E9%80%81%E7%9A%84%E6%95%B0%E6%8D%AE%20%E7%A9%BA%E6%A0%BC%E6%95%B0%E5%AD%97%E9%83%BD%E4%BC%9AURL%E7%BC%96%E7%A0%81%0A%0A%23%23%23%23%23%20%E5%8F%82%E6%95%B0%20-H%0A%0A-H%20%E5%8F%82%E6%95%B0%E6%B7%BB%E5%8A%A0%20HTTP%20%E8%AF%B7%E6%B1%82%E7%9A%84%E6%A0%87%E5%A4%B4%0A%0A%60%60%60shell%0Acurl%20-H%20'Accept-Language%3A%20en-US'%20https%3A%2F%2Fgoogle.com%0Acurl%20-H%20'Accept-Language%3A%20en-US'%20-H%20'Secret-Message%3A%20xyzzy'%20https%3A%2F%2Fgoogle.com%0A%60%60%60%0A%0A%23%23%23%23%23%20%E5%8F%82%E6%95%B0%20-o%0A%0A-o%20%E5%8F%82%E6%95%B0%E5%B0%86%E6%9C%8D%E5%8A%A1%E5%99%A8%E7%9A%84%E5%9B%9E%E5%BA%94%E4%BF%9D%E5%AD%98%E6%88%90%E6%96%87%E4%BB%B6%EF%BC%8C%E7%AD%89%E5%90%8C%E4%BA%8E%20wget%20%E5%91%BD%E4%BB%A4%0A%0A%60%60%60shell%0Acurl%20-o%20tmp.html%20https%3A%2F%2Fwww.tmp.com%0A%60%60%60%0A%0A%E5%B0%86%20www.tmp.com%20%E4%BF%9D%E5%AD%98%E6%88%90%20tmp.log%20%E6%96%87%E4%BB%B6%0A%0A%3E%20%E6%9B%B4%E5%A4%9A%E6%9C%89%E7%94%A8%E7%9A%84curl%20%E5%8F%82%E6%95%B0%E5%8F%82%E8%80%83%EF%BC%9Ahttps%3A%2F%2Fcatonmat.net%2Fcookbooks%2Fcurl%0A%0A%23%23%23%202.%20libcurl%20%E5%BA%93%E7%9A%84%E5%AE%89%E8%A3%85%0A%0A%20curl%20%E5%91%BD%E4%BB%A4%E5%BA%95%E5%B1%82%E4%BD%BF%E7%94%A8%E7%9A%84%E5%B0%B1%E6%98%AF%20libcurl%20%E5%BA%93%E3%80%82%E5%9B%A0%E6%AD%A4%E5%A6%82%E6%9E%9C%E8%A6%81%E4%BD%BF%E7%94%A8%E4%BB%A3%E7%A0%81%E6%9D%A5%E8%A7%A3%E5%86%B3%20%E4%BD%BF%E7%94%A8curl%20%E7%9A%84%E5%9C%BA%E6%99%AF%EF%BC%8C%E5%A6%82%E5%8F%91%E9%80%81web%20%E8%AF%B7%E6%B1%82%E3%80%82%E8%BF%99%E6%98%AF%E5%B0%B1%E8%A6%81%E7%94%A8%E5%88%B0%20libcurl%20%E5%BA%93%0A%0A%60%60%60shell%0A1.%20%E8%BF%9B%E5%85%A5%E5%AE%89%E8%A3%85%E7%9A%84%E7%9B%AE%E5%BD%95%20%20cd%20%2Fusr%2Flocal%0A2.%20%E4%B8%8B%E8%BD%BDcurl%E6%BA%90%E7%A0%81%20%09wget%20https%3A%2F%2Fcurl.haxx.se%2Fdownload%2Fcurl-7.53.0.tar.gz%0A3.%20%E8%A7%A3%E5%8E%8Bcurl%E5%8C%85%09%09%20tar%20-xzvf%20curl-7.53.0.tar.gz%0A4.%20%E8%BF%9B%E5%85%A5curl%E5%AE%89%E8%A3%85%E7%9B%AE%E5%BD%95%20cd%20%2Fusr%2Flocal%2Fcurl-7.53.0%0A5.%20%E7%BC%96%E8%AF%91%E5%AE%89%E8%A3%85%20%09%09%09.%2Fconfigure%20%26%26%20make%20%26%26%20make%20install%0A6.%20%E6%A3%80%E6%9F%A5%E6%98%AF%E5%90%A6%E5%AE%89%E8%A3%85%E6%88%90%E5%8A%9F%20%20curl%20--version%0A%60%60%60%0A%0Alibcurl%20%E5%BA%93%E7%9A%84%E5%A4%B4%E6%96%87%E4%BB%B6%EF%BC%8C%E6%A3%80%E6%9F%A5%E4%B8%80%E4%B8%8B%E6%98%AF%E5%90%A6%E5%9C%A8%20%2Fusr%2Flocal%2Finclude%2Fcurl%20%E4%B8%8B%E4%BA%86%EF%BC%8C%E6%88%96%E8%80%85%20%2Fusr%2Finclude%2Fcurl%20%E4%B8%8B%E4%BA%86%E3%80%82%E5%90%A6%E5%88%99%E5%B0%86%E5%85%B6%E6%B7%BB%E5%8A%A0%E5%88%B0%E5%BA%93%E9%93%BE%E6%8E%A5%E7%9B%AE%E5%BD%95%E4%B8%AD%0A%0A%E6%A3%80%E6%9F%A5%E4%B8%80%E4%B8%8B%20libcurl.so%20%E6%88%96%E8%80%85%20libcurl.a%20%E6%96%87%E4%BB%B6%E6%98%AF%E5%90%A6%E5%AD%98%E5%9C%A8%E4%B8%8E%20%2Fusr%2Flocal%2Flib%20%E6%88%96%E8%80%85%20%2Fusr%2Flib%20%E4%B8%8B%E4%BA%86%EF%BC%8C%E6%B2%A1%E6%9C%89%E7%9A%84%E8%AF%9D%E5%B0%B1%E6%89%8B%E5%8A%A8%E6%94%BE%E4%B8%80%E4%B8%8B%E3%80%82%0A%0A%E5%9C%A8%20%2Fusr%2Flocal%2Fcurl-7.53.0%2Fdocs%2Fexample%20%E4%B8%8B%EF%BC%8C%E5%8F%AF%E4%BB%A5%E7%9C%8B%E5%88%B0%20libcurl%20%E7%9A%84%E7%A4%BA%E4%BE%8B%E4%BB%A3%E7%A0%81%EF%BC%8C%E8%BF%98%E6%9C%89%20README%20%E6%96%87%E4%BB%B6%E3%80%82%E5%8F%AF%E4%BB%A5%E5%AD%A6%E4%B9%A0%E4%B8%80%E4%B8%8B%E3%80%82%0A%0A%23%23%23%203.%20libcurl%20%E5%BA%93%E7%9A%84%E4%BD%BF%E7%94%A8%0A%0A%E6%88%91%E8%87%AA%E5%B7%B1%E7%AE%80%E5%8D%95%E7%9A%84%E4%BD%BF%E7%94%A8%20API%20%E5%B0%81%E8%A3%85%E4%BA%86%E4%B8%80%E4%B8%AA%E4%BD%BF%E7%94%A8%20libcurl%20%E7%9A%84%E7%B1%BB%0A%0A%60%60%60c%2B%2B%0A%23ifndef%20COMM_HTTP_H%0A%23define%20COMM_HTTP_H%0A%0A%23include%20%3Cvector%3E%0A%23include%20%3Cstring%3E%0A%23include%20%3Ciostream%3E%0A%23include%20%3Ccurl%2Fcurl.h%3E%0A%23include%20%3Cjson%2Fjson.h%3E%0A%23include%20%3Cstring.h%3E%0A%0Anamespace%20COMM_HTTP%7B%0A%0A%20%20%20%20class%20Http%0A%20%20%20%20%7B%0A%20%20%20%20public%3A%0A%20%20%20%20%20%20%20%20Http()%3B%0A%20%20%20%20%20%20%20%20~Http()%3B%0A%20%20%20%20%20%20%20%20static%20size_t%20WriteCallback(char%20*contents%2C%20size_t%20size%2C%20size_t%20nmemb%2C%20void%20*userp)%3B%0A%20%20%20%20%20%20%20%20bool%20HttpPostRequest(const%20std%3A%3Astring%26%20HttpUrl%2Cconst%20std%3A%3Astring%26%20HttpParam%2Cstd%3A%3Astring%26%20HttpResponse%2Cstd%3A%3Astring%26%20ErrMsg)%3B%0A%0A%20%20%20%20private%3A%0A%20%20%20%20%20%20%20%20CURL*%20curl%3B%0A%20%20%20%20%20%20%20%20struct%20curl_slist*%20CurlHeaders%3B%0A%20%20%20%20%7D%3B%0A%0A%20%20%20%20COMM_HTTP%3A%3AHttp%3A%3AHttp()%0A%20%20%20%20%20%20%20%20%3A%20curl(NULL)%2C%0A%20%20%20%20%20%20%20%20CurlHeaders(NULL)%0A%20%20%20%20%7B%7D%0A%0A%20%20%20%20COMM_HTTP%3A%3AHttp%3A%3A~Http()%0A%20%20%20%20%7B%7D%0A%0A%20%20%20%20size_t%20COMM_HTTP%3A%3AHttp%3A%3AWriteCallback(char%20*contents%2C%20size_t%20size%2C%20size_t%20nmemb%2C%20void%20*userp)%20%7B%0A%20%20%20%20%20%20%20%20((std%3A%3Astring*)userp)-%3Eappend((char*)contents%2C%20size%20*%20nmemb)%3B%0A%20%20%20%20%20%20%20%20return%20size%20*%20nmemb%3B%0A%20%20%20%20%7D%0A%0A%20%20%20%20bool%20COMM_HTTP%3A%3AHttp%3A%3AHttpPostRequest(const%20std%3A%3Astring%26%20HttpUrl%2Cconst%20std%3A%3Astring%26%20HttpParam%2Cstd%3A%3Astring%26%20HttpResponse%2Cstd%3A%3Astring%26%20ErrMsg)%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%2F*%20In%20windows%2C%20this%20will%20init%20the%20winsock%20stuff%20*%2F%0A%20%20%20%20%20%20%20%20curl_global_init(CURL_GLOBAL_ALL)%3B%0A%20%20%20%20%20%20%20%20%2F%2F%20for%20(std%3A%3Avector%3Cstd%3A%3Astring%3E%3A%3Aconst_iterator%20iter%20%3D%20HttpHeaders.begin()%3Biter%20!%3D%20HttpHeaders.end()%3Biter%2B%2B)%0A%20%20%20%20%20%20%20%20%2F%2F%20%7B%0A%20%20%20%20%20%20%20%20%2F%2F%20%20%20%20%20CurlHeaders%20%3D%20curl_slist_append(CurlHeaders%2C%20iter-%3Ec_str())%3B%0A%20%20%20%20%20%20%20%20%2F%2F%20%7D%0A%20%20%20%20%20%20%20%20curl_slist_append(CurlHeaders%2C%20%22Accept%3A%20application%2Fjson%22)%3B%0A%20%20%20%20%20%20%20%20curl_slist_append(CurlHeaders%2C%20%22Content-Type%3A%20application%2Fjson%22)%3B%0A%20%20%20%20%20%20%20%20curl_slist_append(CurlHeaders%2C%20%22charset%3A%20utf-8%22)%3B%0A%20%20%20%20%20%20%20%20curl%20%3D%20curl_easy_init()%3B%0A%20%20%20%20%20%20%20%20if%20(curl)%0A%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20curl_easy_setopt(curl%2C%20CURLOPT_HTTPHEADER%2C%20CurlHeaders)%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20curl_easy_setopt(curl%2C%20CURLOPT_NOSIGNAL%2C1L)%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20curl_easy_setopt(curl%2C%20CURLOPT_POST%2C%201L)%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20curl_easy_setopt(curl%2C%20CURLOPT_URL%2C%20HttpUrl.c_str())%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20curl_easy_setopt(curl%2C%20CURLOPT_POSTFIELDS%2C%20HttpParam.c_str())%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20curl_easy_setopt(curl%2C%20CURLOPT_WRITEFUNCTION%2C%20Http%3A%3AWriteCallback)%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20curl_easy_setopt(curl%2C%20CURLOPT_WRITEDATA%2C%20%26HttpResponse)%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20CURLcode%20ResCode%20%3D%20curl_easy_perform(curl)%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20(ResCode%20!%3D%20CURLE_OK)%0A%20%20%20%20%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2F%2F%20std%3A%3Acout%20%3C%3C%20%22curl_easy_perform%20failed%2C%20ResCode%3A%20%22%20%3C%3C%20ResCode%20%3C%3C%20%22%2C%22%20%3C%3C%20curl_easy_strerror(ResCode)%20%3C%3C%20std%3A%3Aendl%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20ErrMsg%20%3D%20%22curl_easy_perform%20failed%2C%20msg%3A%20%22%20%2B%20(std%3A%3Astring)curl_easy_strerror(ResCode)%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%20false%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20curl_easy_cleanup(curl)%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20curl_slist_free_all(CurlHeaders)%3B%0A%20%20%20%20%20%20%20%20%7Delse%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%2F%2F%20std%3A%3Acout%20%3C%3C%20%22curl%20init%20failed!%22%20%3C%3C%20std%3A%3Aendl%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20ErrMsg%20%3D%20%22curl_easy_init%20failed%22%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20false%3B%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20curl_global_cleanup()%3B%0A%20%20%20%20%20%20%20%20return%20true%3B%0A%20%20%20%20%7D%0A%0A%7D%0A%0A%23endif%20%2F%2FCOMM_HTTP_H%0A%60%60%60%0A%0A%E5%87%BD%E6%95%B0%20HttpPostRequest%20%E5%8F%AF%E4%BB%A5%E5%90%91%20Web%20%E5%8F%91%E9%80%81%20POST%20%E8%AF%B7%E6%B1%82%EF%BC%8C%E5%B9%B6%E4%B8%94%E6%8E%A5%E6%94%B6%20WEB%20%E7%9A%84%E5%93%8D%E5%BA%94%EF%BC%8C%E5%B9%B6%E4%B8%94%E4%BF%9D%E5%AD%98%E5%9C%A8%20%E5%8F%82%E6%95%B0%20HttpResponse%20%E9%87%8C%E9%9D%A2%EF%BC%8C%E6%9C%80%E5%90%8E%20ErrMsg%20%E6%98%AF%E9%94%99%E8%AF%AF%E4%BF%A1%E6%81%AF%E3%80%82%0A%0A%23%23%23%204.%20linux%20%E4%BD%BF%E7%94%A8%20libcurl.a%20%E5%9C%A8%E9%93%BE%E6%8E%A5%E7%9A%84%E6%97%B6%E5%80%99%E6%8A%A5%E9%94%99%0A%0A%E5%9C%A8%E7%BC%96%E8%AF%91%E7%9A%84%E6%97%B6%E5%80%99%EF%BC%8C%E5%8F%91%E7%8E%B0%E5%8A%A0%E4%B8%8A%20libcurl.a%20%E5%90%8E%EF%BC%8C%E7%BC%96%E8%AF%91%E6%8A%A5%E9%94%99%EF%BC%8C%E8%80%8C%E4%B8%94%E5%A4%A7%E5%A4%9A%E6%95%B0%E6%98%AF%E5%BC%95%E7%94%A8%E5%A4%B1%E8%B4%A5%E3%80%82%0A%0A%E5%85%B6%E5%AE%9E%20libcurl%20%E5%9C%A8%E9%93%BE%E6%8E%A5%E7%9A%84%E6%97%B6%E5%80%99%E8%BF%98%E9%9C%80%E8%A6%81%E4%BE%9D%E8%B5%96%E5%88%AB%E7%9A%84%E5%BA%93%EF%BC%8C%E5%8A%A0%E4%B8%8A%E5%8D%B3%E5%8F%AF%E3%80%82%20%0A%0A%60%60%60%0A-lidn%20-lrt%20-lcrypto%20-lssl%20.%2Flib%2Flibcurl.a%0A%60%60%60%0A%0A**%E6%8F%92%E8%A8%80%EF%BC%8C%E5%90%8E%E9%9D%A2%E6%9C%89%E6%9C%BA%E4%BC%9A%E8%A6%81%E5%89%96%E6%9E%90%E4%B8%80%E4%B8%8Bcurl%20%E7%9A%84%E6%BA%90%E7%A0%81**%0A%0A
