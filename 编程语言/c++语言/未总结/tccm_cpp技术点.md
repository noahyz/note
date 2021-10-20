```
__attribute__ 
__attribute__是一个编译属性，用于向编译器描述特殊的标识、错误检查或高级优化。它是GNU C特色之一，系统中有许多地方使用到。 __attribute__可以设置函数属性（Function Attribute ）、变量属性（Variable Attribute ）和类型属性（Type Attribute)等。

format 这个属性指定一个函数比如printf、scanf作为参数，这使编译器能够根据代码中提供的参数检查格式字符串。对于追踪难以发现的错误非常有帮助
format参数使用如下
format(archetype, string-index, first-to-check)
archetype指定是那种风格；string-index指定传入函数的第几个参数是格式化字符串；first-to-check指定第一个可变参数所在索引
extern int my_printf (void *my_object, const char *my_format, ...) __attribute__((format(printf, 2, 3)));
如果是c++代码，不要忘记this指针参数

__VA_ARGS__ 是一个可变参数的宏，这个可变参数的宏是新的C99规范中新增的，目前似乎只有gcc支持（VC6.0的编译器不支持）。宏前面加上##的作用在于，当可变参数的个数为0时，这里的##起到把前面多余的","去掉的作用,否则会编译出错。

vasprintf 
int vasprintf(char **strp, const char *fmt, va_list ap);
可变参数输出到strp

__thread 
gcc内置的线程局部存储设施，其存储效率可以和全局变量相比；__thread变量在每一个线程中都有一份独立实例，各线程值互不干扰。

extern char *strchr(const char *s,char c)
查找字符串s中首次出现字符c的位置。返回首次出现c的位置的指针，如果s中不存在c则返回NULL。
```

