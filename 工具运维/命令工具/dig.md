---
title: dig命令
---

#### 查看单个域名的DNS信息，比如：`dig baidu.com`

```
// 显示dig命令的版本和输入的参数
; <<>> DiG 9.10.6 <<>> baidu.com
;; global options: +cmd

// 显示服务返回的一些技术详情，其中 status 为 NOERROR 表示本次查询成功结束
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 18467
;; flags: qr rd ra; QUERY: 1, ANSWER: 2, AUTHORITY: 5, ADDITIONAL: 12

// 显示我们要查询的域名
;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
;; QUESTION SECTION:
;baidu.com.			IN	A

// 查询到的结果
;; ANSWER SECTION:
baidu.com.		148	IN	A	182.61.244.181
baidu.com.		148	IN	A	182.61.201.211

;; AUTHORITY SECTION:
baidu.com.		148272	IN	NS	ns1.baidu.com.
baidu.com.		148272	IN	NS	ns4.baidu.com.
baidu.com.		148272	IN	NS	ns3.baidu.com.
baidu.com.		148272	IN	NS	ns2.baidu.com.
baidu.com.		148272	IN	NS	ns7.baidu.com.

;; ADDITIONAL SECTION:
ns2.baidu.com.		148272	IN	A	220.181.33.31
ns3.baidu.com.		148272	IN	A	153.3.238.93
ns3.baidu.com.		148272	IN	A	36.155.132.78
ns4.baidu.com.		148272	IN	A	14.215.178.80
ns4.baidu.com.		148272	IN	A	111.45.3.226
ns1.baidu.com.		148272	IN	A	110.242.68.134
ns7.baidu.com.		148272	IN	A	180.76.76.92
ns2.baidu.com.		148272	IN	AAAA	240e:940:603:4:0:ff:b01b:589a
ns1.baidu.com.		148272	IN	AAAA	240e:bf:b801:1002:0:ff:b024:26de
ns7.baidu.com.		148272	IN	AAAA	240e:bf:b801:1002:0:ff:b024:26de
ns7.baidu.com.		148272	IN	AAAA	240e:940:603:4:0:ff:b01b:589a

// 本次查询的一些统计信息。花费了多长时间、查询的DNS服务器、在什么时间进行查询
;; Query time: 53 msec
;; SERVER: 172.22.233.180#53(172.22.233.180)
;; WHEN: Sun Jun 08 20:05:58 CST 2025
;; MSG SIZE  rcvd: 384
```

#### 常见的 DNS 记录的类型

| 类型  | 目的                                                         |
| ----- | ------------------------------------------------------------ |
| A     | 地址记录，用来指定域名的 IPv4 地址，如果需要将域名指向一个 IP 地址，就需要添加 A 记录。 |
| AAAA  | 用来指定主机名(或域名)对应的 IPv6 地址记录。                 |
| CNAME | 如果需要将域名指向另一个域名，再由另一个域名提供 ip 地址，就需要添加 CNAME 记录。 |
| MX    | 如果需要设置邮箱，让邮箱能够收到邮件，需要添加 MX 记录。     |
| NS    | 域名服务器记录，如果需要把子域名交给其他 DNS 服务器解析，就需要添加 NS 记录。 |
| SOA   | SOA 这种记录是所有区域性文件中的强制性记录。它必须是一个文件中的第一个记录。 |
| TXT   | 可以写任何东西，长度限制为 255。绝大多数的 TXT记录是用来做 SPF 记录(反垃圾邮件)。 |

#### 查看CNAME类型的记录

除了A记录，常见的 DNS 记录还有 CNAME，我们可以在查询时指定要查询的 DNS 记录类型

```
dig src.ssrf.corp.kuaishou.com.v1.ksydns.com CNAME

; <<>> DiG 9.10.6 <<>> src.ssrf.corp.kuaishou.com.v1.ksydns.com CNAME
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 58025
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 13, ADDITIONAL: 27

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
;; QUESTION SECTION:
;src.ssrf.corp.kuaishou.com.v1.ksydns.com. IN CNAME

// CNAME 记录类型
;; ANSWER SECTION:
src.ssrf.corp.kuaishou.com.v1.ksydns.com. 55 IN	CNAME src.ssrf.corp.kuaishou.com.queniubm.com.
```

#### 从指定的DNS服务器上查询

