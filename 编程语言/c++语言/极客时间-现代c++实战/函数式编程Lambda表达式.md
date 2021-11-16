### c++98 的函数对象

```c++
struct adder {
    explicit adder(int n) : n_(n) {}
    int operator() (int x) const {
        return x + n_;
    }
private:
    int n_;
};

int main() {
    auto add_2 = adder(2);
    auto num = add_2(2);
    std::cout << num << std::endl;
}
```

函数对象在c++98 开始被标准化了，函数对象是一个可以被当作函数来用的对象。

### 使用函数模板（函数的指针和引用）

```c++
int add_2(int x)
{
  return x + 2;
};

template <typename T>
auto test1(T fn)
{
  return fn(2);
}

template <typename T>
auto test2(T& fn)
{
  return fn(2);
}

template <typename T>
auto test3(T* fn)
{
  return (*fn)(2);
}
```

当用 `add_2` 去调用时，fn 的类型将分别推导为 `int (*)(int)、int (&)(int)、int (*)(int)` 。在个别情况下，需要通过函数对象的类型来区分函数对象的时候，就不能使用函数指针或引用了---原型相同的函数，他们的类型也是相同的

### Lambda 表达式

```c++
auto add_2 = [](int x) {
  return x + 2;
};
```

- Lambda 表达式以一对中括号开始
- 跟函数定义一样，有参数列表
- 跟正常的函数定义一样，有一个函数体，里面有 return 语句
- Lambda 表达式一般不需要说明返回值（相当于auto）；有特殊情况需要说明时，则应使用箭头语法的方式 `[](int x) -> int {...}` 
- 每个Lambda 表达式都有一个全局唯一的类型，要精确捕捉 Lambda 表达式到一个变量中，只能通过 auto 声明的方式

一个Lambda 表达式除了没有名字之外，还有**一个特点是可以立即进行求值**。如下

```c++
[](int x) { return x * x; }(3)
```

如上，是一个constexpr 的函数。只要能满足 constexpr 函数的条件，一个lambda 表达式默认就是 constexpr 函数

另外**一种用途是解决多重初始化路径**的问题。如下

```c++
// 原始代码
Obj obj;
switch (init_mode) {
case init_mode1:
  obj = Obj(…);
  break;
case init_mode2;
  obj = Obj(…);
  break;
…
}

// 改造后代码
auto obj = [init_mode]() {
  switch (init_mode) {
  case init_mode1:
    return Obj(…);
    break;
  case init_mode2:
    return Obj(…);
    break;
  …
  }
}();
```

原始代码实际上是调用了默认构造函数、带参数的构造函数和（移动）赋值函数；既可能有性能损失，也对 Obj 提出了有默认构造函数的额外要求。使用Lambda 表达式进行改造，即可以提升性能（不需要默认函数或拷贝/移动），又让初始化部分显得更清晰。

### 变量捕获

变量捕获的开头是可选的默认捕获符 = 或 &，表示会自动按值或按引用捕获用到的本地变量，他们之间用逗号分隔

- 本地变量名标明对其按值捕获（不能在默认捕获符 = 后出现；因其已自动按值捕获所有本地变量）
- & 加本地变量名标明对其按引用捕获（不能在默认捕获符 & 后出现；因其已自动按引用捕获所有本地变量）
- this 标明按引用捕获外围对象（针对Lambda 表达式定义出现一个非静态类成员内的情况）；注意默认捕获符 = 和 & 号可以自动捕获 this（并且在c++20之前，在 = 后写this 会导致出错）
- `*this` 标明按值捕获外围对象（针对Lambda 表达式定义出现在一个非静态类成员内的情况；c++17新增语法）
- `变量名 = 表达式` 标明按值捕获表达式的结果（可理解为 auto 表量名 = 表达式）
- `&变量名 = 表达式` 标明按引用捕获表达式的结果（可理解为 auto& 变量名 = 表达式）

不推荐使用默认捕获符，显式的代码比隐式的代码更容易维护。

按引用捕获必须能够确保被捕获的变量和 lambda 表达式的生命周期至少一样长，并在有下面需求之一时才使用：

- 需要在lambda 表达式中修改这个变量并让外部观察到
- 需要看到这个变量在外部被修改的结果
- 这个变量的复制代价比较高

如果希望以移动的方式来捕获某个变量的话，则应考虑 `变量名=表达式` 的形式。表达式可以返回一个 prvalue 或 xvalue。

```c++
int get_count() {
    static int count = 0;
    return ++count;
}

class task {
public:
    explicit task(int data) : data_(data) {}
    auto lazy_launch() {
        return [*this, count = get_count()]() mutable {
            std::ostringstream oss;
            oss << "Done work " << data_ << " (No. " << count << ") in thread " << std::this_thread::get_id() << '\n';
            msg_ = oss.str();
            calculate();
        };
    }
    void calculate() {
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
        std::cout << msg_;
    }

private:
    int data_;
    std::string msg_;
};

int main() {
    auto t = task{37};
    std::thread t1{t.lazy_launch()};
    std::thread t2{t.lazy_launch()};
    t1.join();
    t2.join();
}
```

如上代码，lambda 表达式的使用

- mutable 标记使捕获的内容可更改（缺省不可更改捕获的值，相当于定义了 `operator()(...) const `）
- `[*this]` 按值捕获外围对象（task）
- [count = get_count()] 捕获表达式可以在生成 lambda 表达式时计算并存储等号后表达式的结果

### function 模板

function 模板的参数就是函数的类型，一个函数对象放到 function 里之后，外界可以观察到的就只剩下他的参数、返回值类型和执行效果。注意function 对象的创建还是比较耗资源的

```c++
map<string, function<int(int, int)>>
  op_dict{
    {"+",
     [](int x, int y) {
       return x + y;
     }},
    {"-",
     [](int x, int y) {
       return x - y;
     }},
    {"*",
     [](int x, int y) {
       return x * y;
     }},
    {"/",
     [](int x, int y) {
       return x / y;
     }},
  };
```

