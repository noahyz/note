```
mvn clean compile
mvn clean test
mvn clean package 
mvn clean install
1. maven的约定：在项目的根目录放置pom.xml，在 src/main/java目录中放置项目的主代码，在src/test/java中放置项目的测试代码
2. maven定义了一组规则：世界上任何一个构件都可以使用maven坐标唯一标识，maven坐标的元素包括：groupId、artifactId、version、packaging、classifier
	 groupId: 定义当前maven项目隶属的实际项目。maven项目和实际项目不一定是一对一的关系，一个实际项目往往会被划分成很多模块。groupId不应该对应项目隶属的组织或公司。groupId的表示方式和java包名的表示方式类似，通常与域名反向一一对应
	 artifactId: 该元素定义实际项目中一个maven项目(模块)，推荐的做法是使用实际项目名称作为artifactId的前缀，方便寻找实际构件。默认情况下，maven生成的构件，其文件名会以artifactId作为开头
	 version: 该元素定义maven项目当前所处的版本
	 packaging: 该元素定义maven项目的打包方式。打包方式通常与所生成构件的文件扩展名对应。比如packaging为jar，则文件名为xxx.jar，而使用war打包方式的maven项目，最终生成的构件会有一个xxx.war文件，不过这不是绝对的。其次，打包方式会影响到构建的生命周期。当不定义packaging的时候，maven会默认值jar
	 classifier: 该元素用来帮助定义构建输出的一些附属构件。附属构件与主构件对应，如主构件是nexus-indexer-2.0.0.jar，该项目可能还会通过使用一些插件生成如nexus-indexer-2.0.0.-javadoc.jar、nexus-indexer-2.0.0-sources.jar这样的一些附属构件，其包含了java文档和源代码。javadoc和sources就是这两个附属构件的classifier。注意：不能直接定义项目的classifier，因为附属构件不是项目直接默认生成的，而是由附加的插件帮助生成的
	 注：groupId、artifactId、version是必须定义的，packaging是可选的(默认为jar)，而classifier是不能直接定义的
	 项目构件的文件名是与坐标相对应的，一般的规则为artifactId-version[-classifier].packaging，[-classifier]表示可选。强调packaging并非一定与构件扩展名对应。
	 <scope>test</scope>：用来定义依赖范围
	 
3. 依赖的配置
		根元素project下的dependencies可以包含一个或者多个dependency元素，以声明一个或者多个项目依赖。每个依赖可以包含的元素有：
		(1) groupId、artifactId、version: 依赖的基本坐标，对于任何一个依赖来说，基本坐标是最重要的，maven根据坐标才能找到需要的依赖
		(2) type： 依赖的类型，对应于项目坐标定义的packaging。大部分情况该元素不必声明，其默认值为jar
		(3) scope: 依赖的范围
    (4) optional: 标记依赖是否可选
    (5) exclusions: 用来排除传递性依赖
```

##### 依赖范围

|依赖范围|对于编译classpath有效|对于测试classpath有效|对于运行时classpath有效|例子|
|---|---|---|---|---|
|compile|Y|Y|Y|spring-core|
|test||Y||JUnit|
|provided|Y|Y||servlet-api|
|runtime||Y|Y|JDBC驱动实现|
|system|Y|Y||本地的。Maven仓库之外的类库文件|

##### 仓库

​	仓库分为两类：本地仓库和远程仓库，首先会查看本地仓库，如果本地仓库存在此构件，则直接使用；如果不存在或者需要查看是否有更新的构件版本，maven会去远程仓库查找，发现需要的构件之后，下载到本地仓库再使用。
​	默认情况每个用户在自己的用户目录下都有一个路径名为 `.m2/repository/` 的仓库目录。此文件默认不存在，需要从maven安装目录复制  `$M2_HOME/conf/settings.xml` 文件再进行编辑。
​	maven的 install 插件(mvn install)会将项目的构建输出文件安装到本地仓库 

```
maven的中央仓库的配置：打开jar文件 $M2_HOME/lib/maven-model-builder-3.0.jar，访问路径 org/apache/maven/model/pom-4.0.0.xml 可看到配置
  <repositories>
    <repository>
      <id>central</id>
      <name>Central Repository</name>
      <url>https://repo.maven.apache.org/maven2</url>
      <layout>default</layout>
      <snapshots>
        <enabled>false</enabled>
      </snapshots>
    </repository>
  </repositories>
	
	maven自带的中央仓库使用的id为central，如果其他的仓库声明也使用该id，就会覆盖中央仓库的配置。
	url值指向仓库的地址
	releases的enabled值为true，表示开启此仓库的发布版本下载支持
	snapshots的enabled值为false，表示关闭仓库的快照版本的下载支持
	layout元素值为default表示仓库的布局是maven2及maven3的默认布局，而不是maven1的布局
	updatePolicy元素用来配置maven从远程仓库检查更新的频率，默认的值是daily，表示maven每天检查一次。never表示从不检查更新；always表示每次构建都检查更新；interval: X 表示每隔X分钟检查一次更新(X为任意整数)
	checksumPolicy元素用来配置maven检查校验和文件的策略，当构件被部署到maven仓库中时，会同时部署对应的校验和文件。warn构建时验证失败会警告，fail构建会失败；ignore忽略校验和错误
	
	远程仓库如果需要认证的话，可以将配置认证信息放在setting.xml文件中
	<servers>
    <server>
      <id>deploymentRepo</id>
      <username>repouser</username>
      <password>repopwd</password>
    </server>
  </servers>
  server元素的id必须和POM中需要认证的repository元素的id完全一致，这个id将认证信息与仓库配置联系在了一起。
```

##### 部署至远程仓库

```
编辑项目的 pom.xml 文件
    <distributionManagement>
        <snapshotRepository>
            <id>tencent_public_snapshots</id>
            <name>tencent_public_snapshot</name>
            <url>https://mirrors.tencent.com/repository/maven/tencent_public_snapshots/</url>
        </snapshotRepository>
        <repository>
            <!--必须与 settings.xml 的 id 一致-->
            <id>tencent_public</id>
            <name>tencent_public_release</name>
            <url>https://mirrors.tencent.com/repository/maven/tencent_public/</url>
        </repository>
    </distributionManagement>
repository：表示发布版本构件的仓库
snapshotRepositiry：表示快照版本的仓库
远程仓库部署构件的时候，需要认证。需要在setting.xml 中创建 server 元素，其id与仓库的id 相匹配。
mvn clean deploy: 将项目构建输出的构件部署到配置对应的远程仓库
```

##### 命令行和生命周期

```
1. mvn clean: 该命令调用clean生命周期的clean阶段，实际执行的阶段为clean生命周期的 pre-clean 和 clean 阶段
2. mvn test: 该命令调用default生命周期的test阶段，实际执行的阶段为default生命周期的validate、initialize等，直到test的所有阶段。这也解释了为什么在执行测试的时候，项目的代码能够自动得以编译
3. mvn clean install: 该命令调用clean生命周期的clean阶段和default生命周期的install阶段。实际执行的阶段为clean生命周期的pre-clean、clean阶段，以及default生命周期的从validate至install的所有阶段。
4. mvn clean deploy site-deploy: 该命令调用clean生命周期的clean阶段、default生命周期的deploy阶段，以及site生命周期的site-deploy阶段。实际执行的阶段为clean生命周期的pre-clean、clean阶段，default生命周期的所有阶段，以及site生命周期的所有阶段。该命令结合了maven所有三个生命周期，且deploy为default生命周期的最后一个阶段，site-deploy为site生命周期的最后一个阶段。
```





































