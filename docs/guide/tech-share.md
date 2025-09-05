---
sidebar: false
footer: false
---

# 📖 漫谈 MCP

## 🚀 GitLab MCP 服务器 - 技术分享

## 🤖 什么是 MCP？

### MCP 就像是 AI 的"工具箱"

想象一下，你有一个很聪明的 AI 助手（比如 Claude），它可以帮你写代码、回答问题。但是这个助手只能在聊天框里跟你说话，不能直接帮你做实际的工作，比如：

- 查看公司的 GitLab 项目
- 修改代码文件
- 运行命令
- 访问数据库

**MCP 就是给 AI 助手配备的"工具箱"**，让它能够安全地使用各种工具和访问外部数据。

### 通俗的比喻：AI 助手的"手臂"

```typescript
// 没有 MCP 的 AI 助手
const aiAssistant = {
  canTalk: true,        // ✅ 能聊天
  canSeeFiles: false,   // ❌ 看不到文件
  canUseGitLab: false,  // ❌ 用不了 GitLab
  canRunCommands: false // ❌ 运行不了命令
};

// 有 MCP 的 AI 助手
const aiAssistantWithMCP = {
  canTalk: true,        // ✅ 能聊天
  canSeeFiles: true,    // ✅ 能通过 MCP 查看文件
  canUseGitLab: true,   // ✅ 能通过 MCP 使用 GitLab
  canRunCommands: true  // ✅ 能通过 MCP 运行命令
};
```

### MCP 解决的核心问题

**问题1：AI 助手"手无寸铁"**
- 传统 AI 只能聊天，不能干活
- 需要手动复制粘贴信息
- 效率低下，容易出错

**问题2：企业安全顾虑**
- AI 不能直接访问公司内网
- 数据安全和权限控制困难
- 企业不敢让 AI 连接内部系统

### MCP 的工作原理

```
你（开发者）     AI助手（Claude）     MCP服务器      GitLab服务器
     │                │                │                │
     │   "帮我查看项目A的分支"          │                │
     │───────────────▶│                │                │
     │                │   "需要调用GitLab工具"           │
     │                │───────────────▶│                │
     │                │                │   "查询分支信息"   │
     │                │                │───────────────▶│
     │                │                │   "返回分支数据"   │
     │                │◀───────────────│                │
     │                │   "分支信息：main, dev..."      │
     │   "分支信息：main, dev..."      │                │
     ◀───────────────│◀───────────────│                │
```

**简单来说：**
1. 你告诉 AI 助手想要做什么
2. AI 助手通过 MCP 协议调用相应的工具
3. MCP 服务器安全地执行操作并返回结果
4. AI 助手把结果告诉你

### MCP 的核心优势

- **🔐 安全第一**：企业可以精确控制 AI 能访问哪些数据
- **🏢 企业友好**：完美支持内网环境和私有化部署
- **⚡ 效率提升**：AI 可以直接帮你完成很多重复性工作
- **🔧 易扩展**：可以轻松添加新的工具和功能

### MCP 的传输方式

**MCP 官方支持的传输协议：**

#### 1. **Stdio 模式** - 标准输入输出
```typescript
// 最简单的集成方式，适合本地工具
const transport = new StdioServerTransport();
await server.connect(transport);
```
- ✅ **优点**：简单、无依赖、本地安全
- ❌ **缺点**：仅支持本地、无法远程访问
- 🎯 **适用场景**：桌面应用、命令行工具

#### 2. **Streamable HTTP 模式** - 可流式HTTP
```typescript
// 支持远程访问的现代化HTTP传输
const transport = new StreamableHTTPServerTransport();
await server.connect(transport);
```
- ✅ **优点**：支持远程访问、会话管理、现代HTTP特性
- ✅ **缺点**：需要服务器部署
- 🎯 **适用场景**：Web服务、远程工具、云部署

