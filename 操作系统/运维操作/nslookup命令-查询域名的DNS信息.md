---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

# nslookup命令--查询域名的DNS信息

nslookup命令的英文全称为 “query Internet name server interactively ”。nslookup命令主要用来查询域名的DNS信息。在使用nslookup之前，先确保已经安装了它，nslookup属于bind-utils包下一个命令 。

nslookup有两种工作模式：“交互模式”和“非交互模式”。在命令行中直接输入nslookup，无需输入任何参数即进入交互模式，由“>”提示。

-sil 不显示任何警告信息

exit 退出命令

server 指定解析域名的服务器地址

set type=soa 设置查询域名授权起始信息

set type=a 设置查询域名A记录

set type=mx 设置查询域名邮件交换记录

[root@linuxcool ~]# nslookup linuxcool.com

Server: 180.76.76.76

Address: 180.76.76.76#53

Non-authoritative answer:

Name: linuxcool.com

Address: 216.218.186.2

Name: linuxcool.com

Address: 2001:470:0:76::2

nslookup%E5%91%BD%E4%BB%A4%E7%9A%84%E8%8B%B1%E6%96%87%E5%85%A8%E7%A7%B0%E4%B8%BA%20%E2%80%9Cquery%20Internet%20name%20server%20interactively%20%E2%80%9D%E3%80%82nslookup%E5%91%BD%E4%BB%A4%E4%B8%BB%E8%A6%81%E7%94%A8%E6%9D%A5%E6%9F%A5%E8%AF%A2%E5%9F%9F%E5%90%8D%E7%9A%84DNS%E4%BF%A1%E6%81%AF%E3%80%82%E5%9C%A8%E4%BD%BF%E7%94%A8nslookup%E4%B9%8B%E5%89%8D%EF%BC%8C%E5%85%88%E7%A1%AE%E4%BF%9D%E5%B7%B2%E7%BB%8F%E5%AE%89%E8%A3%85%E4%BA%86%E5%AE%83%EF%BC%8Cnslookup%E5%B1%9E%E4%BA%8Ebind-utils%E5%8C%85%E4%B8%8B%E4%B8%80%E4%B8%AA%E5%91%BD%E4%BB%A4%20%E3%80%82%0A%0Anslookup%E6%9C%89%E4%B8%A4%E7%A7%8D%E5%B7%A5%E4%BD%9C%E6%A8%A1%E5%BC%8F%EF%BC%9A%E2%80%9C%E4%BA%A4%E4%BA%92%E6%A8%A1%E5%BC%8F%E2%80%9D%E5%92%8C%E2%80%9C%E9%9D%9E%E4%BA%A4%E4%BA%92%E6%A8%A1%E5%BC%8F%E2%80%9D%E3%80%82%E5%9C%A8%E5%91%BD%E4%BB%A4%E8%A1%8C%E4%B8%AD%E7%9B%B4%E6%8E%A5%E8%BE%93%E5%85%A5nslookup%EF%BC%8C%E6%97%A0%E9%9C%80%E8%BE%93%E5%85%A5%E4%BB%BB%E4%BD%95%E5%8F%82%E6%95%B0%E5%8D%B3%E8%BF%9B%E5%85%A5%E4%BA%A4%E4%BA%92%E6%A8%A1%E5%BC%8F%EF%BC%8C%E7%94%B1%E2%80%9C%3E%E2%80%9D%E6%8F%90%E7%A4%BA%E3%80%82%0A%0A-sil%09%E4%B8%8D%E6%98%BE%E7%A4%BA%E4%BB%BB%E4%BD%95%E8%AD%A6%E5%91%8A%E4%BF%A1%E6%81%AF%0Aexit%09%E9%80%80%E5%87%BA%E5%91%BD%E4%BB%A4%0Aserver%09%E6%8C%87%E5%AE%9A%E8%A7%A3%E6%9E%90%E5%9F%9F%E5%90%8D%E7%9A%84%E6%9C%8D%E5%8A%A1%E5%99%A8%E5%9C%B0%E5%9D%80%0Aset%20type%3Dsoa%09%E8%AE%BE%E7%BD%AE%E6%9F%A5%E8%AF%A2%E5%9F%9F%E5%90%8D%E6%8E%88%E6%9D%83%E8%B5%B7%E5%A7%8B%E4%BF%A1%E6%81%AF%0Aset%20type%3Da%09%E8%AE%BE%E7%BD%AE%E6%9F%A5%E8%AF%A2%E5%9F%9F%E5%90%8DA%E8%AE%B0%E5%BD%95%0Aset%20type%3Dmx%09%E8%AE%BE%E7%BD%AE%E6%9F%A5%E8%AF%A2%E5%9F%9F%E5%90%8D%E9%82%AE%E4%BB%B6%E4%BA%A4%E6%8D%A2%E8%AE%B0%E5%BD%95%0A%0A%5Broot%40linuxcool%20~%5D%23%20nslookup%20linuxcool.com%0AServer%3A%20%20%20%20%20%20%20%20%20180.76.76.76%0AAddress%3A%20%20%20%20%20%20%20%20180.76.76.76%2353%0ANon-authoritative%20answer%3A%0AName%3A%20%20%20%20linuxcool.com%20%0AAddress%3A%20216.218.186.2%0AName%3A%20%20%20%20linuxcool.com%0AAddress%3A%202001%3A470%3A0%3A76%3A%3A2
