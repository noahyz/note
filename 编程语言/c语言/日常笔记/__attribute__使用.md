---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

#### 一、`__attribute__((constructor))` 和 `__attribute__((destructor))`

`__attribute__` 是 GNU C 的一大特色，可以设置函数属性、变量属性、类型属性。主要用来在函数或数据声明中设置其属性。给函数设置属性的主要目的在于让编译器进行优化。

gcc 为函数提供了几种类型的属性，其中包括：

- 构造函数 `(constructors)` ，可以使函数在 main 函数之前调用
- 和析构函数 `(destructors)`，可以使函数在 main 函数退出前调用

还可以设置优先级。

```
static __attribute__((constructor(101))) void func_01() {}
static __attribute__((constructor(102))) void func_02() {}
static __attribute__((constructor(103))) void func_03() {}
```

以上三个函数会按照优先级的顺序调用，括号内的数值（101、102、103）代表优先级。另外，（1-100）的范围是保留的，所以最好从 100 之后开始用。**main函数之前的，即constructor的优先级，数值越小，越先调用。destructor中的数值越大，越先调用。**

#### 二、`__attribute__((unused))`

变量可能不会用到，用于消除编译警告

```
int main(int argc __attribute__((unused)), char **argv) {}
```

还有一个用处，就是用于 debug 时

```c

/* warning: 'someFunction' declared 'static' but never defined */
static int someFunction() __attribute__((unused));
 
int main(int argc __attribute__((unused)), char **argv) {
	/* warning: unused variable 'mypid' */
	int	mypid __attribute__((unused)) = getpid();
 
#ifdef DEBUG
	printf("My PID = %d\n", mypid);
#endif
	return 0;
}
```

#### 三、`__attribute__((visibility("default")))` 

在 linux 下动态库（so库）中，通过 gcc 的 C++ visibility 属性可以控制共享文件导出符号。可见属性可以应用到函数、变量、模板以及c++类。
限制符号可见性的原因：从动态库中尽可能少地输出符号是一个好的实践经验。输出一个受限制的符号会提高程序的模块性，并隐藏实现的细节。动态库装载和识别的符号越少，程序启动和运行的速度就越快。导出所有符号会减慢程序速度，并耗用大量内存。

- “default”：用它定义的符号将被导出，动态库中的函数默认是可见的。
- “hidden”：用它定义的符号将不被导出，并且不能从其它对象进行使用，动态库中的函数是被隐藏的。表示该方法符号不会被放到动态符号表里，所以其他模块（可执行文件或者动态库）不可以通过符号表访问该方法。但是可以在源文件之间共享。实际上，隐藏的符号将不会出现在动态符号表中，但是还被留在符号表中用于静态链接。

```
__attribute__((visibility("default"))) void test() {}
__attribute__((visibility("hidden"))) void test() {}
```

编译选项：`-fvisibility=[default|internal|hidden|protected] ` 也可以对符号进行操作。



















