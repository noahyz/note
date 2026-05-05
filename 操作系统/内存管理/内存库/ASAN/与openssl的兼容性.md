```
在C++程序中使用ASAN（Address Sanitizer）和OpenSSL是可能存在兼容性问题的。ASAN是一种内存错误检测工具，它会对程序的内存使用情况进行跟踪和监测，以检测潜在的内存错误。OpenSSL是一个加密库，用于提供安全通信协议的实现，包括SSL和TLS。

由于ASAN会在程序运行时修改内存布局，可能会影响到OpenSSL的内存管理。这可能导致一些问题，例如OpenSSL中的指针可能会指向已经被ASAN修改过的地址，从而导致内存访问错误。

为了解决这个问题，可以使用特殊的编译选项来启用ASAN和OpenSSL的兼容性支持。例如，可以使用“-fsanitize=address -fno-omit-frame-pointer”编译选项来启用ASAN，同时使用“-DOPENSSL_NO_ASM -DOPENSSL_NO_INLINE_ASM”编译选项来禁用OpenSSL中的汇编代码。这些选项可以确保ASAN和OpenSSL之间的兼容性。

但是需要注意的是，即使启用了兼容性支持，仍然可能存在其他问题。因此，在使用ASAN和OpenSSL的组合时，建议仔细测试和调试程序，以确保程序的安全性和稳定性。
```

```
-DOPENSSL_NO_ASM -DOPENSSL_NO_INLINE_ASM 
这些选项会禁用OpenSSL库中的汇编代码，并使用C代码替代。这可能会影响OpenSSL库的性能，但可以确保在使用AddressSanitizer（ASAN）等工具时的兼容性。

./config -d no-ssl2 no-ssl3 no-comp no-hw no-engine --prefix=<install_path> -DOPENSSL_NO_ASM -DOPENSSL_NO_INLINE_ASM
make
make install

这将使用禁用了汇编代码的选项进行编译，生成OpenSSL库并将其安装在指定的安装路径下。

需要注意的是，禁用汇编代码可能会影响OpenSSL库的性能。因此，在实际使用中，建议在评估性能和安全性之间做出权衡，根据具体情况选择是否禁用汇编代码。
```

```
OPENSSL_NO_ASAN是一个OpenSSL库中的编译选项，它用于禁用AddressSanitizer（ASAN）内存错误检测工具。

AddressSanitizer是一种内存错误检测工具，它可以帮助开发者在程序运行时发现内存错误，例如使用未初始化的内存、内存泄漏、缓冲区溢出等等。在C++程序中，使用ASAN工具可以帮助开发者检测潜在的内存错误，提高程序的安全性和稳定性。

然而，当OpenSSL库与ASAN工具一起使用时，可能会出现一些问题。因为ASAN工具会修改程序的内存布局，这可能会影响到OpenSSL库的内存管理。为了避免这种问题，OpenSSL库中提供了OPENSSL_NO_ASAN编译选项，可以禁用ASAN工具。

如果在编译OpenSSL库时定义了OPENSSL_NO_ASAN宏，那么OpenSSL库将不会使用ASAN工具进行内存错误检测。这可以避免ASAN工具可能会对OpenSSL库的影响，确保OpenSSL库的稳定性和安全性。

需要注意的是，禁用ASAN工具可能会降低OpenSSL库的安全性。因此，在使用OPENSSL_NO_ASAN编译选项时，建议使用其他安全检测工具或策略来确保程序的安全性。

```

```
openssl 直接使用 enable-asan 来启用 ASAN

以下是对这些编译选项的解释：

-d 选项
-d 选项是 ./config 命令的选项之一，用于指定 OpenSSL 库的构建目标。在 OpenSSL 1.1.1 版本中，可以使用 -d 选项来指定以下目标：

debug：编译 OpenSSL 库的调试版本，包括符号表和其他调试信息。
release：编译 OpenSSL 库的发布版本，优化代码以提高性能。
beta1：编译 OpenSSL 库的预发布测试版本，包含新的功能和改进。
如果不使用 -d 选项，则默认构建为 release 版本。

no-ssl2 选项
no-ssl2 选项用于禁用 SSLv2 协议，这是一种不安全的协议，已经被现代浏览器和服务器所淘汰。因此，建议在编译 OpenSSL 库时禁用 SSLv2 协议，以提高安全性。

no-ssl3 选项
no-ssl3 选项用于禁用 SSLv3 协议，这也是一种不安全的协议，由于其存在漏洞而被废弃。建议在编译 OpenSSL 库时禁用 SSLv3 协议，以提高安全性。

no-comp 选项
no-comp 选项用于禁用 OpenSSL 库的压缩功能。这是因为压缩功能在某些情况下可能会导致安全漏洞，因此禁用压缩功能可以提高安全性。

no-hw 选项
no-hw 选项用于禁用 OpenSSL 库的硬件加速功能。硬件加速可以通过使用特定的硬件来提高加密和解密的速度。然而，某些硬件可能存在漏洞或安全隐患，因此在某些情况下，禁用硬件加速可以提高安全性。

no-engine 选项
no-engine 选项用于禁用 OpenSSL 库的动态加密引擎。动态加密引擎可以在运行时加载加密模块，以提高加密和解密的速度。然而，某些动态加密引擎可能存在漏洞或安全隐患，因此在某些情况下，禁用动态加密引擎可以提高安全性。

需要注意的是，这些编译选项的使用可能会影响 OpenSSL 库的功能和性能。在实际使用中，应该根据具体情况进行选择，平衡安全性和性能的需求。
```

