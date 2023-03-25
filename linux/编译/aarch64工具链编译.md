---
title: aarch64 工具链编译
---

## aarch64 工具链编译

### 1. 先下载对应源码

```
1. binutils-2.33.1
wget -c https://ftp.gnu.org/gnu/binutils/binutils-2.33.1.tar.lz

2. gcc-7.5.0
wget -c https://ftp.gnu.org/gnu/gcc/gcc-7.5.0/gcc-7.5.0.tar.gz
gcc 的依赖库:
wget -c https://ftp.gnu.org/gnu/mpfr/mpfr-4.0.1.tar.xz
wget -c https://ftp.gnu.org/gnu/gmp/gmp-6.1.2.tar.xz
wget -c https://ftp.gnu.org/gnu/mpc/mpc-1.1.0.tar.gz
wget -c  ftp://gcc.gnu.org/pub/gcc/infrastructure/isl-0.18.tar.bz2
wget -c ftp://gcc.gnu.org/pub/gcc/infrastructure/cloog-0.16.1.tar.gz

3. linux-5.4.74
wget --no-check-certificate -c https://cdn.kernel.org/pub/linux/kernel/v5.x/linux-5.4.74.tar.gz

3. glibc-2.28
wget -c https://ftp.gnu.org/gnu/libc/glibc-2.28.tar.xz
```

### 2. 设置环境

```
目录结构
-> zhangyi83@172-18-184-22 /data/App/toolchain ? # tree
.
├── README.md
├── src
│   ├── binutils-2.33.1.tar.lz
│   ├── gcc-7.5.0.tar.gz
│   └── glibc-2.28.tar.gz
└── target
    └── aarch64

解压
cd $TOOLCHAIN/src
lzip -d binutils-2.33.1.tar.lz
tar -xf binutils-2.33.1.tar
tar -xzf gcc-7.5.0.tar.gz
tar -xzf glibc-2.28.tar.gz
tar -xf cloog-0.18.1.tar.gz
tar -xf gmp-6.1.2.tar.xz
tar -xf mpfr-4.0.1.tar.xz
tar -xf isl-0.18.tar.bz2
tar -xf mpc-1.1.0.tar.gz

# gcc依赖库的处理
mv cloog-0.18.1 gcc-8.2.0/cloog
mv gmp-6.1.2 gcc-8.2.0/gmp
mv mpfr-4.0.1 gcc-8.2.0/mpfr
mv isl-0.18 gcc-8.2.0/isl
mv mpc-1.1.0 gcc-8.2.0/mpc

安装适用于 aarch64 架构的交叉编译工具链，以便在 x86 上生成 aarch64 代码。
sudo apt-get install gcc-aarch64-linux-gnu g++-aarch64-linux-gnu binutils-aarch64-linux-gnu

设置交叉编译环境
export CC=aarch64-linux-gnu-gcc
export CXX=aarch64-linux-gnu-g++
export LD=aarch64-linux-gnu-ld
export AR=aarch64-linux-gnu-ar
export AS=aarch64-linux-gnu-as
export RANLIB=aarch64-linux-gnu-ranlib
# 假设这些交叉编译工具链安装到了 '/usr/bin' 目录下，这一句不要漏掉
export PATH=/usr/bin:$PATH

设置环境变量，（环境变量一定要配置）
export TOOLCHAIN=/data/App/toolchain
cd $TOOLCHAIN
mkdir -p target/aarch64
export AARCH64=$TOOLCHAIN/target/aarch64
export PATH=$AARCH64/bin:$PATH
```

### 三、编译

编译 binutils-2.33.1

```
cd $TOOLCHAIN/src/binutils-2.33.1
mkdir build-aarch64 && cd build-aarch64

../configure --prefix=$AARCH64 \
--build=x86_64-linux-gnu --host=aarch64-linux-gnu --target=aarch64-linux-gnu \
--disable-multilib

make -j8
make install

安装时出现问题
1. 找不到 isl/schedule.h 头文件
sudo apt update
sudo apt install libisl-dev
```

编译 gcc

```
cd $TOOLCHAIN/src/gcc-7.5.0
mkdir build-aarch64 && cd build-aarch64

export LIBRARY_PATH=

../configure --prefix=$AARCH64 \
--host=aarch64-linux-gnu --target=aarch64-linux-gnu \
--enable-languages=c,c++ \
--disable-multilib

make -j8
make install

# 遇到问题
1. LIBRARY_PATH shouldn't contain the current directory when building gcc
查看是否含有可能会出现当前路径： echo $LIBRARY_PATH
暂时屏蔽掉： export LIBRARY_PATH=
重新运行 configure 然后再编译

2. 有 error 停止编译，可以查看 config.log 定位 error 位置
如果改动了 configure，然后想要重新编译的话，记得执行 make distclean; make clean 清理 cache。再重新编译。如果还有相关问题，那就删除编译目录 build_aarch64，在重新创建，重新编译。

3. 遇到如下的问题不用理会，继续往下找错误
gcc: error: unrecognized command line option '-V'
gcc: fatal error: no input files
compilation terminated.

4. 遇到 /usr/bin/ld: unrecognised emulation mode: aarch64linux
疑惑点是本不应该使用本机的 x86 链接器：/usr/bin/ld。但是却使用了，一定是指定的链接器路径有问题。警告一番周折，发现是没有安装 aarch64 架构的交叉工具链，还有一定要设置 CC、CXX 等这些环境变量。
要使用 aarch64-linux-gnu，不要使用 aarch64-linux。
```

编译 Linux Kernel Headers

```
cd $TOOLCHAIN/src/linux-5.4.74

make -j8 ARCH=arm64 \
INSTALL_HDR_PATH=$AARCH64/aarch64-linux-gnu \
headers_install
```

编译 glibc

```
cd $TOOLCHAIN/src/glibc-2.28
mkdir -p build-aarch64 && cd build-aarch64

../configure --prefix=$AARCH64/aarch64-linux-gnu \
--build=x86_64-linux-gnu --host=aarch64-linux-gnu --target=aarch64-linux-gnu \
--with-headers=$AARCH64/aarch64-linux-gnu/include \
--disable-multilib \
libc_cv_forced_unwind=yes 

make -j14
make install

遇到问题
1. LD_LIBRARY_PATH shouldn't contain the current directory when building glibc.
先让这个环境变量消失。 export LD_LIBRARY_PATH=
```