#### 3. **SSE 模式** - 服务器发送事件（已废弃）
```typescript
// 兼容性传输，已被Streamable HTTP替代
const transport = new SSEServerTransport('/messages', res);
await server.connect(transport);
```
- ⚠️ **状态**：已废弃，建议迁移到Streamable HTTP
- 📋 **用途**：向后兼容旧版本客户端

### MCP 与其他 Agent 协议的区别

**❌ 澄清一个误区：不是所有 Agent 都通过 MCP 实现**

```typescript
// MCP 只是众多协议中的一种
const agentProtocols = {
  mcp: "Model Context Protocol (Anthropic)",
  openai: "OpenAI Assistant API",
  langchain: "LangChain Agent Framework",
  llamaindex: "LlamaIndex RAG Framework",
  custom: "自定义 Agent 实现"
};
```

**MCP 的独特优势：**
- **🎯 标准化协议**：统一的接口标准，便于集成
- **🔒 企业友好**：特别适合内网和私有化部署
- **⚡ 高性能**：优化的通信协议和工具调用
- **🚀 易扩展**：插件化的工具系统

### 主流 Agent 实现方式对比

| 实现方式 | 代表 | 适用场景 | 是否基于MCP |
|---------|------|---------|-----------|
| **MCP协议** | Claude Desktop, Cursor | 工具集成, 企业内网 | ✅ 是 |
| **Assistant API** | ChatGPT Plugins | 通用工具集成 | ❌ 否 |
| **LangChain** | 各种Agent应用 | 复杂工作流 | ❌ 否 |
| **自定义框架** | 企业自研Agent | 特定业务需求 | ❌ 否 |

### MCP vs RAG：两种不同的技术方案

**RAG (Retrieval-Augmented Generation)** 和 **MCP (Model Context Protocol)** 是两种不同的 AI 增强技术：

#### 🔍 RAG：知识增强技术
```typescript
// RAG 的工作原理
const ragProcess = {
  // 1. 用户查询
  query: "如何部署这个项目？",

  // 2. 检索相关文档
  retrieval: "从知识库中找到部署文档",

  // 3. 增强生成回答
  generation: "基于检索到的文档生成准确回答"
};
```

**RAG 的特点：**
- **📚 知识库集成**：连接文档、数据库等知识源
- **🎯 准确性提升**：基于检索结果生成更准确的回答
- **🔄 实时更新**：知识库可以动态更新
- **📖 适用场景**：问答系统、文档助手

#### 🔧 MCP：工具调用协议
```typescript
// MCP 的工作原理
const mcpProcess = {
  // 1. 用户请求
  request: "帮我查看 GitLab 项目状态",

  // 2. 调用工具
  toolCall: "通过 MCP 协议调用 GitLab API",

  // 3. 执行操作
  execution: "安全地访问 GitLab 数据",

  // 4. 返回结果
  response: "项目状态信息"
};
```

**MCP 的特点：**
- **⚙️ 工具集成**：连接外部工具和服务
- **🏢 企业友好**：支持内网和私有化部署
- **🔒 安全控制**：精确的权限管理
- **🚀 实时交互**：可以执行实际操作

### 🤝 RAG 和 MCP 可以完美结合

**✅ 是的，它们不仅可以同时使用，而且相辅相成！**

```typescript
// RAG + MCP 的结合使用
const hybridAI = {
  // 使用 RAG 获取知识
  knowledge: "从文档库检索相关信息",

  // 使用 MCP 调用工具
  action: "执行实际操作",

  // 综合生成回答
  response: "基于知识和工具结果的完整回答"
};
```

## 🧠 什么是 Agent？Agent 与 MCP 的关系

### Agent 的定义和核心概念

**Agent (智能代理)** 是能够自主感知环境、做出决策并执行动作的智能实体。

