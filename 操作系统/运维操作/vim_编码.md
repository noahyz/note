---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

# vim 编码

在 .vimrc 文件里加上

```
set fileencodings=utf-8,ucs-bom,gb18030,gbk,gb2312,cp936
set termencoding=utf-8
set encoding=utf-8
```

* encoding：Vim 内部使用的字符编码方式，包括Vim 的buffer（缓冲区）、菜单文本、消息文本。
* fileencoding：Vim 中当前编辑的文件的字符编码方式，Vim保存文件时也会将文件保存为这种字符编码方式（不管是否新文件都如此）。
* fileencodings：Vim 启动时会按它所列出的字符编码方式逐一探测即将打开的文件的字符编码方式，并且将fileencoding 设置为最终探测到的字符编码方式。因此最好将 Unicode 编码方式放到这个列表的最前面，将拉丁语系编码方式 latin1 放到最后面
* termencoding：Vim 所工作的终端的字符编码方式。

---

再来记录一下 Vim 的多字符编码方式支持是如何工作的。

    (1)Vim 启动，根据 .vimrc 中设置的 encoding 的值来设置 buffer、菜单文本、消息文的字符编码方式。

    (2)读取需要编辑的文件，根据 fileencodings 中列出的字符编码方式逐一探测该文件编码方式。并设置 fileencoding 为探测到看起来是正确的 字符编码方式,如果没有找到合适的编码，就用latin-1(ASCII)编码打开。

    (3) 对比 fileencoding 和 encoding 的值，若不同则调用 iconv 将文件内容转换为 encoding 所描述的字符编码方式，并且把转换后的内容放到为此文件开辟的 buffer 里，此时我们就可以开始编辑这个文件了。

    (4)编辑完成后保存文件时，再次对比 fileencoding 和 encoding 的值。若不同，再次调用 iconv 将即将保存的 buffer 中的文本转换为 fileencoding 所描述的字符编码方式，并保存到指定的文件中。

    由于 Unicode 能够包含几乎所有的语言的字符，而且 Unicode 的 UTF-8 编码方式又是非常具有性价比的编码方式 (空间消耗比 UCS-2 小)，因此建议 encoding 的值设置为 utf-8。这么做的另一个理由是 encoding 设置为 utf-8 时，Vim 自动探测文件的编码方式会更准确 (或许这个理由才是主要的 ;) 。我们在中文 Windows 里编辑的文件，为了兼顾与其他软件的兼容性，文件编码还是设置为 GB2312/GBK 比较合适，因此 fileencoding 建议设置为 chinese (chinese 是个别名，在 Unix 里表示 gb2312，在 Windows 里表示 cp936，也就是 GBK 的代码页)。
