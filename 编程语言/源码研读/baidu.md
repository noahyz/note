



| 类别                     | 项目名        | icode-repo               | 推荐版本 | BCLOUD                                    | 最后更新人                                              | 推荐理由                                                     |
| ------------------------ | ------------- | ------------------------ | -------- | ----------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------ |
| 综合能力强的通用类基础库 | common        | baidu/base/common        | stable   | CONFIG("baidu/base/common@stable")        | 周松松                                                  | 基于chromium的base库发展的基础库。功能完备（字符串、线程管理、日期时间、容器……），代码可读性强，接口易用性高 |
| 正则解析                 | spreg         | baidu/base/spreg         | stable   | CONFIGS('baidu/base/spreg@stable)         |                                                         | 厂内开发的线程安全的正则表达式解析库，在开源正则库pcre的基础上封装而来 |
| 缓冲处理                 | iobuf         | baidu/base/iobuf         | stable   | CONFIGS('baidu/base/iobuf@stable)         | 周松松                                                  | 厂内开发的一种非连续零拷贝缓冲，高性能，和std::string接口类似，但不相同 |
| 计数器                   | bvar          | baidu/base/bvar          | stable   | CONFIGS('baidu/base/bvar@stable)          | 周松松                                                  | 厂内开发的多线程环境下的计数器类库，适合于写多读少的场景     |
| 线程库                   | bthread       | baidu/base/bthread       | stable   | CONFIGS('baidu/base/bthread@stable)       | 周松松                                                  | 厂内开发的M:N线程库，目的是在提高程序的并发度的同时，降低编码难度，并在核数日益增多的CPU上提供更好的scalability, cache locality |
| 词典                     | odict         | baidu/base/odict         | stable   | CONFIGS('baidu/base/odict@stable)         | [yuhao10](http://icode.baidu.com/users/yuhao10)         | 厂内开发的高性能单机内存词典库                               |
| 编码识别                 | ccode         | baidu/base/ccode         | stable   | CONFIGS('baidu/base/ccode@stable)         |                                                         | 厂内开发的编码识别类库                                       |
| 数据签名                 | sign          | baidu/base/sign          | stable   | CONFIGS('baidu/base/sign@stable)          | [xingyongxu](http://icode.baidu.com/users/xingyongxu)   | 厂内开发的签名库                                             |
| 通信交互                 | baidu-rpc     | baidu/base/baidu-rpc     | stable   | CONFIGS('baidu/base/baidu-rpc@stable)     | [wangweibing](http://icode.baidu.com/users/wangweibing) | 厂内的高性能RPC框架                                          |
|                          | protobuf-json | baidu/base/protobuf-json | stable   | CONFIGS('baidu/base/protobuf-json@stable) | [zhouchao06](http://icode.baidu.com/users/zhouchao06)   | protobuf-json格式互转的基础库                                |
| base64                   | base64        | baidu/base/base64        | stable   | CONFIGS('baidu/base/base64@stable)        | [yuhao10](http://icode.baidu.com/users/yuhao10)         | 厂内开发的base64编码与解码库                                 |

﻿

- ullib：提供网络、配置文件读写、日志等多种基础功能
- Uconv：不同的编码类型之间的转换，utf8 <--> gbk
- urlparser：URL 解析
- connectpool：管理 socket 的连接池
- fileblock：提供超大逻辑文件的存取功能。并在此基础上，提供按块存取大文件的功能
- fileio：提供一些复杂 io 模式的封装，目前只有对 direct io 方式读取数据的封装
- ctpl：封装与 C++ template 相关的操作
- 

