```typescript
// Agent 的基本架构
interface Agent {
  // 感知能力 - 获取信息
  perceive(): EnvironmentState;

  // 推理能力 - 分析和决策
  reason(state: EnvironmentState): Action;

  // 执行能力 - 执行动作
  act(action: Action): Result;

  // 学习能力 - 从经验中改进
  learn(experience: Experience): void;
}
```

**Agent 的三大核心能力：**
- **🧠 自主性**：能够在没有人类干预的情况下独立工作
- **🎯 目标导向**：能够朝着特定目标采取行动
- **🔄 适应性**：能够根据环境变化调整行为

### Agent 的不同类型

#### 🤖 简单 Agent
```typescript
const simpleAgent = {
  input: "用户请求",
  process: "固定规则处理",
  output: "预定义响应"
};
```

#### 🧠 复杂 Agent（支持学习）
```typescript
const learningAgent = {
  input: "环境感知",
  process: "机器学习模型",
  output: "动态决策",
  learning: "持续改进"
};
```

### Agent 与 MCP 的关系

**MCP 是 Agent 的"工具调用协议"，不是 Agent 本身**

```typescript
// Agent 使用 MCP 的关系
const agentWithMCP = {
  // Agent 层 - 决策和推理
  agent: {
    goal: "完成用户任务",
    planning: "制定执行计划",
    reasoning: "分析当前状态"
  },

  // MCP 层 - 工具调用
  mcp: {
    protocol: "标准化通信",
    tools: "外部工具集成",
    security: "安全访问控制"
  },

  // 工具层 - 实际执行
  tools: ["GitLab API", "文件系统", "数据库"]
};
```

**关系总结：**
- **Agent 是"大脑"**：负责思考、决策、规划
- **MCP 是"神经系统"**：负责连接大脑和外部工具
- **工具是"肢体"**：负责实际执行操作

### Agent 与各种协议的关系

**🎯 Agent 是架构层，协议是通信层**

#### 1. Agent 使用 MCP 协议
```typescript
// Claude Desktop 中的 Agent + MCP
const claudeAgent = {
  agent: "Claude 的推理引擎",
  protocol: "MCP 协议",
  tools: ["文件编辑器", "终端", "浏览器"],
  workflow: "Agent 思考 → MCP 调用 → 工具执行"
};
```

#### 2. Agent 使用其他协议
```typescript
// 不同协议在 Agent 中的应用
const agentProtocols = {
  // 使用 MCP 进行工具调用
  mcp: "标准化工具集成协议",

  // 使用 RAG 进行知识检索
  rag: "检索增强生成技术",

  // 使用 LangChain 进行工作流编排
  langchain: "Agent 框架和工具链",

  // 使用自定义协议
  custom: "特定业务场景的专用协议"
};
```

#### 3. 混合协议架构
```typescript
// 现代 Agent 的混合架构
const modernAgent = {
  // 核心 Agent 引擎
  core: "推理和决策引擎",

  // 多种协议支持
  protocols: {
    mcp: "工具调用",
    rag: "知识检索",
    api: "服务集成",
    custom: "业务定制"
  },

  // 统一接口层
  interface: "协议适配器",

  // 工具生态
  tools: ["各种外部工具和服务"]
};
```

### Agent 的实现层次

**Agent 可以看作是一个分层架构：**

```
┌─────────────────┐
│   应用层 Agent    │ ← 业务逻辑、用户交互
├─────────────────┤
│   框架层 Agent    │ ← LangChain、LlamaIndex
├─────────────────┤
│   协议层          │ ← MCP、自定义协议
├─────────────────┤
│   工具层          │ ← API、文件系统、数据库
├─────────────────┤
│   基础设施层      │ ← 模型、计算资源
└─────────────────┘
```

### Agent 与 MCP 的实际应用场景

#### 📋 场景1：代码开发助手
```
开发者: "帮我优化这个函数"
      ↓
Agent: 分析代码，制定优化计划
      ↓
MCP: 调用代码分析工具
      ↓
工具: 执行代码分析和优化
      ↓
Agent: 基于结果生成建议
```

