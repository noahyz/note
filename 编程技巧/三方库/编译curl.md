编译 openssl

```
../Configure --cross-compile-prefix=aarch64-linux-gnu-  no-asm no-zlib no-comp no-engine no-dso no-ssl2 no-ssl3 no-hw linux-aarch64 --prefix=/home/system/ExtDisk/home/system/App/toolchain/src/out_aarch64_zy/openssl-1.1.1o --openssldir=/home/system/ExtDisk/home/system/App/toolchain/src/out_aarch64_zy/openssl-1.1.1o -fno-sanitize=address -DOPENSSL_NO_ASM -DOPENSSL_NO_INLINE_ASM -DOPENSSL_NO_INLINE -DOPENSSL_NO_AUTOLOAD_CONFIG -DOPENSSL_NO_DEPRECATED -DOPENSSL_NO_COMP -DOPENSSL_NO_ENGINE -DOPENSSL_NO_STATIC_ENGINE -DOPENSSL_NO_HW -DOPENSSL_NO_SSL2 -DOPENSSL_NO_SSL3 -DOPENSSL_NO_TLS1 -DOPENSSL_NO_TLS1_1 -DOPENSSL_NO_WEAK_SSL_CIPHERS 

make depend
make -j8
make install  # 才可以安装到设置的目录中

-fno-sanitize=address 选项来禁用 ASan 的内存分配函数重载
```

```
在使用 ASAN 时，由于 ASAN 会对内存分配函数进行重载，为了避免对 OpenSSL 的影响，需要禁用 ASAN 的内存分配函数重载。您可以在编译 OpenSSL 库时指定编译选项 -DOPENSSL_NO_ASM、-DOPENSSL_NO_INLINE、-DOPENSSL_NO_AUTOLOAD_CONFIG、-DOPENSSL_NO_DEPRECATED、-DOPENSSL_NO_COMP、-DOPENSSL_NO_ENGINE、-DOPENSSL_NO_STATIC_ENGINE、-DOPENSSL_NO_HW、-DOPENSSL_NO_SSL2、-DOPENSSL_NO_SSL3、-DOPENSSL_NO_TLS1、-DOPENSSL_NO_TLS1_1 和 -DOPENSSL_NO_WEAK_SSL_CIPHERS 来禁用 ASAN 的内存分配函数重载。这些选项会关闭一些不必要的功能和优化，从而确保在使用 ASAN 时不会对 OpenSSL 的内存分配函数造成干扰。

../config no-asm no-zlib no-ssl2 no-ssl3 no-comp no-hw no-engine -DOPENSSL_NO_ASM -DOPENSSL_NO_INLINE -DOPENSSL_NO_AUTOLOAD_CONFIG -DOPENSSL_NO_DEPRECATED -DOPENSSL_NO_COMP -DOPENSSL_NO_ENGINE -DOPENSSL_NO_STATIC_ENGINE -DOPENSSL_NO_HW -DOPENSSL_NO_SSL2 -DOPENSSL_NO_SSL3 -DOPENSSL_NO_TLS1 -DOPENSSL_NO_TLS1_1 -DOPENSSL_NO_WEAK_SSL_CIPHERS 
```

```
aarch64，编译动态库
../Configure --debug no-tests --cross-compile-prefix=aarch64-linux-gnu- no-asm no-autoload-config no-deprecated no-zlib no-comp no-engine no-static-engine no-ssl2 no-ssl3 no-tls1 no-tls1_1 no-hw no-crypto-mdebug  linux-aarch64 --prefix=/home/system/ExtDisk/home/system/App/toolchain/src/out_aarch64_zy/openssl-1.1.1o --openssldir=/home/system/ExtDisk/home/system/App/toolchain/src/out_aarch64_zy/openssl-1.1.1o -fno-sanitize=address

no-inline, no-inline-asm 不支持这两个选项
-fno-sanitize=address  是 gcc 的选项

-DOPENSSL_NO_ASM -DOPENSSL_NO_INLINE_ASM -DOPENSSL_NO_INLINE -DOPENSSL_NO_AUTOLOAD_CONFIG -DOPENSSL_NO_DEPRECATED -DOPENSSL_NO_COMP -DOPENSSL_NO_ENGINE -DOPENSSL_NO_STATIC_ENGINE -DOPENSSL_NO_HW -DOPENSSL_NO_SSL2 -DOPENSSL_NO_SSL3 -DOPENSSL_NO_TLS1 -DOPENSSL_NO_TLS1_1 -DOPENSSL_NO_CRYPTO_MDEBUG


aarch64，编译静态库，并且增加 enable-asan
../Configure enable-asan  --debug no-tests --cross-compile-prefix=aarch64-linux-gnu- no-asm no-autoload-config no-deprecated no-zlib no-comp no-engine no-static-engine no-ssl2 no-ssl3 no-tls1 no-tls1_1 no-hw no-crypto-mdebug  linux-aarch64 --prefix=/home/system/ExtDisk/home/system/App/toolchain/src/out_aarch64_zy/openssl-1.1.1o --openssldir=/home/system/ExtDisk/home/system/App/toolchain/src/out_aarch64_zy/openssl-1.1.1o 

x86:
../Configure --cross-compile-prefix=x86_64-linux-gnu- no-asm no-zlib no-comp no-engine no-ssl2 no-ssl3 no-hw  linux-x86_64 --prefix=/home/system/ExtDisk/home/system/App/toolchain/src/out_x86_zy/openssl-1.1.1o --openssldir=/home/system/ExtDisk/home/system/App/toolchain/src/out_x86_zy/openssl-1.1.1o -fno-sanitize=address -DOPENSSL_NO_ASM -DOPENSSL_NO_INLINE_ASM -DOPENSSL_NO_INLINE -DOPENSSL_NO_AUTOLOAD_CONFIG -DOPENSSL_NO_DEPRECATED -DOPENSSL_NO_COMP -DOPENSSL_NO_ENGINE -DOPENSSL_NO_STATIC_ENGINE -DOPENSSL_NO_HW -DOPENSSL_NO_SSL2 -DOPENSSL_NO_SSL3 -DOPENSSL_NO_TLS1 -DOPENSSL_NO_TLS1_1

打开 OPENSSL_NO_CRYPTO_MDEBUG 宏，使用 no-crypto-mdebug 选项

```



