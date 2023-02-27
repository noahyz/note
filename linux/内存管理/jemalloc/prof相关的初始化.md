prof 配置的初始化路径

```
malloc_init() 会被 constructor 调用
malloc_init() -> malloc_init_hard() -> malloc_init_hard_a0_locked() -> ... -> malloc_conf_init_helper()
初始化 opt_prof 
```

内存分配流程

```
C 库内存管理函数 -> imalloc() -> imalloc_body() 
如果 config_prof 和 opt_prof 都为 true，则 prof 打开 -> 检测是否需要采样 -> 调用 imalloc_no_sample() / imalloc_sample() 两种逻辑 
```

加载配置（环境变量）

```
malloc_conf_init_helper() 会被初始化时调用
会通过 obtain_malloc_conf 获取配置（环境变量），赋值给相关变量：opt_prof / opt_lg_prof_interval 
opt_prof: "prof"
opt_lg_prof_interval: "lg_prof_interval"

```

constructor :

```
zone_register()  关于 zone 的，先不看
jamlloc_init() -> malloc_init_hard() -> 

```

```
je_mallctl("prof.dump") -> ctl_byname() -> (node->ctl) -> prof_dump_ctl -> prof_mdump -> prof_dump ->
```





- dump 出结果文件时，增加时间戳：`prof_dump_filename()`
- 随时启动、停止。通过脚本来启动、停止 prof。
  - 先关闭 prof，
- 设置阈值，1. 申请量超过某值。2. 采样的 sample_value 值。3. 内存申请高水位超过某值



```
export MALLOC_CONF="prof:true,lg_prof_interval:20,lg_prof_sample:19,prof_log:true,log=." 

LD_PRELOAD=/data/code/cpp/noahyzhang_jemalloc/jemalloc/build/lib/libjemalloc.so ./test_jemalloc
```

```
opt.prof: 启用/禁用内存分析
opt.prof_prefix: 分析文件转储的文件名前缀
opt.prof_active: 分析文件已激活/已停止
opt.prof_thread_active_init:

opt.lg_prof_sample: 分配样本之间的平均间（对数基数为2），以分配活跃的字节数衡量。默认采样间隔为 512KB（2^19 B）；也就是说每分配 512KB 就会采样一次。

opt.prof_accum:

opt.lg_prof_interval: 内存分析文件转储的平均间隔（对数基数为2），以分配活跃的字节数衡量。也就是说内存申请量超过此值，就转储一次到分析文件。默认情况下是禁用的。

opt.prof_dump: 每次总虚拟内存超过先前的最大值时都会触发内存分析文件转储
opt.prof_final: 
opt.prof_leak: 启用/禁用内存泄漏
opt.prof_leak_error: 检测到内存泄漏，则使进程退出并返回错误码

thread.prof.name: 获取/设置与内存分析文件转储中的调用线程关联的描述性名称
thread.prof.active: 控制调用线程的采样当前是否处于活跃状态

prof.thread_active_init: 
prof.active: 控制采样当前是否处于活跃状态
prof.dump: 将内存分析文件转储到指定文件，或者如果指定 NULL，则根据模式转储到文件 <prefix>.<pid>.<seq>.m<mseq>.heap，其中<prefix>由 opt.prof_prefix 和prof.prefix 选项
prof.prefix: 设置分析文件转储的文件名前缀，opt.prof_prefix 为默认设置。设置文件存储路径
prof.gdump: 启用后，每次总虚拟内存超过先前的最大值时出发内存分析文件转储
prof.reset: 重置所有内存分析文件统计信息
prof.lg_sample: 获取当前采样率

prof.interval: 在基于事件间隔的分析文件转储之间分配的平均字节数。和 opt.lg_prof_interval 的信息一致。

生成 profiler 文件的时机：
- 在 exit 前，转储
- 每申请一定大小的字节数，就转储。lg_prof_interval 
- 每次使用的虚拟内存总量达到一个新高，就转储。prof_gdump  配置为一个 bool 类型
- 手动通过 mallctl  “prof.dump”  来触发转储。
```



```
使用 atexit 注册一个函数当进程调用 exit 退出时被调用。
atexit(prof_fdump);

那也就是在结束的时候，调用 prof_fdump 来即时生成 profiler 文件
```

```
1. prof_fdump 只会在进程退出前被调用，生成 profiler 文件
2. prof_idump 当一个时间间隔内分配的内存大于某个值时，生成 profiler 文件
3. prof_gdump 当使用的虚拟内存总量达到一个新高，生成 profiler 文件
4. prof_mdump 
```









