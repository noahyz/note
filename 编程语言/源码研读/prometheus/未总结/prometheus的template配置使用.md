## tencentcloud_cloudmonitor_agent 配置 prometheus 插件的 template 介绍

### 一、prometheus 数据格式

我们有这样的 prometheus 的数据如下（以下是伪代码）：

```
prometheusCounter = prometheus.NewCounterVec(
    prometheus.CounterOpts{
    Namespace: "TXHJ",
    Name: "SRMP_OrderDataServer_api_pre_costTime_total",
    },
    []string{"cpu"},
)
prometheusCounter.With(prometheus.Labels{"cpu":"cpu0"}).Add(float64(10))
```

如上，我们有一个 counter 类型的一个监控指标。其中，namespace：TXHJ。measurement ( metric_name )：SRMP_OrderDataServer_api_pre_costTime_total。dimension ( tags )：[]string{"cpu"} 。
由于使用 prometheus pull 方式，我们在本机使用  `curl 127.0.0.1:8080/metrics ` 得到下面的prometheus 监控数据。

```
# HELP TXHJ_SRMP_OrderDataServer_api_pre_costTime_total 
# TYPE TXHJ_SRMP_OrderDataServer_api_pre_costTime_total counter
TXHJ_SRMP_OrderDataServer_api_pre_costTime_total{cpu="cpu0"} 10
```

转换成 agent 内部存储的格式，如下 ( 只有一个指标的重要部分 )：

```
    {
        "name":"TXHJ_SRMP_OrderDataServer_api_pre_costTime_total",
        "tags":{
            "cpu":"cpu0",
        },
        "time":"2021-04-27 12:30:15 +0800 CST",
        "fields":{
            "TXHJ_SRMP_OrderDataServer_api_pre_costTime_total":"{key:TXHJ_SRMP_OrderDataServer_api_pre_costTime_total,value:10}"
        }
    }
```

如上，我们可以观察到一个此指标的 measurement 和 field 是一致的。（注：histogram、summary 类型有些出入，读者自行验证下）

### 二、 template 模式介绍

首先介绍 template 模式的关键字：

1. measurement：指定指标的名字，可以多次指定
2. field：指定指标的字段名字，可以多次指定
3. measurement* ：指定指标的名字，可以匹配后续
4. field* ：指定指标的字段名字，可以匹配后续

注意：measurement* 和 field* 不能一起使用。除过以上关键字，其他 template 中的部分都将被视为 dimension（tag）

### 三、template 使用

1. 匹配所有指标。`"_ * mytag_measurement_measurement_measurement_measurement_field_field"` ，其中 `_` 是分隔符，`*` 代表匹配所有指标，最后的代表转换成什么形式 

```
templates = [ "_ * mytag_measurement_measurement_measurement_measurement_field_field" ]
```

分析，由上面的例子，当匹配到 `TXHJ_SRMP_OrderDataServer_api_pre_costTime_total` 时，
mytag 匹配到了 TXHJ
measurement 匹配到了 SRMP、OrderDataServer、api、pre
field 匹配到了 costTime、total
所以得到的结果如下： 

```
   {
        "name":"SRMP_OrderDataServer_api_pre",
        "tags":{
            "cpu":"cpu0",
            "mytag":"TXHJ",
            "url":"http://9.134.239.95:8081/metrics"
        },
        "time":"2021-04-27 13:19:05 +0800 CST",
        "fields":{
            "costTime_total":"{key:costTime_total,value:10}"
        }
    },
```

可见，由于 mytag 不是template 的关键词，因此被作为 dimension ( tag )。measurement 匹配到了 SRMP_OrderDataServer_api_pre（中间以 _ 作为分隔符）。field 匹配到了 costTime_total （中间以 _ 作为分隔符 ）

2. 匹配部分指标。`"_ TXHJ_* measurement_server_field*"` ，其中 `_` 是分隔符， `TXHJ_* ` 是要匹配的指标（以 `TXHJ_ ` 开头的指标），最后的代表转换成什么形式

````
templates = [ "_ TXHJ_* measurement_server_field*" ]
````

分析，当匹配到 `TXHJ_SRMP_OrderDataServer_api_pre_costTime_total` 时，
measurement 匹配到 TXHJ
server 匹配到 SRMP
field 匹配到后续所有 OrderDataServer、api、pre、costTime、total 
所以得到结果如下：

```
    {
        "name":"TXHJ",
        "tags":{
            "cpu":"cpu0",
            "server":"SRMP",
            "url":"http://9.134.239.95:8081/metrics"
        },
        "time":"2021-04-27 13:32:35 +0800 CST",
        "fields":{
            "OrderDataServer_api_pre_costTime_total":"{key:OrderDataServer_api_pre_costTime_total,value:15}"
        }
    }
```

### 四、其他

以上说明使用的分隔符为下划线 _ ，推荐使用下划线，这也是 tencentcloud_cloudmonitor_agent 默认的分隔符。如果要使用别的分隔符，则需增加或修改 inputs.prometheus 插件中的配置项 `metric_separator = "分隔符"` 



