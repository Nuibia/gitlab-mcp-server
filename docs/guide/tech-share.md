---
sidebar: false
footer: false
---

# 📖 漫谈 MCP

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

## 🚨 为什么需要 MCP？

### MCP 出现之前的 AI Agent 世界

在 MCP 出现之前，AI Agent（智能代理）是如何工作的？为什么我们需要 MCP？

#### 🤖 传统 AI Agent 的工作方式

**API 集成模式**：AI 只能调用预先定义好的 API 接口，每个工具都需要单独编写适配器代码。想集成 GitLab？写一个 GitLab 适配器。想集成 Slack？再写一个 Slack 适配器。随着工具数量增加，适配器代码呈指数级增长。

**手动操作模式**：AI 只能提供建议，无法直接执行操作。开发者需要手动复制代码片段到聊天框，等待 AI 分析，然后复制 AI 的建议再手动执行。这种工作模式效率低下，容易出错，上下文也经常丢失。

#### 🏢 企业集成难题

**安全挑战**：AI 直接访问公司内网数据库，难以满足企业安全审计要求。数据泄露风险高，权限控制困难。

**合规问题**：无法追踪 AI 的操作记录，难以满足企业合规要求。

**扩展困境**：每个新工具都需要重新编写适配器，维护成本随着工具数量线性增长。

**实际工作流程**：发现问题 → 手动查询 → 复制结果 → 发送给 AI → 等待建议 → 手动执行修复。整个过程繁琐且低效。

### MCP 解决的核心问题

**问题1：AI 助手"手无寸铁"**
- 传统 AI 只能聊天，不能干活
- 需要手动复制粘贴信息
- 效率低下，容易出错

**问题2：企业安全顾虑**
- AI 不能直接访问公司内网
- 数据安全和权限控制困难
- 企业不敢让 AI 连接内部系统

**问题3：集成复杂度高**
- 每个工具都需要单独的适配器代码
- 难以扩展新的工具和服务
- 维护成本随着工具数量呈指数增长

#### 🎯 MCP 的核心创新

**标准化协议**：MCP 定义了统一的工具接口规范，所有工具都使用相同的调用方式。无论是 GitLab、Slack 还是数据库，都遵循相同的协议标准，无需为每个工具编写专门的适配器。

**安全隔离**：每个 MCP 工具运行在独立的进程中，具有精确的权限控制。AI 无法直接访问系统资源，一切操作都有完整的审计日志，符合企业安全标准。

**即插即用**：添加新工具就像安装手机 App 一样简单。通过配置文件就能集成新工具，无需修改 AI Agent 的核心代码，扩展性极强。

#### 🚀 MCP 带来的改变

| 方面 | MCP 之前 | MCP 之后 |
|------|---------|---------|
| **集成方式** | 为每个工具写适配器 | 统一协议接口 |
| **安全性** | AI 直接访问系统 | 进程隔离 + 权限控制 |
| **扩展性** | 代码修改 + 重部署 | 配置文件更新 |
| **维护成本** | O(n) - 随工具数量线性增长 | O(1) - 协议标准化 |
| **用户体验** | 手动复制粘贴 | AI 直接执行操作 |

**MCP 本质上就是给 AI Agent 配备了"操作系统"，让它能够安全、高效地使用各种工具和服务。**

## 🛠️ 如何使用 MCP？

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

### MCP 与其他技术的关系

**MCP vs RAG**：RAG 主要用于知识检索增强，让 AI 更"聪明"。MCP 主要用于工具调用，让 AI 更"能干"。两者可以结合使用，构建更强大的 AI 系统。

### Agent 与 MCP 的关系

**Agent (智能代理)** 是能够自主决策和执行任务的智能实体，而 **MCP 是 Agent 连接外部工具的标准协议**。

**三层架构关系：**
- **🧠 Agent 层**：负责思考、决策、规划（大脑）
- **🌐 MCP 层**：负责标准化通信和安全控制（神经系统）
- **🔧 工具层**：负责实际执行操作（肢体）

**MCP 让 Agent 变得更强大**：Agent 负责"想什么"，MCP 负责"怎么做"，工具负责"做什么"。



## 🎯 GitLab 项目演示

### 🎯 gitlab-mcp-server 项目介绍

