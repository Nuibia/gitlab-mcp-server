# GitLab MCP 服务器项目总结

## 项目概述

这是一个基于TypeScript的Model Context Protocol (MCP) 服务器，专门用于管理GitLab项目。项目采用现代化的架构设计，使用最新的MCP SDK，提供了简洁易用的GitLab项目管理功能。

## 核心特性

### ✅ 已完成功能

1. **项目列表查看** (`list_projects`)
   - 获取GitLab实例中的所有项目
   - 显示项目详细信息（名称、描述、可见性、星标数、分支数等）
   - 格式化输出，便于阅读

2. **现代化架构**
   - 基于TypeScript，类型安全
   - 使用最新的MCP SDK
   - 支持ES模块
   - 模块化设计，共享工具函数
   - 完整的错误处理和日志记录

3. **开发友好**
   - 热重载开发模式
   - 智能构建（自动清理旧文件）
   - 详细的错误信息
   - 完整的文档和示例

4. **内网支持**
   - HTTP服务器模式
   - 代理支持
   - SSL证书验证配置
   - 内网访问优化

## 技术栈

- **TypeScript**: 类型安全的JavaScript
- **MCP SDK**: Model Context Protocol官方SDK
- **Axios**: HTTP客户端
- **Express**: Web框架（HTTP服务器）
- **Dotenv**: 环境变量管理

## 项目结构

```
gitlab-mcp-server/
├── src/
│   ├── utils.ts          # 共享工具函数
│   │   ├── GitLab API配置和认证
│   │   ├── Axios实例创建（支持代理和SSL）
│   │   ├── 项目数据格式化
│   │   └── 错误处理
│   ├── index.ts          # Stdio服务器实现
│   └── http-server.ts    # HTTP服务器实现
├── dist/                 # 构建输出目录
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript配置
├── env.example           # 环境变量示例
├── test-http-client.js   # HTTP客户端测试脚本
├── test-server.js        # 服务器测试脚本
├── README.md            # 项目说明
├── USAGE.md             # 使用指南
├── HTTP_SERVER_GUIDE.md # HTTP服务器指南
├── INTRANET_GUIDE.md    # 内网访问指南
└── SUMMARY.md           # 项目总结
```

## 核心代码

### 共享工具函数 (`src/utils.ts`)

```typescript
import axios from "axios";
import https from "https";
import dotenv from "dotenv";

// 加载环境变量
dotenv.config();

// GitLab API配置
export const GITLAB_URL = process.env.GITLAB_URL || "https://gitlab.xiaomawang.com/";
export const GITLAB_TOKEN = process.env.GITLAB_TOKEN;

// 检查GitLab token
export function checkGitLabToken() {
  if (!GITLAB_TOKEN) {
    console.error("错误: 请设置GITLAB_TOKEN环境变量");
    process.exit(1);
  }
}

// 创建axios实例，支持内网访问
export function createAxiosInstance() {
  // 支持代理和SSL配置
}

// 格式化项目信息
export function formatProjects(projects: GitLabProject[]) {
  // 格式化项目数据
}

// 处理GitLab API错误
export function handleGitLabError(error: any) {
  // 统一的错误处理
}
```

### 主服务器实现 (`src/index.ts`)

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { 
  GITLAB_URL, 
  checkGitLabToken, 
  createAxiosInstance, 
  formatProjects, 
  handleGitLabError 
} from "./utils.js";

// 检查GitLab token
checkGitLabToken();

// 创建MCP服务器
const server = new McpServer({
  name: "gitlab-mcp-server",
  version: "1.0.0"
});

// 注册GitLab项目列表工具
server.registerTool(
  "list_projects",
  {
    title: "GitLab项目列表",
    description: "获取所有GitLab项目列表",
    inputSchema: {}
  },
  async () => {
    // 使用共享工具函数实现GitLab API调用和数据处理
  }
);
```

## 使用方法

### 1. 安装和配置

```bash
# 安装依赖
yarn install

# 配置环境变量
cp env.example .env
# 编辑 .env 文件，设置 GITLAB_TOKEN

# 构建项目（自动清理旧文件）
yarn build
```

### 2. 运行服务器

```bash
# 开发模式
yarn dev

# 生产模式
yarn start

# HTTP服务器模式（推荐用于内网）
yarn http:dev
```

### 3. 作为MCP客户端使用

```json
{
  "mcpServers": {
    "gitlab": {
      "command": "node",
      "args": ["/path/to/gitlab-mcp-server/dist/index.js"],
      "env": {
        "GITLAB_URL": "https://gitlab.com",
        "GITLAB_TOKEN": "your_token_here"
      }
    }
  }
}
```

## 示例输出

```
✅ 成功获取到 3 个项目:

📁 **username/my-project**
   - 描述: 这是一个示例项目
   - 可见性: private
   - 默认分支: main
   - 星标: 3 | 分支: 1
   - 链接: https://gitlab.com/username/my-project
   - 最后更新: 2024/1/15 14:30:25
```

## 扩展性

项目设计具有良好的扩展性，可以轻松添加新的GitLab功能：

1. **添加新工具**: 使用 `server.registerTool()` 注册新工具
2. **共享工具函数**: 在 `src/utils.ts` 中添加新的工具函数
3. **API集成**: 利用现有的axios配置和错误处理
4. **类型安全**: 使用TypeScript进行类型验证

### 扩展示例

```typescript
// 在 src/utils.ts 中添加新的工具函数
export async function getProjectDetails(projectId: number) {
  const axiosInstance = createAxiosInstance();
  const response = await axiosInstance.get(`${GITLAB_URL}/api/v4/projects/${projectId}`);
  return response.data;
}

// 在 src/index.ts 中注册新工具
server.registerTool(
  "get_project_details",
  {
    title: "获取项目详情",
    description: "获取指定项目的详细信息",
    inputSchema: { projectId: z.number() }
  },
  async ({ projectId }) => {
    try {
      const projectDetails = await getProjectDetails(projectId);
      return {
        content: [{
          type: "text",
          text: `项目详情: ${JSON.stringify(projectDetails, null, 2)}`
        }]
      };
    } catch (error) {
      const errorMessage = handleGitLabError(error);
      return {
        content: [{
          type: "text",
          text: errorMessage
        }]
      };
    }
  }
);
```

## 最佳实践

1. **错误处理**: 统一的错误处理函数
2. **日志记录**: 详细的日志输出
3. **类型安全**: 使用TypeScript
4. **环境配置**: 使用dotenv管理环境变量
5. **模块化设计**: 共享工具函数，避免代码重复
6. **智能构建**: 自动清理旧文件，确保构建干净
7. **文档完整**: 提供详细的使用文档

## 未来改进

1. **更多GitLab功能**:
   - 项目创建和删除
   - 分支管理
   - 合并请求管理
   - 用户管理

2. **增强功能**:
   - 缓存机制
   - 分页支持
   - 搜索和过滤
   - 实时通知

3. **部署优化**:
   - Docker支持
   - CI/CD集成
   - 监控和日志

## 总结

这个GitLab MCP服务器项目成功实现了：

- ✅ 基于最新MCP SDK的现代化架构
- ✅ 类型安全的TypeScript实现
- ✅ 模块化设计，共享工具函数
- ✅ 完整的GitLab项目列表功能
- ✅ HTTP服务器模式，支持内网访问
- ✅ 智能构建，自动清理旧文件
- ✅ 详细的文档和示例
- ✅ 良好的错误处理和日志记录
- ✅ 易于扩展的设计

项目为GitLab项目管理提供了一个简洁、高效、可扩展的MCP服务器解决方案。 