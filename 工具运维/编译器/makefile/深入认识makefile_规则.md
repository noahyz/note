---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

# 深入认识makefile 规则

#### 多目标规则与多规则目标

* 多目标规则，可以简单的理解为是一种将多条具有1)相同依赖和2)相同生成命令的规则，合并成一条规则的语法，其基本格式为
```
all : target1 target2
    echo "This is a rule for $@"
target1 target2 : dep
    echo "This is a rule for $@"
dep:
```

* 多规则目标：这种情况下，此目标文件的所有依赖文件将会被合并成此目标一个依赖文件列表，其中任何一个依赖文件比目标更新（比较目标文件和依赖文件的时间戳）时，make将会执行特定的命令来重建这个目标。对于一个多规则的目标，重建此目标的命令只能出现在一个规则中（可以是多条命令）。如果多个规则同时给出重建此目标的命令，make将使用最后一个规则的命令，同时提示错误信息。
#### 静态模式规则

```
TARGETS ...: TARGET-PATTERN: PREREQ-PATTERNS ...
    COMMANDS
```

* TARGET-PATTERN称为目标模式，PREREQ-PATTERNS称为依赖模式；目标模式和依赖模式中，一般需要包含模式字符%。
* 目标模式的作用就是从目标列表中的目标匹配过滤出需要的值，目标模式中的字符%表示在匹配过滤的过程中不做过滤的部分，目标模式中的其他字符表示要与目标列表中的目标精确匹配，例如，目标模式%.o， 表示从目标列表的目标中匹配所有以.o结尾的目标，然后过滤掉匹配目标的.o部分， 因此目标main.o经过目标模式%.o匹配过滤后，得到的输出就是main。
* 依赖模式的作用就是表示要如何生成依赖文件。具体的生成过程，就是使用目标模式过滤出来的值，替换依赖模式字符%所表示的位置。因此，如果依赖模式为%.c， 则使用上述例子过滤出来的main来替换字符%， 最终得到依赖文件main.c
```
main.o : main.c
    $(CC) -o $@ -c $<
    
complicated.o : complicated.c
    $(CC) -o $@ -c $<
```

可以简化为：

```
$(objects) : %.o : %.c 
    $(CC) -o $@ -c $<
```

#### 伪目标

将编译生成的不需要的文件全部都删除，在项目的makefile 中定义一条目标为 clean 的规则

```
clean:
    rm -rf complected complicated.o main.o
```

但是，当编译目录下存在 clean 文件时，由于 clean 规则没有依赖，所以clean 文件的时间戳永远显得都是最新的，因此这个命令也无法执行，这时可以使用伪目标。

伪目标意味着它不代表一个真正的文件名，在执行make 时可以指定这个目标来执行其所在规则定义的命令

```
.PHONY : clean
clean : 
    rm -rf complicated complicated.o main.o
```

这样目标 clean 就是一个伪目标，无论当前目标下是否存在 clean 这个文件。当我们输入一个 make clean 之后，rm 命令都会执行。

#### 命令

* 命令回显：make 在执行的时候会把要执行的命令进行输出。我们可以关闭回显。    * 在每个需要关闭回显的命令行前加上 @ 字符
```
all:
    @echo "hello wotld"
```

    * 执行 make 的时候带上参数 -s 或者 --silcent 禁止所有执行命令的显示
    * 在 makefile 中使用没有依赖的特殊目标 .SILENT 也可以禁止所有命令的回显

* 命令的执行：在Makefile中**书写在同一行中的多个命令属于一个完整的shell命令行，书写在独立行的一条命令是一个独立的shell命令行**。所以需要注意：在一个规则的命令中，命令行cd改变目录不会对其后的命令的执行产生影响。就是说其后的命令执行的工作目录不会是之前使用cd进入的那个目录。如果要实现这个目的，就不能把cd和其后的命令放在两行来书写。而应该把这两条命令写在一行上，用分号分隔。这样它们才是一个完整的shell命令行。
* 命令执行的错误处理：通常情况下，规则中每一条命令在运行结束之后，make 都会检测命令执行的返回状态，如果返回成功，就执行下一条命令；命令出错（返回状态非0），make就会放弃对当前规则的执行，或者终止对当前 makefile 的解析执行。但是一些中，规则中一个命令的执行失败并不代表规则执行的错误。为了忽略一些无关紧要的命令执行失败的情况，我们可以在命令之前加一个减号 - ，来告诉make 忽略此命令的执行失败检查。
#### 头文件依赖

* 以前所写的makefile 的项目的依赖关系没有加入对头文件的依赖。gcc -MM main.c 可以列出执行文件对其他文件的依赖关系列表

makefile 支持使用 sinclude 关键字将指定文件导入到当前的 makefile 中，因此，可以将 gcc 对于源文件的依赖关系分析输出到某个文件当中【某个文件：依赖描述文件，可命名为与源文件同名但以 .d 结尾的文件】，然后再将依赖描述文件导入到 makefile 中。
* 当使用 sininclude 关键字向当前 makefile 导入文件时，如果导入的文件不存在，make 会试图去执行可以生产导入文件的规则去生产被导入的文件，然后再执行导入。可以使用静态模式规则，让 make 在执行时，去调用 gcc 生成依赖关系文件。
```
# 描述：complicated 项目 makefile文件 
# 版本：v1.5 
# 修改记录： 
# 1. 为complicated项目makefile添加注释
# 2. 使用变量改进我们complicated项目的makefile 
# 3. 使用静态模式规则，简化makefile
# 4. 使用伪目标，加上clean规则 
# 5. 引进wildcard函数，自动扫描当前目录下的源文件 
# 6. 加入自动规则依赖 
# 定义可执行文件变量
executbale := complicated 
# wildcard函数扫描源文件，定义列表变量 
sources := $(wildcard *.c)
# 使用变量的引用替换，定义object文件列表 
objects := $(sources:.c=.o) 
# 使用变量的引用替换，定义依赖描述文件列表
deps := $(sources:.c=.d) 
# 定义编译命令变量 
CC := gcc 
RM := rm -rf 
# 终极目标规则，生成complicated可执行文件
$(executbale): $(objects) 
# 使用自动化变量改造我们的编译命令 
    $(CC) -o $@ $^ 
# 子规则, main.o和complicated.o的生成规则，使用静态模式规则
$(objects):%.o:%.c 
    $(CC) -o $@ -c $< 
# clean规则 
.PHONY: clean 
clean: $(RM) 
    $(executbale) $(objects) $(deps) 
# 自动规则依赖 
sinclude $(deps) 

$(deps):%.d:%.c 
    $(CC) -MM $< > $@
```
