---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

### scp命令

1. 从服务器上下载文件

   ```
   scp username@servername:/path/filename /var/www/local_dir(本地目录)
   ```

2. 上传本地文件到服务器

   ```
   scp /path/filename username@servername:/path
   ```

3. 从服务器下载整个目录

   ```
   scp -r username@servername:/var/www/remote_dir/  /var/www/local_dir 
   ```

4. 上传目录到服务器

   ```
   scp -r local_dir username@servername:remote_dir
   scp -r test root@192.168.0.101:/var/www/  # 注: 目标服务器要开启权限
   ```

   