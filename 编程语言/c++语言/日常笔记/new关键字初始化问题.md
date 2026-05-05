---
title: c++中 new 关键字内存初始化问题
date: 2023-01-19 11:11:41
tags:
- linux
---

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

https://blog.csdn.net/u012920673/article/details/51176811?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522161785613816780271551460%2522%252C%2522scm%2522%253A%252220140713.130102334.pc%255Fall.%2522%257D&request_id=161785613816780271551460&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~first_rank_v2~rank_v29-2-51176811.first_rank_v2_pc_rank_v29&utm_term=new%E5%AF%B9%E8%B1%A1%20%E6%98%AF%E5%90%A6%E5%8A%A0%E6%8B%AC%E5%8F%B7&spm=1018.2226.3001.4187











