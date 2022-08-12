## 研究OOM

理解OOM机制： https://www.zhihu.com/question/21972130

---

oom_killer（out of memory killer）是Linux内核的一种内存管理机制，在系统可用内存较少的情况下，内核为保证系统还能够继续运行下去，会选择杀掉一些进程释放掉一些内存。通常oom_killer的触发流程是：

进程A想要分配物理内存（通常是当进程真正去读写一块内核已经“分配”给它的内存）->触发缺页异常->内核去分配物理内存->物理内存不够了，触发OOM

功能：当一个进程拿内核已经分配给自己的内存时，系统发现没有物理内存了。于是各处去找，找不到那就找一个最合适的进程删掉，释放些内存，如果找不到这个进程，那么系统自杀。

[https://cloud.tencent.com/developer/article/1157275#:~:text=OOM%E5%88%86%E6%9E%90,%E8%BF%9B%E7%A8%8B%E9%87%8A%E6%94%BE%E6%8E%89%E4%B8%80%E4%BA%9B%E5%86%85%E5%AD%98%E3%80%82](https://cloud.tencent.com/developer/article/1157275#:~:text=OOM%E5%88%86%E6%9E%90,%E8%BF%9B%E7%A8%8B%E9%87%8A%E6%94%BE%E6%8E%89%E4%B8%80%E4%BA%9B%E5%86%85%E5%AD%98%E3%80%82)

当系统内存不足时，`out_of_memory()` 被触发，然后调用 `select_bad_process()` 选择一个 “bad” 进程杀掉，判断和选择一个 “bad” 进程是由 `oom_badness()` 决定的，最 bad 的那个进程就是最占内存的进程。

```
/**
 * oom_badness - heuristic function to determine which candidate task to kill
 * @p: task struct of which task we should calculate
 * @totalpages: total present RAM allowed for page allocation
 *
 * The heuristic for determining which task to kill is made to be as simple and
 * predictable as possible.  The goal is to return the highest value for the
 * task consuming the most memory to avoid subsequent oom failures.
 */
unsigned long oom_badness(struct task_struct *p, struct mem_cgroup *memcg,
			  const nodemask_t *nodemask, unsigned long totalpages)
{
	long points;
	long adj;

	if (oom_unkillable_task(p, memcg, nodemask))
		return 0;

	p = find_lock_task_mm(p);
	if (!p)
		return 0;

	adj = (long)p->signal->oom_score_adj;
	if (adj == OOM_SCORE_ADJ_MIN) {
		task_unlock(p);
		return 0;
	}

	/*
	 * The baseline for the badness score is the proportion of RAM that each
	 * task's rss, pagetable and swap space use.
	 */
	points = get_mm_rss(p->mm) + p->mm->nr_ptes +
		 get_mm_counter(p->mm, MM_SWAPENTS);
	task_unlock(p);

	/*
	 * Root processes get 3% bonus, just like the __vm_enough_memory()
	 * implementation used by LSMs.
	 */
	if (has_capability_noaudit(p, CAP_SYS_ADMIN))
		adj -= 30;

	/* Normalize to oom_score_adj units */
	adj *= totalpages / 1000;
	points += adj;

	/*
	 * Never return 0 for an eligible task regardless of the root bonus and
	 * oom_score_adj (oom_score_adj can't be OOM_SCORE_ADJ_MIN here).
	 */
	return points > 0 ? points : 1;
}
```

### 1. 配置 OOM killer

可以通过一些内核参数来调整 OOM killer 的行为。比如可以在触发 OOM 后立即触发 kernel panic，然后 10 秒后自动重启系统

```
# sysctl -w vm.panic_on_oom=1
vm.panic_on_oom = 1

# sysctl -w kernel.panic=10
kernel.panic = 10

# echo "vm.panic_on_oom=1" >> /etc/sysctl.conf
# echo "kernel.panic=10" >> /etc/sysctl.conf
```

oom 会给每个进程打分，然后根据分数高低来决定杀那个进程。这个分数可以根据 adj 调节，root 权限的进程通常被认为很重要，不应该被轻易杀掉，所以打分的时候可以得到 3% 的优惠。我们可以操作每个进程的 oom_abj 内核参数来决定哪些进程不那么容易被 OOM killer 选中杀掉。比如调整 `oom_score_adj` 为 -15，分数越低越不容易被杀。

```
# ps aux | grep mysqld
mysql    2196  1.6  2.1 623800 44876 ?        Ssl  09:42   0:00 /usr/sbin/mysqld

# cat /proc/2196/oom_score_adj
0
# echo -15 > /proc/2196/oom_score_adj
```

完全关闭 OOM killer （不推荐用在生产环境）

```
# sysctl -w vm.overcommit_memory=2
# echo "vm.overcommit_memory=2" >> /etc/sysctl.conf
```

### 2. 找出最有可能被 OOM killer 杀掉的进程

如下脚本可用来打印当前系统上 oom_score 分数最高（最容易被 OOM killer）的进程

```
#!/bin/bash
for proc in $(find /proc -maxdepth 1 -regex '/proc/[0-9]+'); do
    printf "%2d %5d %s\n" \
        "$(cat $proc/oom_score)" \
        "$(basename $proc)" \
        "$(cat $proc/cmdline | tr '\0' ' ' | head -c 50)"
done 2>/dev/null | sort -nr | head -n 10
```

