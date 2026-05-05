---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

spring概念介绍：https://zhuanlan.zhihu.com/p/133534252

Springboot介绍：https://www.yiibai.com/spring-boot/spring_boot_introduction.html

#### 1. 依赖注入

在代码中，类与类之间的耦合是必须的。通过依赖注入（`Dependency Injection`），对象的依赖关系将由系统中负责协调对象的第三方组件在创建对象的时候进行设定。对象无需自行创建和管理他们的依赖关系。

如果一个对象只通过接口（而不是具体实现）来表明依赖关系，那么这种依赖就能够在对象本身毫不知情的情况下，用不同的具体实现进行替换。

在 spring 中，可以通过配置 xml，或者通过注解来实现。如下的 xml 配置。

```
    <bean id="autoCar" class="com.xxx.car.impl.AutoCar"/>
    <bean id="bike" class="com.xxx.car.impl.Bike"/>

    <bean id="man" class="com.xxx.Man.impl.ManImpl">
        <property name="carFunc" ref="autoCar"/>
    </bean>
```

Component 注解，spring 会主动寻找带有 `@Component` 注解的类，并为其创建 bean。

ComponentScan 注解，默认会扫描与配置类相同的包，spring 将会扫描这个包以及所有子包，查找带有 `@Component` 注解的包。

也可以使用 XML 启用扫描：

```
<context:component-scan base-package="com.xxx"/>
```

Autowired 注解，表明当 Spring 创建 bean 的时候，会进行实例化，并且会设置对应类型的 bean。`@Autowired` 还可以用在属性的 Setter 方法上。实际上，`@Autowired` 可以用在类的任何方法上。

#### 2. AOP（面向切面编程）

依赖注入能够让互相协作的软件组件保持松散耦合，而面向切面编程（`aspect-oriented programming, AOP`）允许我们把遍布应用各处的功能分离出来形成可重用的组件。比如日志模块、事务管理、安全模块等

描述切面的常用术语有：通知（advice）、切点（pointcut）和连接点（join point）。

**通知**：切面的工作称为通知，通知定义了切面是什么、以及何时使用。除了描述切面要完成的工作，通知还解决了何时执行这个工作的问题。应该应用在某个方法被调用之前？还是之后？还是只在抛出异常时调用？有 5 种类型的通知：

- 前置通知：在目标方法被调用之前调用通知功能
- 还有后置通知、返回通知、异常通知
- 环绕通知：通知包裹了被通知的方法，在被通知的方法调用之前和调用之后执行自定义的行为





















