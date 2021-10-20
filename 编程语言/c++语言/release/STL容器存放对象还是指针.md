---
title: STL容器使用姿势--存储对象还是指针
date: 2021-10-16 16:19:17
categories:
- 编程语言
tags:
- stl
---

### 问题描述

c++的STL使用范围比较广泛，拿vector举一个例子，vector中可以存储对象也可以存储指针，那存储对象和存储指针分别有什么优缺点呢？

### 问题分析

```c++
#include <vector>
#include <iostream>

class TestObj {
public:
    explicit TestObj(int data) : data(data) {} 
private:
    int data;
};

int main() {
    TestObj obj(10);
    std::vector<TestObj> vec;
    vec.push_back(obj);

    std::cout << "origin TestObj address: " << &obj << std::endl;
    std::cout << "Address of vector: " << &vec[0] << std::endl;
    return 0;
}
```

```
origin TestObj address: 0x7ffc0198678c
Address of vector: 0x1472c20
```

再向vector中push_back或者insert元素的时候，容器会拷贝一份对象进行存储

对于内建类型，比如int、double等是进行位拷贝，自定义类型的数据会调用类的拷贝构造函数。如果一个类的拷贝构造函数很耗时，很容易造成程序的性能瓶颈。

对于存放基类对象的容器，如果向容器中插入子类的对象，那么子类特有的那些内容就会被无情的剥离，可能造成严重的BUG。推荐存放指针。

对于存放指针的容器，也是推荐存放智能指针，不用程序员来管理指针指向的内存的释放工作，避免出现问题。

### 问题总结

推荐容器中存放智能指针，效率高，同时也避免了手动管理内存带来的问题

对于存放基类的容器，使用指针解决派生类对象的剥离问题