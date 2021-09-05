# samba安装

yum install samba

samba-common-3.6.9-151.el6.x86_64 _//主要提供samba服务器的设置文件与设置文件语法检验程序testparm_

samba-client-3.6.9-151.el6.x86_64 _//客户端软件，主要提供linux主机作为客户端时，所需要的工具指令集_

samba-swat-3.6.9-151.el6.x86_64 _//基于https协议的samba服务器web配置界面_

samba-3.6.9-151.el6.x86_64 _//服务器端软件，主要提供samba服务器的守护程序，共享文档，日志的轮替，开机默认选项_

ls /etc/init.d

chkconfig --level 345 smb on 开机自启动

service smb start 启动服务

su root 切换到root用户下

mkdir /data 新建需要分享的目录

chmod -R 777 /data 改变文件夹读写权限

vi /etc/samba/smb.conf 打开配置文件

末尾添加

/*

[workspace]

comment = shmily workspace

path = /data

valid users = shmily

write list = shmily

read only = No

guest ok = Yes

*/

useradd smbuser 添加用户

smbpasswd -**a** smbuser 将smbuser 添加smb用户组

service smb restart 重启服务

1)关闭防火墙： #sevice iptables stop

2)修改 /etc/samba/smb.conf，具体配置网上有,我的如下：

 security = share     ---- 这个要用上，share表示安全最低级别，其次是user,最高是server

[共享目录名]

path = /home/用户名/共享目录名

;read only = no  -----这个需要在前面用分号注释掉

writeable = yes

browseable = yes

public = yes

guest ok = yes

3)SELinux作怪

修改/etc/sysconfig/selinux 把enforcing改成disabled；然后命令行setenforce 0；

或者用Rainsome兄说的 使用selinux强制策略：chcon -R -t samba_share_t /home/suyang/"Fedora Samba"         

4)修改目录权限 #chmod 777 /home/wind ; #chmod 777 /home/wind/smbShare; 特别是前面一个做为上层目录权限也需要修改！！！！

5)重启samba服务 #service smb restart 或者 /etc/rc.d/init.d/smb restart

结束。 当然你要在linux与windows之间互相能ping 通。

好的解决方案：[https://blog.csdn.net/lu_linux/article/details/54430331](https://blog.csdn.net/lu_linux/article/details/54430331)
