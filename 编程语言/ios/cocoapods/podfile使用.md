---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

### 1. podfile 指定第三方 SDK 的版本

podfile语法参考： https://www.cnblogs.com/lxlx1798/p/14587268.html

```
source 'https://github.com/Artsy/Specs.git'  # 指明依赖库的来源地址


target 'Test' do
    platform:ios,'10.0'  # 指明平台是 ios，版本是 10.0 
    pod 'AFNetworking', '~> 2.6.3' 
    pod 'test', '1.0'  # 指定版本号为 1.0 
    pod 'test', :git => 'https://github.com/xxx/test.git'  # 引入 master 分支（默认）
    pod 'test', :git => 'https://github.com/xxx/test.git', :branch => 'dev'  # 引入指定的分支
    pod 'test', :git => 'https://github.com/xx/test.git', :tag => '0.0.1'  # 引入某个 tag 的代码
    pod 'test', :git => 'https://github.com/xxx/test.git', :commit => '02149723'  # 引入某个特殊的提交节点
    pod 'test', :podspec => 'https://example.com/JSONKit.podspec'  # podspec 可以从另一个源库的地址引入
    pod 'test', :path => '~/Desktop/BIZUtils/trunk/' # 指定 pod 地址为本地
end
```

### 2. 第三方库的操作

```
1. 更新指定的第三方库
pod update 库名

2. 把 podfile 内全部的库更新，重新安装
pid install

3. 只安装新添加的库，已更新的库忽略
pod install --verbose --no-repo-update

4. 只更新指定的库，其他库忽略
pod update 库名 --verbose --no-repo-update 
```

