---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

#### 谷歌的测试框架

```
EXPECT和ASSERT系列的区别：
1. EXPECT_* 失败时，案例继续往下执行
2. ASSERT_* 失败时，直接在当前函数中返回，当前函数中ASSERT_* 后面的语句将不会执行

可以使用操作符 << 将一些自定义的信息输出，例如：
EXPECT_EQ(x, y) << "error" << 代码中的变量
```

数值型数据检查：

| **Fatal assertion**                    | **Nonfatal assertion**                 | **Verifies**             |
| -------------------------------------- | -------------------------------------- | ------------------------ |
| `ASSERT_EQ(`*expected*`, `*actual*`);` | `EXPECT_EQ(`*expected*`, `*actual*`);` | *expected* `==` *actual* |
| `ASSERT_NE(`*val1*`, `*val2*`);`       | `EXPECT_NE(`*val1*`, `*val2*`);`       | *val1* `!=` *val2*       |
| `ASSERT_LT(`*val1*`, `*val2*`);`       | `EXPECT_LT(`*val1*`, `*val2*`);`       | *val1* `<` *val2*        |
| `ASSERT_LE(`*val1*`, `*val2*`);`       | `EXPECT_LE(`*val1*`, `*val2*`);`       | *val1* `<=` *val2*       |
| `ASSERT_GT(`*val1*`, `*val2*`);`       | `EXPECT_GT(`*val1*`, `*val2*`);`       | *val1* `>` *val2*        |
| `ASSERT_GE(`*val1*`, `*val2*`);`       | `EXPECT_GE(`*val1*`, `*val2*`);`       | *val1* `>=` *val2*       |

 字符串检查：

| **Fatal assertion**                                   | **Nonfatal assertion**                                | **Verifies**                                            |
| ----------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------- |
| `ASSERT_STREQ(`*expected_str*`, `*actual_str*`);`     | `EXPECT_STREQ(`*expected_str*`, `*actual_str*`);`     | the two C strings have the same content                 |
| `ASSERT_STRNE(`*str1*`, `*str2*`);`                   | `EXPECT_STRNE(`*str1*`, `*str2*`);`                   | the two C strings have different content                |
| `ASSERT_STRCASEEQ(`*expected_str*`, `*actual_str*`);` | `EXPECT_STRCASEEQ(`*expected_str*`, `*actual_str*`);` | the two C strings have the same content, ignoring case  |
| `ASSERT_STRCASENE(`*str1*`, `*str2*`);`               | `EXPECT_STRCASENE(`*str1*`, `*str2*`);`               | the two C strings have different content, ignoring case |

 显示返回成功或者失败:  直接返回成功：SUCCESS() 

| **Fatal assertion** | **Nonfatal assertion** |
| ------------------- | ---------------------- |
| ```FAIL();```       | ```ADD_FAILURE();```   |

 