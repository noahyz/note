---
title: 数组中元素组成的小于 N 的最大数
---

### 一、题目

给定一个数字字符串S和一个数组nums，数组中的元素都在0~9之间，问从数组中选择元素组成的数字，小于N的最大值是多少？

例如 A={1, 2, 4, 9}，x=2533，返回 2499

### 二、分析

如下是我们的思路

#### 1. 拿到原始字符串 S 和数组 nums 后，首先看能否拼出和 S 长度一样的字符串吗？

我们先将数组 nums 中的元素进行排序（从小到大），然后拿到数组 nums 中最小的数字，得到 min_val，与字符串 S 的第一位对比

- 如果 min_val 大于 S 的第一位，说明无论从数组中选择数字，得到的结果都会比 S 大，所以明显不能拼出相同长度的字符串了，只能将长度减一
- 如果 min_val 小于 S 的第一位，那么现在可以拼出相同长度的字符串了
- 如果 min_val 等于 S 的第一位，那么需要递归，从 S 的第二位开始继续如上比较。

```
    bool check(const std::string& str, int min_val) {
        if (str.empty()) {
            return true;
        }
        char ch = str[0];
        if (ch - '0' > min_val) {
            return true;
        } else if (ch - '0' < min_val) {
            return false;
        } else {
            return check(str.substr(1), min_val);
        }
    }
```

#### 2. 获取理论最大值

根据第一步，我们可以得到我们的结果字符串是否和原始字符串 S 长度一致。

比如，`S="2413"` 如果能获取到相同长度的字符串，那么理论上可以得到最大值 2412。

但是如果数组为 `[4,6,8]`，很明显，我们不能获取到相同长度的字符串，因此理论上的最大值为 999。

这个最大值我们取名为 max_below 

```
    std::string get_max_below(const std::vector<int>& nums, int N) {
        std::string str = std::to_string(N);
        int min = nums[0];
        bool flag = check(str, min);
        int num = flag ? (N-1) : static_cast<int>(std::pow(10, str.size()-1) - 1);
        return std::to_string(num);
    }
```

#### 3. 拼接结果字符串框架

我们每次找数组 nums 中小于等于该位置上最大的数，然后拼接即可。但是注意，如果从数组中选择的数字小于 max_below 当前位置的数字的话，此后都要选择数组中的最大值来拼接。

比如：`2413 和 {2,3,6,8}`，拼接到 23 之后，因为 3 小于 4，所以此后都要选择 8 来拼接后面的部分，得到结果 2388

```
    std::string get_max_less_num(std::vector<int> nums, int N) {
        std::sort(nums.begin(), nums.end());
        std::string max_below = get_max_below(nums, N);
        std::string sb;
        bool flag = false;
        for (int i = 0; i < max_below.size(); i++) {
            char ch = max_below[i];
            if (flag) {
                sb.push_back(nums[nums.size()-1]+'0');
            } else {
                int index = get_index(nums, max_below, i);
                sb.push_back(nums[index]+'0');
                if (nums[index] < ch-'0') {
                    flag = true;
                }
            }
        }
        return sb;
    }
```

#### 4. 如果获取某位置上的数

我们需要获取小于等于 target 的数字下标，可以使用二分法，类似于找到小于等于 target 的一个最大的数。

不过需要注意一个问题，选择数字还要受到 max_below 下一位数字的影响，比如 `max_below=2411, nums={2,4,6,8}`，那么按照以上的逻辑，我们应该选择 4，但是选择 4 的话，后面拼接就会一定大于 max_below 了，因此选择数字要受到下一位的影响，我们需要对当前位置的数字进行处理。

```
    int get_index(const std::vector<int>& nums, const std::string& max_below, int index) {
        int cur_num = max_below[index] - '0';
        if (index < max_below.size()-1) {
            int next_num = max_below[index+1] - '0';
            // 下一位不能小于等于 nums[0]，否则就要选小于 cur_num 的数
            if (next_num <= nums[0]) {
                cur_num -= 1;
            }
        }
        // cur_num 处理完后，找到小于等于 cur_num 的数
        int left = 0, right = nums.size()-1;
        while (left <= right) {
            int mid = left + (right-left)/2;
            if (nums[mid] == cur_num) {
                left = mid+1;
            } else if (nums[mid] < cur_num) {
                left = mid+1;
            } else {
                right = mid-1;
            }
        }
        return right;
    }
```

一定要注意，我们的 max_below 是相对的最接近 N 的最大值。所以在考虑下一位的时候，下一位不能小于等于 nums[0]，否则就要选小于 cur_num 的数。

这里二分法的下标问题：

- 如果 cur_num 在数组的左右范围中，自然能返回正确结果
- 如果 cur_num 大于数组中最大的数，那么返回 right 是正确的，也就是选择数组中最大的数
- 如果 cur_num 小于数组中最小的数，理论上不会出现这种场景。因为这样子，给定的数组中不存在小于 N 的最大值

下面贴上整体代码

```
class Solution {
public:
    std::string get_max_less_num(std::vector<int> nums, int N) {
        std::sort(nums.begin(), nums.end());
        std::string max_below = get_max_below(nums, N);
        std::string sb;
        bool flag = false;
        for (int i = 0; i < max_below.size(); i++) {
            char ch = max_below[i];
            if (flag) {
                sb.push_back(nums[nums.size()-1]+'0');
            } else {
                int index = get_index(nums, max_below, i);
                sb.push_back(nums[index]+'0');
                if (nums[index] < ch-'0') {
                    flag = true;
                }
            }
        }
        return sb;
    }

    std::string get_max_below(const std::vector<int>& nums, int N) {
        std::string str = std::to_string(N);
        int min = nums[0];
        bool flag = check(str, min);
        int num = flag ? (N-1) : static_cast<int>(std::pow(10, str.size()-1) - 1);
        return std::to_string(num);
    }

private:
    bool check(const std::string& str, int min_val) {
        if (str.empty()) {
            return true;
        }
        char ch = str[0];
        if (ch - '0' > min_val) {
            return true;
        } else if (ch - '0' < min_val) {
            return false;
        } else {
            return check(str.substr(1), min_val);
        }
    }

    int get_index(const std::vector<int>& nums, const std::string& max_below, int index) {
        int cur_num = max_below[index] - '0';
        if (index < max_below.size()-1) {
            int next_num = max_below[index+1] - '0';
            // 下一位不能小于等于 nums[0]，否则就要选小于 cur_num 的数
            if (next_num <= nums[0]) {
                cur_num -= 1;
            }
        }
        // cur_num 处理完后，找到小于等于 cur_num 的数
        int left = 0, right = nums.size()-1;
        while (left <= right) {
            int mid = left + (right-left)/2;
            if (nums[mid] == cur_num) {
                left = mid+1;
            } else if (nums[mid] < cur_num) {
                left = mid+1;
            } else {
                right = mid-1;
            }
        }
        return right;
    }
};

int main() {
    // std::vector<int> nums{2, 3, 9};
    // int N = 24399;
    // std::vector<int> nums{1, 2, 4, 9};
    std::vector<int> nums{5, 3, 4, 9};
    int N = 2533;
    Solution s;
    // std::cout << s.get_max_below(nums, N) << std::endl;
    std::cout << s.get_max_less_num(nums, N) << std::endl;
    return 0;
}
```