```
使用如下编译选项编译
../Configure --cross-compile-prefix=aarch64-linux-gnu-  no-asm shared linux-aarch64 --prefix=$TOOLCHAIN/src/out_aarch64/openssl-1.1.1o enable-asan  no-ssl2 no-ssl3 no-comp no-hw no-engine -DOPENSSL_NO_ASM -DOPENSSL_NO_INLINE_ASM

出现大量 ENGINE* 找不到符号的问题
/media/system/Data/home/system/home/system/App/toolchain/target/aarch64/bin/../lib/gcc/aarch64-linux-gnu/7.5.0/../../../../aarch64-linux-gnu/bin/ld: ./libcrypto.so: undefined reference to `ENGINE_set_default'
/media/system/Data/home/system/home/system/App/toolchain/target/aarch64/bin/../lib/gcc/aarch64-linux-gnu/7.5.0/../../../../aarch64-linux-gnu/bin/ld: ./libcrypto.so: undefined reference to `ENGINE_get_pkey_asn1_meths'
/media/system/Data/home/system/home/system/App/toolchain/target/aarch64/bin/../lib/gcc/aarch64-linux-gnu/7.5.0/../../../../aarch64-linux-gnu/bin/ld: ./libcrypto.so: undefined reference to `ENGINE_load_builtin_engines'
/media/system/Data/home/system/home/system/App/toolchain/target/aarch64/bin/../lib/gcc/aarch64-linux-gnu/7.5.0/../../../../aarch64-linux-gnu/bin/ld: ./libcrypto.so: undefined reference to `ENGINE_add_conf_module'
原因：因为 OpenSSL 编译时没有正确链接 Engine 库。删除 no-engine 选项

重新编译
../Configure --cross-compile-prefix=aarch64-linux-gnu-  no-asm shared linux-aarch64 --prefix=$TOOLCHAIN/src/out_aarch64/openssl-1.1.1o enable-asan  no-ssl2 no-ssl3 no-comp no-hw -DOPENSSL_NO_ASM -DOPENSSL_NO_INLINE_ASM

出现 comp_zlib 或者 load_COMP 这些找不到符号
/media/system/Data/home/system/home/system/App/toolchain/target/aarch64/bin/../lib/gcc/aarch64-linux-gnu/7.5.0/../../../../aarch64-linux-gnu/bin/ld: ./libcrypto.so: undefined reference to `comp_zlib_cleanup_int'
/media/system/Data/home/system/home/system/App/toolchain/target/aarch64/bin/../lib/gcc/aarch64-linux-gnu/7.5.0/../../../../aarch64-linux-gnu/bin/ld: ./libcrypto.so: undefined reference to `ERR_load_COMP_strings'

重新编译，去掉 no-comp 这个编译选项
../Configure --cross-compile-prefix=aarch64-linux-gnu- no-asm shared linux-aarch64 --prefix=$TOOLCHAIN/src/out_aarch64/openssl-1.1.1o enable-asan  no-ssl2 no-ssl3 no-hw -DOPENSSL_NO_ASM -DOPENSSL_NO_INLINE_ASM --debug

openssl 文档，使用 enable-asan 时需要和 no-shared 
../Configure --cross-compile-prefix=aarch64-linux-gnu- enable-asan no-shared no-asm no-ssl2 no-ssl3 no-hw -DOPENSSL_NO_ASM -DOPENSSL_NO_INLINE_ASM linux-aarch64 --prefix=$TOOLCHAIN/src/out_aarch64/openssl-1.1.1o --debug

出现报错：undefined reference to `ssl3_num_ciphers'
注意：重新编译需要清理磁盘。make clean

编译出来的是静态库。
```

