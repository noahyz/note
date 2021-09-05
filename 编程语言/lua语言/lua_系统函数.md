# lua 系统函数

使用lua api 操作windows

os.execute 执行dos 命令，只返回执行后的状态

io.popen 执行dos命令，但是返回一个文件

local t = io.popen('svn help')

local a = t:read("*all")
--a返回一个字符串，内容是svn help的内容

如果想执行某命令或程序可选os.execute(),如果还想捕捉该执行结果可用io.popen()
