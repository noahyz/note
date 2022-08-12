## linux下perf命令总结
perf是Linux下的一款性能分析工具，能够进行函数级与指令级的热点查找。

#### Perf List
利用perf剖析程序性能时，需要指定当前测试的性能时间。性能事件是指在处理器或操作系统中发生的，可能影响到程序性能的硬件事件或软件事件

#### Perf top
实时显示系统/进程的性能统计信息
常用参数
    -e：指定性能事件
    -a：显示在所有CPU上的性能统计信息
    -C：显示在指定CPU上的性能统计信息
    -p：指定进程PID
    -t：指定线程TID
    -K：隐藏内核统计信息
    -U：隐藏用户空间的统计信息
    -s：指定待解析的符号信息
    ‘‐G’ or‘‐‐call‐graph’ <output_type,min_percent,call_order>
    graph: 使用调用树，将每条调用路径进一步折叠。这种显示方式更加直观。每条调用路径的采样率为绝对值。也就是该条路径占整个采样域的比率。
    fractal: 默认选项。类似与 graph，但是每条路径前的采样率为相对值。
    flat: 不折叠各条调用
    选项 call_order 用以设定调用图谱的显示顺序，该选项有 2个取值，分别是 callee 与caller。
        将该选项设为callee 时，perf按照被调用的顺序显示调用图谱，上层函数被下层函数所调用。
        该选项被设为caller 时，按照调用顺序显示调用图谱，即上层函数调用了下层函数路径，也不显示每条调用路径的采样率



https://blog.didiyun.com/index.php/2019/01/02/linux-perf/

https://www.shuzhiduo.com/A/WpdKrb1m5V/

https://blog.csdn.net/cyq6239075/article/details/104371328
