---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

### 一、const 和 constexpr 

#### 1. 区别

```c++
void dis_1(const int x){
    //错误，x是只读的变量，但本质上是变量
    array <int,x> myarr{1,2,3,4,5};
    cout << myarr[1] << endl;
}

void dis_2(){
    // 正确，x是只读变量的同时，还是个常量
    const int x = 5;
    array <int,x> myarr{1,2,3,4,5};
    cout << myarr[1] << endl;
}

int main() {
   dis_1(5);
   dis_2();
}
```

C++ 11标准中，为了解决 const 关键字的双重语义问题，保留了 const 表示“只读”的语义，而将“常量”的语义划分给了新添加的 constexpr 关键字。因此 C++11 标准中，建议将 const 和 constexpr 的功能区分开，即凡是表达“只读”语义的场景都使用 const，表达“常量”语义的场景都使用 constexpr。

#### 2. 只读和常量

“只读“和”不允许修改“这两个没有必然的联系。对于只读的变量也可以被修改，如下例子：

```c++
int main() {
    int a = 10;
    const int & con_b = a;
    cout << con_b << endl; // 10 

    a = 20;
    cout << con_b << endl; // 20
}
```

#### 3. 结论

在 C++ 11 标准中，const 用于为修饰的变量添加“只读”属性；而 constexpr 关键字则用于指明其后是一个常量（或者常量表达式），编译器在编译程序时可以顺带将其结果计算出来，而无需等到程序运行阶段，这样的优化极大地提高了程序的执行效率。

### constexpr 和编译器计算

```c++
constexpr int factorial(int n) {
  if (n == 0) {
    return 1;
  } else {
    return n * factorial(n - 1);
  }
}

int main()
{
  constexpr int n = factorial(10);
  printf("%d\n", n);
}
```

使用 ` objdump -d xxx` 看汇编代码，可以发现在编译期间已经计算好了

```shell
zhangyi@NOAHYZHANG-MB0 test1 % objdump -d test

test:   file format Mach-O 64-bit x86-64

Disassembly of section __TEXT,__text:

0000000100000f70 _main:
100000f70: 55                           pushq   %rbp
100000f71: 48 89 e5                     movq    %rsp, %rbp
100000f74: 48 83 ec 10                  subq    $16, %rsp
100000f78: c7 45 fc 00 5f 37 00         movl    $3628800, -4(%rbp)
100000f7f: bf 00 5f 37 00               movl    $3628800, %edi
100000f84: e8 0d 00 00 00               callq   13 <dyld_stub_binder+0x100000f96>
100000f89: 31 c9                        xorl    %ecx, %ecx
100000f8b: 89 45 f8                     movl    %eax, -8(%rbp)
100000f8e: 89 c8                        movl    %ecx, %eax
100000f90: 48 83 c4 10                  addq    $16, %rsp
100000f94: 5d                           popq    %rbp
100000f95: c3                           retq

Disassembly of section __TEXT,__stubs:

0000000100000f96 __stubs:
100000f96: ff 25 64 10 00 00            jmpq    *4196(%rip)

Disassembly of section __TEXT,__stub_helper:

0000000100000f9c __stub_helper:
100000f9c: 4c 8d 1d 65 10 00 00         leaq    4197(%rip), %r11
100000fa3: 41 53                        pushq   %r11
100000fa5: ff 25 55 00 00 00            jmpq    *85(%rip)
100000fab: 90                           nop
100000fac: 68 00 00 00 00               pushq   $0
100000fb1: e9 e6 ff ff ff               jmp     -26 <__stub_helper>
```

