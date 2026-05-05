---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <!--类似于java的包名，通常时公司或者组织的名称-->
    <groupId>groupId</groupId>
    <!--类似于java的类名，通常是项目名称-->
    <artifactId>LearnJava</artifactId>
    <!--版本号 SNAPSHOT表示非release-->
    <version>1.0-SNAPSHOT</version>

    <!--依赖,其中的groupId、artifactId、version和包名的定义一致-->
    <dependencies>
        <dependency>
            <groupId>com.tencent.tccm</groupId>
            <artifactId>tccm-client-java</artifactId>
            <!-- 这里引用的是snapshot版本的jar包，生产环境要引用release版本-->
            <version>1.0-SNAPSHOT</version>
          	<!--表示该jar包在那个阶段使用-->
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
```

| scope    | 说明                                          |
| -------- | --------------------------------------------- |
| compile  | 编译时需要用到该jar包(默认)                   |
| test     | 编译Test时需要用到该jar包                     |
| runtime  | 编译时不需要，但运行时需要用到                |
| provided | 编译时需要用到，但运行时由JDK或某个服务器提供 |

maven会维护一个中央仓库，下载到本地的jar包会放在用户主目录的 .m2 目录。

只有以 `-SNAPSHOT` 结尾的版本号会被Maven视为开发版本，开发版本每次都会重复下载，这种SNAPSHOT版本只能用于内部私有的Maven repo，公开发布的版本不允许出现 SNAPSHOT。

经常用到的phase(阶段)：` clean:清理 compile 编译 test 运行测试 package 打包`。可使用：` mvn clean, mvn clean compile, mvn clean test, mvn clean package `

##### 自定义插件

例如：使用 `maven-shade-plugin` 可以创建一个可执行的jar，要使用这个插件，需要在 `pom.xml` 中声明它

```xml
   <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-shade-plugin</artifactId>
                <version>3.2.4</version>
                <executions>
                    <execution>
                        <phase>package</phase>
                        <goals>
                            <goal>shade</goal>
                        </goals>
                        <configuration>
                            <transformers>
                                <transformer implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">
                                    <mainClass>com.tencent.test_tccm.TestOther</mainClass>
                                </transformer>
                            </transformers>
                        </configuration>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
```

常用的插件：

- maven-shade-plugin：打包所有依赖包并生成可执行jar；
- cobertura-maven-plugin：生成单元测试覆盖率报告
- findbugs-maven-plugin：对Java源码进行静态分析以找出潜在问题

### 配置jdk版本

maven的pom.xml文件中未配置jdk版本时，一旦pom文件发生变化，Java compiler和language level 会自动变回原来的默认版本，在pom中配置jdk版本的配置内容如下：

```xml
<build>
    <plugins>
        <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <configuration>
                    <source>1.8</source>
                    <target>1.8</target>
                </configuration>
            </plugin>
    </plugins>
</build>
```

