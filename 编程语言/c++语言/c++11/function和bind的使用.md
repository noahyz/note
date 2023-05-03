---
title: c++11 中 function 和 bind 的使用
---

## c++11 中 function 和 bind 的使用

在 c++11 中提供了 `std::function` 和 `std::bind` 两个方法来对可回调对象进行统一和封装。在我们设计回调函数时候，不可避免的需要传入一个函数对象或者函数指针的参数

c++ 有这么几种可调用对象：函数指针、lambda 表达式、仿函数。其中的 bind 机制是对旧版本中的 `bind1st` 和 `bind2st` 的合并升级。

- 函数指针和其他指针类型一致，只不过函数指针指向某种特定类型
- lambda 表达式是一个匿名的可调用的代码，可以较好的保证不会出现不安全的访问
- 仿函数就是重载了函数调用运算符 `()` 的类的对象

下面重点介绍下 function 和 bind 机制。

我们已经可以看到定义一个可调用对象是比较容易的，因此如果使用一个统一的方式来保存可调用对象或者传递可调用对象，那可以让我们的代码变得很清晰。而 `function` 的出现就是干这件事情的

`std::function` 是一个可调用对象包装器，是一个类模版，可以容纳**除了类成员函数指针**之外的所有可调用对象，可以使用统一的方式处理函数、函数对象、函数指针，并允许保存和延迟他们的执行。

如下的例子来使用 `std::function`

```c++
#include <functional>
#include <vector>
#include <iostream>

using func = typename std::function<int(int, int)>;

// 一般函数
int add(int a, int b) { return a + b; }

// lambda
auto mod = [](int a, int b) { return a % b; };

// 函数对象
class divide {
public:
    int operator()(int a, int b) {
        return a / b;
    }
};

int main() {
    std::vector<func> arr{add, mod, divide()};
    for (const auto& x : arr) {
        std::cout << x(5, 2) << std::endl;
    }
    return 0;
}
```

- `std::function` 可以取代函数指针的作用，可以延迟函数的执行，适合回调函数使用

- `std::function` 对 c++ 中各种可调用对象（普通函数、lambda表达式、函数指针等等）进行封装，形成一个新的可调用的 `std::function` ，让代码更加清晰

- `std::function` 对象可以做到类型安全，即定义的 `function` 的类型是确定的，不会改变。

  什么是类型安全，举一个例子，`void*` 可以转换成任意类型的指针，包括函数指针，有可能会造成内存访问错误。

下面再来介绍 `std::bind` 的用法，他是一个通用的函数适配器，接受一个可调用对象，生成一个新的可调用对象来适应原对象的参数列表。也就是说，`std::bind` 可以将可调用对象与其参数一起进行绑定，绑定后的结果可以使用 `std::function` 保存。我们简述一下他的作用：

- 将可调用对象和其参数绑定成一个仿函数
- 只绑定部分参数，减少可调用对象传入的参数

```c++
#include <functional>
#include <iostream>

void func(int x, int y, int z) {
    std::cout << "x: " << x << ", y: " << y << ", z: " << z << std::endl;
}

void func_02(int& a, int& b) {
    ++a;
    ++b;
    std::cout << "a: " << a << ", b: " << b << std::endl;
}

class A {
public:
    void func_03(int i, int j) {
        std::cout << "i: " << i << ", j: " << j << std::endl;
    }
};

int main() {
    auto f1 = std::bind(func, 1, 2, 3);
    f1(); // 打印 x: 1, y: 2, z: 3

    auto f2 = std::bind(func, std::placeholders::_1, std::placeholders::_2, 3);
    f2(1, 2); // 打印 x: 1, y: 2, z: 3

    auto f3 = std::bind(func, std::placeholders::_2, std::placeholders::_1, 3);
    f3(1, 2);  // 打印 x: 2, y: 1, z: 3 注意 f2 和 f3 的区别，参数顺序的不同

    int m = 2, n = 3;
    auto f4 = std::bind(func_02, std::placeholders::_1, n);
    f4(m); // 打印 a: 3, b: 4
    std::cout << "m: " << m << ", n: " << n << std::endl; // 打印 m: 3, n: 3

    A a;
    auto f5 = std::bind(&A::func_03, &a, std::placeholders::_1, std::placeholders::_2);
    f5(10, 20); // 打印 10 20

    std::function<void(int, int)> f6 = std::bind(&A::func_03, a, std::placeholders::_1, std::placeholders::_2);
    f6(10, 20); // 打印 10 20

    return 0;
}
```

如上例子，我们总结出以下结论

- 在上述例子 4 中，预绑定的参数是值传递，没有预绑定的参数使用 `std::placeholders` 占位符的形式占位，从 `_1` 开始，依次递增，是以形参类型为准
- `std::placeholders` 表示新的可调用对象的某个参数，而且和原函数的该占位符所在位置进行匹配
- `std::bind` 绑定类成员函数时，要注意 this 指针的存在
- `std::bind` 的返回值是可调用实体，可以直接赋给 `std::function` 