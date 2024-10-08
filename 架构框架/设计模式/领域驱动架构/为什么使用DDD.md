---
title: 为什么使用 DDD
---

### 一、DDD 的由来

业务和行业趋势：

- 业务的日渐复杂，微服务的设计理念和价值越来越明显。
- 微服务到底应该如何拆分和设计才算合理？而且微服务的边界历来是最容易产生争议的地方
- 很多公司在建设中台，需要将通用的可复用的业务能力沉淀到中台业务模型，实现企业级能力复用。因此中台面临的首要问题就是中台领域模型的重构

DDD 的价值：

- DDD 设计思想实现的微服务边界非常清晰，业务领域划分也十分合理
- DDD、微服务、中台他们之间是铁三角关系。中台本质是业务模型，微服务是业务模型的系统落地，DDD 是一种设计思想，他可以同时指导中台业务建模和微服务设计，这构成了他们之间的铁三角关系。DDD 强调领域模型和微服务设计的一体性，先有领域模型然后才有微服务，而不是脱离领域模型来谈微服务设计
- 其次，就是通过战略设计，建立领域模型，划分微服务边界。这步是关键
- 最后，通过战术设计，我们会从领域模型转向微服务设计和落地。此时，边界清晰、可持续演进的微服务架构雏形就出来了。

>中台和平台的区别：
>
>- 平台只是将部分通用的公共能力独立为共享平台。虽然可以通过API或者数据对外提供公共共享服务，解决系统重复建设的问题，但这类平台并没有和企业内的其它平台或应用，实现页面、业务流程和数据从前端到后端的全面融合，并且没有将核心业务服务链路作为一个整体方案考虑，各平台仍然是分离且独立的。 
>- 中台来源于平台，但中台和平台相比，它更多体现的是一种理念的转变，它主要体现在这三个关键能力上：对前台业务的快速响应能力；企业级复用能力；从前台、中台到后台的设计、研发、页面操作、流程服务和数据的无缝联通、融合能力。 中台首先体现的是一种企业级的能力，它提供的是一套企业级的整体解决方案，解决小到企业、集团，大到生态圈的能力共享、联通和融合问题，支持业务和商业模式创新。通过平台联通和数据融合为用户提供一致的体验，更敏捷地支撑前台一线业务。

### 二、软件架构的演进

软件架构模式经历了从单机、集中式到分布式微服务架构三个阶段的演进。

<img src="./image/软件架构的演进.png" alt="s" style="zoom:23%;" />

- **单机架构**：采用面向过程的设计方法，系统包括客户端 UI 层和数据库两层，采用 C/S 架构模式，整个系统围绕数据库驱动设计和开发，并且总是从设计数据库和字段开始。
- **集中式架构：**采用面向对象的设计方法，系统包括业务接入层、业务逻辑层和数据库层，采用经典的三层架构，也有部分应用采用传统的 SOA 架构。这种架构容易使系统变得臃肿，可扩展性和弹性伸缩性差。
- **分布式微服务架构：**随着微服务架构理念的提出，集中式架构正向分布式微服务架构演进。微服务架构可以很好地实现应用之间的解耦，解决单体应用扩展性和弹性伸缩能力不足的问题。

















