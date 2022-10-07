## c++ 中 explicit 关键字详解

c++ 中的 explicit 关键字只能用于修饰只有一个参数的类构造函数，他的作用是表明该构造函数是显式的。

与之对应的 implicit 关键字则表明构造函数是隐式的，类构造函数默认情况下即声明为 implicit 隐式的

#### 一、隐式声明的场景

```c++
class A {
public:
    char* str_;
    int size_;
    
    A(int size) : size_(size) {
        str_ = reinterpret_cast<char*>(malloc(size+1));
        memset(str_, 0, size_+1);
    }
    
    A(const char* p) {
        int size = strlen(p);
        str_ = reinterpret_cast<char*>(malloc(size+1));
        strcpy(str_, p);
        size_ = strlen(str_);
    }
};

void test_A() {
    A a1(24);        // 1. OK，正常用法
    A a2 = 10;       // 2. OK，发生隐式转换，为 A 预分配 10 字节大小的内存
    A a3;            // 3. NO，没有默认构造函数
    A a4("abc");     // 4. OK，正常用法
    A a5 = "abc";    // 5. OK，调用 A(const char*)
    A a6 = 'c';      // 6. OK，调用 A(int), 且 size 等于 'c' 的 ASCII 值
    a1 = 2;          // 7. OK，发生隐式转换，为 A 预分配 2 字节大小的内存
    a3 = a1;         // 8. 编译正确，但应该重载 = 操作符，正确释放内存
}
```

如上，表达式 2 中的 `A a2 = 10` 进行解释，在 C++ 中，如果构造函数只有一个参数时，那么在编译的时候就会有一个缺省的转换操作：将该构造函数对应数据类型转换为该类对象。

也就是说，`A a2 = 10` 这句代码会被转换为：`A a2(10)` 或者 `A tmp(10); A a2 = tmp;`

虽然隐式转换了，但是 `A a2 = 10;` 或 `A a6 = 'c'` 这种代码可读性太差，非常不严谨。因此我们需要阻止这种隐式转换，就需要使用 explicit 关键字。

#### 二、使用 explicit 禁止隐式转换

```c++
class A {
public:
    char* str_;
    int size_;

    explicit A(int size) : size_(size) {
        str_ = reinterpret_cast<char*>(malloc(size+1));
        memset(str_, 0, size_+1);
    }

    A(const char* p) {
        int size = strlen(p);
        str_ = reinterpret_cast<char*>(malloc(size+1));
        strcpy(str_, p);
        size_ = strlen(str_);
    }
};

void test_A() {
    A a1(24);        // OK，正常用法
    A a2 = 10;       // NO，explicit 禁止了隐式转换
    A a3;            // NO，没有默认构造函数
    A a4("abc");     // OK，正常用法
    A a5 = "abc";    // OK，调用 A(const char*)
    A a6 = 'c';      // NO，调用 A(int), 但是 explicit 禁止了隐式转换
    a1 = 2;          // NO，explicit 禁止了隐式转换
}
```

 explicit 关键字禁止了类构造函数的隐式转换，可以使代码可读性更好

#### 三、多个参数的情况

explicit 关键字仅仅对只有一个参数的类构造函数有效，如果类构造函数参数大于等于两个，是不会产生隐式转换的，所以 explicit 关键字也就无效了。

但是，也有例外，当除了第一个参数以外的其他参数都有默认值时，explicit 依然有效。此时，当调用构造函数时只传入一个参数，等效于只有一个参数的类构造函数。 

#### 四、总结

- explicit 关键字只能用于类的单参数构造函数。无参数的构造函数和多参数的构造函数总是显式调用，这种情况在构造函数前加 explicit 无意义
- google 的 c++ 规范中提到 explicit 的优点是可以避免不合时宜的类型变换。因此 google 约定所有参数的构造函数都必须是显式的，只有极少数情况下拷贝构造函数可以不声明 explicit，例如作为其他类的透明包装器的类