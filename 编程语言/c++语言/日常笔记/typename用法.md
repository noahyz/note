---
title: c++ 关于 typename 的用法
date: 2023-01-19 11:11:41
tags:
- c++
---

## c++ 关于 typename 的用法

### 一、问题的由来

```
template <typename T>
DataRes BuildData(const T& val);
```

```
template <class T>
DataRes BuildData(const T& val);
```

这两种用法在 C++ 中有什么区别呢？

### 二、分析

最早使用 class 来声明模板参数列表的类型是为了避免增加不必要的关键字；后来委员会认为 class 既定义类，又定义泛型模板的类型。这样混用会造成概念上的混淆加上了 typename 关键字。

因此在模板定义语法中关键字 class 和 typename 的作用完全一样。而 typename 还有另外一个作用是：使用嵌套依赖类型。

```
class MyArray 
{ 
public：
    typedef int LengthType;
    .....
}

template<class T>
void MyMethod( T myarr ) 
{ 
    typedef typename T::LengthType LengthType; 
    LengthType length = myarr.GetLength; 
}
```

这个时候 typename 的作用就是告诉 c++ 编译器，typename 后面的字符串 `T::LengthType` 为一个类型名称，而不是成员函数或者成员变量。