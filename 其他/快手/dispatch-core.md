

````
1. 容量调度配置，单独的一个线程，去拉取相关配置
CapacitySched(16999, SchedServiceGrpc.class, true, true, "public-cdn-dispatch-capacity")
容量调度，暂时不用了。拉取配置一般返回的为空。直接走路由策略了。

2. 
````