#### 🚀 场景2：项目管理助手
```
用户: "准备项目部署"
      ↓
Agent: 检查部署条件，制定部署计划
      ↓
MCP: 调用 GitLab API 和 CI/CD 工具
      ↓
工具: 执行自动化部署流程
      ↓
Agent: 监控部署状态并报告结果
```

### Agent 生态的发展趋势

**🔮 未来 Agent 将朝着混合化、标准化方向发展：**

1. **🎯 协议标准化**：MCP 等协议成为主流
2. **🔧 工具生态化**：丰富的工具和插件生态
3. **🧠 推理增强**：更强的推理和规划能力
4. **🏢 企业友好**：更好的安全和合规支持

### 总结：Agent、MCP 和协议的关系

- **Agent** 是智能实体，能够自主决策和执行任务
- **MCP** 是 Agent 连接外部工具的标准协议
- **协议** 是 Agent 与外部世界通信的桥梁
- **Agent 可以同时使用多种协议**，根据任务需求选择最适合的工具

**最终，Agent 是"指挥官"，协议是"通信兵"，工具是"执行者"**，它们协同工作构建完整的AI应用生态。

### 为什么选择 MCP？

**MCP 的核心价值在于标准化和安全性：**

1. **🔧 统一的工具接口**：不管什么工具，都用同样的方式调用
2. **🏢 企业级安全**：精确的权限控制和数据隔离
3. **⚙️ 易于维护**：标准化的协议减少集成成本
4. **🚀 持续演进**：Anthropic 持续改进协议标准

### 为什么需要 GitLab MCP 服务器？

**GitLab 是开发者的"工作台"**，包含了：
- 项目代码和分支
- 问题跟踪和合并请求
- CI/CD 流水线
- 团队协作信息

**MCP 是 AI 助手的"工具箱"**，让 AI 能够调用各种外部工具和服务。

> **📖 面向对象**：想要开发 MCP 服务器的开发者
>
> 本文档深入介绍 MCP 协议的核心概念，通过 GitLab 项目演示开发全流程。

## 🎯 GitLab 项目演示

### 为什么选择 GitLab 作为演示案例？

我们选择 GitLab 作为 MCP 开发的演示案例，因为：

- **📚 丰富的 API**：GitLab 提供了完整的 REST API，便于展示 MCP 工具调用
- **🏢 企业级应用**：代表了典型的企业级工具集成场景
- **🔒 权限管理**：展示了 MCP 在企业环境中的安全控制
- **🚀 实用价值**：开发者日常工作中常用的工具

## 🏗️ MCP 开发技术栈

### MCP SDK 核心使用

```typescript
// 1. 创建 MCP 服务器实例
const server = new Server(
  {
    name: "gitlab-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 2. 注册工具
server.setRequestHandler("tools/call", async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "list_projects":
      // 调用 GitLab API 获取项目列表
      const projects = await getGitLabProjects();
      return {
        content: [{ type: "text", text: formatProjectsList(projects) }]
      };
    case "get_project_by_name":
      // 根据项目名搜索项目
      const project = await getProjectByName(args.projectName);
      return {
        content: [{ type: "text", text: formatProjectInfo(project) }]
      };
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// 3. 连接传输层
const transport = new StdioServerTransport();
await server.connect(transport);
```

### MCP 开发必备工具

```json
{
  "核心依赖": {
    "@modelcontextprotocol/sdk": "^1.17.1",
    "zod": "^3.23.8"
  },
  "开发工具": {
    "typescript": "^5.3.0",
    "tsx": "^4.7.0"
  },
  "传输层": {
    "stdio": "内置支持",
    "http": "可选扩展"
  }
}
```

**MCP 开发三要素：**
- **📦 SDK**：官方协议实现库
- **🔧 工具**：你的业务逻辑封装
- **🌐 传输**：连接 AI 助手和服务器

