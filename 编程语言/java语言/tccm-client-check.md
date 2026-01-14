---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

getInstance：voliate syncronized 的区别。指令重排序 

https://blog.csdn.net/weixin_30601893/article/details/112715406?utm_medium=distribute.pc_relevant.none-task-blog-2~default~baidujs_title~default-0.no_search_link&spm=1001.2101.3001.4242.0

BlockingQueue offer 修改，失败的话，尽早失败。异常尽量不要抛给业务。

startReceive 中 while 循环 可能会消耗cpu多一点

worker bufferFlushExecutor 中队列的长度，现在为5，是否可以设置大一点

udp 发送框架：

垃圾回收器：g one 

arthas：阿尔萨斯 java 诊断工具

```
wget https://halo.corp.kuaishou.com/api/cloud-storage/v1/public-objects/user-cloud-storage/pcap%2Farthas-packaging-4.0.5-bin.zip

 unzip pcap%2Farthas-packaging-4.0.5-bin.zip 
 sh install-local.sh 
 java -jar arthas-boot.jar
 
 
 #查看对应方法的入参和返回值，-x 3表示展开对象的深度为3层
watch com.example.YourClass yourMethod '{params, returnObj}' -x 3
#查看方法耗时
trace com.example.YourClass yourMethod
#查看方法堆栈
stack com.example.YourClass yourMethod

thread -b
thread -all > /tmp/all-threads.log
```

