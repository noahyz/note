---
title: 序列化和反序列化(json/protobuf)
date: 2020-10-22 20:19:17
categories:
- 组件学习
tags:
- json protobuf
---

### 1. 数据的序列化和反序列化

- 序列化：将数据结构或者对象(可以认为内存空间有布置的一段内存)转换生成二进制数据的过程
- 反序列化：将上一步生成的二进制数据转换成数据结构或者对象的过程

我最先接触到的序列化和反序列化是在学习 linux 网络编程的时候。举如下例子：

```c++
struct Book{
  int Id;
  char BookName[10];
  char Author[10];
  float Version;
};

//定义一个图书对象
Book book;
book.Id = 123;
strcpy(book.BookName,"HelloWorld");
strcpy(book.Author,"zy");
book.Version = 1.1;

//假定需要将book这个对象发送给远端的服务器
sendto(sockfd,(const void*)&book,sizeof(Book),0,service_addr,sizeof(struct sockaddr));

```

```c++
// 服务端程序假定要获取这个book对象
char buf[1024] = "";
recvfrom(sockfd,buf,1024,0,NULL,NULL);

Book* pBook = (Book*)buf;
std::cout << pBook->Id << std::endl;
std::cout << pBook->BookName << std::endl;
...
```

上面的两段程序就是一个简单的将一个数据对象，假定是由客户端发送给服务端的过程。我们都知道所定义的数据结构对于计算机来说都是二进制的字节而已，在网络传输的过程中也是以字节流进行传输的。在 sendto 函数中参数 book 被强制转换成 void\*，(sendto函数第二个参数类型为 const void\*) ，在 recvfrom 函数中获取到的buf，最终被我们强制转换成 struct Book 类型，并且得到了我们想要的结果。顿时，是不是发现这就是序列化和反序列化。将book对象转成 void\* 发送，是发送前的序列化操作；将接收到的 buf 转成 struct Book 类型，是反序列化操作。

这是最简单的序列化和反序列化操作了，但是存在一个特别大的问题。**如果客户端和服务端所使用的数据类型不一样，或者说客户端在struct Book类型中增加了一个字段的情况**，会出现什么问题呢？如下所示：

```c++
//客户端类型1
struct Book{
  int Id;
  char BookName[10];
  char Author[10];
  float Version;
  char BookType[10];
};

//客户端类型2
struct Book{
  int Id;
  char BookType[10];
  char BookName[10];
  char Author[10];
  float Version;
};

//服务端类型不变
struct Book{
  int Id;
  char BookName[10];
  char Author[10];
  float Version;
};
```

对于客户端类型1，如果熟悉c/c++语言的类型强制转换的底层做了什么，客户端发送这种类型，服务端还是可以解析出来的。但是对于客户端类型2，服务端拿到这种类型数据进行强制转换后解析必然是错误的。

因此，设计序列化反序列化的协议，来应对灵活多变的类似于上述的数据传输的场景是非常有必要的。我们允许两端的数据结构类型有轻微的差异。然后，就有了 JSON 这种强大的工具。

### 2. JSON的认识

JSON是一种轻量级的数据交互格式，采用完全独立于语言的文本格式来存储和表示数据，这些特性使JSON成为理想的数据交换语言，非常易于阅读和编写，同时也容易机器解析和生成，运用于网络传输的场景很多。

#### 2.1 Linux 下安装json库

1. 下载jsoncpp。 http://sourceforge.net/projects/jsoncpp/files/

2. 下载scons，这时一个构建工具，用来分析文件之间的依赖。http://sourceforge.net/projects/scons/files/scons/2.1.0/scons-2.1.0.tar.gz/download

3. 解压 scons tar -xzvf scons

4. 到scons目录中执行 python setup.py install

5. 解压jsoncpp tar -xzvf jsoncpp

6. 到jsoncpp目录下，执行 sudo scons platform=linux-gcc

7. 将jsoncpp/include目录下的json 文件夹拷贝到 /usr/include/

8. 将jsoncpp/libs/linux-gcc-4.9.1 目录下的 libjson_linux-gcc-4.9.1.a 拷贝到 /usr/local/lib 下，可以重命名

#### 2.2 JSON 的使用

关于 JSON 的语法规则可以自行谷歌。

在 jsoncpp 目录下 docs 目录里有关于 JSON 使用的 demo，强烈建议书写 JSON 前进行参考。下面给出简单的例子

