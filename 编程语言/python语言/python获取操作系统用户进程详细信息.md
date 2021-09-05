获取操作系统用户进程详细信息
包括：进程状态、名称、CPU占用率、进程ID、内存占用率、进程CMDLine、进程所属用户、进程所处路径、启动时间、进程磁盘IO
【扩展：还可获取进程网络资源使用率】

```
class SystemInfo(object):
    """
    Get operating system information
    """
    def __init__(self):
        pass
 
    def process_info(self):
        """
        :return: A list of all process details of the system
        """
        proc, all_processes = [],  psutil.process_iter()
        for items in all_processes:
            try:
                procinfo = items.as_dict(attrs=["pid", "name"])
                try:
                    #the process start path
                    p_path_cwd = items.cwd().decode("gbk")
 
                    #the process accounts for system memory uasge
                    proc_mem_percent = items.memory_percent()
 
                    #the process starts cmdline content
                    cmdlines = str(items.cmdline())
 
                    #the process accounts for system CPU usage
                    cpu_percent = items.cpu_percent(interval=1)
                except Exception,e:
                    try:
                        p_path_cwd = items.exe()
                    except Exception,e:p_path_cwd = e.name
                p_status, p_create_time, proc_user, proc_io_info = items.status(), items.create_time(),items.username() , {}
 
                try:
                    proc_io = items.io_counters()
                    proc_io_info["ReadCount"] = proc_io.read_count
                    proc_io_info["WriteCount"] = proc_io.write_count
                    proc_io_info["ReadBytes"] = proc_io.read_bytes
                    proc_io_info["WriteBytes"] = proc_io.write_bytes
                except Exception,e:pass
                procinfo.update({"path": p_path_cwd,
                                 "cmdline":cmdlines,
                                 "cpu_percent":cpu_percent,
                                 "status": p_status,
                                 "CreateTime": p_create_time,
                                 "MemPercent": proc_mem_percent,
                                 "user": proc_user,
                                 "DiskIo": proc_io_info})
            except Exception, e:pass
            finally:
                proc.append(procinfo)
        return proc
if __name__ == '__main__':
    print(SystemInfo().process_info())
```
