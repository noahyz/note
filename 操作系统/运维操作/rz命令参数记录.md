---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

# 未总结---rz 上传大文件出现乱码

使用ftrz、ftsz

后面研究下rz、sz

### sz 命令
-a：以文本模式传输(ASCII)
-b：(ZMODEM)二进制替代，不进行任何转换就传输文件
-e：转义所有控制字符，如果具有相同名字的文件，则强制发件人重命名新文件
-y：指示 ZMODEM 接受程序覆盖同名的任何现有文件

### rz 命令
-a：以 ASCII 模式传输
-b：以二进制模式传输，文件传输覆盖
-e：转义所有的控制字符
-y: 替代同名的已存在文件

--ymodem：使用 YMODEM 协议
-Z (--zmodem): 使用 ZMODEM 协议

后面了解下这几种协议 YMODEM、ZMODEM等