```c++
#include <iostream>
#include <string>
#include <string.h>

#include "json/json.h"

struct Book{
  int Id;
  char BookType[10];
  char BookName[10];
  char Author[10];
  float Version;
};

std::string SerializeToJson(const Book& book)
{
  Json::FastWriter writer;
  Json::Value value;

  value["Id"] = book.Id;
  value["BookName"] = book.BookName;
  value["BookType"] = book.BookType;
  value["Author"] = book.Author;
  value["Version"] = book.Version;

  std::string JsonStr = writer.write(value);
  return JsonStr;
}

Book DeserializeToObj(const std::string& JsonStr)
{
  Json::Reader reader;
  Json::Value value;
  Book book;
  memset(&book,0,sizeof(Book));

  if(reader.parse(JsonStr,value))
  {
    book.Id = value["Id"].asInt();
    strcpy(book.BookName,value["BookName"].asString().c_str());
    strcpy(book.Author,value["Author"].asString().c_str());
    book.Version = value["Version"].asDouble();
  }
  return book;
}

int main()
{
  Book book;
  book.Id = 1234;
  strcpy(book.BookType,"language");
  strcpy(book.BookName,"HelloWorld");
  strcpy(book.Author,"zy");
  book.Version = 1.1;

  std::string JsonStr = SerializeToJson(book);
  std::cout << "serialize to json" << std::endl;
  std::cout << "JsonStr: " << JsonStr << std::endl;

  std::string JsonStrNew = "{\"Id\":5678,\"BookName\":\"C++\",\"Author\":\"John\",\"Version\":1.1}";
  Book BookObjNew = DeserializeToObj(JsonStrNew);
  std::cout << "deserialize to Book Obj" << std::endl;
  std::cout << "BookObjNew Id: " << BookObjNew.Id << std::endl;
  std::cout << "BookObjNew BookType: " << BookObjNew.BookType << std::endl;
  std::cout << "BookObjNew BookName: " << BookObjNew.BookName << std::endl;
  std::cout << "BookObjNew Author: " << BookObjNew.Author << std::endl;
  std::cout << "BookObjNew Version: "  << BookObjNew.Version << std::endl;

  return 0;
}
```

编译运行后，程序输出：

```c++
serialize to json
JsonStr: {"Author":"zy","BookName":"HelloWorldzy","BookType":"language","Id":1234,"Version":1.100000023841858}

deserialize to Book Obj
BookObjNew Id: 5678
BookObjNew BookType: 
BookObjNew BookName: C++
BookObjNew Author: John
BookObjNew Version: 1.1
```

如上，我们可以看出，使用 JSON 来传输数据对象的时候，Book 结构体新增加的 BookType 字段可以放在任意位置， 不会影响我们从 JSON 中解析我们想要的字段，因此也就不影响客户端和服务端之间的灵活的交互。这样我们传输数据就方便很多。

### 3. ProtoBuf 的认识

protobuf 相对其他序列化反序列化工具来说，效率可以说是最高的，protobuf 也支持多种语言(c++、java、python等)，使用范围很广。

#### 3.1 ProtoBuf 的安装

官方提供了完美的安装方式：https://github.com/protocolbuffers/protobuf/blob/master/src/README.md

贴一下我安装过成的问题：

##### 3.1.1 pkg-config 的问题

当我使用 pkg-config 查看 protobuf 的编译 flags 时，出现：

