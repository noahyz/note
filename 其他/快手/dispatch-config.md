---
title: kuaishou-cdn-dispatch-config
---

克隆到项目后，先按照 readme 来进行配置。一定要先进行 `mvn clean` 之后，然后再来进行 `mvn compile`。最后刷新 maven 的依赖，然后再开始运行 API 服务。

```
kconf 的配置地址：https://kconf.corp.kuaishou.com/#/cdn/dispatch/dispatchConfigItemConf

在 Mac 上无法获取到配置
curl -v --location --request GET 'http://kcdn.dispatch.om.internal.yximgs.com:9809/api/machine/getinfo' \
--header 'token: dea524caf24c468241e74d7e10702866' \
--header 'caller: dispatch'
失败：Recv failure: Connection reset by peer


数据库如何访问
mybatis-generator.xml
<jdbcConnection driverClass="com.mysql.jdbc.Driver"
    connectionURL="jdbc:mysql://bjfk-d13.yz02:15136/dispatch-manage?useUnicode=true&amp;characterEncoding=UTF8"
    userId="test_rw"
    password="54rltyi5BCdcm06wu22A0brvvzU5uDgB">
</jdbcConnection>
数据库中存储的是 kconf 的操作记录。
api 的 path 为：/api/v1/common


kconf 地址：cdn.dispatchManage.dispatchTableRefreshTime
cdn.dispatchManage.dispatchTableRefreshTime

projectName 对应的 kconf 为空的 case：
projectName：cdn.unitedDispatchTable.adFc  的 kConf 为 NULL
cdn.unitedDispatchTable1.robot_test
```

测试功能的情况。使用 Postman 进行测试

```
1. 根据host查询具体的302配置

curl --location --request POST 'localhost:8080/public/v1/cdn/redirect/config_by_hostname' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "ad-cdn-domain-list"
}'

    "cdn_console": {
        "console_api_host": "http://kes-zhengpeiwei-01.dev.kwaidc.com:9809",
        "console_api_token": "16a524caf24c468241e74d7e10702865",
        "console_api_caller": "kcdnt"
    }
其中 console_api_host 域名访问不通。导致出现 API error

2. path 为 /api/v1/common 的路径，是操作 kconf 的记录，然后使用 mysql 数据库来记录这些操作记录的

3. path 为 /api/v1/traffic 的路径。

4. 通过域名查询配置
/api/v1/traffic/config/list_by_domains
会进行遍历如下的配置
    // 主站
    Manifest("Manifest"),
    // kcdn系列配置
    KCdnCommon("KCdnCommon"),
    // 管控
    Solar("Solar"),
    // 302
    Redirect("Redirect"),
    // 占位符配置
    ClientDomainPlaceholder("ClientDomainPlaceholder"),
    WebDomainPlaceholder("WebDomainPlaceholder")
从这些配置中获取到对应的配置。
先看主站的逻辑：
获取到 Kdd 的配置，然后进行转换之后，和用户传入的域名进行匹配，然后把对应域名的配置返回。
cdn.dispatchManage.kddDispatchKessServiceName
kCDN 的逻辑：
通过 kconf 的配置获取对应的配置，有一个（配置名 - 调度表）的映射。这个映射有两个，新的和旧的
新的映射：cdn.unitedDispatchTableConfig.projectConfigKeyMapper
旧的映射：cdn.unitedDispatchTable.projectConfigKeyMapper
在这个映射的帮助下，我们可以得到 域名和配置(kconf) 之间的对应关系。然后通过 kConf 就可以获取到这个域名的配置信息。

curl --location --request POST 'localhost:8080/api/v1/traffic/config/list_by_domains' \
--header 'Content-Type: application/json' \
--data-raw '{
    "domainNames": ["ali-album.video.yximgs.com"],
  	"notUseEffective": false
}'


5. 
/api/v1/traffic/config/list


/api/v1/traffic/config/domain_replace
根据条件进行故障切换
先进行故障切换，然后保存操作记录到数据库
如果用户需要进行回滚操作，会把本次操作的数据存储到数据库，回滚的时候从数据库读取数据进行回滚。
故障切换就是，原来的域名可能故障了，我们现在要切换到新的域名上。然后将此同步到 kconf 中


/api/v1/traffic/config/domain_replace_revert
故障切换回滚。
故障切换的时候，会返回一个 “操作ID”，这个 操作ID 关联一个数据库的一个记录。

```

老的 keyMapper 表：https://kconf.corp.kuaishou.com/#/cdn/unitedDispatchTable/projectConfigKeyMapper

新的 keyMapper 表：https://kconf.corp.kuaishou.com/#/cdn/unitedDispatchTableConfig/projectConfigKeyMapper

````
kconf 配置： cdn.resilience.dispatchTable
描述：容量调度-兜底调度表
hashType：1 随机，2用户，3图片
fileType：1图片，2视频，3静态
domain格式：domain,带宽,qps,httpsQps


````

































