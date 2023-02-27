---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

### prometheus的配置

#### 1. 前

- 查看可用的命令行参数：./prometheus -h
- 指定对应的配置文件，参数：--config.file=./prometheus.yml
- 重新加载配置，可以向进程发送SIGHUP信号或者向 /-/reload 端点发送HTTP POST 请求

#### 2. 配置文件

prometheus自带的默认的配置文件

```
# 默认的全局配置
global:
  scrape_interval:     15s # 采集间隔15s，默认为1min一次
  evaluation_interval: 15s # 计算规则的间隔15s默认为1min一次
  scrape_timeout: 10s # 采集超时时间，默认为10s
  external_labels:  # 当和其他外部系统交互时的标签，如远程存储、联邦集群时
    prometheus: monitoring/k8s  # 如：prometheus-operator的配置
    prometheus_replica: prometheus-k8s-1

# Alertmanager的配置
alerting:
  alertmanagers:
  - static_configs:
    - targets:
      - 127.0.0.1:9093  # alertmanager的服务地址，如127.0.0.1:9093
  alert_relabel_configs: # 在抓取之前对任何目标及其标签进行修改。 
  - separator: ;
    regex: prometheus_replica
    replacement: $1
    action: labeldrop 

# 一旦加载了报警规则文件，将按照evaluation_interval即15s一次进行计算，rule文件可以有多个
rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

# scrape_configs为采集配置，包含至少一个job

scrape_configs:
  # Prometheus的自身监控 将在采集到的时间序列数据上打上标签job=xx
  - job_name: 'prometheus'
    # 采集指标的默认路径为：/metrics，如 localhost:9090/metric
    # 协议默认为http
    static_configs:
    - targets: ['localhost:9090']

# 远程读，可选配置，如将监控数据远程读写到influxdb的地址，默认为本地读写
remote_write:
  127.0.0.1:8090

# 远程写
remote_read:
  127.0.0.1:8090
```

#### 3. scrape_configs 配置

prometheus的配置中，最常用的就是 scrape_configs 配置，比如添加新的监控项，修改原有监控项的地址频率等。

- 最简单的配置为：

    ```
    scrape_configs:
    - job_name: 'prometheus'
      metrics_path: '/metrics'
      scheme: http
      static_configs:
      - targets:
        - localhost:9090
    ```

- 完整配置

    ```
    # job 将以标签形式出现在指标数据中，如node-exporter采集的数据，job=node-exporter
    job_name: node-exporter
    
    # 采集频率：30s
    scrape_interval: 30s
    
    # 采集超时：10s
    scrape_timeout: 10s
    
    # 采集对象的path路径
    metrics_path: /metrics
    
    # 采集协议：http或者https
    scheme: https
    
    # 可选的采集url的参数
    params:
      name: demo
    
    # 当自定义label和采集到的自带label冲突时的处理方式，默认冲突时会重名为exported_xx
    honor_labels: false
    
    
    # 当采集对象需要鉴权才能获取时，配置账号密码等信息
    basic_auth:
      username: admin
      password: admin
      password_file: /etc/pwd
    
    # bearer_token或者文件位置(OAuth 2.0鉴权)
    bearer_token: kferkhjktdgjwkgkrwg
    bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
    
    # https的配置，如跳过认证，或配置证书文件
    tls_config:
      # insecure_skip_verify: true
      ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
      server_name: kubernetes
      insecure_skip_verify: false
    
    # 代理地址
    proxy_url: 127.9.9.0:9999
    
    # Azure的服务发现配置
    azure_sd_configs:
    
    # Consul的服务发现配置
    consul_sd_configs:
    
    # DNS的服务发现配置
    dns_sd_configs:
    
    # EC2的服务发现配置
    ec2_sd_configs:
    
    # OpenStack的服务发现配置
    openstack_sd_configs:
    
    # file的服务发现配置
    file_sd_configs:
    
    # GCE的服务发现配置
    gce_sd_configs:
    
    # Marathon的服务发现配置
    marathon_sd_configs:
    
    # AirBnB的服务发现配置
    nerve_sd_configs:
    
    # Zookeeper的服务发现配置
    serverset_sd_configs:
    
    # Triton的服务发现配置
    triton_sd_configs:
    
    # Kubernetes的服务发现配置
    kubernetes_sd_configs:
     - role: endpoints
        namespaces:
          names:
          - monitoring
    
    # 对采集对象进行一些静态配置，如打特定的标签
    static_configs:
      - targets: ['localhost:9090', 'localhost:9191']
        labels:
          my:   label
          your: label
    
    # 在Prometheus采集数据之前，通过Target实例的Metadata信息，动态重新写入Label的值。
    如将原始的__meta_kubernetes_namespace直接写成namespace，简洁明了
    
    relabel_configs:
      - source_labels: [__meta_kubernetes_namespace]
        separator: ;
        regex: (.*)
        target_label: namespace
        replacement: $1
        action: replace
      - source_labels: [__meta_kubernetes_service_name]
        separator: ;
        regex: (.*)
        target_label: service
        replacement: $1
        action: replace
      - source_labels: [__meta_kubernetes_pod_name]
        separator: ;
        regex: (.*)
        target_label: pod
        replacement: $1
        action: replace
      - source_labels: [__meta_kubernetes_service_name]
        separator: ;
        regex: (.*)
        target_label: job
        replacement: ${1}
        action: replace
      - separator: ;
        regex: (.*)
        target_label: endpoint
        replacement: web
        action: replace
    
    # 指标relabel的配置，如丢掉某些无用的指标
    metric_relabel_configs:
      - source_labels: [__name__]
        separator: ;
        regex: etcd_(debugging|disk|request|server).*
        replacement: $1
        action: drop
    
    # 限制最大采集样本数，超过了采集将会失败，默认为0不限制
    sample_limit: 0
    ```

    