```
pkg-config --cflags protobuf  # print compiler flags
Package protobuf was not found in the pkg-config search path.
Perhaps you should add the directory containing `protobuf.pc'
to the PKG_CONFIG_PATH environment variable
No package 'protobuf' found
```

解决：使用 pkg-config 命令来检测环境变量时，如果你没有设置 PKG_CONFIG_PATH，那么久找不到 protobuf.pc 这个文件，所以需要设置一下：`export PKG_CONFIG_PATH=/usr/local/lib/pkgconfig`

##### 3.1.2 ldconfig 的问题

ldconfig 是为了刷新一下共享库的缓存位置。其实就是重新加载一下 `/etc/ld.so.conf` 这个文件。

一般 protobuf 的 lib 文件会安装在 `/usr/local/lib` 下。如果系统共享库缓存位置没有这个路径，则会报类似找不到 libprotobuf.so.0 的错误。

解决：

	1. 将路径临时添加到环境变量中：`export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/usr/local/lib `。这个临时添加的环境变量是临时存在的，shell 关闭之后临时环境变量也就会失效。
 	2. 永久添加到环境变量中：`export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/usr/local/lib `
 	3. 或者直接将路径添加到 `/etc/ld.so.conf` 文件中，也不会失效。

#### 3.2 protobuf 的使用

##### 3.2.1 protobuf 的数据类型

protobuf 属于轻量级的数据转换工具，因此没有支持太多的数据类型。如下是 protobuf 支持的基本类型列表。

| proto文件消息类型 | C++ 类型 | 说明                                                         |
| :---------------- | :------- | :----------------------------------------------------------- |
| double            | double   |                                                              |
| float             | float    |                                                              |
| int32             | int32    | 使用可变长编码方式，负数时不够高效，应该使用sint32           |
| int64             | int64    | 同上                                                         |
| uint32            | uint32   | 使用可变长编码方式                                           |
| uint64            | uint64   | 同上                                                         |
| sint32            | int32    | 使用可变长编码方式，有符号的整型值，负数编码时比通常的int32高效 |
| sint64            | sint64   | 同上                                                         |
| fixed32           | uint32   | 总是4个字节，如果数值总是比2^28大的话，这个类型会比uint32高效 |
| fixed64           | uint64   | 总是8个字节，如果数值总是比2^56大的话，这个类型会比uint64高效 |
| sfixed32          | int32    | 总是4个字节                                                  |
| sfixed64          | int64    | 总是8个字节                                                  |
| bool              | bool     |                                                              |
| string            | string   | 一个字符串必须是utf-8编码或者7-bit的ascii编码的文本          |
| bytes             | string   | 可能包含任意顺序的字节数据                                   |

##### 3.2.2 protobuf 使用的步骤说明

1. 定义 后缀以 proto 结尾的文件，文件的内容就是需要存储或者传输的数据结构，也就是定义我们自己的数据存储或传输的协议。
2. 使用 protoc 编译器来编译自定义的 \*.proto 文件，生成  \*.ph.h、\*.ph.cc 文件。
3. 使用 protobuf 提供的 API 来读写消息。

##### 3.2.3 定义 proto 文件

定义 proto 文件就是定义自己的数据存储或者传输的协议格式。比如，我们想要序列化上面的 Book 对象进行网络传输，那我们 proto 文件的定义：为每一个需要序列化的数据结构添加一个消息（message），然后为消息（message）中的每一个字段（field）指定一个名字、类型和修饰符以及唯一标识（tag）。每一个消息对应到 C++ 中就是一个类，嵌套消息对应的就是嵌套类，当然一个 .proto 文件中可以定义多个消息，就像一个头文件中可以定义多个类一样。如下就是自定义的嵌套消息的 .proto 文件 book.proto。

```protobuf
syntax="proto2";

package tutorial;

message Book{
    required uint32 Id = 1;
    required string BookName = 2;
    optional string Author = 3;

    enum VersionType {
        OLD = 0;
        LATEST = 1;
    }

    message VersionNumber { 
        required float number = 1;
        optional VersionType type = 2 [default = LATEST];
    }
    repeated VersionNumber Version = 4;
}
```

**package声明**

 \*.proto 文件以一个package声明开始。这个声明是为了防止不同项目之间的命名冲突。对应到 C++ 中去，你用这个 .proto 文件生成的类将被放置在一个与 package 名相同的命名空间中。

**字段类型**

接下来就是消息（message）的定义了，一个消息就是某些类型的字段的集合。许多标准的、简单的数据类型都可以用作字段类型，包括bool，int32，float，double以及string。可以使用其他的消息（message）类型来作为字段类型。在上面的例子中，消息 VersionNumber 就是一个被用作字段类型的例子。

**修饰符**

每个字段必须要使用如下三种之一的修饰符来修饰：

-  **required：**必须提供字段值，否则对应的消息就会被认为是“未初始化的”。如果 libprotobuf 是以 debug 模式编译的，序列化一个未初始化的消息（message）将会导致一个断言错误。在优化过的编译情况下（译者注：例如release），该检查会被跳过，消息会被写入。然而，解析一个未初始化的消息仍然会失败（解析函数会返回false）。并且这样做，一个required的字段与一个optional的字段就没有区别了。
- **optional：**字段值允许不指定。如果没有指定一个 optional 的字段值，它就会使用默认值。对简单类型来说，你可以指定你自己的默认值，就像我们在上面的例子中对 VersionNumber 的 type 字段所做的一样。如果你不指定默认值，就会使用系统默认值：数据类型的默认值为0，string的默认值为空字符串，bool的默认值为 false。对嵌套消息（message）来说，其默认值总是消息的“默认实例”或“原型”，即：没有任何一个字段是指定了值的。调用访问类来取一个未显式指定其值的 optional（或者required）的字段的值，总是会返回字段的默认值。
- **repeated：**字段会重复N次（N可以为0）。重复的值的顺序将被保存在 protocol buffer 中。你只要将重复的字段视为动态大小的数组就可以了。
- 注意： required是永久性的：在把一个字段标识为required的时候，你应该特别小心。如果在某些情况下你不想写入或者发送一个required的字段，那么将该字段更改为optional可能会遇到问题——旧版本的读者（译者注：即读取、解析消息的一方）会认为不含该字段的消息（message）是不完整的，从而有可能会拒绝解析。在这种情况下，你应该考虑编写特别针对于应用程序的、自定义的消息校验函数。Google的一些工程师得出了一个结论：使用required弊多于利；他们更愿意使用optional和repeated而不是required。当然，这个观点并不具有普遍性。

**标识**

在每一项后面的、类似于“= 1”，“= 2”的标志指出了该字段在二进制编码中使用的唯一“标识（tag）”。标识号1~15编码所需的字节数比更大的标识号使用的字节数要少1个，所以，如果你想寻求优化，可以为经常使用或者重复的项采用1~15的标识（tag），其他经常使用的optional项采用≥16的标识（tag）。在重复的字段中，每一项都要求重编码标识号（tag number），所以重复的字段特别适用于这种优化情况。

##### 3.2.4 编译自定义的 .proto 文件

编译方法。指定源目录（即你的应用程序源代码所在的目录。如果不指定的话，就使用当前目录）、目标目录（即生成的代码放置的目录，通常与 $SRC_DIR 是一样的），以及你的 .proto 文件所在的目录。命令如下：

```protobuf
protoc -I=$SRC_DIR --cpp_out=$DST_DIR $SRC_DIR/book.proto
```

因为需要生成的是C++类，所以使用了 –-cpp_out 选项参数。protocol buffers 也为其他支持的语言提供了类似的选项参数，如`--java_out=OUT_DIR`，指定java源文件生成目录。

于是我们使用命令 `protoc -I=./ --cpp_out=./ book.proto` ，编译生成 book 消息类。

这时就会在指定的目录下生成 `book.ph.h、book.ph.cc`文件

##### 3.2.5 了解 \*.pb.h 文件

查看 book.pb.h 文件，我们会发现得到了一个类，他对应于 book.proto 文件中写的每一个消息(message)。在这个 Book 类中，编译器为每一个字段生成了读写函数。

```c++
// Book

