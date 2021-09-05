# 研究OOM

理解OOM机制： https://www.zhihu.com/question/21972130

---

oom_killer（out of memory killer）是Linux内核的一种内存管理机制，在系统可用内存较少的情况下，内核为保证系统还能够继续运行下去，会选择杀掉一些进程释放掉一些内存。通常oom_killer的触发流程是：

进程A想要分配物理内存（通常是当进程真正去读写一块内核已经“分配”给它的内存）->触发缺页异常->内核去分配物理内存->物理内存不够了，触发OOM

功能：当一个进程拿内核已经分配给自己的内存时，系统发现没有物理内存了。于是各处去找，找不到那就找一个最合适的进程删掉，释放些内存，如果找不到这个进程，那么系统自杀。

[https://cloud.tencent.com/developer/article/1157275#:~:text=OOM%E5%88%86%E6%9E%90,%E8%BF%9B%E7%A8%8B%E9%87%8A%E6%94%BE%E6%8E%89%E4%B8%80%E4%BA%9B%E5%86%85%E5%AD%98%E3%80%82](https://cloud.tencent.com/developer/article/1157275#:~:text=OOM%E5%88%86%E6%9E%90,%E8%BF%9B%E7%A8%8B%E9%87%8A%E6%94%BE%E6%8E%89%E4%B8%80%E4%BA%9B%E5%86%85%E5%AD%98%E3%80%82)
