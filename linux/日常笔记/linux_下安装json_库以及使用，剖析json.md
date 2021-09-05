# linux 下安装json 库以及使用，剖析json

https://blog.csdn.net/weixin_36607844/article/details/78957807

https://www.cnblogs.com/skysoot/archive/2012/04/17/2453010.html

https://www.cnblogs.com/fengbohello/p/4066254.html

编译jsoncpp 库遇到的问题

https://www.shuzhiduo.com/A/A2dmxavb5e/

https://www.cnblogs.com/weiweisuhe/p/6266317.html

### linux 下安装json库

1. 下载jsoncpp。 http://sourceforge.net/projects/jsoncpp/files/
2. 下载scons，这时一个构建工具，用来分析文件之间的依赖。http://sourceforge.net/projects/scons/files/scons/2.1.0/scons-2.1.0.tar.gz/download
3. 解压 scons tar -xzvf scons
4. 到scons目录中执行 python setup.py install
5. 解压jsoncpp tar -xzvf jsoncpp
6. 到jsoncpp目录下，执行 sudo scons platform=linux-gcc
7. 将jsoncpp/include目录下的json 文件夹拷贝到 /usr/include/
8. 将jsoncpp/libs/linux-gcc-4.9.1 目录下的 libjson_linux-gcc-4.9.1.a 拷贝到 /usr/local/lib 下，可以重命名
### 使用makefile编译jsoncpp

如果想要不使用scons来构建工程，而想要使用makefile，那也是可以编译的。要编译的文件全部位于 /src/lib_json ，其实也就 3个 `*`.cpp 文件。makefile文件如下：

```
g++ json_reader.cpp json_value.cpp json_writer.cpp -fPIC -Wall -shared -o ../../build/x64/release/libjson.so -I../../include -I.
```

### 使用

jsoncpp 目录下docs目录里有demo，参考即可。

### 问题

* 解析json格式的时候，出现这个错误：relocation R_X86_64_32 against '.rodata' can not be used when making a shared object;

错误提示最后需要加上 -fPIC 编译选项，需要在编译 jsoncpp 的时候加上 -fPIC 选项。放弃scons编译，使用cmake 编译    1. 新建编译目录
    
    
    mkdir build
    
    
    cd build
    2. cmake
    
    
    cmake -DCMAKE_CXX_FLAGS="-fPIC -Dnullptr=NULL"
    3. make & make install
    
    
    make -j4
    
    
    sudo make install