// required uint32 Id = 1;
inline bool Book::_internal_has_id() const {
  bool value = (_has_bits_[0] & 0x00000004u) != 0;
  return value;
}
inline bool Book::has_id() const {
  return _internal_has_id();
}
inline void Book::clear_id() {
  id_ = 0u;
  _has_bits_[0] &= ~0x00000004u;
}
inline ::PROTOBUF_NAMESPACE_ID::uint32 Book::_internal_id() const {
  return id_;
}
inline ::PROTOBUF_NAMESPACE_ID::uint32 Book::id() const {
  // @@protoc_insertion_point(field_get:tutorial.Book.Id)
  return _internal_id();
}
inline void Book::_internal_set_id(::PROTOBUF_NAMESPACE_ID::uint32 value) {
  _has_bits_[0] |= 0x00000004u;
  id_ = value;
}
inline void Book::set_id(::PROTOBUF_NAMESPACE_ID::uint32 value) {
  _internal_set_id(value);
  // @@protoc_insertion_point(field_set:tutorial.Book.Id)
}

// required string BookName = 2;
inline bool Book::_internal_has_bookname() const {
  bool value = (_has_bits_[0] & 0x00000001u) != 0;
  return value;
}
inline bool Book::has_bookname() const {
  return _internal_has_bookname();
}
inline void Book::clear_bookname() {
  bookname_.ClearToEmpty(&::PROTOBUF_NAMESPACE_ID::internal::GetEmptyStringAlreadyInited(), GetArena());
  _has_bits_[0] &= ~0x00000001u;
}
inline const std::string& Book::bookname() const {
  // @@protoc_insertion_point(field_get:tutorial.Book.BookName)
  return _internal_bookname();
}
inline void Book::set_bookname(const std::string& value) {
  _internal_set_bookname(value);
  // @@protoc_insertion_point(field_set:tutorial.Book.BookName)
}
inline std::string* Book::mutable_bookname() {
  // @@protoc_insertion_point(field_mutable:tutorial.Book.BookName)
  return _internal_mutable_bookname();
}
inline const std::string& Book::_internal_bookname() const {
  return bookname_.Get();
}
inline void Book::_internal_set_bookname(const std::string& value) {
  _has_bits_[0] |= 0x00000001u;
  bookname_.Set(&::PROTOBUF_NAMESPACE_ID::internal::GetEmptyStringAlreadyInited(), value, GetArena());
}
inline void Book::set_bookname(std::string&& value) {
  _has_bits_[0] |= 0x00000001u;
  bookname_.Set(
    &::PROTOBUF_NAMESPACE_ID::internal::GetEmptyStringAlreadyInited(), ::std::move(value), GetArena());
  // @@protoc_insertion_point(field_set_rvalue:tutorial.Book.BookName)
}
inline void Book::set_bookname(const char* value) {
  GOOGLE_DCHECK(value != nullptr);
  _has_bits_[0] |= 0x00000001u;
  bookname_.Set(&::PROTOBUF_NAMESPACE_ID::internal::GetEmptyStringAlreadyInited(), ::std::string(value),
              GetArena());
  // @@protoc_insertion_point(field_set_char:tutorial.Book.BookName)
}
inline void Book::set_bookname(const char* value,
    size_t size) {
  _has_bits_[0] |= 0x00000001u;
  bookname_.Set(&::PROTOBUF_NAMESPACE_ID::internal::GetEmptyStringAlreadyInited(), ::std::string(
      reinterpret_cast<const char*>(value), size), GetArena());
  // @@protoc_insertion_point(field_set_pointer:tutorial.Book.BookName)
}
inline std::string* Book::_internal_mutable_bookname() {
  _has_bits_[0] |= 0x00000001u;
  return bookname_.Mutable(&::PROTOBUF_NAMESPACE_ID::internal::GetEmptyStringAlreadyInited(), GetArena());
}
inline std::string* Book::release_bookname() {
  // @@protoc_insertion_point(field_release:tutorial.Book.BookName)
  if (!_internal_has_bookname()) {
    return nullptr;
  }
  _has_bits_[0] &= ~0x00000001u;
  return bookname_.ReleaseNonDefault(&::PROTOBUF_NAMESPACE_ID::internal::GetEmptyStringAlreadyInited(), GetArena());
}
inline void Book::set_allocated_bookname(std::string* bookname) {
  if (bookname != nullptr) {
    _has_bits_[0] |= 0x00000001u;
  } else {
    _has_bits_[0] &= ~0x00000001u;
  }
  bookname_.SetAllocated(&::PROTOBUF_NAMESPACE_ID::internal::GetEmptyStringAlreadyInited(), bookname,
      GetArena());
  // @@protoc_insertion_point(field_set_allocated:tutorial.Book.BookName)
}

