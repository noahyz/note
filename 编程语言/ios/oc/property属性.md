oc 中的 property 属性：https://www.jianshu.com/p/85890909a81b

oc atomic 一定能保证线程安全吗？

- atomic 修饰的属性，编译器会在编译期间在 setter, getter 方法里加入一些互斥锁，保证在多线程开发，读取变量的值正确
- atomic 只能保证 setter, getter 线程安全，如 self.name = xxx。但对于 [array objectAtIndex:index] 无法保证多线程安全。
    