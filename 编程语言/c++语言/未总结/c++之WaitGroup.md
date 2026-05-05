---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

```
//C++ WaitGroup like golang sync.WaitGroup
class WaitGroup {
public:
    void Add(int incr = 1) { counter += incr; }
    void Done() { if (--counter <= 0) cond.notify_all(); }
    void Wait() {
        std::unique_lock<std::mutex> lock(mutex);
        cond.wait(lock, [&] { return counter <= 0; });
    }

private:
    std::mutex mutex;
    std::atomic<int> counter;
    std::condition_variable cond;
};
```

