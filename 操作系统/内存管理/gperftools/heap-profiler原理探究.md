---
title: gperftools 的 heap-profiler 原理探究
---

## gperftools 的 heap-profiler 原理探究

本文着重谈就 heap-profiler 的实现原理。

```c++
src/base/googleinit.h

#define REGISTER_MODULE_INITIALIZER(name, body)                 \
  namespace {                                                   \
    static void google_init_module_##name () { body; }          \
    GoogleInitializer google_initializer_module_##name(#name,   \
            google_init_module_##name, NULL);                   \
  }
  
REGISTER_MODULE_INITIALIZER(heapprofiler, HeapProfilerInit());
```

这个代码通过宏，C++ 的静态全局成员，使其可以在初始化阶段调用到类的构造函数，从而初始化到用户函数。

```
src/heap-profiler.cc

# 初始化函数
1. 初始化 profiler 文件存储位置
2. 以及信号驱动
3. 清除旧的 profiler 文件
4. 开始正式的分析 HeapProfilerStart
HeapProfilerInit()
```

`void HeapProfilerStart(const char* prefix)` 开始 profiler 分析

```
首先需要给初始化过程加锁
中间是一些基本的初始化
接下来进行 hook 内存申请函数
    RAW_CHECK(MallocHook::AddNewHook(&NewHook), "");
    RAW_CHECK(MallocHook::AddDeleteHook(&DeleteHook), "");
最后确定要把 profiler 的文件名
```

内存申请函数和内存释放函数，对应的操作：

```
// static
void NewHook(const void* ptr, size_t size) {
  if (ptr != NULL) RecordAlloc(ptr, size, 0);
}

// static
void DeleteHook(const void* ptr) {
  if (ptr != NULL) RecordFree(ptr);
}
```

主要看 RecordAlloc、RecordFree 这两个函数是如何收集 alloc 和 free 的操作的

```c++
static void RecordAlloc(const void* ptr, size_t bytes, int skip_count) {
  // Take the stack trace outside the critical section.
  void* stack[HeapProfileTable::kMaxStackDepth];
  int depth = HeapProfileTable::GetCallerStackTrace(skip_count + 1, stack);
  SpinLockHolder l(&heap_lock);
  if (is_on) {
    heap_profile->RecordAlloc(ptr, bytes, depth, stack);
    MaybeDumpProfileLocked();
  }
}

首先获取调用的堆栈
然后加锁
开始收集信息，如果满足 dump 的条件，则进行 dump
```

如何收集信息

```c++
void HeapProfileTable::RecordAlloc(
    const void* ptr, size_t bytes, int stack_depth,
    const void* const call_stack[]) {
  Bucket* b = GetBucket(stack_depth, call_stack);
  b->allocs++;
  b->alloc_size += bytes;
  total_.allocs++;
  total_.alloc_size += bytes;

  AllocValue v;
  v.set_bucket(b);  // also did set_live(false); set_ignore(false)
  v.bytes = bytes;
  address_map_->Insert(ptr, v);
}

首先通过堆栈信息，获取到对应的 bucket 桶。这个桶可以理解为当前这个堆栈的哈希。
然后填充这个桶的信息，比如：调用次数、申请内存的多少等
接着，将这个指针和信息联合在一起即可
```

再来看看是如何进行 dump 操作，主要是 `MaybeDumpProfileLocked()`。关于文件的操作不展开了，主要看如何拿到 profiler 信息，然后写入文件的过程

```c++
static char* DoGetHeapProfileLocked(char* buf, int buflen) {
  // We used to be smarter about estimating the required memory and
  // then capping it to 1MB and generating the profile into that.
  if (buf == NULL || buflen < 1)
    return NULL;

  RAW_DCHECK(heap_lock.IsHeld(), "");
  int bytes_written = 0;
  if (is_on) {
    HeapProfileTable::Stats const stats = heap_profile->total();
    (void)stats;   // avoid an unused-variable warning in non-debug mode.
    bytes_written = heap_profile->FillOrderedProfile(buf, buflen - 1);
    // FillOrderedProfile should not reduce the set of active mmap-ed regions,
    // hence MemoryRegionMap will let us remove everything we've added above:
    RAW_DCHECK(stats.Equivalent(heap_profile->total()), "");
    // if this fails, we somehow removed by FillOrderedProfile
    // more than we have added.
  }
  buf[bytes_written] = '\0';
  RAW_DCHECK(bytes_written == strlen(buf), "");

  return buf;
}


```













