---
title: 金额 n 的零钱组合数
---

## 一、题目

给你一个整数数组 `coins` 表示不同面额的硬币，另给一个整数 `amount` 表示总金额。

请你计算并返回可以凑成总金额的硬币组合数。如果任何硬币组合都无法凑出总金额，返回 `0` 。

假设每一种面额的硬币有无限个。 

题目数据保证结果符合 32 位带符号整数。

Leetcode：https://leetcode.cn/problems/coin-change-ii/description/

## 二、分析

使用动态规划的方法计算可能的组合数，用 `dp[x]` 表示金额之和等于 x 的硬币组合数，目标是求 `dp[amount]`。

动态规划的边界是 `dp[0]=1`。只有当不选取任何硬币时，金额之和才为 0，因此只有 1 种硬币组合。

对于面额为 coin 的硬币，当 `coin <= i <= amount` 时，如果存在一种硬币组合的金额之和等于 `i-coin`，则在该硬币组合中增加一个面额为 coin 的硬币，即可得到一种金额之和等于 i 的硬币组合。因此需要遍历 coins，对于其中的每一种面额的硬币，更新数组 dp 中的每个大于或等于该面额的元素的值。

上述做法不会重复计算不同的排列。因为外层循环是遍历数组 coins 的值，内层循环是遍历不同的金额之和，在计算 `dp[i]` 的值时，可以确保金额之和等于 i 的硬币面额的顺序，由于顺序确定，因此不会重复计算不同的排列。

```
class Solution {
public:
    int change(int amount, vector<int>& coins) {
        std::vector<int> dp(amount+1, 0);
        dp[0] = 1;
        for (const auto& coin : coins) {
            for (int i = coin; i <= amount; i++) {
                dp[i] += dp[i-coin];
            }
        }
        return dp[amount];
    }
};
```