## 🏛️ MCP 通用架构模式

### MCP 服务器的标准架构

```
┌─────────────────┐
│   AI 助手         │ ← Claude、Cursor 等
├─────────────────┤
│   MCP 协议层      │ ← 标准化通信协议
├─────────────────┤
│   工具层          │ ← 你的业务工具实现
├─────────────────┤
│   外部服务        │ ← GitLab、数据库等
└─────────────────┘
```

### MCP 开发的核心原则

- **🎯 协议标准化**：使用官方 SDK，确保协议兼容性
- **🔧 工具解耦**：业务逻辑与协议逻辑分离
- **🌐 传输灵活**：支持多种传输方式（Stdio/HTTP）
- **📦 模块化设计**：每个工具都是独立的模块

## 🔧 MCP 开发关键技术

### 工具定义与注册

```typescript
// 1. 定义工具接口
interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, any>;
  };
}

// 2. 实现工具逻辑 - 基于实际的 GitLab 工具
const listProjectsTool: Tool = {
  name: "list_projects",
  description: "获取当前GitLab实例中所有可访问的项目列表",
  inputSchema: {
    type: "object",
    properties: {}
  }
};

const getProjectByNameTool: Tool = {
  name: "get_project_by_name",
  description: "通过项目名称或命名空间搜索GitLab项目",
  inputSchema: {
    type: "object",
    properties: {
      projectName: {
        type: "string",
        description: "项目名称或命名空间，如 'myproject' 或 'group/project'"
      }
    }
  }
};

// 3. 注册到 MCP 服务器
server.setRequestHandler("tools/list", async () => {
  return {
    tools: [listProjectsTool, getProjectByNameTool]
  };
});

server.setRequestHandler("tools/call", async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "list_projects":
      const projects = await getGitLabProjects();
      return {
        content: [{ type: "text", text: formatProjectsList(projects) }]
      };
    case "get_project_by_name":
      const project = await getProjectByName(args.projectName);
      return {
        content: [{ type: "text", text: project ? formatProjectInfo(project) : "项目未找到" }]
      };
  }
});
```

### 传输层选择策略

**Stdio 模式（推荐开发）**
```typescript
// 最简单的集成方式，适合本地开发和测试
const transport = new StdioServerTransport();
await server.connect(transport);
```
- ✅ **开发友好**：启动快，调试容易
- ✅ **资源节省**：无网络开销
- ❌ **部署限制**：只能本地使用

**HTTP 模式（推荐生产）**
```typescript
// 支持远程访问，适合生产环境
const transport = new StreamableHTTPServerTransport({
  port: 3000,
  endpoint: "/mcp"
});
await server.connect(transport);
```
- ✅ **远程访问**：支持网络调用
- ✅ **扩展性好**：可水平扩展
- ❌ **配置复杂**：需要网络配置

## 🎨 MCP 开发最佳实践

### MCP 项目结构建议

```typescript
// 基于实际 GitLab MCP 项目的结构
src/
├── index.ts              // 主入口文件
├── http-server.ts        // HTTP 服务器（可选）
├── mcp/
│   └── register-tools.ts // 工具注册中心
├── services/             // 业务逻辑层
│   ├── index.ts          // 服务导出
│   ├── gitlab.ts         // GitLab API 调用
│   └── config.ts         // 配置服务
├── types/                // 类型定义
│   ├── index.ts          // 类型导出
│   ├── gitlab.ts         // GitLab 相关类型
│   └── config.ts         // 配置类型
└── utils/                // 工具函数
    ├── index.ts          // 工具导出
    └── format.ts         // 格式化工具
```

### 开发流程规范

**1️⃣ 工具设计阶段**
```typescript
// 先定义工具接口，确保设计合理
interface GitLabTool {
  name: "list_projects" | "get_project_by_name";
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, any>;
  };
}
```

