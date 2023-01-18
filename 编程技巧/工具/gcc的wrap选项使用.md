### GCC 通过 --wrap 选项使用包装函数

对 symbol 使用包装函数，任何对 symbol 未定义的引用会被解析成 `__wrap_symbol`。而任何对 `__real_symbol` 未定义的引用会被解析成 symbol。即当一个名为 symbol 符号使用 wrap 功能时，工程中任何用到 symbol 符号的地方实际使用的是 `__wrap_symbol` 符号，任何用到 `__real_symbol` 的地方实际使用的是真正的 symbol。
注意：当 `__wrap_symbol` 是使用 C++ 实现时，一定要加上 `extern "C"`

```cpp
# wrap_symbol.h
extern "C" {
void* __wrap_malloc(size_t size);
void __wrap_free(void* ptr);
 
void* __real_malloc(size_t size);
void __real_free(void* ptr);
 
int foo();
int __wrap_foo();
 
// c++filt: _Znwm ==> operator new(unsigned long)
void* __wrap__Znwm(unsigned long size);
// c++filt _ZdlPv ==> operator delete(void*)
void __wrap__ZdlPv(void* ptr);
 
void* __real__Znwm(unsigned long size);
void __real__ZdlPv(void* ptr);
} // extern "C"

# wrap_symbol.cpp
void* __wrap_malloc(size_t size) {
	fprintf(stdout, "call __wrap_malloc function, size: %d\n", size);
	return __real_malloc(size);
}
 
void __wrap_free(void* ptr) {
	fprintf(stdout, "call __wrap_free function\n");
	__real_free(ptr);
}
 
int foo() {
	fprintf(stdout, "call foo function\n");
	return 0;
}
 
int __wrap_foo() {
	fprintf(stdout, "call __wrap_foo function\n");
	return 0;
};
 
void* __wrap__Znwm(unsigned long size) {
	fprintf(stdout, "call __wrap__Znwm funtcion, size: %d\n", size);
	return __real__Znwm(size);
}
 
void __wrap__ZdlPv(void* ptr) {
	fprintf(stdout, "call __wrap__ZdlPv function\n");
	__real__ZdlPv(ptr);
}
```

测试代码

```c++
int main() {
	char* p1 = (char*)malloc(4);
	free(p1);
	
	foo();
	
	int* p2 = new int;
	delete p2;
	return 0;
}
```

编译运行

```
g++ -o test_wrap_symbol *.o -O2 -Wall -Wl,--wrap=malloc -Wl,--wrap=free -Wl,--wrap=foo -Wl,--wrap=_Znwm -Wl,--wrap=_ZdlPv
```