https%3A%2F%2Fblog.csdn.net%2Fweixin_36607844%2Farticle%2Fdetails%2F78957807%0Ahttps%3A%2F%2Fwww.cnblogs.com%2Fskysoot%2Farchive%2F2012%2F04%2F17%2F2453010.html%0Ahttps%3A%2F%2Fwww.cnblogs.com%2Ffengbohello%2Fp%2F4066254.html%0A%0A%E7%BC%96%E8%AF%91jsoncpp%20%E5%BA%93%E9%81%87%E5%88%B0%E7%9A%84%E9%97%AE%E9%A2%98%0Ahttps%3A%2F%2Fwww.shuzhiduo.com%2FA%2FA2dmxavb5e%2F%0Ahttps%3A%2F%2Fwww.cnblogs.com%2Fweiweisuhe%2Fp%2F6266317.html%0A%0A%23%23%23%20linux%20%E4%B8%8B%E5%AE%89%E8%A3%85json%E5%BA%93%0A1.%20%E4%B8%8B%E8%BD%BDjsoncpp%E3%80%82%20http%3A%2F%2Fsourceforge.net%2Fprojects%2Fjsoncpp%2Ffiles%2F%0A2.%20%E4%B8%8B%E8%BD%BDscons%EF%BC%8C%E8%BF%99%E6%97%B6%E4%B8%80%E4%B8%AA%E6%9E%84%E5%BB%BA%E5%B7%A5%E5%85%B7%EF%BC%8C%E7%94%A8%E6%9D%A5%E5%88%86%E6%9E%90%E6%96%87%E4%BB%B6%E4%B9%8B%E9%97%B4%E7%9A%84%E4%BE%9D%E8%B5%96%E3%80%82http%3A%2F%2Fsourceforge.net%2Fprojects%2Fscons%2Ffiles%2Fscons%2F2.1.0%2Fscons-2.1.0.tar.gz%2Fdownload%0A3.%20%E8%A7%A3%E5%8E%8B%20scons%20tar%20-xzvf%20scons%0A4.%20%E5%88%B0scons%E7%9B%AE%E5%BD%95%E4%B8%AD%E6%89%A7%E8%A1%8C%20python%20setup.py%20install%0A5.%20%E8%A7%A3%E5%8E%8Bjsoncpp%20tar%20-xzvf%20jsoncpp%0A6.%20%E5%88%B0jsoncpp%E7%9B%AE%E5%BD%95%E4%B8%8B%EF%BC%8C%E6%89%A7%E8%A1%8C%20sudo%20scons%20platform%3Dlinux-gcc%0A7.%20%E5%B0%86jsoncpp%2Finclude%E7%9B%AE%E5%BD%95%E4%B8%8B%E7%9A%84json%20%E6%96%87%E4%BB%B6%E5%A4%B9%E6%8B%B7%E8%B4%9D%E5%88%B0%20%2Fusr%2Finclude%2F%0A8.%20%E5%B0%86jsoncpp%2Flibs%2Flinux-gcc-4.9.1%20%E7%9B%AE%E5%BD%95%E4%B8%8B%E7%9A%84%20libjson_linux-gcc-4.9.1.a%20%E6%8B%B7%E8%B4%9D%E5%88%B0%20%2Fusr%2Flocal%2Flib%20%E4%B8%8B%EF%BC%8C%E5%8F%AF%E4%BB%A5%E9%87%8D%E5%91%BD%E5%90%8D%0A%0A%23%23%23%20%E4%BD%BF%E7%94%A8makefile%E7%BC%96%E8%AF%91jsoncpp%0A%E5%A6%82%E6%9E%9C%E6%83%B3%E8%A6%81%E4%B8%8D%E4%BD%BF%E7%94%A8scons%E6%9D%A5%E6%9E%84%E5%BB%BA%E5%B7%A5%E7%A8%8B%EF%BC%8C%E8%80%8C%E6%83%B3%E8%A6%81%E4%BD%BF%E7%94%A8makefile%EF%BC%8C%E9%82%A3%E4%B9%9F%E6%98%AF%E5%8F%AF%E4%BB%A5%E7%BC%96%E8%AF%91%E7%9A%84%E3%80%82%E8%A6%81%E7%BC%96%E8%AF%91%E7%9A%84%E6%96%87%E4%BB%B6%E5%85%A8%E9%83%A8%E4%BD%8D%E4%BA%8E%20%2Fsrc%2Flib_json%20%EF%BC%8C%E5%85%B6%E5%AE%9E%E4%B9%9F%E5%B0%B1%203%E4%B8%AA%20%60*%60.cpp%20%E6%96%87%E4%BB%B6%E3%80%82makefile%E6%96%87%E4%BB%B6%E5%A6%82%E4%B8%8B%EF%BC%9A%0A%60%60%60%0Ag%2B%2B%20json_reader.cpp%20json_value.cpp%20json_writer.cpp%20-fPIC%20-Wall%20-shared%20-o%20..%2F..%2Fbuild%2Fx64%2Frelease%2Flibjson.so%20-I..%2F..%2Finclude%20-I.%0A%60%60%60%0A%0A%23%23%23%20%E4%BD%BF%E7%94%A8%0Ajsoncpp%20%E7%9B%AE%E5%BD%95%E4%B8%8Bdocs%E7%9B%AE%E5%BD%95%E9%87%8C%E6%9C%89demo%EF%BC%8C%E5%8F%82%E8%80%83%E5%8D%B3%E5%8F%AF%E3%80%82%0A%0A%23%23%23%20%E9%97%AE%E9%A2%98%0A-%20%E8%A7%A3%E6%9E%90json%E6%A0%BC%E5%BC%8F%E7%9A%84%E6%97%B6%E5%80%99%EF%BC%8C%E5%87%BA%E7%8E%B0%E8%BF%99%E4%B8%AA%E9%94%99%E8%AF%AF%EF%BC%9Arelocation%20R_X86_64_32%20against%20'.rodata'%20can%20not%20be%20used%20when%20making%20a%20shared%20object%3B%20%0A%20%20%E9%94%99%E8%AF%AF%E6%8F%90%E7%A4%BA%E6%9C%80%E5%90%8E%E9%9C%80%E8%A6%81%E5%8A%A0%E4%B8%8A%20-fPIC%20%E7%BC%96%E8%AF%91%E9%80%89%E9%A1%B9%EF%BC%8C%E9%9C%80%E8%A6%81%E5%9C%A8%E7%BC%96%E8%AF%91%20jsoncpp%20%E7%9A%84%E6%97%B6%E5%80%99%E5%8A%A0%E4%B8%8A%20-fPIC%20%E9%80%89%E9%A1%B9%E3%80%82%E6%94%BE%E5%BC%83scons%E7%BC%96%E8%AF%91%EF%BC%8C%E4%BD%BF%E7%94%A8cmake%20%E7%BC%96%E8%AF%91%0A%20%201.%20%E6%96%B0%E5%BB%BA%E7%BC%96%E8%AF%91%E7%9B%AE%E5%BD%95%0A%20%20mkdir%20build%0A%20%20cd%20build%0A%20%202.%20cmake%0A%20%20cmake%20-DCMAKE_CXX_FLAGS%3D%22-fPIC%20-Dnullptr%3DNULL%22%0A%20%203.%20make%20%26%20make%20install%0A%20%20make%20-j4%0A%20%20sudo%20make%20install
