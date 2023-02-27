---
title: c++11 中 enable_shared_from_this 使用
date: 2023-01-19 11:11:41
tags:
- linux
---

#### c++11 之 enable_shared_from_this

enable_shared_from_this 是一个模板类

```
template< class T > class enable_shared_from_this;
```

`std::enable_shared_from_this` 能让一个对象（假设名为 t，且被一个 std::shared_ptr 对象 pt 管理）安全地生成其他额外的 std::shared_ptr 实例，他们与 pt 共享对象 t 的所有权

若一个类 T 继承 `std::enable_shared_from_this<T>` ，则会为该类提供成员函数：shared_from_this。当 T 类型对象 t 被一个名为 pt 的 `std::shared_ptr<T>` 类对象管理时，调用 `T::shared_from_this` 成员函数，将会返回一个新的 `std::shared_ptr<T>` 对象，他与 pt 共享 t 的所有权。

#### 例子

```
class B : public std::enable_shared_from_this<B> {
public:
    std::shared_ptr<B> get_ptr() {
        return B::shared_from_this();
    }
    ~B() {
        std::cout << "B::~B() called" << std::endl;
    }
};

int main() {
    std::shared_ptr<B> b1(new B());
    std::shared_ptr<B> b2 = b1->get_ptr();

    std::cout << "b1.use_count(): " << b1.use_count() << std::endl;
    std::cout << "b2.use_count(): " << b2.use_count() << std::endl;
}
输出：
b1.use_count(): 2
b2.use_count(): 2
B::~B() called
```

#### 使用场景

当类A 被 shared_ptr 管理，且在类A 的成员函数中需要把当前类对象作为参数传给其他函数时，就需要传递一个指向自身的 shared_ptr。

1. 为什么不直接传递 this 指针？

   使用智能指针的初衷是为了方便资源管理，如果智能指针和原始指针混用，很容易破坏智能指针的语义，从而产生问题

2. 可以直接传递 `shared_ptr<this>` 吗？

   不能，这样会导致两个非共享的 shared_ptr 指向同一个对象，未增加引用计数导致对象被析构两次。