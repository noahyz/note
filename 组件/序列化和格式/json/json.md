---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

当 struct 中的字段没有值时，使用 json.Marshal 方法并不会自动忽略这些字段，而是根据字段的类型输出了他们的默认空值，这往往和我们的预期不一致，json 包提供了对字段的控制手段，我们可以为字段增加 omitempty tag，这个 tag 会在字段值为零值（int 和 float 类型零值是 0，string 类型零值是 ""，对象类型零值是 nil）时，忽略该字段。

```go
type PersonAllowEmpty struct {
    Name     string             `json:",omitempty"`
    Age      int64              `json:",omitempty"`
    Birth    time.Time          `json:",omitempty"`
    Children []PersonAllowEmpty `json:",omitempty"`
}
```

如果想要某一个字段在任何情况下都被 json 包忽略

```go
type Person struct {
    Name     string `json:"-"`
    Age      int64 `json:"-"`
    Birth    time.Time `json:"-"`
    Children []string `json:"-"`
}
```