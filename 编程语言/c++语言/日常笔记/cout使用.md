C / C++ 保留两位小数（setprecision(n)的一些用法总结）
https://blog.csdn.net/qq_36667170/article/details/79265224

#### 1. c++ 设置浮点数精度

如下，有三种方法

```
// 1
// std::cout << std::setiosflags(std::ios::fixed) << std::setprecision(2);

// 2 
// std::cout.setf(std::ios::fixed);
// std::cout << std::setprecision(3);

// 3
std::cout << std::fixed << std::setprecision(4);
```

- 在 C++ 中，设置完精度之后，永久生效
- 按照四舍五入的方式修改了数字的显示方法，并不是修改原数字

#### 2. c 语言设置浮点数精度

格式化 `%f` 输出浮点型数据，在 % 之后加上 `.n` 即可。默认保留六位小数

```
printf("%.3f \n", pi);
```

#### 3. 输出二进制、八进制

```
int a = 2149580819;
cout << "八进制： " << oct << a << endl;
cout << "十进制： " << dec << a << endl;
cout << "十六进制： " << hex << a << endl;
cout << "二进制： " << bitset<sizeof(a)*8>(a) << endl;
```