// optional string Author = 3;
inline bool Book::_internal_has_author() const {
  bool value = (_has_bits_[0] & 0x00000002u) != 0;
  return value;
}
inline bool Book::has_author() const {
  return _internal_has_author();
}
inline void Book::clear_author() {
  author_.ClearToEmpty(&::PROTOBUF_NAMESPACE_ID::internal::GetEmptyStringAlreadyInited(), GetArena());
  _has_bits_[0] &= ~0x00000002u;
}
inline const std::string& Book::author() const {
  // @@protoc_insertion_point(field_get:tutorial.Book.Author)
  return _internal_author();
}
inline void Book::set_author(const std::string& value) {
  _internal_set_author(value);
  // @@protoc_insertion_point(field_set:tutorial.Book.Author)
}
inline std::string* Book::mutable_author() {
  // @@protoc_insertion_point(field_mutable:tutorial.Book.Author)
  return _internal_mutable_author();
}
inline const std::string& Book::_internal_author() const {
  return author_.Get();
}
inline void Book::_internal_set_author(const std::string& value) {
  _has_bits_[0] |= 0x00000002u;
  author_.Set(&::PROTOBUF_NAMESPACE_ID::internal::GetEmptyStringAlreadyInited(), value, GetArena());
}
inline void Book::set_author(std::string&& value) {
  _has_bits_[0] |= 0x00000002u;
  author_.Set(
    &::PROTOBUF_NAMESPACE_ID::internal::GetEmptyStringAlreadyInited(), ::std::move(value), GetArena());
  // @@protoc_insertion_point(field_set_rvalue:tutorial.Book.Author)
}
inline void Book::set_author(const char* value) {
  GOOGLE_DCHECK(value != nullptr);
  _has_bits_[0] |= 0x00000002u;
  author_.Set(&::PROTOBUF_NAMESPACE_ID::internal::GetEmptyStringAlreadyInited(), ::std::string(value),
              GetArena());
  // @@protoc_insertion_point(field_set_char:tutorial.Book.Author)
}
inline void Book::set_author(const char* value,
    size_t size) {
  _has_bits_[0] |= 0x00000002u;
  author_.Set(&::PROTOBUF_NAMESPACE_ID::internal::GetEmptyStringAlreadyInited(), ::std::string(
      reinterpret_cast<const char*>(value), size), GetArena());
  // @@protoc_insertion_point(field_set_pointer:tutorial.Book.Author)
}
inline std::string* Book::_internal_mutable_author() {
  _has_bits_[0] |= 0x00000002u;
  return author_.Mutable(&::PROTOBUF_NAMESPACE_ID::internal::GetEmptyStringAlreadyInited(), GetArena());
}
inline std::string* Book::release_author() {
  // @@protoc_insertion_point(field_release:tutorial.Book.Author)
  if (!_internal_has_author()) {
    return nullptr;
  }
  _has_bits_[0] &= ~0x00000002u;
  return author_.ReleaseNonDefault(&::PROTOBUF_NAMESPACE_ID::internal::GetEmptyStringAlreadyInited(), GetArena());
}
inline void Book::set_allocated_author(std::string* author) {
  if (author != nullptr) {
    _has_bits_[0] |= 0x00000002u;
  } else {
    _has_bits_[0] &= ~0x00000002u;
  }
  author_.SetAllocated(&::PROTOBUF_NAMESPACE_ID::internal::GetEmptyStringAlreadyInited(), author,
      GetArena());
  // @@protoc_insertion_point(field_set_allocated:tutorial.Book.Author)
}

