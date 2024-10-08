---
title: gitognore文件语法
date: 2021-03-28 14:11:41
categories:
- 组件学习
tags:
- git
---

## git提交忽略文件

1. 创建 .gitignore 文件，然后编辑即可。

2. 各种语言的忽略配置文件：https://github.com/github/gitignore

3. gitignore 文件的语法

    ```
    #注释			.gitignore的注释
    *.txt		  忽略所有 .txt 后缀的文件
    !src.a        忽略除 src.a 外的其他文件
    /todo         仅忽略项目根目录下的 todo 文件，不包括 src/todo
    build/        忽略 build/ 目录下的所有文件，过滤整个build
    doc/*.txt     忽略doc目录下所有 .txt 后缀的文件，但不包括doc 子目录的 .txt 文件
    bin/:         忽略当前路径下的 bin 文件夹，该文件夹下的所有内容都会被忽略，不忽略 bin 文件
    /bin:         忽略根目录下的 bin 文件
    /*.c:         忽略 cat.c，不忽略 build/cat.c
    debug/*.obj:  忽略 debug/io.obj，不忽略 debug/common/io.obj 和 tools/debug/io.obj
    **/foo:       忽略 /foo, a/foo,a/b/foo 等
    a/**/b:       忽略 a/b,a/x/b,a/x/y/b 等
    !/bin/run.sh  不忽略 bin 目录下的 run.sh 文件
    *.log:        忽略所有 .log 文件
    config.js:    忽略当前路径的 config.js 文件
    /mtk/         忽略整个文件夹
    *.zip         忽略所有的 .zip 文件
    /mtk/do.c     忽略某个具体文件
    ```

    注意：被过滤掉的文件不会出现在 git 仓库中了，本地库中有，只是push的时候不会上传

4. 语法解释

    ```
    1）空格不匹配任意文件，可作为分隔符，可用反斜杠转义；
    2）以“＃”开头的行都会被 Git 忽略。即#开头的文件标识注释，可以使用反斜杠进行转义；
    3）可以使用标准的glob模式匹配。所谓的glob模式是指shell所使用的简化了的正则表达式；
    4）以斜杠 "/" 开头表示目录；"/" 结束的模式只匹配该文件夹以及在该文件夹路径下的内容，但是不匹配该文件；"/"开始的模式匹配项目跟目录；如果一个模式不包含斜杠，则它匹配相对于当前 .gitignore 文件路径的内容，如果该模式不在 .gitignore 文件中，则相对于项目根目录；
    5）以星号 "*" 通配多个字符，即匹配多个任意字符；使用两个星号 "**" 表示匹配任意中间目录，比如`a/**/z`可以匹配 a/z, a/b/z 或 a/b/c/z等；
    6）以问号"?"通配单个字符，即匹配一个任意字符；
    7）以方括号“ [] ”包含单个字符的匹配列表，即匹配任何一个列在方括号中的字符。比如[abc]表示要么匹配一个a，要么匹配一个b，要么匹配一个c；如果在方括号中使用短划线分隔两个字符，表示所有在这两个字符范围内的都可以匹配。比如[0-9]表示匹配所有0到9的数字，[a-z]表示匹配任意的小写字母）；
    8）以叹号"!"表示不忽略(跟踪)匹配到的文件或目录，即要忽略指定模式以外的文件或目录，可以在模式前加上惊叹号（!）取反；
    ```

5. 使用命令 `git check-ignore ` 检查 .gitignore 文件写的是否有问题

参考：https://www.cnblogs.com/kevingrace/p/5690241.html