**2️⃣ 协议实现阶段**
```typescript
// 使用官方 SDK 实现协议
server.registerTool(
  "list_projects",
  {
    title: "获取GitLab项目列表",
    description: "获取当前GitLab实例中所有可访问的项目列表",
    inputSchema: {}
  },
  async () => {
    const projects = await getGitLabProjects();
    return {
      content: [{ type: "text", text: formatProjectsList(projects) }]
    };
  }
);
```

**3️⃣ 测试验证阶段**
```typescript
// 确保工具能正确响应
const response = await callTool("list_projects", {});
console.log(response); // 验证输出格式和数据结构
```

### 常见错误处理模式

```typescript
// 基于实际 GitLab 项目的错误处理
enum GitLabErrorType {
  NETWORK_ERROR = '网络连接错误',
  AUTH_ERROR = '认证失败',
  PERMISSION_ERROR = '权限不足',
  API_LIMIT_ERROR = 'API限流',
  NOT_FOUND_ERROR = '资源不存在'
}

function handleGitLabError(error: any): string {
  // 错误分类处理
  if (error.response?.status === 401) {
    return "❌ 认证失败：请检查 GitLab Token 是否正确设置";
  }
  if (error.response?.status === 403) {
    return "🚫 权限不足：你没有访问该资源的权限";
  }
  if (error.response?.status === 404) {
    return "🔍 资源不存在：请检查项目名称或路径是否正确";
  }
  if (error.response?.status === 429) {
    return "⏱️ API限流：请求过于频繁，请稍后再试";
  }

  return `❌ 未知错误：${error.message}`;
}

// 在工具中使用错误处理
server.registerTool("list_projects", {...}, async () => {
  try {
    const projects = await getGitLabProjects();
    return {
      content: [{ type: "text", text: formatProjectsList(projects) }]
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: handleGitLabError(error) }]
    };
  }
});
```

## 🚀 MCP 部署模式

### 本地开发模式

```bash
# 1. 安装依赖
yarn install

# 2. 设置环境变量
export GITLAB_TOKEN=your_gitlab_token
export GITLAB_URL=https://gitlab.com

# 3. 构建项目
yarn build

# 4. 启动 MCP 服务器
yarn start

# 5. 配置 AI 工具
# 在 Cursor 或 Claude Desktop 中配置 MCP 服务器路径
# 路径指向: /path/to/gitlab-mcp-server/dist/index.js
```

### 云端部署模式

```typescript
// HTTP 服务器模式部署
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

const server = new Server({...});
const transport = new SSEServerTransport("/sse", response);
await server.connect(transport);
```

### 部署平台推荐

- **Vercel**：快速部署 HTTP 模式的 MCP 服务器
- **Railway**：支持持久运行的云服务
- **Fly.io**：全球 CDN，适合低延迟需求
- **自托管**：企业内网环境下的私有部署

## ☁️ MCP 托管平台

### 常见的 MCP 托管平台

#### 1. **Vercel** - 前端云平台（推荐新手）
```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署到 Vercel
vercel --prod

# 配置环境变量
vercel env add GITLAB_TOKEN
vercel env add GITLAB_URL
```

**优点：**
- ✅ 免费额度充足（每月 100GB 流量）
- ✅ 自动HTTPS和全球CDN
- ✅ Git集成，自动部署
- ✅ 支持Node.js原生

#### 2. **Railway** - 现代化应用平台
```bash
# Railway CLI 安装
npm install -g @railway/cli

# 登录并部署
railway login
railway init
railway up
```

**优点：**
- ✅ 自动检测项目类型
- ✅ 内置数据库支持
- ✅ 简单的环境变量管理
- ✅ 按使用量计费，性价比高

#### 3. **Render** - 云应用平台
```yaml
# render.yaml
services:
  - type: web
    name: gitlab-mcp-server
    runtime: node
    buildCommand: yarn build
    startCommand: yarn start:http
    envVars:
      - key: GITLAB_TOKEN
        value: your-token
      - key: GITLAB_URL
        value: https://gitlab.com
```