// repeated .tutorial.Book.VersionNumber Version = 4;
inline int Book::_internal_version_size() const {
  return version_.size();
}
inline int Book::version_size() const {
  return _internal_version_size();
}
inline void Book::clear_version() {
  version_.Clear();
}
inline ::tutorial::Book_VersionNumber* Book::mutable_version(int index) {
  // @@protoc_insertion_point(field_mutable:tutorial.Book.Version)
  return version_.Mutable(index);
}
inline ::PROTOBUF_NAMESPACE_ID::RepeatedPtrField< ::tutorial::Book_VersionNumber >*
Book::mutable_version() {
  // @@protoc_insertion_point(field_mutable_list:tutorial.Book.Version)
  return &version_;
}
inline const ::tutorial::Book_VersionNumber& Book::_internal_version(int index) const {
  return version_.Get(index);
}
inline const ::tutorial::Book_VersionNumber& Book::version(int index) const {
  // @@protoc_insertion_point(field_get:tutorial.Book.Version)
  return _internal_version(index);
}
inline ::tutorial::Book_VersionNumber* Book::_internal_add_version() {
  return version_.Add();
}
inline ::tutorial::Book_VersionNumber* Book::add_version() {
  // @@protoc_insertion_point(field_add:tutorial.Book.Version)
  return _internal_add_version();
}
inline const ::PROTOBUF_NAMESPACE_ID::RepeatedPtrField< ::tutorial::Book_VersionNumber >&
Book::version() const {
  // @@protoc_insertion_point(field_list:tutorial.Book.Version)
  return version_;
}
```

如上，getter 函数具有与字段名一模一样的名字，并且是小写的，而 setter 函数都是以 set_ 前缀开头。此外，还有 has_ 前缀的函数，对每一个单一的（required或optional的）字段来说，如果字段被置（set）了值，该函数会返回 true。最后，每一个字段还有一个 clear_ 前缀的函数，用来将字段重置（un-set）到空状态（empty state）。

然而，数值类型的字段 Id 就只有如上所述的基本读写函数，BookName 和 Author 字段则有一些额外的函数，因为它们是 string。前缀为 mutable_ 的函数返回  string 的直接指针（direct pointer）。除此之外，还有一个额外的 setter 函数。注意：你甚至可以在 Version 还没有被置（set）值的时候就调用 mutable_version()，它会被自动初始化为一个空字符串。在此例中，如果有一个单一消息字段，那么它也会有一个 mutable_  前缀的函数，但是没有一个 set_  前缀的函数。

重复的字段也有一些特殊的函数。如果你看一下重复字段 Version 的那些函数，就会发现你可以： 

 （1）得到重复字段的 _size（换句话说，这个Person关联了多少个电话号码）。

 （2）通过索引（index）来获取一个指定的版本号。

 （3）通过指定的索引（index）来更新一个已经存在的版本号。

 （4）向消息（message）中添加另一个版本号，然后你可以编辑它（重复的标量类型有一个add_ 前缀的函数，允许你传新值进去）。

**关于枚举和嵌套类（Enums and Nested Classes）。**

​	生成的代码中包含了一个VersionType 枚举，它对应于 .proto 文件中的那个枚举。你可以把这个类型当作 Book::VersionType，其值为 Book::OLD 和 Book::LATEST（实现的细节稍微复杂了点，但是没关系，不理解它也不会影响你使用该枚举）。

编译器还生成了一个名为 Book::VersionNumber的嵌套类。如果你看看代码，就会发现“真实的”类实际上是叫做 Book_VersionNumber，只不过 Book 内部的一个 typedef 允许你像一个嵌套类一样来对待它。这一点所造成的唯一的一个区别就是：如果你想在另一个文件中对类进行前向声明（forward-declare）的话，你就不能在C++中对嵌套类型进行前向声明了，但是你可以对Book_VersionNumber进行前向声明。

**关于标准消息函数（Standard Message Methods）。**  

每一个消息（message）还包含了其他一系列函数，用来检查或管理整个消息，包括：

```c++
bool IsInitialized() const; //检查是否全部的required字段都被置（set）了值。