默认的DNS服务器上获得的结果可能不准确，可以从指定的DNS服务器上进行查询

```
dig src.ssrf.corp.kuaishou.com.v1.ksydns.com @8.8.8.8

; <<>> DiG 9.10.6 <<>> src.ssrf.corp.kuaishou.com.v1.ksydns.com @8.8.8.8
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 730
;; flags: qr rd ra; QUERY: 1, ANSWER: 9, AUTHORITY: 0, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 512
;; QUESTION SECTION:
;src.ssrf.corp.kuaishou.com.v1.ksydns.com. IN A

;; ANSWER SECTION:
src.ssrf.corp.kuaishou.com.v1.ksydns.com. 60 IN	CNAME src.ssrf.corp.kuaishou.com.queniubm.com.
src.ssrf.corp.kuaishou.com.queniubm.com. 60 IN A 114.80.179.229
src.ssrf.corp.kuaishou.com.queniubm.com. 60 IN A 114.80.179.231
src.ssrf.corp.kuaishou.com.queniubm.com. 60 IN A 114.80.179.236
src.ssrf.corp.kuaishou.com.queniubm.com. 60 IN A 114.80.179.235
src.ssrf.corp.kuaishou.com.queniubm.com. 60 IN A 114.80.179.232
src.ssrf.corp.kuaishou.com.queniubm.com. 60 IN A 114.80.179.230
src.ssrf.corp.kuaishou.com.queniubm.com. 60 IN A 114.80.179.234
src.ssrf.corp.kuaishou.com.queniubm.com. 60 IN A 114.80.179.233

// 可以看到本次查询的DNS服务器为8.8.8.8
;; Query time: 495 msec
;; SERVER: 8.8.8.8#53(8.8.8.8)
;; WHEN: Sun Jun 08 20:37:51 CST 2025
;; MSG SIZE  rcvd: 247
```

如果不指定DNS服务器，dig会使用 `/etc/resolv.conf` 中的地址作为 DNS 服务器。

#### 反向查询

我们可以反向解析 IP 地址对应的域名。使用 +short 获得精简的结果。

```
dig -x 8.8.8.8 +short
dns.google.
```

#### 查看TTL

TTL 主要控制 DNS 记录在 DNS 服务器上的缓存时间

```
dig src.ssrf.corp.kuaishou.com.v1.ksydns.com @8.8.8.8

// 其中 60 就是 TTL 时间
;; ANSWER SECTION:
src.ssrf.corp.kuaishou.com.v1.ksydns.com. 60 IN	CNAME src.ssrf.corp.kuaishou.com.queniubm.com.
src.ssrf.corp.kuaishou.com.queniubm.com. 60 IN A 101.89.125.244
src.ssrf.corp.kuaishou.com.queniubm.com. 60 IN A 101.89.125.241
src.ssrf.corp.kuaishou.com.queniubm.com. 60 IN A 101.89.125.251
src.ssrf.corp.kuaishou.com.queniubm.com. 60 IN A 101.89.125.250
src.ssrf.corp.kuaishou.com.queniubm.com. 60 IN A 101.89.125.243
src.ssrf.corp.kuaishou.com.queniubm.com. 60 IN A 101.89.125.249
src.ssrf.corp.kuaishou.com.queniubm.com. 60 IN A 101.89.125.242
src.ssrf.corp.kuaishou.com.queniubm.com. 60 IN A 101.89.125.248
```

### 跟踪整个查询过程

使用 +trace 选项，可以跟踪 dig 命令执行查询都经历了哪些过程。

