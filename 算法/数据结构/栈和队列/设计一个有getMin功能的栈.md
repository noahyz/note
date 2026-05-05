---
title: 设计一个有getMin功能的栈
---

## 设计一个有getMin功能的栈

### 一、题目

设计一个支持 push ，pop ，top 操作，并能在常数时间内检索到最小元素的栈。

实现 MinStack 类:

MinStack() 初始化堆栈对象。
void push(int val) 将元素val推入堆栈。
void pop() 删除堆栈顶部的元素。
int top() 获取堆栈顶部的元素。
int getMin() 获取堆栈中的最小元素。

对应的 leetcode 地址：https://leetcode.cn/problems/min-stack/submissions/

### 二、实现思路

- 使用两个栈，一个栈A用来保存原始数据，一个栈B用来保存最小元素的数据
- push 操作时，栈A正常插入，栈 B 取 “当前数据和栈 B 的 top 值的最小值” 插入。
- pop 操作时，两个栈都正常 pop
- getMin 操作时，取栈 B 的 top 值即可

### 三、代码实现

```c++
#include <stack>
#include <iostream>

template <typename T>
class MinStack {
public:
    MinStack() = default;

    void push(const T& data) {
        stack_data_.push(data);
        if (__glibc_unlikely(stack_min_.empty())) {
            stack_min_.push(data);
        } else {
            auto min_val = std::min(stack_min_.top(), data);
            stack_min_.push(min_val);
        }
    }
    void pop() {
        if (!stack_data_.empty() && !stack_min_.empty()) {
            stack_data_.pop();
            stack_min_.pop();
        }
    }
    T top() {
        T top_val;
        if (!stack_data_.empty() && !stack_min_.empty()) {
            return stack_data_.top();
        }
        return top_val;
    }
    T get_min() {
        T min_val;
        if (!stack_data_.empty() && !stack_min_.empty()) {
            min_val = stack_min_.top();
        }
        return min_val;
    }
private:
    std::stack<T> stack_data_;
    std::stack<T> stack_min_;
};

int main() {
    MinStack<int> s;
    s.push(-2);
    s.push(0);
    s.push(-3);
    std::cout << s.get_min() << std::endl;
    s.pop();
    std::cout << s.top() << std::endl;
    std::cout << s.get_min() << std::endl;
    return 0;
}
```

- 时间复杂度：O(1)
- 空间复杂度：O(n)

