---
title: c/cpp 下 volatile 关键字浅析
date: 2023-01-19 11:11:41
tags:
- linux
---

## 关于 c/c++ 下 volatile 关键字

volatile 关键字所修饰的变量。编译器对访问该变量的代码不会进行优化。系统总会重新从它所在的内存读取数据。

### 一、必要性

通过插入汇编代码，测试有无 volatile 关键字对程序最终代码的影响

```
int main() {
	
}
```



https://zhuanlan.zhihu.com/p/62060524

https://www.cnblogs.com/yc_sunniwell/archive/2010/07/14/1777432.html

https://liam.page/2018/01/18/volatile-in-C-and-Cpp/
