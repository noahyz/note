**KSC2防盗链和普通防盗链方案对比**

普通防盗链：通过 pkey 中的时间戳信息进行访问权限的控制。

ksc2防盗链： 在普通防盗链基础上加密URL实现了URL防篡改能力，同样通过 pkey 进行访问权限控制。

# **主要差异**

|             | KSC2防盗链                                                   | 普通pkey防盗链                                       |
| ----------- | ------------------------------------------------------------ | ---------------------------------------------------- |
| 防篡改      | 有，替换域名不可用                                           | 无，替换域名可用，可利用该特点绕过防盗链校验         |
| 解析 bb key | 不能直接解析，需提供接口                                     | 可直接解析                                           |
| 缓存效率    | 同个URL加密结果一致，方案本身对缓存效率无影响，但升级到该方案对过度阶段会导致原有非防盗链的缓存key失效。 | 非防盗链升级到该类型防盗链可以命中原有缓存。         |
| 安全性      | 除防篡改带来的更高安全性之外，还具备防遍历能力。             | 篡改风险遍历风险                                     |
| URL长度     | 长度较长，影响包括：超过浏览器最大长度限制（2K+字符），目前未遇到。文件下载时触发操作系统对文件路径长度的限制，目前有用户反馈，下载时重命名即可解决。请求及响应体变大，带宽费用增加 | 长度和业务的 bb key 等有关。                         |
| 可读性      | 已无法读出原始路径上的信息                                   | 保留原始路径信息，业务可能会在原始路径上编码业务信息 |
| 图床支持    | 图床通过修改路径方式实现，和KSC2的设计有冲突，需要图床支持query参数方式。KCDN自有的图片处理支持query参数，无影响。 | 路径未加密，无影响。                                 |
|             |                                                              |                                                      |
|             |                                                              |                                                      |

# **KSC2使用上遇到的问题**

1. 反解析：用户提交的KSC2需要反解析出 bb key，以便和 bb 中的文件对应上。

解决方法：业务自行将原始URL对称加密后作为query参数拼接于KSC2防盗链上，在用户提交后自行反解析该参数，获得 bb key。

1. 反解析：业务基于统计的反解析需求，如主站在做kvc转码收益核算时，需要从视频 url 中提取 video_id 信息，这时候需要反解析 KSC2 链接。

​	解决方法： 反解析服务扩容，为业务提供离线反解析能力。

1. 无法通过KSC2链接再次签发出新防盗链。

解决方法：应该是调度 sdk Bug，修复即可

1. IM场景不适用

解决方法：这个问题对所有基于时间戳防盗链的方案都存在，并非KSC2引入，需提供其他方式的防盗链方案，如refer防盗链

1. 缓存命中效率低

SDK闭环解决该问题，自动获取用户ID等信息作为cdn hash，降低业务使用难度。

1. URL太长导致下载时触发系统路径最大长度限制。

解决方法：下载时重命名。

例子：

原始文件名长度116：

https://p2-infra.safetystatic.com/bs2/ad-dsp-ticket-bucket/YWQtZHNwLXRpY2tldC1idWNrZXQ6YWRfZHNwX3RpY2tldF91cGxvYWQ6MTY4NzU1NzE4NDpNRVJDSEFOVDpbQkAxOWNkN2NhMDoxMDA3Nzk5NjA5MTg0.xlsx

KSC2加密后，文件名长度 214：

https://p2-infra.safetystatic.com/ksc2/QGwggDDysXKL8ceeUnFYvwtA84xna_w42A84QINMCfJykdeI8lvNYlfq96NTSU1tMF8TQy7k2qJI71QmgAvQF_f05XySoslVjkw5nGBgen1Lbi3F3D4xcogYij-bHpP35MBU5FcMW-noOGvPdAhziUpwGUKxAv9DO_PCdy98AfKCt57pY0G8fOHZ5yDZYwK0XkOuRh3a1NBEq1KlraBmtQ.xlsx?pkey=AAW2SvJIcsk3MV2y7_9NZ54iibinkP_zvX9m4Oq5x7qbitLEFanZwBR8qpx6VLFT-dYO66yApl6i1-sWT7wmcqTO

1. 不支持中文名称

解决方法：中文名称的URL降级为普通防盗链。

# **普通防盗链的问题**

1. 篡改并绕过防盗链，利用可以替换域名的特点将防盗链域名替换为其他非防盗链域名，以绕过防盗链校验。

解决方法： 设置桶隔离，只有白名单的域名才能回源到业务指定的桶，但这个方法也存在以下问题：

​	1）业务设置了桶隔离之后，域名白名单只能是防盗链域名，不能存在非防盗链域名的情况，这会导致该桶的所有文件都只能通过防盗链访问，业务在设置桶隔离后，存在改造不彻底造成线上故障的可能，改造难度高。

​	2）共享缓存下，通过命中缓存，可以绕过桶隔离。

​	3）桶隔离需要配置单独源站，有较高成本。

1. 通过有规律的 bb key 遍历文件，造成文件泄漏风险。

# **相关文档**

[防盗链V2版本介绍](https://docs.corp.kuaishou.com/d/home/fcADRe5zu6oC33vstvxGvU-J2)

[CDN侧URL加密需求 V2.0](https://docs.corp.kuaishou.com/d/home/fcAB8ImNzu03Ta8N3WeFL2twB)

[图床query支持动态参数方案](https://docs.corp.kuaishou.com/k/home/VSAPL7M7Xqz8/fcAAoIbsK0OqaP3qkIGFAt6hP)

[文件上传下载安全问题专项治理讨论](https://docs.corp.kuaishou.com/d/home/fcADvcd70f6jX7APJK4O7wWKB#section=h.wgbgtc4xt6yk)

[快手音乐人CDN存储授权书文件名伪随机致大量音乐人授权书泄露](https://security.corp.kuaishou.com/vul/VUL-202209-143/)