### template Patterns

模板模式是一个轻量的语言用于展示以点分隔的字符串应该如何与 metircs 映射

一个模板如下：

```
"host.mytag.mytag.measurement.measurement.field*"
```

可以设置以下的关键字

1. measurement：指定 graphite bucket 的这个部分与measurement name 相对应，这个可以指定多次
2. field：指定 graphite bucket 的这个部分与 field name 相对应，这个可以指定多次
3. measurement* ：指定 graphite bucket的所有剩下的元素与 measurement name 相对应
4. fields*：指定 graphite bucket 的所有剩下的元素与 field name 相对应

模版中任何不是关键字的部分都将被视为tag key。这个可以指定多次

注意：measurement 必须在模板中指定。fields* 不能与 measurement* 相结合。

### 例子：

#### Measurement & Tag Templates

最基本的模板是指定单个的转换以用作所有传入的 metric，如下的模板

```
templates = [
    "region.region.measurement*"
]
```

将导致下面的 Graphite -> telegraf 的转换

```
us.west.cpu.load 100
=> cpu.load,region=us.west value=100
```

也可以指定多个模板，但是应该使用过滤器来区分他们。（如下）

```
templates = [
    "*.*.* region.region.measurement", # <- all 3-part measurements will match this one.
    "*.*.*.* region.region.host.measurement", # <- all 4-part measurements will match this one.
]
```

#### Field Templates

field 关键字告诉 telegraf 给出该 field 名字的metric，如下

```
separator = "_"
templates = [
    "measurement.measurement.field.field.region"
]
```

将导致下面的 Graphite -> telegraf 的转换

```
cpu.usage.idle.percent.eu-east 100
=> cpu_usage,region=eu-east idle_percent=100
```

field key 还可以通过指定 field* 从 graphite bucket 所有剩余的元素去派生

```
separator = "_"
templates = [
    "measurement.measurement.region.field*"
]
```

将导致下面的 Graphite -> telegraf 的转换

```
cpu.usage.eu-east.idle.percentage 100
=> cpu_usage,region=eu-east idle_percentage=100
```

#### Filter Templates

用户也可以使用基于 bucket 的名字，使用 glob 配置来过滤要使用的模板，如下

```
templates = [
    "cpu.* measurement.measurement.region",
    "mem.* measurement.measurement.host"
]
```

将导致如下的转换

```
cpu.load.eu-east 100
=> cpu_load,region=eu-east value=100

mem.cached.localhost 256
=> mem_cached,host=localhost value=256
```

#### Adding Tags

可以将额外的 tags 添加到接收到的 metric 中不存在此 tag 的 metric 上。你可以通过指定他们添加额外的 tags  在这个模式下。tags 和 line protocol 有相同的格式。多个 tags 使用逗号分隔。

```
templates = [
    "measurement.measurement.field.region datacenter=1a"
]
```

将导致下面的 Graphite -> telegraf 的转换

```
cpu.usage.idle.eu-east 100
=> cpu_usage,region=eu-east,datacenter=1a idle=100
```