本项目是一个完整的 **GitLab MCP 服务器** 实现，为 MCP 开发提供了最佳实践示例：

**📍 项目地址**: `gitlab-mcp-server/`

**🔧 核心功能**:
- 🔍 **项目列表查询**：获取 GitLab 实例中的所有项目信息
- 🌿 **分支搜索**：按分支名搜索项目，支持模糊匹配
- 🧭 **项目详情**：通过项目名精确搜索项目信息
- 🌐 **双传输模式**：支持 Stdio 和 HTTP 两种传输方式

**🏗️ 技术架构**:
```typescript
// 项目结构层次
gitlab-mcp-server/
├── src/
│   ├── index.ts              // Stdio 服务器入口
│   ├── http-server.ts        // HTTP 服务器入口
│   ├── mcp/register-tools.ts // 工具注册中心
│   ├── services/gitlab.ts    // GitLab API 封装
│   ├── types/gitlab.ts       // 类型定义
│   └── utils/format.ts       // 数据格式化工具
```

### 为什么选择 GitLab 作为演示案例？

我们选择 GitLab 作为 MCP 开发的演示案例，因为：

- **📚 丰富的 API**：GitLab 提供了完整的 REST API，便于展示 MCP 工具调用
- **🏢 企业级应用**：代表了典型的企业级工具集成场景
- **🔒 权限管理**：展示了 MCP 在企业环境中的安全控制
- **🚀 实用价值**：开发者日常工作中常用的工具


## 🏗️ MCP 开发技术栈

### MCP SDK 核心使用

基于 `gitlab-mcp-server` 项目的实际实现：

```typescript
// 基于实际项目的服务器创建代码 (src/index.ts)
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// 1. 创建 MCP 服务器实例
const server = new Server(
  {
    name: "gitlab-mcp-server", // 项目名称
    version: "1.0.0",          // 版本号
  },
  {
    capabilities: {
      tools: {}, // 支持工具调用
    },
  }
);

// 2. 注册工具处理器 (实际代码在 src/mcp/register-tools.ts)

// 新
server.registerTool(
  "list_projects",
  {
    title: "获取GitLab项目列表",
   description: "获取当前GitLab实例中所有可访问的项目列表...",
    inputSchema: {}
  },
  async () => {
    const projects = await getGitLabProjects(sessionId);
    return generateProjectsListText(projects);
  }
);

// 老
server.setRequestHandler("tools/list", async () => {
  return {
    tools: [
      {
        name: "list_projects",
        description: "获取当前GitLab实例中所有可访问的项目列表",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "get_project_by_name",
        description: "通过项目名称搜索GitLab项目",
        inputSchema: {
          type: "object",
          properties: {
            projectName: { type: "string", description: "项目名称" }
          }
        }
      }
    ]
  };
});

// 3. 连接传输层
const transport = new StdioServerTransport();
await server.connect(transport);
```

**📁 实际项目文件对照**:
- **服务器入口**: `src/index.ts` - Stdio 模式启动
- **HTTP入口**: `src/http-server.ts` - HTTP 模式启动
- **工具注册**: `src/mcp/register-tools.ts` - 统一注册所有工具
- **业务逻辑**: `src/services/gitlab.ts` - GitLab API 封装

### MCP 开发必备工具

基于 `gitlab-mcp-server` 项目的实际依赖配置：