void CopyFrom(const Person& from); //用外部消息的值，覆写调用者消息内部的值。

void Clear();   //将所有项复位到空状态（empty state）。

int ByteSize() const;   //消息字节大小
```

**关于Debug的API。**

```c++
string DebugString() const; //将消息内容以可读的方式输出

string ShortDebugString() const; //功能类似于，DebugString(),输出时会有较少的空白

string Utf8DebugString() const; //Like DebugString(), but do not escape UTF-8 byte sequences.

void PrintDebugString() const;  //Convenience function useful in GDB. Prints DebugString() to stdout.
```

**关于解析&序列化(Parsing and Serialization)。**

最后，每一个protocol buffer 类都有读写你所选择的消息类型的函数。它们包括：

```c++
bool SerializeToString(string* output) const; //将消息序列化并储存在指定的string中。注意里面的内容是二进制的，而不是文本；我们只是使用string作为一个很方便的容器。

bool ParseFromString(const string& data); //从给定的string解析消息。

bool SerializeToArray(void * data, int size) const  //将消息序列化至数组

bool ParseFromArray(const void * data, int size)    //从数组解析消息

bool SerializeToOstream(ostream* output) const; //将消息写入到给定的C++ ostream中。

bool ParseFromIstream(istream* input); //从给定的C++ istream解析消息。
```

**注意：**  

protocol buffers 和面向对象的设计 protocol buffer类通常只是纯粹的数据存储器（就像C++中的结构体一样）；它们在对象模型中并不是一等公民。如果你想向生成的类中添加更丰富的行为，最好的方法就是在应用程序中对它进行封装。如果你无权控制.proto文件的设计的话，封装 protocol buffers 也是一个好主意（例如，你从另一个项目中重用一个.proto文件）。在那种情况下，你可以用封装类来设计接口，以更好地适应你的应用程序的特定环境：隐藏一些数据和方法，暴露一些便于使用的函数，等等。但是你绝对不要通过继承生成的类来添加行为。这样做的话，会破坏其内部机制，并且不是一个好的面向对象的实践。

##### 3.2.6 读写消息

接下来我们使用 protobuf 为我们生成的消息类来完成我们序列化和反序列化的操作。如下： 

```c++
#include <iostream>
#include <string>
#include "book.pb.h"

int main()
{
    GOOGLE_PROTOBUF_VERIFY_VERSION;

    tutorial::Book book;

    //给消息类 Book 对象 book 赋值
    book.set_id(1234);
    *book.mutable_bookname()="HelloWorld";
    book.set_author("zy");
    //增加一个版本号对象
    tutorial::Book::VersionNumber* version_number = book.add_version();
    version_number->set_number(1.1);
    version_number->set_type(tutorial::Book::OLD);
    
    //再增加一个版本号对象
    tutorial::Book::VersionNumber* version_number2 = book.add_version();
    version_number2->set_number(1.2);
    version_number2->set_type(tutorial::Book::LATEST);

    //将消息对象 book 序列化到 string 容器
    std::string serializedStr;
    book.SerializeToString(&serializedStr);
    std::cout << "serialization result: " << serializedStr << std::endl; // 序列化后的字符串内容是二进制数据，可能打印出来会乱码
    std::cout << "debugString: " << book.DebugString() << std::endl;

    /*------------------上面是序列化，下面是反序列化------------------*/
    //解析序列化后的消息对象，即反序列化
    tutorial::Book deserializedBook;
    if(!deserializedBook.ParseFromString(serializedStr))
    {
        std::cerr << "Failed to parse book. " << std::endl;
        return -1;
    }

    std::cout << std::endl << "-----------------上面是序列化，下面是反序列化--------------" << std::endl;
    std::cout << "deserializedBook debugString: " << deserializedBook.DebugString() << std::endl;
    std::cout << "Book Id: " << deserializedBook.id() << std::endl;
    std::cout << "Book Name: " << deserializedBook.bookname() << std::endl;
    if(deserializedBook.has_author())
    {
        std::cout << "Book Author: " << deserializedBook.author() << std::endl;
    }
    for(int i = 0;i < deserializedBook.version_size();i++)
    {
        const tutorial::Book::VersionNumber& version_number3 = deserializedBook.version(i);

        switch (version_number3.type())
        {
            case tutorial::Book::OLD:
                std::cout << "OLD Version number: "; 
                break;
            
            case tutorial::Book::LATEST:
                std::cout << "LATEST Version number: ";
                break;
        }
        std::cout << version_number3.number() << std::endl;
    }
    google::protobuf::ShutdownProtobufLibrary();
}
```

makefile 如下：

```makefile
EXE=./main

PB_PATH = /usr/local

INC=$(PB_PATH)/include/

LIBPATH=$(PB_PATH)/lib/

