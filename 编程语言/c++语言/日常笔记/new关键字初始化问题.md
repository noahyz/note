## c++的 new 关键字的内存初始化问题

c++ 的 new 关键字在初始化时：

- 对于有构造函数的类，不论有没有括号，都用构造函数进行初始化
- 对于没有构造函数的类，
    1. 不加括号的 new 只分配内存空间，不进行内存的初始化
    2. 加括号的 new 会在分配内存的同时初始化为 0 

如下代码所示

```
int main() {
    int* a = new int[1000];
    for (int i = 0; i < 1000; i++) {
        a[i] = i+1;
    }
    delete[] a;
    // int* b = new int[1000];    // 第一种情况
    int* b = new int[1000]();    // 第二种情况
    for (int i = 0;i < 1000; i++) {
        std::cout << b[i] << " ";
    }
    std::cout << std::endl;
    return 0;
}
```

如上代码，第一种情况时，new 操作符没有对内存进行初始化；第二种情况时，new 操作符将内存初始化为 0 

#### 1. new 操作符对于类

```
class Test {
public:
    int a;
};

int main() {
    auto* tmp = new Test;
    tmp->a = 10;
    delete tmp;

    auto* t = new Test;
    std::cout << t->a << std::endl;

    auto* t2 = new Test();
    std::cout << t2->a << std::endl;
}
```

```
输出：
10
0
```

---

下来需要从源码角度去分析一下









