---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

# 删除包含特定字符的行：

### 1. 全局删除匹配到的行

```
:g/pattern/d1
```

### 2. 删除第1-10行里的匹配到的行

```
:1,10g/pattern/d1
```

### 3. 删除不包含指定字符的行

```
:v/pattern/d1
```

或

```
:g!/pattern/d
```