PB_LIB=protobuf

LIB=$(PB_LIB) pthread

SOURCE=$(wildcard *.cpp) 
OBJ=$(patsubst %.cpp, %.o, $(SOURCE))

#CFLAGS= -g -Wall
#CFLAGS= -Wall -g
CFLAGS= -Wall -fPIC -g
CC=g++ -std=c++11

all:$(EXE)
$(EXE):$(OBJ)
	$(CC) $(CFLAGS) -o $@ $^ $(addprefix -L, $(LIBPATH)) $(addprefix -l, $(LIB)) 

%.o:%.cpp
	$(CC) $(CFLAGS) -o $@ -c $< $(addprefix -I, $(INC))

pb:
	$(PB_PATH)/bin/protoc --cpp_out=./ *.proto
	rename .cc .cpp *.cc

clean:
	rm -rf *.d *.o $(EXE) $(ARLIB)

install:
	sz -bye $(EXE)

debug:
	./debug.sh $(EXE)
```

编译记得加上 `-std=c++11` 选项。如果出现共享库找不到等情况，参考本文 3.1 解决。

程序输出结果：

```c++
root@VM-xxx-xx-centos:book# ./main 
serialization result:�
���?oWorldzy"
debugString: Id: 1234
BookName: "HelloWorld"
Author: "zy"
Version {
  number: 1.1
  type: OLD
}
Version {
  number: 1.2
  type: LATEST
}


-----------------上面是序列化，下面是反序列化--------------
deserializedBook debugString: Id: 1234
BookName: "HelloWorld"
Author: "zy"
Version {
  number: 1.1
  type: OLD
}
Version {
  number: 1.2
  type: LATEST
}

Book Id: 1234
Book Name: HelloWorld
Book Author: zy
OLD Version number: 1.1
LATEST Version number: 1.2
```

可以看出，系列化和反序列化是成功的，并且其中的序列化后的二进制数据打印出来是乱码。

关于更多的 protobuf 的优化技巧、扩展技巧、高级使用请参考 protobuf 官网：https://developers.google.com/protocol-buffers/

### 4. 其他序列化方法

#### 4.1 XML

XML（Extensible Markup Language），可扩展标记语言，用结构化的方式来表示数据，和 JSON 一样，都是一种数据交换格式。C++对象可以序列化为XML，用于网络传输或存储。XML 具有统一标准、可移植性高等优点，但因为文件格式复杂，导致序列化结果数据较大，传输占用带宽，其在序列化与反序列化场景中，没有JSON常见。

#### 4.2 Google Protocol Buffers

Google Protocol Buffers是Google内部使用的数据编码方式，旨在用来代替XML进行数据交换。可用于数据序列化与反序列化。主要特性有：  （1）高效；  （2）语言中立(C++, Java, Python等)；  （3）可扩展。  官方文档请[点击这里](https://developers.google.com/protocol-buffers/docs/overview?csw=1)。

#### 4.3 Boost Serialization

Boost Serialization可以创建或重建程序中的等效结构，并保存为二进制数据、文本数据、JSON、XML或者有用户自定义的其他文件。该库具有如下优秀特性：  （1）代码可移植（实现仅依赖于ANSI C++）。  （2）深度指针保存与恢复。  （3）可以序列化STL容器和其他常用模版库。  （4）数据可移植。  （5）非入侵性。

#### 4.4 MFC Serialization

Windows平台下可使用MFC中的序列化方法。MFC 对 CObject 类中的序列化提供内置支持。因此，所有从 CObject派生的类都可利用 CObject 的序列化协议。详见[MSDN中的介绍](https://msdn.microsoft.com/en-us/library/6bz744w8(v=vs.80).aspx)。

#### 4.5 .NET Framework

.NET的运行时环境用来支持用户定义类型的流化的机制。它在此过程中，先将对象的公共字段和私有字段以及类的名称（包括类所在的程序集）转换为字节流，然后再把字节流写入数据流。在随后对对象进行反序列化时，将创建出与原对象完全相同的副本。

#### 4.6 简单总结

这几种序列化方案各有优缺点，各有自己的适用场景。XML产生的数据文件较大，很少使用。MFC和.NET框架的方法适用范围很窄，只适用于Windows下，且.NET框架方法需要.NET的运行环境，但是二者结合Visual Studio IDE使用最为方便。Google Protocol Buffers效率较高，但是数据对象必须预先定义，并使用protoc编译，适合要求效率，允许自定义类型的内部场合使用。Boost.Serialization使用灵活简单，而且支持标准C++容器。

考虑平台的移植性、适用性和高效性，推荐大家使用 Google 的 protobuf 和 Boost 的序列化方案

------

本文参考：https://cloud.tencent.com/developer/article/1176660

