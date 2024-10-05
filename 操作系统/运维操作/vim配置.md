---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

# vim配置

github上一个很好的项目：https://github.com/chxuan/vimplus

##### 自己配的vimplus的帮助手册在：F:\各种文档\help.md

```
#set nocompatible
# 打开语法高亮
syntax on
# 在底部显示当前模式 
set showmode 
# 命令模式下显示键入的指令
set showcmd
# 支持使用鼠标
set mouse=a
# 使用utf-8编码
set encoding=utf-8
# 启用256色
set t_Co=256
# 开启文件类型检查，并且载入与该类型对应的缩进规则(如.py 文件会去找~/.vim/indent/python.vim)
filetype indent on

# 下一行的缩进更上一行保持一致
set autoindent
# 按下Tab会显示vim的空格数
set tabstop=2
# 文本上按下>>(增加一级缩进) <<(取消一级缩进) ==(取消全部缩进)
set expandtab
# Tab 转为多少空格
set softtabstop=2
# 显示行号
# set number
# 显示光标所在行的行号，其它行都为相对改行的行号
# set relativenumber
# 光标所在的当前行高亮
# set cursorline
# 设置行宽
#set textwidth=80
# 自动拆行,关闭用set nowtap 
set wrap
# 遇到指定符号(如空格)才拆行
set linebreak
# 指定拆行与编辑窗口右边缘之间空出的字符数
set wrapmargin=2
# 垂直滚动时，光标距离顶部或者底部的位置
set scrolloff=15
# 水平滚动时，光标距离行首或行尾的位置(不拆行时有用)
set sidescrolloff=5
# 是否显示状态栏。0 表示不显示，1 表示只在多窗口时显示，2 表示显示
set laststatus=2
#在状态栏显示光标的当前位置（位于哪一行哪一列）
set ruler
#光标遇到圆括号、方括号、大括号时，自动高亮对应的另一个圆括号、方括号和大括号
set showmatch
# 搜索时，高亮显示匹配结果
set hlsearch
# 输入搜索模式时，每输入一个字符，就自动跳到第一个匹配的结果
# set incsearch
# 搜索时忽略大小写
# set smartcase
# 打开英语单词的拼写检查
# set spell spelllang=en_us
# 出错时，发出视觉提示，通常是屏幕闪烁
set visualbell
set paste
```
