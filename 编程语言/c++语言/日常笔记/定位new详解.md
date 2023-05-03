---
title: placement new 详解
---

## placement new 详解

```
void* operator new(size_t, void* ptr) throw() { return ptr; }
```

placement new 是 operator new 的一个重载版本。允许我们在一个已经分配好的内存中（栈和堆中）构造一个新的对象。其中参数中 `void*` 实际上就是指向一个已经分配好的内存缓冲区的首地址。

我们在 new 的时候，需要分配内存，而分配内存的操作往往相对比较耗时。而使用 placement new 只是在已经分配好的内存中调用构造函数，在某些场景中，是非常适用的。

如下举一个例子：

```c++
#include <string>

class A {
public:
    A() {
        dummy_01_ = 10;
        dummy_02_ = "hello world";
    }

    ~A() {
        dummy_01_ = 0;
        dummy_02_.clear();
    }

private:
    int dummy_01_{0};
    std::string dummy_02_;
};

int main() {
    // allocate memory
    const int N = 10;
    char* buf = new char[N * sizeof(A) + sizeof(int)];

    // placement new
    A* p_A = new(buf) A;

    // business logic ...

    // call destory func
    p_A->~A();
  
  	// deallocate memory
  	delete[] buf;
    return 0;
}
```

1. 第一步内存空间提前分配，可以使用堆或者栈上的空间。
2. 使用 placement new 再已有的空间上进行构造对象
3. 进行业务逻辑操作
4. 构造出来的对象如果用完了，需要主动调用类的析构函数
5. 最后如果内存空间在堆上，则需要释放内存

注意：

- 在 C++ 标准中，对于 `placement operator new[]` 需要注意：

  ```
  placement operator new[] needs implementation-defined amount of additional storage to save a size of array.
  ```

  即需要申请出比原始对象大小多出 `sizeof(int)` 个字节来存放对象的个数，或者数组的大小。

- 使用 placement new 的操作，不需要 delete，只是调用了构造函数，没有再次申请内存。

小结：placement new 适用于那些大量重复申请或者释放的内存空间，并且这块内存空间存储的是相同的类型。