---
title: nSum问题
---

本文对于 nSum 问题进行分析。先从最简单的 twoSum 问题来看。

### 一、twoSum 问题

如果假设输入一个数组 `nums` 和一个目标和 `target`，**请你返回 `nums` 中能够凑出 `target` 的两个元素的值**，比如输入 `nums = [1,3,5,6], target = 9`，那么算法返回两个元素 `[3,6]`。可以假设只有且仅有一对儿元素可以凑出 `target`。

针对这个题目，我们可以使用双指针的方式，分别从最左边和最右边进行遍历数组。

```
    std::vector<int> twoSum(const std::vector<int>& nums, int target) {
        if (nums.size() < 2) {
            return std::vector<int>();
        }
        int left = 0, right = nums.size()-1;
        while (left < right) {
            int sum = nums[left] + nums[right];
            if (sum == target) {
                return std::vector<int>{nums[left], nums[right]};
            } else if (sum < target) {
                left++;
            } else {
                right--;
            }
        }
        return std::vector<int>();
    }
```

比较简单，不多说了。现在增加难度，要求求出所有符合要求的元素对，并且不能含有重复的。

我们在每次判断的时候进行比较即可，如果是相等的元素，我们直接跳过

```
    std::vector<std::pair<int, int>> twoSum2(const std::vector<int>& nums, int target) {
        if (nums.size() < 2) {
            return std::vector<std::pair<int, int>>();
        }
        std::vector<std::pair<int, int>> res;
        int left = 0, right = nums.size()-1;
        while (left < right) {
            int left_val = nums[left];
            int right_val = nums[right];
            int sum = left_val + right_val;
            if (sum == target) {
                res.emplace_back(std::pair<int, int>{left_val, right_val});
                while (left < right && nums[left] == left_val) left++;
                while (left < right && nums[right] == right_val) right--;
            } else if (sum < target) {
                while (left < right && nums[left] == left_val) left++;
            } else {
                while (left < right && nums[right] == right_val) right--;
            }
        }
        return res;
    }
```

### 二、threeSum 问题

两数之和会了，其实三数之和也就比较简单了。要求和为 target 的三元祖，那我们先确定一个数字，假设为 `nums[i]`，那么剩下的两个数字就是和为 `target-nums[i]`。两数之和我们会了，因此三数之和即在两数之和的基础上进行封装即可。

```
class Solution2 {
public:
    std::vector<std::vector<int>> threeSum(std::vector<int> nums, int target) {
        if (nums.size() < 3) {
            return std::vector<std::vector<int>>();
        }
        std::sort(nums.begin(), nums.end());
        std::vector<std::vector<int>> res;
        for (int i = 0; i < nums.size()-2; i++) {
            auto tuples = twoSum(nums, i+1, target-nums[i]);
            for (auto& x : tuples) {
                x.emplace_back(nums[i]);
                res.emplace_back(x);
            }
            while (i < nums.size()-2 && nums[i] == nums[i+1]) i++;
        }
        return res;
    }

private:
    std::vector<std::vector<int>> twoSum(const std::vector<int>& nums, int start, long int target) {
        if (nums.size() < 2) {
            return std::vector<std::vector<int>>();
        }
        std::vector<std::vector<int>> res;
        int left = start, right = nums.size()-1;
        while (left < right) {
            int left_val = nums[left];
            int right_val = nums[right];
            int sum = left_val + right_val;
            if (sum == target) {
                res.push_back(std::vector<int>{left_val, right_val});
                while (left < right && nums[left] == left_val) left++;
                while (left < right && nums[right] == right_val) right--;
            } else if (sum < target) {
                while (left < right && nums[left] == left_val) left++;
            } else {
                while (left < right && nums[right] == right_val) right--;
            }
        }
        return res;
    }
};
```

### 三、4Sum 问题

那么 4Sum 问题也就引刃而解了，穷举一个数，然后调用 3Sum 函数，最后组合成和为 target 的四元祖即可。

