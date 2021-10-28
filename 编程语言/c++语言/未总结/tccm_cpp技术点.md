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

std::aligned_storage
内存对齐
alignof运算符：返回由类型标识所指示的类型的任何实例所要求的对齐子节数，该类型可以为完整类型、数组类型或者引用类型。若类型为引用类型，则运算符返回被引用类型的对齐；若类型为数组类型，则返回元素类型的对齐要求
alignas说明符：指定类型或者对象的对齐要求

POD的含义：Plain old data structure，缩写为POD，是C++语言的标准中定义的一类数据结构，POD适用于需要明确的数据底层操作的系统中。POD通常被用在系统的边界处，即指不同系统之间只能以底层数据的形式进行交互，系统的高层逻辑不能互相兼容。比如当对象的字段值是从外部数据中构建时，系统还没有办法对对象进行语义检查和解释，这时就适用POD来存储数据

std::aligned_storage 希望将内存分配与对象创建分离
将non-POD类型转换为POD类型
#pragma 指令兼容性不够，该标准没有定义任何必须支持的强制编译指示，因此每个编译器都可以自由定义自己的集合。但是 std::aligned_storage 就可以随时使用它

localtime 函数将日历时间timep转换为用户指定的时区的时间
不可重入。它返回的是系统内部一个静态分配的空间。
localtime 可重入，将返回的时间填充到参数重

```

