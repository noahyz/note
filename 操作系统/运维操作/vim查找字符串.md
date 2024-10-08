---
title: vim查找字符串
date: 2021-03-12 21:11:41
tags:
- vim
---

### vim中查找字符串的时候一般有3中需求：

- 普通查找
    命令模式下，按’/’或’?’，然后输入要查找的字符，Enter。

    /和?的区别是，一个向前（下）找，一个向后（上）。

- 全词匹配
    如果你输入 “/int”，你也可能找到 “print”。
    要找到以 “int” 结尾的单词，可以用：

    ```
    /int\>
    “\>” 是一个特殊的记号，表示只匹配单词末尾。类似地，”\<” 只匹配单词的开头。
    一次，要匹配一个完整的单词 “int”，只需： /\< int\>
    不区分大小写
    ```

- 默认是区分大小写的

    ```
    先输入
    :set ignorecase //忽略大小写 进行查找
    再输入
    :set noignorecase //恢复到大小写敏感
    ```

    
    

### vim 中统计字符串出现的次数

vim中统计字符串出现的次数：` :m,ns/\<字符串\>//gn `
上面命令的意思是:统计m到n行中"字符串"出现的次数...应用的时候只需要修改m,n的值和"字符串"替换为待统计的字符串即可

另外一个方法，统计"字符串"在当前编辑文件出现的次数

` :%s/字符串//ng `

统计词语在文件中出现的行数:

`cat file|grep -i 字符串 |wc -l `

