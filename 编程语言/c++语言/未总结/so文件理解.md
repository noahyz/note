## so 文件理解

Linux下的so文件通常是作为动态链接库使用的，但其实so文件跟可执行程序一样都是ELF格式，所以应该都是可以直接执行的。 在Linux下的很多so库文件都是可以直接执行的，不过通常只是打印出编译信息。比如：

```
/lib/ld-linux-aarch64.so.1
/lib/aarch64-linux-gnu/libc.so.6 
```

要让一个 so 文件可以直接运行，只需要在编译时指定入口函数即可，否则强制执行一个 so 文件会导致出 core。gcc/g++ 即 c/c++ 在实现上略有不同

### 一、gcc 编译

如下源代码

```c
#include <stdio.h>
#include <stdlib.h>

const char service_interp[] __attribute__((section(".interp"))) = "/lib/ld-linux-aarch64.so.1";

void lib_service()
{
    printf("This is a service of the shared library\n");
}

void lib_entry()
{
    printf("Entry point of the service library\n");
    exit(0);
}
```

其中 service_interp 变量指明了 ld.so 的位置，不同的 linux 系统略有不同，函数 `libentry()` 必须以 `exit(0)` 结束。编译

```
gcc -shared service.c -o libservice.so -Wl,-e,lib_entry -fPIC
```

`-Wl`表示传递给链接器ld的参数，分隔的逗号会被替换成空格。`-e,lib_entry`就指明了入口函数。 编译生成的libservice.so就可以直接执行了

```
-> ./libservice.so 
Entry point of the service library
```

当然，这也丝毫不影响 `libservice.so` 作为动态链接库的功能

### 二、g++ 编译

c++ 代码需要主要函数名的重构问题。有两种处理方式

- 使用 `extern "C"` 使函数名以 C 语言的方式处理
- 先使用 `g++ -c` 将代码编译成 `.o` 文件，再使用 `readelf -s xxx.o` 来查看重构之后的函数名，在编译时使用重构后的函数名

再值得注意一点的是，入口函数及其所调用的函数不能使用C++的输入输出类，即不能使用cout、cin之类，否则就会core。

### 三、总结

将程序的核心逻辑进行so化是有相当多好处的，比如可以进行多实例部署，可以将词典资源抽离出来，可以加快服务拉起， 可以充分利用机器资源等。而给so文件直接可执行的功能，就可以方便地了解so文件编译信息、版本信息、使用方法等。