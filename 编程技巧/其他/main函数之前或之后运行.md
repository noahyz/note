## c++如何让函数在 main 之前或之后运行

main 函数执行之前，主要是初始化系统相关资源：

- 设置栈指针
- 初始化 static 静态和 global 全局变量，即 data 段的内容
- 将未初始化部分的赋初始值：数值型short，int，long等为0，bool为FALSE，指针为NULL，等等，即.bss段的内容
- 将main函数的参数，argc，argv等传递给main函数，然后才真正运行main函数

使用 `__attribute__` 来完成

```
__attribute__((constructor(101))) void func() {}
__attribute__((destructor(102)))void after() {}
```

其中括号内的数值 101、102 代表优先级，另外 1-100 的范围是保留的，所以最好从 100 之后开始用。

另：main函数之前的，即constructor的优先级，**数值越小，越先调用**。destructor中的数值越大，越先调用

资料：Common Function Attributes：https://gcc.gnu.org/onlinedocs/gcc-6.2.0/gcc/Common-Function-Attributes.html#Common-Function-Attributes

