---
title: makefile学习
date: 2020-10-18 19:54:54
categories:
- 组件学习
tags:
- makefile
---

## makefile 学习

```
target:pererquisites
<tab> command1
<tab> command2
...
<tan> commandN
```

上面的这个就是一条简单的makefile

* target：规则的目标，可以简单理解为这条规则存在的目的是什么。通常是程序中间或者最后需要生成的文件名，也可以不对应具体的文件，而仅仅就是个概念上的规则目标。
* prerequisites：规则的依赖列表，可以简单的理解为要达到本条规则的目标所需要的先决条件是什么。可以是文件名，也可以是其他规则的目标；
* command：规则的命令，可以简单的理解为当目标所需要的先决条件的满足了之后，需要执行什么动作来达成规则的目标。规则的命令其实就是shell命令。一条规则中可以有多行命令，特别注意：每行命令都必须以tab键开始！

注意：规则不能没有目标，但是可以没有依赖
#### make 的工作原理

make 命令的使用，make 后面也可以带上参数：

1. -f <文件名> 来指定make 命令从哪里读取makefile 文件；如果不显式指定，则make 就会在当前目录下依次查找名字 GNUmakefile,makefile,Makefile的文件来作为其makefile 文件。
2. make <target> 指定makefile 目标
3. make -C <subdir><target>
make 解析makefile 的流程如下：

```
终极目标：依赖A 依赖B 依赖C
    终极目标命令
依赖A：子依赖A1 子依赖A2
    依赖A命令
依赖B：子依赖B1 子依赖B2
    依赖B命令
依赖C：子依赖C1 子依赖C2
    依赖C命令
```

makefile 中变量的定义：与C语言中宏类似，它为一个文本字符串提供一个名字（变量名）

```
变量名 赋值符 变量值 
```

* 变量名大小写区分，使用字母、数字、下划线构成。推荐：变量名采用大写方式，内部定义的一般变量采用小写（例如：目标文件列表），而参数列表采用大写（例如：编译选项）。
* 变量值，指的是变量所代表的内容，可以是一个文件名列表、编译选项列表、程序运行的选项参数列表、搜索源文件的目录列表、编译输出的目录列表和所有我们能够想到的事物。变量的值，其本质就是一个字符串。
* 赋值符，有= 、 := 、 ?=和 +=四种格式，其中= 和 := 为基本定义类型， ?=和 +=为基于=的扩展定义类型。

接下来，变量引用：用变量所代表的内容，执行一个严格的文本替换，替换变量的名字。
```
$(变量名)
${变量名}
$单字符变量名，变量仅包含一个字符，如 $@、$^ 等
```

```
objects = program.o foo.o utils.o

program : $(objects)              # 在依赖中引用变量
    gcc -o program ${objects}   # 在命令中引用变量
$(objects) : defs.h                  # 在目标中引用变量
```

* 递归展开式变量和直接展开式变量；使用赋值操作符= 、 += 和 ?=定义的变量都是递归展开式变量，使用赋值操作符 :=定义的变量为直接展开式变量 。两种变量类型的的最根本区别在于：变量值的求值时机，递归式变量的求值时机在于变量被引用时，直接展开式的求值时机在于变量被定义时。
* += 实现对一个已经存在定义的变量进行追加赋值
* ？= 只有在此变量在没有赋值的情况下才会对这个变量进行赋值
自动化变量：就是在每条规则中，make 自动为我们提供用于指定规则各个组成部分的变量。

@ ：代表规则中的目标文件名 < ：代表规则中的第一个依赖的文件名

$^ ：代表规则中所有依赖文件的列表，文件名用空格分隔

注意：

* $ 字符在makefile 中有特殊用途，因此如果要取消其特殊用途当成一个普通字符传递给 echo 命令执行，需要使用 $$
* $@ 在bash shell 中也有特殊用途，因此如果希望 echo 命令在 bash 中正常输出 $@ ,需要加上 \ 字符
对于一个已经定义的变量，可以使用“替换引用”将其值使用指定的字符（字符串）进行替换。格式为 $(VAR:A=B) 或者 ${VAR:A=B}，将变量“VAR”所表示的值中所有字符串“A”结尾的字符替换为“B”的字。“结尾”的含义是空格之前（变量值的多个字以空格隔开），而对于变量其他部分的“A”字符不进行替换。
