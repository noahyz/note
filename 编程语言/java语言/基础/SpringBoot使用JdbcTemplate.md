---
title: SpringBoot 项目使用 JdbcTemplate
---

我们都知道使用原始的JDBC在操作数据库是比较麻烦的，所以Spring为了提高开发的效率，顺带着就把JDBC封装、改造了一番，而JdbcTemplate就是Spring对原始JDBC封装之后提供的一个操作数据库的工具类。

我们可以借助JdbcTemplate来完成所有数据库操作，比如：增删改查等。

JdbcTemplate主要提供以下三种类型的方法：

- executeXxx() : 执行任何SQL语句，对数据库、表进行新建、修改、删除操作
- updateXxx() : 执行新增、修改、删除等语句
- queryXxx() : 执行查询相关的语句

JdbcTemplate算是最简单的数据持久层方案，实际开发过程中，我们会使用mybatis、hibernate、jpa等持久化框架。

与JdbcTemplate类似的还有NamedParameterJdbcTemplate。

增加 pom 依赖

```
<!-- JDBC -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-jdbc</artifactId>
</dependency>
        
 <dependency>
     <groupId>com.mchange</groupId>
     <artifactId>c3p0</artifactId>
     <version>0.9.5.5</version>
     <scope>compile</scope>
</dependency>

<!-- MySQL 驱动包-->
<!--MySQL Server 版本为 8.x时，mysql-connector-java使用5.1.35时会报错-->
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.11</version>
</dependency>
```

application.properties

```
# 定义c3p0的配置，没有提示可以使用，数据库连接地址
c3p0.jdbcUrl=jdbc:mysql://192.168.61.130:3306/spring_db?serverTimezone=Asia/Shanghai&useUnicode=true&charcterEncoding=UTF-8&useSSL=false
  # 数据库用户名
c3p0.user=root
  # 数据库密码
c3p0.password=1234
  # 数据库驱动程序
#c3p0.driverClass=com.mysql.jdbc.Driver
c3p0.driverClass=com.mysql.cj.jdbc.Driver
  # 最小连接数
c3p0.minPoolSize=2
  # 最大连接数
c3p0.maxPoolSize=10
  # 最大等待时间
c3p0.maxIdleTime=3000
  # 初始化连接数
c3p0.initialPoolSize=3
```

配置数据源。只要配置了数据源就会自动注入JdbcTemplate Bean。

```
@Configuration
public class DataSourceConfig {
    @Bean(name = "dataSource")
    //配置属性,prefix : 前缀 spring.datasource固定
    @ConfigurationProperties(prefix = "c3p0")
    public DataSource createDataSource() {
        return DataSourceBuilder.create()
                .type(ComboPooledDataSource.class) // 设置数据源类型
                .build();
    }
}
```

使用 **NamedParameterJdbcTemplate** 

在经典的 JDBC 用法中, SQL 参数是用占位符 ? 表示,并且受到位置的限制。定位参数的问题在于, 一旦参数的顺序发生变化, 就必须改变参数绑定。

在 Spring JDBC 框架中, 绑定 SQL 参数的另一种选择是使用具名参数(named parameter)。

具名参数：SQL 按名称(以冒号开头)而不是按位置进行指定. 具名参数更易于维护, 也提升了可读性。具名参数由框架类在运行时用占位符取代。

具名参数只在 NamedParameterJdbcTemplate 中得到支持。

```
@Controller
public class UserController {
    @Autowired
    private NamedParameterJdbcTemplate namedParameterJdbcTemplate;
    
    @RequestMapping(value = "/insertUser", method = RequestMethod.POST)
    @ResponseBody
    public void insertUser(@RequestBody UserParam param) {
        String sql = "insert into user(id, email, username) values(:id, :email, :username)";

        MapSqlParameterSource source = new MapSqlParameterSource();
        source.addValue("id", param.getId());
        source.addValue("email", param.getEmail());
        source.addValue("username", param.getUsername());
        namedParameterJdbcTemplate.update(sql, source);
    }
}
```