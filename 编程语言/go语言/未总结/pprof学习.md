https://segmentfault.com/a/1190000019222661

https://segmentfault.com/a/1190000000501635

https://blog.csdn.net/chushoufengli/article/details/103763815


https://zhuanlan.zhihu.com/p/71529062

pprof
go tool pprof http://<host>:<port>/debug/pprof/profile?seconds=10

go-torch http://<host>:<port>/debug/pprof/profile

go-torch -t 1 http://9.134.239.95:8081/debug/pprof/profile 
go-torch --help

go test -bench=. -memprofile=mem.prof 

