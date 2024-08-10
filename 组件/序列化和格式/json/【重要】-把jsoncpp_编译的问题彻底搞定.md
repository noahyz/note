---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

# 【重要】---把jsoncpp 编译的问题彻底搞定

今天又花了将近3个小时来看jsoncpp编译出错的案例l

scons、cmake编译jsoncpp 快点搞定

jsoncpp 下载编译

```
wget https://github.com/open-source-parsers/jsoncpp/archive/1.8.0.tar.gz
tar xzvf 1.8.0.tar.gz
cd jsoncpp-1.8.0/src/lib_json
g++ -g -std=c++11 -Wall -fPIC -c -I../../include json_reader.cpp json_value.cpp json_writer.cpp
ar rvs libjsoncpp.a *.o
g++ -g json_reader.o json_writer.o json_value.o -shared -o libjsoncpp.so
```
