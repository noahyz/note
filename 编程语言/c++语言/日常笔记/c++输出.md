#### 一、c++ 中 setw 的用法

`setw()` 用于控制输出之间的间隔，如下

```
std::cout << "a" << std::setw(5) << "b" << std::endl;
输出：a    b
解释：a 和 b 之间有 4 个空格，上面表达式的意思为 "a" 后面输出 5 个字符，其中 "b" 占一个字符，剩余 4 个字符用空格填充
```

也可以设置用其他字符填充

```
std::cout << "a" << std::setfill('*') << std::setw(5) << "b" << std::endl;
输出：a****b
```

setw 默认为右对齐，也可以设置为左对齐

```
std::cout << std::left << std::setw(5) << "1" << std::endl;
std::cout << std::left << std::setw(5) << "10" << std::endl;
std::cout << std::left << std::setw(5) << "100" << std::endl;
输出：
1    
10   
100 
```

