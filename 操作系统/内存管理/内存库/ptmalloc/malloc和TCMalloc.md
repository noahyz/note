---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

## 一、malloc 函数

malloc函数是一个我们经常使用的函数，如果不对会造成一些潜在的问题。下面就malloc函数的线程安全性和可重入性做一些分析。

 我们知道一个函数要做到线程安全，需要解决多个线程调用函数时访问共享资源的冲突。而一个函数要做到可重入，需要不在函数内部使用静态或全局数据，不返回静态或全局数据，也不调用不可重入函数。

 malloc函数线程安全但是不可重入的，因为malloc函数在用户空间要自己管理各进程共享的内存链表，由于有共享资源访问，本身会造成线程不安全。为了做到线程安全，需要加锁进行保护。同时这个锁必须是递归锁，因为如果当程序调用malloc函数时收到信号，在信号处理函数里再调用malloc函数，如果使用一般的锁就会造成死锁（信号处理函数中断了原程序的执行），所以要使用递归锁。

 虽然使用递归锁能够保证malloc函数的线程安全性，但是不能保证它的可重入性。按上面的场景，程序调用malloc函数时收到信号，在信号处理函数里再调用malloc函数就可能破坏共享的内存链表等资源，因而是不可重入的。

 至于malloc函数访问内核的共享数据结构可以正常的加锁保护，因为一个进程程调用malloc函数进入内核时，必须等到返回用户空间前夕才能执行信号处理函数，这时内核数据结构已经访问完成，内核锁已释放，所以不会有问题。

      Mutex可以分为递归锁（recursive mutex）和非递归锁（non-recursive mutex）。 递归锁也叫可重入锁（reentrant mutex），非递归锁也叫不可重入锁（non-reentrant mutex）。
    
      二者唯一的区别是：
    
            同一个线程可以多次获取同一个递归锁，不会产生死锁。
    
            如果一个线程多次获取同一个非递归锁，则会产生死锁。
Linux下的pthread_mutex_t锁是默认是非递归的。可以通过设置PTHREAD_MUTEX_RECURSIVE属性，将pthread_mutex_t锁设置为递归锁。

递归锁的实现也可以理解为加一个计数，加锁的时候判断计数，计数为0，则加锁，不为0则计数++；释放锁时，判断计数，计数为0则解锁，计数不为0，则计数--

其他见：【性能优化】-【内存】-【内存管理.md】

## 二、TCMalloc 函数

https://www.cnblogs.com/jiujuan/p/13869547.html#:~:text=TCMalloc%E7%94%A8%E5%9B%BA%E5%AE%9A%E5%A4%A7%E5%B0%8F%E7%9A%84,%E6%8F%90%E9%AB%98%E8%8E%B7%E5%8F%96%E5%86%85%E5%AD%98%E7%9A%84%E9%80%9F%E5%BA%A6%E3%80%82

golang的内存分配算法绝大部分都是来自 TCMalloc。Golang 的内存管理分配算法：【编程语言】-【重难点】-【内存管理】

