---
title: set命令
---

语法：

```
SET KEY value [EX seconds] [PX milliseconds] [NX | XX]
```

`EX second`：设置键的过期时间为 second 秒。`SET KEY value EX second` 效果等同于 `SETEX KEY second value`。

`PX millisecond`：设置键的过期时间为 millisecond 毫秒。`SET KEY value PX millisecond` 效果等同于 `PSETEX KEY millisecond value`。

`NX`：只在键不存在时，才对键进行设置操作。`SET KEY value NX` 效果等同于 `SETNX KEY value`。

`XX`：只在键已经存在时，才对键进行设置操作。

https://haicoder.net/redis/redis-set.html

