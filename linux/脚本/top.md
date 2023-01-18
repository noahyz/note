### top 命令参数

```
-b 运行脚本模式
-c 显示 command 列中命令的完整路径
-n 指定 top 在结束之前应该产生的最大迭代数
-o 定义了按照那个字段排序
-d 刷新时间
```

top 使用方法

```
1. 按照 cpu 使用率对数据进行排序
top -bc -n 1 | head -20

2. 按照内存使用顺序排序
top -bc -o +%MEM -n 1 | head -n 20

3. 在批处理模式下，使用 top 命令根据进程的使用时间排列数据。他显示进程自启动以来消耗的 cpu 时间总量
top -bc -o TIME+ -n 1 | head -n 20

4. 将 top 的输出结果保存到文件
top -bc | head -30 > top_info.txt
```



### top 命令输出到文件

持续输出某个进程的信息

````
#!/bin/bash
echo "  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND" > /tmp/top.txt
for i in {1..10000};do
    top -b -n 1 | grep process_name >>/tmp/1.txt
    sleep 1
done
````

持续输出系统整体的信息（按照 cpu 排序）

```
#!/bin/bash
echo "  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND" > /tmp/top.txt
for i in {1..10000};do
    top -b -n 1 | head -20  >> top_system_cpu.txt
    sleep 1
done
```

