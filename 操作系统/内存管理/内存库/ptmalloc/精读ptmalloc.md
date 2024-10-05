---
title: 精读ptmalloc
---

ptmalloc 来自于 glibc 2.27 版本，以 64 位操作系统为例。

## malloc

先贴出 `malloc_chunk` 的定义

```
struct malloc_chunk {

  INTERNAL_SIZE_T      mchunk_prev_size;  /* Size of previous chunk (if free).  */
  INTERNAL_SIZE_T      mchunk_size;       /* Size in bytes, including overhead. */

  struct malloc_chunk* fd;         /* double links -- used only if free. */
  struct malloc_chunk* bk;

  /* Only used for large blocks: pointer to next larger size.  */
  struct malloc_chunk* fd_nextsize; /* double links -- used only if free. */
  struct malloc_chunk* bk_nextsize;
};
```

其中 `__libc_malloc` 是 malloc 函数的原型。

`strong_alias (__libc_malloc, __malloc) strong_alias (__libc_malloc, malloc)`

```c++
checked_request2size(bytes, tbytes)  ==> tbytes = request2size(bytes)  ==> 

bytes == req
(((req) + SIZE_SZ + MALLOC_ALIGN_MASK < MINSIZE) ? MINSIZE : ((req) + SIZE_SZ + MALLOC_ALIGN_MASK) & ~MALLOC_ALIGN_MASK)
其中：
SIZE_SZ 为 sizeof(size_t) 因为为 8

MINSIZE 为 (unsigned long)(((MIN_CHUNK_SIZE + MALLOC_ALIGN_MASK) & ~MALLOC_ALIGN_MASK))
#define MIN_CHUNK_SIZE        (offsetof(struct malloc_chunk, fd_nextsize)) 
因此 MIN_CHUNK_SIZE 为 32

#define MALLOC_ALIGNMENT (2 * SIZE_SZ < __alignof__ (long double) \
			  ? __alignof__ (long double) : 2 * SIZE_SZ)
#define MALLOC_ALIGN_MASK (MALLOC_ALIGNMENT - 1)
其中 __alignof__ (long double)  为 16，则 MALLOC_ALIGNMENT 为 16
那么 MALLOC_ALIGN_MASK 为 15

因此 MINSIZE 为 (32+15) & (~MALLOC_ALIGN_MASK)，这样做的目的是让其对其到 16 这个大小。MINSIZE 为 32

那么 request2size(bytes) 这个宏的含义是
((req + 8 + 15) <  32) ? 32 : ((req) + 8 + 15) & ~MALLOC_ALIGN_MASK)
也就是说用户请求的大小加上 8 和 15 之后，如果小于 32，则取 32 ，如果大于 32，则取 (req+8+15) 对齐到 16 这个大小
在换算一下，req 如果小于 9，则 (req + 8 + 15) 永远小于 32，则结果永远为 32。如果大于 9，则需要进行对齐到 16 这个大小。
举个例子：req=24，结果为 32，如果 req=25, 结果为 48
  
size_t tc_idx = csize2tidx (tbytes);
# define csize2tidx(x) (((x) - MINSIZE + MALLOC_ALIGNMENT - 1) / MALLOC_ALIGNMENT)
tc_idx 为 ((x) - 32 + 16 - 1) / 16), 除以 16 的含义为 所有小于16 的大小，全为 0
因为 x 最小为 32，并且是 16 的整数倍。举例：
x=32, 则 tc_idx=0
x=48, 则 tc_idx=1
x=64, 则 tc_idx=2
```

接下来进行 `MAYBE_INIT_TCACHE()`，进行初始化 `tcache_init()`。需要用到 `_int_malloc` 来申请内存。后边看

如果 tcache 已经被初始化为可用状态，并且满足条件，则通过 tcache 来分配内存

如果没有匹配到 tcache，并且线程数为 1，则直接使用 main_arena 进行分配

否则先挑选 arena，再从这个 arena 进行分配内存。如何获取 arena 呢？

```
arena_get (ar_ptr, bytes);
static __thread mstate thread_arena
获取到线程缓存中的作为 arena，并且加锁。这里为什么要加锁？TLS 不应该是线程私有数据？
```

接下来，终于到了真正分配内存的函数 `_int_malloc` 。

`_int_malloc(mstate av, size_t bytes)` 为实际的分配函数

第一步，先看是否可以匹配到 fastbin