```json
{
  "核心依赖": {
    "@modelcontextprotocol/sdk": "^1.17.1",  // MCP 官方 SDK
    "zod": "^3.23.8",                        // 运行时类型验证
    "axios": "^1.6.0"                        // HTTP 客户端（GitLab API调用）
  },
  "Web服务器": {
    "express": "^4.18.2",                    // HTTP 模式服务器
    "cors": "^2.8.5"                         // 跨域处理
  },
  "开发工具": {
    "typescript": "^5.3.0",                  // 类型安全开发
    "tsx": "^4.6.0",                         // TypeScript 执行器
    "nodemon": "^3.0.1"                      // 开发热重载
  },
  "文档工具": {
    "vitepress": "^1.3.0"                    // 项目文档
  },
  "传输层": {
    "stdio": "内置支持 (src/index.ts)",
    "http": "Express实现 (src/http-server.ts)"
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

**📁 相关文件对照**:
- **工具注册**: `src/mcp/register-tools.ts` - 统一注册所有工具
- **业务逻辑**: `src/services/gitlab.ts` - GitLab API 调用
- **格式化工具**: `src/utils/format.ts` - 响应数据格式化

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

根据部署环境选择合适的传输方式：

- **开发环境**：推荐使用 Stdio 模式，启动快便于调试
- **生产环境**：推荐使用 HTTP 模式，支持远程访问和扩展

## 🎨 MCP 开发最佳实践

### MCP 项目结构建议

**🏗️ 核心架构原则**:
- **services/**：业务逻辑和外部API调用
- **utils/**：纯函数和数据处理工具
- **types/**：TypeScript类型定义
- **mcp/**：MCP协议相关逻辑

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

基于 `gitlab-mcp-server` 项目的实际部署步骤：

```bash
# 1. 安装依赖
yarn install

# 2. 设置环境变量 (至少需要 GITLAB_TOKEN)
export GITLAB_TOKEN=glpat_xxx  # GitLab Personal Access Token
export GITLAB_URL=https://gitlab.com  # GitLab 实例地址
export PORT=3000  # HTTP 模式端口（可选）

# 3. 开发模式启动
# Stdio 模式（推荐）
yarn dev

# 或 HTTP 模式
yarn http:dev

# 4. 生产模式部署
yarn build && yarn start  # Stdio 模式
yarn build && yarn http   # HTTP 模式
```

**🔧 必需配置**:
- **GITLAB_TOKEN**: 具有 `read_api` 权限的 Personal Access Token
- **GITLAB_URL**: GitLab 实例地址（默认为 `https://gitlab.com`）

**📋 配置示例**:

在 Claude Desktop 的配置文件中添加以下任一配置：

```json
{
  "mcpServers": {
    // 方式1：使用编译后的文件（推荐生产环境）
    "gitlab-node": {
      "command": "node",
      "args": ["/path/to/gitlab-mcp-server/dist/index.js"],
      "env": {
        "GITLAB_URL": "https://your-gitlab-instance.com",
        "GITLAB_TOKEN": "your-gitlab-token-here"
      }
    },

    // 方式2：使用 tsx 直接运行源码（适合开发调试）
    "gitlab-tsx": {
      "command": "npx",
      "args": ["tsx", "/path/to/gitlab-mcp-server/src/index.ts"],
      "env": {
        "GITLAB_URL": "https://your-gitlab-instance.com",
        "GITLAB_TOKEN": "your-gitlab-token-here"
      }
    },

    // 方式3：HTTP 模式（支持远程部署）
    "gitlab-http": {
      "transport": "http",
      "url": "http://localhost:3000/mcp",
      "env": {
        "GITLAB_URL": "https://your-gitlab-instance.com",
        "GITLAB_TOKEN": "your-gitlab-token-here"
      }
    }
  }
}
```

**🔄 配置说明**:
- **方式1**: 最稳定，适合生产环境，需要先运行 `yarn build`
- **方式2**: 开发友好，支持热重载，无需编译
- **方式3**: 支持远程访问，需要先启动 HTTP 服务器 `yarn http:dev`

**💡 快速配置步骤**:
1. **获取 GitLab Token**: 登录 GitLab → Settings → Access Tokens → 创建具有 `read_api` 权限的 token
2. **复制配置文件**: 根据使用的 AI 工具编辑相应的配置文件
3. **替换路径和凭据**: 将 `/path/to/gitlab-mcp-server` 替换为实际项目路径
4. **重启 AI 工具**: 配置完成后重启 Claude Desktop 或 Cursor 以生效

**📝 配置文件位置**:
- **Claude Desktop**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Cursor**: `.cursorrules` 或项目级的 `.cursor/mcp.json`

**🖥️ Cursor 配置示例**:

在项目根目录创建 `.cursor/mcp.json` 文件：

```json
{
  "mcpServers": {
    "gitlab": {
      "command": "npx",
      "args": ["tsx", "src/index.ts"],
      "env": {
        "GITLAB_URL": "https://your-gitlab-instance.com",
        "GITLAB_TOKEN": "your-gitlab-token-here"
      }
    }
  }
}
```

