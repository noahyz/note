---
title: 宏 __COUNTER__ 使用
---

## 宏 `__COUNTER__` 使用

我曾经写过如下的代码，在此记录下对于宏 `__COUNTER__` 的使用

```c++
// 实际的插件注册动作，通过定义类对象，到达调用构造函数的目的
#define RESMON_V2_REGISTER_CLASS_PLUGIN(Derived, Base, UniqueID)  \
    namespace {  \
        struct ProxyExec##UniqueID {  \
            typedef Derived _Derived;  \
            typedef Base _Base;  \
            ProxyExec##UniqueID() {  \
                register_plugin<_Derived, _Base>(#Derived, #Base);  \
            }  \
        };  \
        static ProxyExec##UniqueID g_register_plugin_##UniqueID;  \
    }

// 实际的注册插件动作的中转层，为了保证 __COUNTER__ 可用
#define RESMON_V2_REGISTER_CLASS(Derived, Base, UniqueID)  \
    RESMON_V2_REGISTER_CLASS_PLUGIN(Derived, Base, UniqueID)

// 提供给外部插件的宏，用于插件注册
#define RESMON_V2_REGISTER_MONITOR_ITEM(Derived)  \
    RESMON_V2_REGISTER_CLASS(Derived, baidu::pavaro::resmon_v2::MonitorItemBase, __COUNTER__)
```

这段代码的作用就是借助静态的全局变量会自动初始化的特点，自动调用构造函数，而在构造函数中实现一些业务逻辑，以达到程序员的目的。使用宏定义在编译时就生成这些代码，需要生成不同的全局变量。因此我们借助宏 `__COUNTER__`

```
This macro expands to sequential integral values starting from 0\. 
In conjunction with the ## operator, this provides a convenient means to generate unique identifiers. 
Care must be taken to ensure that __COUNTER__ is not expanded prior to inclusion of precompiled headers which use it. 
Otherwise, the precompiled headers will not be used.
```

`__COUNTER__` 是一个计数器，他会从 0 开始，然后每次都加1。而且是在编译期间进行，不用出现竞争。

### 如何使用

通常和 `##` 一起使用，用于构建唯一的标识符。

```
#define MERGE_BODY(a, b) a##b
#define MERGE(a, b) MERGE_BODY(a, b)  // 因为 ‘##’ 会阻止另一个宏展开，所以需要这个中间层
#define uniqueVarName(name) MERGE(name, __COUNTER__)  // 把标识符与 __COUNTER__ 合并
```