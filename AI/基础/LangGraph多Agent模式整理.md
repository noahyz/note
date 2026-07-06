# LangGraph 多 Agent 模式整理

> 基于 LangGraph 开源代码库（`libs/langgraph` + `examples/`）的系统性梳理，涵盖 12 种经典多 Agent 模式与其底层支撑机制。

---

## 目录

1. [底层支撑机制](#一底层支撑机制)
2. [对等协作模式 / Network Pattern](#二对等协作模式--network-pattern)
3. [监督者模式 / Supervisor Pattern](#三监督者模式--supervisor-pattern)
4. [分层团队模式 / Hierarchical Teams](#四分层团队模式--hierarchical-teams)
5. [计划-执行模式 / Plan-and-Execute](#五计划-执行模式--plan-and-execute)
6. [ReWOO 模式](#六rewoo-模式)
7. [LLM Compiler 模式](#七llm-compiler-模式)
8. [自我反思模式 / Reflection & Reflexion](#八自我反思模式--reflection--reflexion)
9. [自我发现模式 / Self-Discover](#九自我发现模式--self-discover)
10. [LATS 模式 / Language Agent Tree Search](#十lats-模式--language-agent-tree-search)
11. [客户支持 / 多专家路由模式](#十一客户支持--多专家路由模式)
12. [双 Agent 对话仿真模式](#十二双-agent-对话仿真模式)
13. [Subgraph 复用模式](#十三subgraph-复用模式)
14. [Prebuilt 高级 API](#十四prebuilt-高级-api)
15. [总结](#十五总结)

---

## 一、底层支撑机制

在介绍具体模式之前，先理解 LangGraph 多 Agent 的三大底层原语：

### 1.1 Send 机制 — 动态任务分发

`Send` 是 LangGraph 实现多 Agent 并行和动态路由的核心机制。

```python
def route_to_agents(state):
    return [
        Send("agent_1", {"task": "analyze"}),
        Send("agent_2", {"task": "validate"}),
    ]
```

**核心能力**：
- 动态地将任务发送给特定节点
- 支持并行执行多个任务
- 允许在运行时决定执行路径

**源码位置**：`libs/langgraph/langgraph/types.py` → `Send`

---

### 1.2 Command 机制 — 高级控制流

`Command` 提供了图执行过程中的精细控制能力。

| 字段 | 作用 |
|------|------|
| `update` | 更新图的状态 |
| `goto` | 跳转到指定节点 |
| `resume` | 恢复被中断的执行 |
| `graph` | 指定目标图（当前图或父图） |

**源码位置**：`libs/langgraph/langgraph/types.py` → `Command`

---

### 1.3 Interrupt 机制 — 人工干预

`interrupt()` 支持在 Agent 执行中暂停并等待人工输入。

**核心能力**：
- 实现 human-in-the-loop 工作流
- 请求用户确认或输入
- 自动保存状态，支持恢复执行

**源码位置**：`libs/langgraph/langgraph/types.py` → `interrupt()`

---

## 二、对等协作模式 / Network Pattern

**英文名称**：Multi-Agent Collaboration / Network Pattern

### 核心思想

多个 Agent 以对等的方式协作，通过共享状态进行通信。每个 Agent 独立决策，也可以相互影响。适用于需要多个专家共同解决问题的场景。

### 架构示意

```
┌─────────────┐
│   Agent A   │
└──────┬──────┘
       │
    ┌──┴──┐
    │State│
    └──┬──┘
       │
┌──────┴──────┐
│   Agent B   │
└─────────────┘
```

### 关键实现

- 使用 `StateGraph` 作为基础框架
- 通过 `add_node()` 添加多个 Agent 节点
- 使用 `add_conditional_edges()` 实现动态路由
- 通过 `Annotated` 状态字段的 reducer 函数聚合多个 Agent 的输出

### 示例文件

- `examples/multi_agent/multi-agent-collaboration.ipynb`

---

## 三、监督者模式 / Supervisor Pattern

**英文名称**：Supervisor Pattern

### 核心思想

一个中央 Supervisor Agent 负责协调和路由任务。Supervisor 决定将任务分配给哪个 Worker Agent，Worker 执行完毕后结果返回给 Supervisor。适用于有明确任务分配和协调需求的场景。

### 架构示意

```
┌──────────────────┐
│   Supervisor     │
│   (Router)       │
└────────┬─────────┘
         │
    ┌────┼────┐
    │    │    │
┌───▼──┐ │ ┌──▼───┐
│Agent1│ │ │Agent2│
└──────┘ │ └──────┘
    ┌────▼───┐
    │Agent3  │
    └────────┘
```

### 关键实现

- Supervisor 节点使用 LLM 进行路由决策
- 使用 `add_conditional_edges()` 实现动态路由
- 每个 Worker Agent 可以是独立函数或子图
- 通过 `Send` 将任务发送给特定 Agent

### 示例文件

- 官方文档中 Supervisor 示例
- 测试：`libs/langgraph/tests/test_pregel.py` → `test_cond_edge_after_send()`

---

## 四、分层团队模式 / Hierarchical Teams

**英文名称**：Hierarchical Agent Teams

### 核心思想

多层级的 Agent 组织结构。上层 Agent 管理下层 Agent，支持递归的子图调用。适用于复杂的任务分解和层级化处理。

### 架构示意

```
┌─────────────────┐
│  Manager Agent  │
└────────┬────────┘
         │
    ┌────┼────┐
    │    │    │
┌───▼──┐ │ ┌──▼───┐
│Team1 │ │ │Team2 │
│┌────┐│ │ │┌────┐│
││Ag1 ││ │ ││Ag3 ││
│└────┘│ │ │└────┘│
│┌────┐│ │ │┌────┐│
││Ag2 ││ │ ││Ag4 ││
│└────┘│ │ │└────┘│
└──────┘ │ └──────┘
```

### 关键实现

- 使用 Subgraph 机制实现层级结构
- 父图可以调用子图作为节点
- 支持状态的继承和隔离
- 使用 `checkpointer` 管理子图状态

### 示例文件

- `examples/multi_agent/hierarchical_agent_teams.ipynb`

---

## 五、计划-执行模式 / Plan-and-Execute

**英文名称**：Plan-and-Execute Pattern

### 核心思想

第一个 Agent 制定计划，第二个 Agent 执行计划中的步骤，可选第三个 Agent 进行验证或反思。适用于需要先规划后执行的复杂任务。

### 架构示意

```
┌──────────────┐
│ Planner      │
│ (制定计划)   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Executor     │
│ (执行步骤)   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Verifier     │
│ (验证结果)   │
└──────────────┘
```

### 关键实现

- 使用 `add_edge()` 连接顺序节点
- Planner 输出结构化的计划
- Executor 逐步执行计划
- 使用状态来跟踪计划进度

### 示例文件

- `examples/plan-and-execute/plan-and-execute.ipynb`

---

## 六、ReWOO 模式

**英文名称**：ReWOO (Reason Without Observation)

### 核心思想

一个 Agent 进行推理和规划，另一个 Agent 执行工具调用。分离推理和执行的关注点，适用于需要分离思考和行动的场景。

### 架构示意

```
┌──────────────────┐
│ Reasoner Agent   │
│ (推理和规划)     │
└────────┬─────────┘
         │
    ┌────▼────┐
    │ 工具调用 │
    │ 计划    │
    └────┬────┘
         │
         ▼
┌──────────────────┐
│ Executor Agent   │
│ (执行工具)       │
└──────────────────┘
```

### 关键实现

- Reasoner 生成工具调用序列
- Executor 执行这些工具调用
- 使用结构化的中间表示

### 示例文件

- `examples/rewoo/rewoo.ipynb`

---

## 七、LLM Compiler 模式

**英文名称**：LLM Compiler Pattern

### 核心思想

LLM 生成任务图或执行计划，系统并行执行可以并行的任务，支持任务间的依赖关系。适用于需要优化执行效率的复杂任务。

### 架构示意

```
┌──────────────────┐
│ LLM Compiler     │
│ (生成任务图)     │
└────────┬─────────┘
         │
    ┌────▼────────────┐
    │ 任务依赖图      │
    │ Task1 → Task2   │
    │   └──→ Task3    │
    └────┬────────────┘
         │
    ┌────▼────────────┐
    │ 并行执行器      │
    │ (执行任务)      │
    └─────────────────┘
```

### 关键实现

- 使用 `Send` 实现并行任务分发
- 支持任务间的依赖管理
- 使用条件边处理任务完成

### 示例文件

- `examples/llm-compiler/LLMCompiler.ipynb`

---

## 八、自我反思模式 / Reflection & Reflexion

**英文名称**：Reflection / Reflexion Pattern

### 核心思想

Agent 执行任务后进行自我评估，根据评估结果决定是否重试或改进。支持多轮迭代改进，适用于需要质量保证的任务。

### 架构示意

```
┌──────────────┐
│ Agent        │
│ (执行任务)   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Evaluator    │
│ (评估结果)   │
└──────┬───────┘
       │
    ┌──┴──┐
    │     │
   是    否
    │     │
    ▼     ▼
  END  重试
```

### 关键实现

- 使用 `add_conditional_edges()` 实现条件路由
- Evaluator 返回评估结果
- 支持循环回到 Agent 进行改进

### 示例文件

- `examples/reflection/reflection.ipynb`
- `examples/reflexion/reflexion.ipynb`

---

## 九、自我发现模式 / Self-Discover

**英文名称**：Self-Discover Pattern

### 核心思想

Agent 自主发现解决问题的方法，通过探索和学习改进策略，支持动态的策略调整。适用于开放式问题解决。

### 架构示意

```
┌──────────────────┐
│ Discovery Agent  │
│ (探索和学习)     │
└────────┬─────────┘
         │
    ┌────▼────┐
    │ 策略库  │
    └────┬────┘
         │
    ┌────▼────┐
    │ 执行和  │
    │ 反馈    │
    └─────────┘
```

### 关键实现

- 使用循环结构支持迭代
- 维护策略或知识库
- 根据反馈动态调整

### 示例文件

- `examples/self-discover/self-discover.ipynb`

---

## 十、LATS 模式 / Language Agent Tree Search

**英文名称**：LATS (Language Agent Tree Search)

### 核心思想

使用树搜索算法探索多个执行路径。每个节点代表一个 Agent 状态，支持回溯和路径选择。适用于需要探索多个解决方案的问题。

### 架构示意

```
        ┌─────────┐
        │ Root    │
        └────┬────┘
             │
        ┌────┼────┐
        │    │    │
    ┌───▼──┐ │ ┌──▼───┐
    │Path1 │ │ │Path2 │
    └──┬───┘ │ └──┬───┘
       │     │    │
    ┌──▼──┐ │ ┌──▼──┐
    │Leaf1│ │ │Leaf2│
    └─────┘ │ └─────┘
```

### 关键实现

- 使用 `Send` 分支探索
- 支持评分和选择最佳路径
- 使用状态跟踪搜索树

### 示例文件

- `examples/lats/lats.ipynb`

---

## 十一、客户支持 / 多专家路由模式

**英文名称**：Customer Support / Multi-Expert Routing

### 核心思想

根据问题类型路由到不同的专家 Agent。每个专家 Agent 处理特定领域的问题，支持问题分类和智能路由。适用于需要多个领域专家的场景。

### 架构示意

```
┌──────────────┐
│ Router Agent │
│ (分类问题)   │
└──────┬───────┘
       │
    ┌──┼──┬──┐
    │  │  │  │
┌───▼┐ │ ┌┴──▼──┐
│销售│ │ │技术  │
│专家│ │ │专家  │
└────┘ │ └──────┘
    ┌──▼──┐
    │账户 │
    │专家 │
    └─────┘
```

### 关键实现

- 使用 LLM 进行问题分类
- 使用 `add_conditional_edges()` 路由
- 每个专家是独立的节点或子图

### 示例文件

- `examples/customer-support/customer-support.ipynb`

---

## 十二、双 Agent 对话仿真模式

**英文名称**：Chatbot Simulation / Agent Evaluation

### 核心思想

两个 Agent 进行对话交互：一个扮演用户，一个扮演助手。用于评估和测试 Agent 性能，适用于 Agent 的自动化评估。

### 架构示意

```
┌──────────────┐
│ Simulated    │
│ User Agent   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Assistant    │
│ Agent        │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Evaluator    │
│ (评估对话)   │
└──────────────┘
```

### 关键实现

- `create_simulated_user()` — 创建模拟用户
- `create_chat_simulator()` — 创建对话模拟器
- 支持多轮对话和评估

### 示例文件

- `examples/chatbot-simulation-evaluation/simulation_utils.py`
- `examples/chatbot-simulation-evaluation/agent-simulation-evaluation.ipynb`

---

## 十三、Subgraph 复用模式

**英文名称**：Subgraph Reuse Pattern

### 核心思想

将常用的 Agent 流程封装为子图，在多个地方复用这个子图。支持参数化和配置，适用于需要代码复用的场景。

### 架构示意

```
┌─────────────────┐
│ Parent Graph    │
│ ┌─────────────┐ │
│ │ Subgraph 1  │ │
│ └─────────────┘ │
│ ┌─────────────┐ │
│ │ Subgraph 2  │ │
│ └─────────────┘ │
└─────────────────┘
```

### 关键实现

- 使用 `CompiledStateGraph` 作为子图
- 支持状态映射和隔离
- 使用 `checkpointer` 管理子图状态

### 示例文件

- `examples/subgraph.ipynb`

---

## 十四、Prebuilt 高级 API

### 14.1 create_react_agent — ReAct Agent 工厂

`create_react_agent()` 是创建 ReAct Agent 的一站式高级 API。

**核心特性**：
- 自动处理工具调用循环（Thought → Action → Observation）
- 支持动态模型选择
- 支持结构化输出
- 支持 pre/post 模型钩子
- 支持 v1（并行工具执行）和 v2（分布式工具执行）

**关键参数**：
| 参数 | 说明 |
|------|------|
| `model` | LLM 模型 |
| `tools` | 可用工具列表 |
| `prompt` | 系统提示 |
| `checkpointer` | 状态持久化 |
| `interrupt_before/after` | 中断点配置 |

**源码位置**：`libs/prebuilt/langgraph/prebuilt/chat_agent_executor.py` → `create_react_agent()`

---

### 14.2 ToolNode — 工具执行节点

`ToolNode` 负责执行工具调用。

**核心特性**：
- 并行执行多个工具调用
- 支持 `InjectedState`（状态注入）
- 支持 `InjectedStore`（存储注入）
- 支持错误处理和验证
- 支持 Command 返回值

**源码位置**：`libs/prebuilt/langgraph/prebuilt/tool_node.py` → `ToolNode`

---

## 十五、总结

### 十五种模式速查表

| 序号 | 模式 | 英文名 | 核心机制 | 示例目录 |
|------|------|--------|----------|----------|
| 1 | 对等协作 | Network | StateGraph + add_node | `examples/multi_agent/` |
| 2 | 监督者 | Supervisor | LLM 路由 + conditional_edges | 官方文档 |
| 3 | 分层团队 | Hierarchical Teams | Subgraph + checkpointer | `examples/multi_agent/` |
| 4 | 计划-执行 | Plan-and-Execute | add_edge 顺序执行 | `examples/plan-and-execute/` |
| 5 | ReWOO | Reason Without Observation | 推理-执行分离 | `examples/rewoo/` |
| 6 | LLM 编译器 | LLM Compiler | Send 并行 + 任务依赖图 | `examples/llm-compiler/` |
| 7 | 自我反思 | Reflection / Reflexion | conditional_edges 循环 | `examples/reflection/` + `reflexion/` |
| 8 | 自我发现 | Self-Discover | 循环 + 策略库 | `examples/self-discover/` |
| 9 | 树搜索 | LATS | Send 分支 + 评分选择 | `examples/lats/` |
| 10 | 多专家路由 | Customer Support | LLM 分类 + 条件路由 | `examples/customer-support/` |
| 11 | 对话仿真 | Chatbot Simulation | 双 Agent 互相对话 | `examples/chatbot-simulation-evaluation/` |
| 12 | 子图复用 | Subgraph Reuse | CompiledStateGraph | `examples/subgraph.ipynb` |

### 底层原语 + 高层模式的分层视图

```
┌─────────────────────────────────────────────────────┐
│           高层多 Agent 模式（12 种）                  │
│   Supervisor / Hierarchical / Plan-Execute /         │
│   Reflection / LATS / ReWOO / LLM Compiler / ...     │
├─────────────────────────────────────────────────────┤
│           Prebuilt 高级 API                          │
│   create_react_agent()  /  ToolNode                  │
├─────────────────────────────────────────────────────┤
│           底层原语                                    │
│   StateGraph  /  Send  /  Command  /  Interrupt      │
└─────────────────────────────────────────────────────┘
```

### 关键设计理念

1. **图即程序**：所有 Agent 编排都是 `StateGraph` 的构建过程
2. **状态驱动**：Agent 之间通过共享状态通信，而非直接调用
3. **原生并行**：`Send` 机制天然支持并行任务分发
4. **可组合**：Subgraph 机制让 Agent 像乐高积木一样组合
5. **可观测**：内置流式输出 + LangSmith 追踪，方便调试

---

> 文档生成时间：2026-06-28
> 基于 LangGraph 开源代码库分析整理