编译 curl

```
export SDKTARGETSYSROOT=/usr
export CC="$SDKTARGETSYSROOT/bin/aarch64-linux-gnu-gcc"
export CXX="$SDKTARGETSYSROOT/bin/aarch64-linux-gnu-g++"
export AR="$SDKTARGETSYSROOT/bin/aarch64-linux-gnu-ar"

cd build_aarch64
make clean
../configure --target=aarch64-linux-gnu --host=aarch64-linux-gnu --build=x86_64-linux-gnu --prefix=/home/system/ExtDisk/home/system/App/toolchain/src/out_aarch64_zy/libcurl-7.83.1 --with-ssl=/home/system/ExtDisk/home/system/App/toolchain/src/out_aarch64_zy/openssl-1.1.1o --without-libidn2 --enable-shared --disable-static --with-pic=yes --disable-ldap --disable-ldaps --without-libidn --without-librt --without-zlib 

指定 dns 相关操作
--enable-ares=/home/system/ExtDisk/home/system/App/toolchain/src/out_aarch64/c-ares-1.17.1 

如果在其他地方安装了 openssl，并且安装了pkg-config，可以先设置 pkg-config 路径：
env PKG_CONFIG_PATH=/home/system/ExtDisk/home/system/App/toolchain/src/out_aarch64_zy/openssl-1.1.1o/lib/pkgconfig ./configure --with-openssl
```

```
  export PKG_CONFIG_PATH=/home/system/ExtDisk/home/system/App/toolchain/src/out_aarch64_zy/openssl-1.1.1o/lib/pkgconfig:$PKG_CONFIG_PATH
```

```
编译的时候遇到问题:
configure: error: --with-openssl was given but OpenSSL could not be detected

查看 config.log 日志：
configure:25831: checking OpenSSL linking with -ldl and -lpthread
configure:25849: /usr/bin/aarch64-linux-gnu-gcc -o conftest -Werror-implicit-function-declaration -O2 -Wno-system-headers  -I/usr/local/include  -I/home/system/ExtDisk/home/system/App/toolchain/src/out_aarch64_zy/openssl-1.1.1o/include  -L/usr/local/lib  -L/home/system/ExtDisk/home/system/App/toolchain/src/out_aarch64_zy/openssl-1.1.1o/lib conftest.c -lcrypto  -lz  -ldl -lpthread >&5
/media/system/Data/home/system/home/system/App/toolchain/target/aarch64/bin/../lib/gcc/aarch64-linux-gnu/7.5.0/../../../../aarch64-linux-gnu/bin/ld: skipping incompatible /usr/local/lib/libcrypto.so when searching for -lcrypto
/media/system/Data/home/system/home/system/App/toolchain/target/aarch64/bin/../lib/gcc/aarch64-linux-gnu/7.5.0/../../../../aarch64-linux-gnu/bin/ld: skipping incompatible /usr/local/lib/libcrypto.a when searching for -lcrypto
/media/system/Data/home/system/home/system/App/toolchain/target/aarch64/bin/../lib/gcc/aarch64-linux-gnu/7.5.0/../../../../aarch64-linux-gnu/bin/ld: skipping incompatible /usr/local/lib/libz.a when searching for -lz
/media/system/Data/home/system/home/system/App/toolchain/target/aarch64/bin/../lib/gcc/aarch64-linux-gnu/7.5.0/../../../../aarch64-linux-gnu/bin/ld: cannot find -lz

aarch64-linux-gnu/bin/ld 找不到 zlib
我们更改选项 --without-zlib
```

```
出现新的错误：checking size of size_t... configure: error: cannot determine a size for size_t

尝试指定 sys_root

../configure --host=aarch64-linux-gnu --with-sysroot=/home/system/ExtDisk/home/system/App/toolchain/target/aarch64/aarch64-linux-gnu  --prefix=/home/system/ExtDisk/home/system/App/toolchain/src/out_aarch64_zy/libcurl-7.83.1 --with-ssl=/home/system/ExtDisk/home/system/App/toolchain/src/out_aarch64_zy/openssl-1.1.1o --without-libidn2 --enable-shared --disable-static --with-pic=yes --disable-ldap --disable-ldaps --without-libidn --without-librt --without-zlib

不可行，重新下载代码编译
```

```
env PKG_CONFIG_PATH=/home/system/ExtDisk/home/system/App/toolchain/src/out_aarch64_zy/openssl-1.1.1o/lib/pkgconfig  ../configure --target=aarch64-linux-gnu --host=aarch64-linux-gnu --build=x86_64-linux-gnu --prefix=/home/system/ExtDisk/home/system/App/toolchain/src/out_aarch64_zy/libcurl-7.83.1 --with-ssl=/home/system/ExtDisk/home/system/App/toolchain/src/out_aarch64_zy/openssl-1.1.1o --without-libidn2 --enable-shared --disable-static --with-pic=yes --disable-ldap --disable-ldaps --without-libidn --without-librt --without-zlib 

成功编译

```

