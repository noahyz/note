---
title: VM0和VM8和VM1的区别
date: 2021-03-07 21:54:54
categories:
- linux
tags:
- 网卡
---

## VM0和VM8和VM1的区别

## **vmnet0，实际上就是一个虚拟的网桥**

vmnet0，实际上就是一个虚拟的网桥，这个网桥有很若干个端口，一个端口用于连接你的Host，一个端口用于连接你的虚拟机，他们的位置是对等的，谁也不是谁的网关。所以在Bridged模式下，你可以让虚拟机成为一台和你的Host相同地位的机器。

## **vmnet1，这是一个Host-Only网络模式**

vmnet1，这是一个Host-Only网络模式，这是用于建立一个与世隔绝的网络环境所用到的，其中vmnet1也是一个虚拟的交换机，交换机的一个 端口连接到你的Host上，另外一个端口连接到虚拟的DHCP服务器上（实际上是vmware的一个组件），另外剩下的端口就是连虚拟机了。虚拟网卡 “VMWare Virtual Ethernet Adapter for VMnet1”作为虚拟机的网关接口，为虚拟机提供服务。在虚拟机启动之后，如果你用ipconfig命令，你会很清楚的看到，你的默认网关就是指向 “VMWare Virtual Ethernet Adapter for VMnet1”网卡的地址的。（实际上它并不能提供路由，这是VMware设计使然，它是干了除了提供路由之外的一些事情——实际上是我也不知道它干了什 么事情），这里没有提供路由主要表现在没有提供NAT服务，使得虚拟机不可以访问Host-Only模式所指定的网段之外的地址。

## **vmnet8，这是一个NAT方式，最简单的组网方式了**

vmnet8，这是一个NAT方式，最简单的组网方式了，从主机的“VMWare Virtual Ethernet Adapter for VMnet8”虚拟网卡出来，连接到vmnet8虚拟交换机，虚拟交换机的另外的口连接到虚拟的NAT服务器（这也是一个Vmware组件），还有一个口 连接到虚拟DHCP服务器，其他的口连虚拟机，虚拟机的网关即是“VMWare Virtual Ethernet Adapter for VMnet8”网卡所在的机器，废话，这肯定就是你的Host机器啦。同样，用ipconfig也可以看出来，你的虚拟机的默认网关也指向了你的 “VMWare Virtual Ethernet Adapter for VMnet8”虚拟网卡地址。相比之下，可以看出来，NAT组网方式和Host-Only方式，区别就在于是否多了一个NAT服务。

host-only与wmnet1虚拟网卡进行通信

NAT模式与VMnet8虚拟网卡进行通信

桥接使用的是你机器的真实网卡进行上网

* 桥接模式：相当于在物理主机与虚拟机网卡之间架设了一座桥梁，从而可以通过物理
* NAT 模式：让 VM 虚拟机的网络服务发挥路由器的作用，使得通过虚拟机软件模拟
* 仅主机模式：仅让虚拟机内的主机与物理主机通信，不能访问外网，在真机中仅主机
