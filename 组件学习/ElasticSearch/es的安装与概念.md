参考：https://www.kuangstudy.com/bbs/1354069127022583809

## 一、ElasticSearch安装

使用Java开发，必须保证 elasticsearch 的版本与Java 的核心jar包版本对应

安装 elasticsearch 和 可视化界面（elasticsearch-head）

1. 下载：https://www.elastic.co/cn/downloads/
2. bin目录下，直接启动
3. 安装可视化界面（可以直接安装浏览器插件）：https://github.com/mobz/elasticsearch-head

安装kibana

1. 下载（版本需要和es版本相同）：https://www.elastic.co/cn/downloads/
2. bin目录二进制文件，直接启动
3. kibana汉化：config/kibaba.yml 文件修改 `i18n.locale: "zh-CN"` 

ELK：Elasticsearch、Logstash、 Kibana三大开源框架首字母大写简称，市面上也被成为Elastic Stack

- Logstash是ELK的中央数据流引擎,用于从不同目标(文件/数据存储/MQ )收集的不同格式数据,经过过滤后支持输出到不同目的地(文件/MQ/redis/elasticsearch/kafka等)。
- Kibana可以将elasticsearch的数据通过友好的页面展示出来 ,提供实时分析的功能。

- 市面上很多开发只要提到ELK能够一致说出它是一个日志分析架构技术栈总称 ,但实际上ELK不仅仅适用于日志分析,它还可以支持其它任何数据分析和收集的场景,日志分析和收集只是更具有代表性。并非唯一性。
- 收集清洗数据(Logstash) ==> 搜索、存储(ElasticSearch) ==> 展示(Kibana)

IK分词器的安装使用

1. 下载（版本应该和es保持一致）：https://github.com/medcl/elasticsearch-analysis-ik/releases

2. 在es的plugins目录下创建 ik 文件夹，将下载拷贝过来

3. 重启 es，即可加载。通过 `elasticsearch-plugin list` 工具也可查看都有哪些插件

4. 添加自定义的词到扩展字典中，在 elasticsearch目录/plugins/ik/config/IKAnalyzer.cfg.xml 中配置，并添加添加自己的字典

5. 重启es，即可加载成功

    ```
    // ik_smart: 最小切 ik_max_word：最细粒度划分(穷尽词库的可能)
    GET _analyze 
    {
    	"analyzer": "ik_smart",
    	"text": "年轻人不讲武德"
    }
    GET _analyze 
    {
    	"analyzer": "ik_max_word",
    	"text": "年轻人不讲武德"
    }
    ```

## 二、ElasticSearch概念

| Relational DB      | ElasticSearch          |
| ------------------ | ---------------------- |
| 数据库（database） | 索引（indices）        |
| 表（tables）       | types \<慢慢会被弃用!> |
| 行（rows）         | documents              |
| 字段（columns）    | fields                 |

**elasticsearch（集群）**中可以包含多个**索引（数据库）** ,每个索引中可以包含多个**类型（表）** ,每个类型下又包含多个**文档（行）** ,每个文档中又包含多个**字段（列）**