---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

# curl 使用方括号、&符号等

在使用curl的时候，遇到方括号、& 符号等

会报类似的错误：

illegal character in range specification at pos 71

我们可以使用 \ 进行转义或者使用使用 curl 的 -g 选项

-g/--globoff

This option switches off the "URL globbing parser". When you set this option, you can

specify URLs that contain the letters {}[] without having them being interpreted by curl

itself. Note that these letters are not normal legal URL contents but they should be

encoded according to the URI standard.