```

-> zhangyi41@zhangyi41deMBP ~/Downloads ? # dig src.ssrf.corp.kuaishou.com.v1.ksydns.com  +trace

// 根域(.)的响应
; <<>> DiG 9.10.6 <<>> src.ssrf.corp.kuaishou.com.v1.ksydns.com +trace
;; global options: +cmd
.			184939	IN	NS	h.root-servers.net.
.			184939	IN	NS	k.root-servers.net.
.			184939	IN	NS	f.root-servers.net.
.			184939	IN	NS	m.root-servers.net.
.			184939	IN	NS	j.root-servers.net.
.			184939	IN	NS	l.root-servers.net.
.			184939	IN	NS	d.root-servers.net.
.			184939	IN	NS	g.root-servers.net.
.			184939	IN	NS	a.root-servers.net.
.			184939	IN	NS	e.root-servers.net.
.			184939	IN	NS	c.root-servers.net.
.			184939	IN	NS	b.root-servers.net.
.			184939	IN	NS	i.root-servers.net.
;; Received 811 bytes from 172.22.233.180#53(172.22.233.180) in 48 ms

// .com 顶级域名服务器响应
com.			172800	IN	NS	l.gtld-servers.net.
com.			172800	IN	NS	j.gtld-servers.net.
com.			172800	IN	NS	h.gtld-servers.net.
com.			172800	IN	NS	d.gtld-servers.net.
com.			172800	IN	NS	b.gtld-servers.net.
com.			172800	IN	NS	f.gtld-servers.net.
com.			172800	IN	NS	k.gtld-servers.net.
com.			172800	IN	NS	m.gtld-servers.net.
com.			172800	IN	NS	i.gtld-servers.net.
com.			172800	IN	NS	g.gtld-servers.net.
com.			172800	IN	NS	a.gtld-servers.net.
com.			172800	IN	NS	c.gtld-servers.net.
com.			172800	IN	NS	e.gtld-servers.net.
com.			86400	IN	DS	19718 13 2 8ACBB0CD28F41250A80A491389424D341522D946B0DA0C0291F2D3D7 71D7805A
com.			86400	IN	RRSIG	DS 8 1 86400 20250621050000 20250608040000 53148 . OOfgwxobZgAijnmOUJ9RpfdRyl5HTlrKcn/bj6SR1ebAYL9bSxvShbjE 4GBxIX5QR/eASwkp8hXJFDHu9R+V0IEiqJ7PpRJ4Q/Vbs8TC4BPyaY/i WVGQ4ndtYKzm8UVOrrqSZy3Xlz1xBT1hV0grHZDNFWFBLF9OPcS7yXUt KJeRu0qB8LL7w99os1+/iAQVlIWSF7mcfSWgmQyoNfEubGzXhaEi6NgY mOBpu6c+eTotenv2O/sDLrrb7DKhCkOVHJSzFkVgqbMc190Rn2L6NdDY XKr6Qa7sysHhyhI2YIzNJxZmyNqu4+pZP5J6I13Www93paR7XWQODels DvRVwA==
;; Received 1200 bytes from 198.41.0.4#53(a.root-servers.net) in 136 ms

ksydns.com.		172800	IN	NS	ns3.dnsv4.com.
ksydns.com.		172800	IN	NS	ns4.dnsv4.com.
CK0POJMG874LJREF7EFN8430QVIT8BSM.com. 900 IN NSEC3 1 1 0 - CK0Q3UDG8CEKKAE7RUKPGCT1DVSSH8LL  NS SOA RRSIG DNSKEY NSEC3PARAM
CK0POJMG874LJREF7EFN8430QVIT8BSM.com. 900 IN RRSIG NSEC3 13 2 900 20250612002557 20250604231557 40097 com. aQvdbofGBXZnILmqyixzz6sdMQYlY2FVg26Rwq5LXhTk8r4DOqZ7t/Cj AKVDYCGLTJA5MHTIuQ4MNJ7A91rwTA==
LGUGDDG0EIBC7R84A1NCMGRVTFCNMT5G.com. 900 IN NSEC3 1 1 0 - LGUGMK7SPHU745L1HD4QRBBM4TCPHAG1  NS DS RRSIG
LGUGDDG0EIBC7R84A1NCMGRVTFCNMT5G.com. 900 IN RRSIG NSEC3 13 2 900 20250615011947 20250608000947 40097 com. CRlRWCDplA9vh3aQN/b9Nb8EfDwczyVUVuUt2+btO/BpCjnF/jHyQQpq eVrJh98cxA0rX/SQ58g+UYPyWzLqqQ==
;; Received 812 bytes from 192.5.6.30#53(a.gtld-servers.net) in 135 ms

src.ssrf.corp.kuaishou.com.v1.ksydns.com. 60 IN	CNAME src.ssrf.corp.kuaishou.com.queniubm.com.
ksydns.com.		86400	IN	NS	ns4.dnsv4.com.
ksydns.com.		86400	IN	NS	ns3.dnsv4.com.
;; Received 176 bytes from 101.227.168.53#53(ns4.dnsv4.com) in 79 ms
```





























