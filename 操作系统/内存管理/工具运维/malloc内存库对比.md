---
title: malloc内存库对比
---

### 一、核心矛盾

内存分配器通常在三件事之间做权衡：

- 速度与并发扩展性：多线程下 malloc/free 是否会因锁竞争退化
- 碎片与RSS可控性：长期运行后，是否容易出现“已free但RSS不降/不归还OS”、内存被分散在不同池中难以回收
- 可观测与可调优能力：是否能输出细粒度统计、支持 profilling(观测/分析)、是否有成熟的 配置参数。

一般对于ptmalloc、jemalloc、tcmalloc，共同的套路是：

- 小对象走 size class（按大小分桶）+ cache（线程/CPU 本地缓存） 的快路径；
- 大对象走 页级/extent 级管理 + mmap/munmap 或 madvise purge；
- 并发通过 arena（多个堆实例） 或 per-thread/per-CPU cache 降锁竞争。

### 二、ptmalloc

实现原理：

- 集成在 glibc 的 malloc
- Arenas：为降低锁竞争，引入多个 arena；线程会绑定/选择某个 arena，在该 arena 上分配/释放时竞争更小。
- Bins：按大小组织空闲块（fastbins/smallbins/largebins/unsorted 等）。
- tcache（thread-local cache）：glibc 2.26 引入“线程缓存”，访问无需锁，显著加速小对象分配效率；当缓存耗尽/回填时才需要锁住底层 arena。

优点：

- 默认可用、兼容性最好：几乎所有 Linux 发行版的系统 malloc 就是它；生态最稳。
- 小对象性能在“有 tcache”后显著改善：大量短生命周期小对象场景，分配效率高。
- 有现成配置参数经验：例如限制 arena 数量可降低内存膨胀（牺牲一定并发性能）。

缺点：

- 多线程 + 多 arena 容易带来 RSS 膨胀/碎片问题：空闲块分散在多个 arena（以及 tcache）里，应用层看似“free 了”，但 OS 侧未必能回收，尤其在容器内更显著（常见现象：QPS 波动后 RSS 上去下不来）。
- 可观测/剖析能力相对较弱：原生内建的统计/heap profiling 体系不够完整，不如 jemalloc 体系化。

适用场景：

- 通用默认：对分配器没有明确痛点、线程数/分配频率不夸张、或更看重“零改动稳定性”时。
- 容器/Java/C++ 服务出现 RSS 膨胀时的第一步：先用 `MALLOC_ARENA_MAX` 限制 arenas 做试探性治理（常见推荐值如 1~2 属于“偏省内存”的取向）。

### 三、jemalloc

实现原理：

- 以“可扩展性 + 碎片控制”为核心目标：采用 arenas + bins(size classes) + tcache 的分层；并在“虚拟内存段（extent）”层面做更精细的管理与回收策略。其接口与 extent/arena 的组织方式在官方手册中有明确描述。
- 可观测/控制能力强：通过 `mallctl`/`MALLOC_CONF` 提供大量统计项与开关；支持 heap profiling（如 `opt.prof`、`prof.active`、`prof.dump` 等）。

优点：

- 碎片控制与长期稳定性通常更好：特别是长生命周期服务、对象大小分布复杂、分配/释放模式多变时，jemalloc 往往更“稳”、RSS 更可控。
- “可观测 + 可调参”明显领先：内建 stats/profiling 体系更适合做线上问题定位（泄漏、碎片、热点 size class 等）。
- 工程治理友好：很多场景下我们不是要“更快”，而是要“更可控、可能解释”，jemalloc 在这点上优势明显

缺点：

- 引入成本与复杂度更高：需要替换系统 malloc（链接或 `LD_PRELOAD`），并理解/维护 `MALLOC_CONF`；调参空间大也意味着“误配”可能性。
- 性能不一定总赢：在一些极端追求吞吐的分配模式下，tcmalloc 可能更占优；jemalloc常见表现是“更均衡、更可控”。

适用场景：

- 长跑型服务（Web服务/存储/网关等），对 RSS 可控、碎片治理、线上剖析能力有强诉求。
- 希望把“内存问题工程化”：不仅要解决一次，还要持续观测、能回归、能解释。

### 四、tcmalloc

实现原理：

- 目标非常明确：快、并发下尽量无锁/低开销锁。官方设计文档把它定义为“Thread-Caching Malloc”，并强调 fast / uncontended allocation（无竞争分配）。
- 现代 google/tcmalloc 默认是 per-CPU caching（基于 Linux rseq 时启用），否则退回 per-thread caching
- 代价方面：官方也明确写了 per-CPU 模式会为每个 CPU 预留一块 slab（典型 256KiB），在 CPU 数多时会带来可观的常驻开销。

优点：

- 高并发下的小对象吞吐非常高/延迟通常非常低：per-CPU/per-thread cache 是快速分配路径，极少触发共享结构锁竞争。
- 对“分配/释放极其频繁”的服务很友好：尤其是线程多、热点 size class 明显的场景。

缺点：

- 内存开销/驻留可能更高：per-CPU cache、元数据、预留 slab 等会推高基准线；CPU 数多的机器尤其明显。
- 更偏“性能优先”的取向：当我们的首要矛盾是 RSS 可控/碎片治理/精细 profiling，jemalloc 往往更合适。

适用场景：

- 极致性能导向：高并发、短生命周期小对象为主、malloc/free 成为热点且锁竞争明显。
- 对“每核缓存”模式接受度高（CPU 多时仍能接受其常驻开销）。

### 五、小结

| 维度         | ptmalloc（glibc malloc）                                     | jemalloc                                                     | tcmalloc（典型：gperftools / google）                        |
| ------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 核心目标     | 兼容/通用、整体均衡；在多线程下通过多 arena 降锁竞争         | 多线程可扩展 + 可控碎片 + 可观测/可调                        | 极致分配/释放吞吐，减少锁竞争（thread/per-cpu cache）        |
| 并发策略     | 多 arena（线程可能落在不同 arena）+ bin；现代 glibc 还有 tcache | 多 arena；可配 narenas、percpu_arena；后台线程做 purge       | 每线程/每 CPU cache（小对象快路径几乎无锁），central freelist/page heap 汇总 |
| 典型优势     | “系统默认”，无需额外引入库；与系统工具链兼容性最好           | 可通过 decay、background_thread 等较系统化地平衡 “RSS/碎片”  | 小对象性能非常强；多线程扩展性好；对锁竞争敏感的业务收益明显 |
| 典型劣势     | 多 arena 下“内存难跨 arena 复用”，某些阶段性工作负载易膨胀（tcmalloc 文档专门点名这一问题） | 引入第三方库；需要理解参数与观测指标，否则容易“越调越差”     | thread/per-cpu cache 可能导致 RSS 看起来“回不去”；需要通过 cache 上限与 release 策略去驯化 |
| 典型适用场景 | 负载不极端、线程数不爆炸、对 RSS 不敏感或已满足              | 希望更稳定的内存曲线/碎片控制；对 tail latency / RSS 有明确目标的长期服务 | 分配频率极高、线程并发强、锁竞争明显；但需要配合参数控制缓存与回收 |

ptmalloc/glibc：默认、稳、兼容性最好；但在高并发与容器化场景容易出现“arena + tcache 导致的内存膨胀/碎片”治理成本。

jemalloc：更偏“可控 + 可治理 + 长期稳定”，并发扩展也强，且 profiling/统计体系完善。

tcmalloc：更偏“性能极致”，per-CPU/per-thread cache 将快路径推到极限，但用更多常驻/元数据换速度。