或者在 `.cursorrules` 文件中添加：

```json
{
  "mcp": {
    "gitlab": {
      "command": "npx",
      "args": ["tsx", "src/index.ts"],
      "env": {
        "GITLAB_URL": "https://your-gitlab-instance.com",
        "GITLAB_TOKEN": "your-gitlab-token-here"
      }
    }
  }
}
```

**🧪 配置验证**:

配置完成后，可以通过以下方式验证 MCP 服务器是否正常工作：

1. **重启 AI 工具**：Claude Desktop 或 Cursor
2. **测试工具调用**：在对话中询问 "帮我查看 GitLab 项目列表"
3. **检查错误日志**：如果连接失败，检查控制台错误信息

### 自托管部署（推荐）

既然你们有自己的云服务器，**自托管是最佳选择**！

**🚀 部署到你的云服务器：**

```bash
# 1. 上传项目到服务器
scp -r gitlab-mcp-server user@your-server:/path/to/

# 2. 在服务器上安装依赖
cd /path/to/gitlab-mcp-server
yarn install

# 3. 配置环境变量
export GITLAB_TOKEN=your_gitlab_token
export GITLAB_URL=https://your-gitlab-instance.com
export PORT=3000

# 4. 构建项目
yarn build

# 5. 启动服务
yarn http    # HTTP 模式，适合远程访问
```

**🔧 使用 PM2 管理进程（生产环境推荐）：**
```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start yarn --name "gitlab-mcp" -- http

# 设置开机自启
pm2 startup
pm2 save

# 查看状态
pm2 status
pm2 logs gitlab-mcp
```

**🐳 Docker 容器化部署：**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN yarn install --production
COPY . .
RUN yarn build
EXPOSE 3000
CMD ["yarn", "http"]
```

```bash
# 构建镜像
docker build -t gitlab-mcp-server .

# 运行容器
docker run -d \
  --name gitlab-mcp \
  -p 3000:3000 \
  -e GITLAB_TOKEN=your_token \
  -e GITLAB_URL=https://your-gitlab.com \
  gitlab-mcp-server
```

**💡 自托管的优势：**
- 🚀 **完全控制**：自定义配置和安全策略
- ⚡ **最低延迟**：内网访问，无网络开销
- 🔒 **数据安全**：敏感数据留在你的服务器
- 📊 **资源优化**：根据实际需求配置资源

### 🔗 推荐的 MCP 服务资源

**📚 MCP 服务器精选合集：**
- **[Awesome MCP Servers](https://github.com/punkpeye/awesome-mcp-servers)** ⭐⭐⭐⭐⭐ - 最全面的 MCP 服务器收集，包含 1000+ 项目
- **[Glama.ai MCP](https://glama.ai/mcp/servers)** - MCP 服务器目录和客户端

**🏢 官方与主流平台：**
- **[Anthropic MCP](https://modelcontextprotocol.io/)** - 官方协议和文档
- **[Cursor MCP](https://docs.cursor.com/zh/context/mcp)** - Cursor 内置 MCP 支持
- **[Claude Desktop](https://docs.anthropic.com/claude/docs/desktop-mcp)** - Claude 官方 MCP 集成

**🔧 核心 MCP 工具：**
- **[MCP SDK](https://www.npmjs.com/package/@modelcontextprotocol/sdk)** - 官方开发工具包
- **[MCP Inspector](https://github.com/modelcontextprotocol/inspector)** - MCP 服务器调试工具

**🌟 热门 MCP 服务器项目：**
- **[GitHub MCP Server](https://github.com/github/github-mcp-server)** - GitHub 集成
- **[mcp-server-git](https://github.com/modelcontextprotocol/server-git)** - Git 仓库管理
- **[mcp-server-filesystem](https://github.com/modelcontextprotocol/server-filesystem)** - 文件系统操作
- **[Slack MCP Server](https://github.com/slack-mcp/server)** - Slack 协作工具
- **[Notion MCP Server](https://github.com/notion-mcp/server)** - Notion 文档管理

**🎯 MCP 开发框架：**
- **[FastMCP](https://fastmcp.com/)** - Python/TypeScript 高性能 MCP 框架
- **[MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk)** - Python 官方 SDK

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
