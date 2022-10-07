## c++ 中 lower_bound 和 upper_bound 的用法

lower_bound 和 upper_bound 都是利用二分查找的方法在一个排好序的数组中进行查找的

在从小到大的排序数组中：

- `lower_bound(begin, end, num)` 从数组的 begin 位置到 end-1 位置二分查找第一个大于或等于 num 的数字，找到返回该数字的地址，不存在则返回 end。
- `upper_bound(begin, end, num)` 从数组的 begin 位置到 end-1 位置二分查找第一个大于 num 的数字，找到返回该数字的地址，不存在则返回 end。

重载 lower_bound 和 upper_bound 。在一个从大到小的数组中：

```c++
int main() {
    std::vector<int> vec{0,1,2,3,4,5,6,7,8,9};
    std::sort(vec.begin(), vec.end(), std::greater<int>());
    for (const auto& x : vec) {
        std::cout << x << " ";
    }
    std::cout << std::endl;

    auto res = std::lower_bound(vec.begin(), vec.end(), 8, std::greater<int>());
    std::cout << *res << std::endl;
    res = std::upper_bound(vec.begin(), vec.end(), 8, std::greater<int>());
    std::cout << *res << std::endl;
    return 0;
}
输出：
9 8 7 6 5 4 3 2 1 0 
8
7
```