```
class Solution {
public:
    std::vector<std::vector<int>> fourSum(std::vector<int>& nums, long int target) {
        if (nums.size() < 4) {
            return std::vector<std::vector<int>>();
        }
        std::vector<std::vector<int>> res;
        std::sort(nums.begin(), nums.end());
        for (int i = 0; i < nums.size()-3; i++) {
            auto triples = threeSum(nums, i+1, target-nums[i]);
            for (auto& x : triples) {
                x.emplace_back(nums[i]);
                res.emplace_back(x);
            }
            while (i < nums.size()-3 && nums[i] == nums[i+1]) i++;
        }
        return res;
    }

private:
    std::vector<std::vector<int>> threeSum(std::vector<int> nums, int start, long int target) {
        if (nums.size() < 3) {
            return std::vector<std::vector<int>>();
        }
        std::vector<std::vector<int>> res;
        for (int i = start; i < nums.size()-2; i++) {
            auto tuples = twoSum(nums, i+1, target-nums[i]);
            for (auto& x : tuples) {
                x.emplace_back(nums[i]);
                res.emplace_back(x);
            }
            while (i < nums.size()-2 && nums[i] == nums[i+1]) i++;
        }
        return res;
    }

    std::vector<std::vector<int>> twoSum(const std::vector<int>& nums, int start, long int target) {
        if (nums.size() < 2) {
            return std::vector<std::vector<int>>();
        }
        std::vector<std::vector<int>> res;
        int left = start, right = nums.size()-1;
        while (left < right) {
            int left_val = nums[left];
            int right_val = nums[right];
            int sum = left_val + right_val;
            if (sum == target) {
                res.push_back(std::vector<int>{left_val, right_val});
                while (left < right && nums[left] == left_val) left++;
                while (left < right && nums[right] == right_val) right--;
            } else if (sum < target) {
                while (left < right && nums[left] == left_val) left++;
            } else {
                while (left < right && nums[right] == right_val) right--;
            }
        }
        return res;
    }
};
```

### 四、nSum 问题

我们写出一个统一的 nSum 函数

```
/* 注意：调用这个函数之前一定要先给 nums 排序 */
vector<vector<int>> nSumTarget(
    vector<int>& nums, int n, int start, int target) {

    int sz = nums.size();
    vector<vector<int>> res;
    // 至少是 2Sum，且数组大小不应该小于 n
    if (n < 2 || sz < n) return res;
    // 2Sum 是 base case
    if (n == 2) {
        // 双指针那一套操作
        int lo = start, hi = sz - 1;
        while (lo < hi) {
            int sum = nums[lo] + nums[hi];
            int left = nums[lo], right = nums[hi];
            if (sum < target) {
                while (lo < hi && nums[lo] == left) lo++;
            } else if (sum > target) {
                while (lo < hi && nums[hi] == right) hi--;
            } else {
                res.push_back({left, right});
                while (lo < hi && nums[lo] == left) lo++;
                while (lo < hi && nums[hi] == right) hi--;
            }
        }
    } else {
        // n > 2 时，递归计算 (n-1)Sum 的结果
        for (int i = start; i < sz; i++) {
            vector<vector<int>> 
                sub = nSumTarget(nums, n - 1, i + 1, target - nums[i]);
            for (vector<int>& arr : sub) {
                // (n-1)Sum 加上 nums[i] 就是 nSum
                arr.push_back(nums[i]);
                res.push_back(arr);
            }
            while (i < sz - 1 && nums[i] == nums[i + 1]) i++;
        }
    }
    return res;
}
```

就是把之前的题目解法进行了合并， `n == 2` 时是 `twoSum` 的双指针解法，`n > 2` 时就是穷举第一个数字，然后递归调用计算 `(n-1)Sum`，组装答案。

**需要注意的是，调用这个 `nSum` 函数之前一定要先给 `nums` 数组排序**，因为 `nSum` 是一个递归函数，如果在 `nSum` 函数里调用排序函数，那么每次递归都会进行没有必要的排序，效率会非常低。

比如我们求 4Sum 问题：

```
vector<vector<int>> fourSum(vector<int>& nums, int target) {
    sort(nums.begin(), nums.end());
    // n 为 4，从 nums[0] 开始计算和为 target 的四元组
    return nSumTarget(nums, 4, 0, target);
}
```