**优点：**
- ✅ 750小时/月的免费额度
- ✅ 支持Docker和原生部署
- ✅ 自动SSL证书
- ✅ 简单的Web界面管理

#### 4. **Fly.io** - 边缘计算平台
```toml
# fly.toml
app = "gitlab-mcp-server"

[build]
  builder = "paketobuildpacks/builder:base"
  buildpacks = ["gcr.io/paketo-buildpacks/nodejs"]

[http_service]
  internal_port = 3000
  force_https = true
```

```bash
# 部署命令
fly launch
fly deploy
```

**优点：**
- ✅ 全球160个数据中心
- ✅ 低延迟访问
- ✅ Docker原生支持
- ✅ 按实际使用计费

### Docker 容器化部署

#### 通用 Docker 部署
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN yarn install --production
COPY . .
RUN yarn build
EXPOSE 3000
CMD ["yarn", "start:http"]
```

**支持 Docker 的平台：**
- **Railway** - 自动检测
- **Render** - 支持Dockerfile
- **Fly.io** - 原生Docker支持
- **Google Cloud Run** - 容器即服务
- **AWS ECS/Fargate** - 容器编排

### 企业级部署选项

#### AWS Lambda + API Gateway
```yaml
# serverless.yml 示例
service: gitlab-mcp-server

provider:
  name: aws
  runtime: nodejs18.x
  environment:
    GITLAB_TOKEN: ${env:GITLAB_TOKEN}
    GITLAB_URL: ${env:GITLAB_URL}

functions:
  mcpHandler:
    handler: dist/http-server.serverlessHandler
    events:
      - http:
          path: /mcp
          method: post
          cors: true
```

```typescript
// http-server.ts 中的 serverless 导出
export const serverlessHandler = async (event, context) => {
  // 处理 Lambda 事件
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "MCP response" })
  };
};
```

### 托管平台对比

| 平台 | 免费额度 | 部署复杂度 | 扩展性 | 推荐指数 |
|------|---------|-----------|--------|---------|
| **Vercel** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Railway** | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Render** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Fly.io** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **AWS** | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

### 选择建议

**个人开发者/小型项目：**
- 🚀 **Vercel** - 简单快速，免费额度充足
- 🎯 **Railway** - 现代化，自动检测项目

**团队/企业应用：**
- 🏢 **Render** - 稳定的免费层级
- 🌍 **Fly.io** - 全球化的低延迟服务

**生产环境：**
- ☁️ **AWS/GCP/Azure** - 企业级功能和支持

## 💡 总结与启发

### MCP 的核心价值

**MCP 不只是工具调用协议，更是：**

- **🔗 标准化桥梁**：连接 AI 与外部世界的统一接口
- **🏢 企业友好**：完美适配企业内网和安全需求
- **🚀 效率倍增**：让 AI 助手成为真正强大的生产力工具
- **🌟 生态基础**：构建 AI 应用新生态的基石

### MCP 开发的心得体会

1. **🎯 协议思维**：优先选择标准协议，专注业务逻辑而非底层通信
2. **🔧 工具抽象**：将复杂业务逻辑封装为标准化的可调用工具
3. **🌐 传输选择**：根据场景选择合适的传输方式（Stdio/HTTP）
4. **📦 渐进开发**：从小工具开始，逐步构建完整的 MCP 应用

### MCP 技术的未来展望

- **🤖 Agent 生态**：更多智能体基于 MCP 构建
- **🔧 工具生态**：丰富的预制工具满足各种业务需求
- **🏢 企业应用**：在企业环境中发挥更大价值
- **🚀 性能优化**：更高效的通信协议和工具调用

---

**🎉 欢迎交流**：如果你对 MCP 协议、GitLab API 集成或相关技术感兴趣，欢迎在项目中提出 Issue 或提交 PR 让我们一起探讨和改进！
