---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

# linux工具之tar

#### tar

* 这五个是独立的命令，压缩解压都要用到其中一个，可以和别的命令连用但只能用其中一个。

`-c：建立压缩档案 -x：解压 -t：查看内容 -r：向压缩归档文件末尾追加文件 -u：更新原压缩包中的文件`
* 下面的参数是根据需要在压缩或解压档案时可选的。

`-z：有gzip属性的 -j：有bz2属性的 -Z：有compress属性的 -v：显示所有过程 -O：将文件解开到标准输出`
* -f 是必须的:

`-f : 使用档案名字，切记，这个参数是最后一个参数，后面只能接档案名。`
### 压缩

tar –cvf jpg.tar *.jpg // 将目录里所有jpg文件打包成 tar.jpg

tar –czf jpg.tar.gz *.jpg // 将目录里所有jpg文件打包成 jpg.tar 后，并且将其用 gzip 压缩，生成一个 gzip 压缩过的包，命名为 jpg.tar.gz

tar –cjf jpg.tar.bz2 *.jpg // 将目录里所有jpg文件打包成 jpg.tar 后，并且将其用 bzip2 压缩，生成一个 bzip2 压缩过的包，命名为jpg.tar.bz2

tar –cZf jpg.tar.Z *.jpg // 将目录里所有 jpg 文件打包成 jpg.tar 后，并且将其用 compress 压缩，生成一个 umcompress 压缩过的包，命名为jpg.tar.Z

rar a jpg.rar *.jpg // rar格式的压缩，需要先下载 rar for linux

zip jpg.zip *.jpg // zip格式的压缩，需要先下载 zip for linux