```
get_max_fast() 这个函数可以获取到最大的 fastbin 的大小

#define DEFAULT_MXFAST     (64 * SIZE_SZ / 4)  ==> 128
global_max_fast = (((s) == 0) ? SMALLBIN_WIDTH : ((s + SIZE_SZ) & ~MALLOC_ALIGN_MASK))
其中 s 为 DEFAULT_MXFAST，SMALLBIN_WIDTH 为 16，
则 global_max_fast 的值为 128

#define MAX_FAST_SIZE     (80 * SIZE_SZ / 4)
MAX_FAST_SIZE 为 160

最终 get_max_fast 返回 128
```

也就是说，小于 128 大小的，均可以来自于 fastbin，接下来寻找 fastbin_index。fastbin 中存储的是固定的大小：32、48、64、80、96、112、128。然后 fastbin 这个数组大小为 10。其中 3 个位置要存什么？ 

```
#define fastbin_index(sz) ((((unsigned int) (sz)) >> (SIZE_SZ == 8 ? 4 : 3)) - 2)
SIZE_SZ 为 8，所以相当于 sz 除以 16，然后再减 2
因为 sz 最小为 32，所以 index 最小为 32 / 16 - 2 = 0

同时，一个 arena 的 fastbin 的个数
typedef struct malloc_chunk *mfastbinptr;
mfastbinptr fastbinsY[NFASTBINS];
#define NFASTBINS  (fastbin_index (request2size (MAX_FAST_SIZE)) + 1)
经过计算 NFASTBINS 为 10

接下来，从这个 arena 的 fastbin 中寻找合适的内存，而 fastbinsY 中存储的就是 malloc_chunk* 类型

#define chunksize_nomask(p)         ((p)->mchunk_size)
#define SIZE_BITS (PREV_INUSE | IS_MMAPPED | NON_MAIN_ARENA)
#define chunksize(p) (chunksize_nomask (p) & ~(SIZE_BITS))

#define chunk2mem(p)   ((void*)((char*)(p) + 2*SIZE_SZ))
含义是给 malloc_chunk 的指针，返回除去 malloc_chunk 头之后剩下的部分

然后填充这块内存空间，返回指针即可
```

第二步，再 smallbin 中寻找

```
#define in_smallbin_range(sz)  \
  ((unsigned long) (sz) < (unsigned long) MIN_LARGE_SIZE)
#define NSMALLBINS         64
#define SMALLBIN_WIDTH    MALLOC_ALIGNMENT
#define SMALLBIN_CORRECTION (MALLOC_ALIGNMENT > 2 * SIZE_SZ)
#define MIN_LARGE_SIZE    ((NSMALLBINS - SMALLBIN_CORRECTION) * SMALLBIN_WIDTH)
MIN_LARGE_SIZE 的大小为 1024

#define smallbin_index(sz) \
  ((SMALLBIN_WIDTH == 16 ? (((unsigned) (sz)) >> 4) : (((unsigned) (sz)) >> 3))\
   + SMALLBIN_CORRECTION)
SMALLBIN_WIDTH 是 16，则 smallbin_index 的值为：请求大小 / 16
而请求大小最小为 129。所以 index 最小为 8。

arena 中 smallbin 的数组大小为 128 * 2 - 2 = 254
mchunkptr bins[NBINS * 2 - 2];
mchunkptr 的类型为 malloc_chunk* 类型

#define bin_at(m, i) \
  (mbinptr) (((char *) &((m)->bins[((i) - 1) * 2]))			      \
             - offsetof (struct malloc_chunk, fd))

同样的，最后将获取到的 victim（malloc_chunk*）类型，去掉头部后，返回给用户
返回前设置内存块中的数据
```

第三步，在 largebin 中寻找

```
#define largebin_index(sz) \
  (SIZE_SZ == 8 ? largebin_index_64 (sz)                                     \
   : MALLOC_ALIGNMENT == 16 ? largebin_index_32_big (sz)                     \
   : largebin_index_32 (sz))
   
#define largebin_index_64(sz)                                                \
  (((((unsigned long) (sz)) >> 6) <= 48) ?  48 + (((unsigned long) (sz)) >> 6) :\
   ((((unsigned long) (sz)) >> 9) <= 20) ?  91 + (((unsigned long) (sz)) >> 9) :\
   ((((unsigned long) (sz)) >> 12) <= 10) ? 110 + (((unsigned long) (sz)) >> 12) :\
   ((((unsigned long) (sz)) >> 15) <= 4) ? 119 + (((unsigned long) (sz)) >> 15) :\
   ((((unsigned long) (sz)) >> 18) <= 2) ? 124 + (((unsigned long) (sz)) >> 18) :\
   126)
如上是为了计算 largebin 的 index，而进行分桶。

如果有 fastbin，则进行合并
如果没有继续往下走
```





















