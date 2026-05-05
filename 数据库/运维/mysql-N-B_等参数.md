---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

# mysql -N -B 等参数

--skip-column-names, -N

不要在结果中写入列名

--batch, -B

使用tab作为分隔符打印结果，每一行都换行。使用该选项，mysql不使用历史文件

批处理模式导致以非表格格式输出格式并转义特殊字符。可以通过使用原始模式来禁用转移

-execute, -e

执行该语句并退出。默认输出格式类似于使用产生的格式--batch。使用该选项，mysql不使用历史文件
