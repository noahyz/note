jeprof 依赖 perl 环境，需要搭建 perl 环境。注意 perl 中有一些脚本使用的是绝对路径，需要放在绝对目录中

然后使用 jeprof 解析 heap 的时候，出现如下的问题：

```
jeprof /opt/WM_B/APP/HAVP/linux-arm/ANP/bin/pavaro ./custom_prof.mem_profiler.110003.20230307_114334_114347.heap
Using local file /opt/WM_B/APP/HAVP/linux-arm/ANP/bin/pavaro.
Argument "MSWin32" isn't numeric in numeric eq (==) at /bin/jeprof line 5124.
Argument "linux" isn't numeric in numeric eq (==) at /bin/jeprof line 5124.
Using local file ./custom_prof.mem_profiler.110003.20230307_114334_114347.heap.
Welcome to jeprof!  For help, type 'help'.
(jeprof) top20
Total: 41.4 MB
    41.4 100.0% 100.0%     41.4 100.0% 0000ffff81627978
```

解决第一个问题，jeprof 使用了 file，并且是 /usr/bin/file 这个路径下的 file。注意 file 命令需要设置 magic file。

第二个问题，貌似解析的不正确。 jemalloc 依赖堆栈展开器支持来获取堆栈跟踪，在许多情况下，使用 libunwind 会更好。加上 `--enable-prof-libunwind` 来编译 jemalloc

注意先编译 libunwind.so，然后再编译 libjemalloc.so。可以解决。解析不正确的问题。然后出现新的问题，解析正常，但是并没有把内存地址转换成相应的符号。缺少 addr2line 工具。再来编译 add2line 工具

加上 add2line 工具后，解析正确。nice。开心，嘿嘿嘿



