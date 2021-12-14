### 刷新DNS缓存

刷新DNS缓存让你可以得到新的域名解析。

linux 下刷新DNS缓存需要重起 nscd daemon：

重启 nscd daemon，` /etc/rc.d/init.d/nscd restart` 即可

或者 `systemctl restart nscd ` 

有些系统使用的不是 nscd 而是 systemd-resolve，那就使用命令：

` sudo systemd-resolve --flush-caches ` 

少数情况下，还有的系统使用了 dnsmasq 或者 named，那就使用命令：

` sudo systemctl restart dnsmasq ` 或 ` sudo systemctl restart named ` 

修改Hosts 不生效的原因：1. 服务器设置了keep-alive 2. 浏览器DNS缓存和系统DNS缓存

因此常说应该重启下服务器，或者清空DNS缓存

