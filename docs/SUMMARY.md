# GitLab MCP 服务器项目总结

## 项目概述

这是一个基于TypeScript的Model Context Protocol (MCP) 服务器，专门用于管理GitLab项目。项目采用现代化的架构设计，使用最新的MCP SDK，提供了简洁易用的GitLab项目管理功能。

## 核心特性

1. **GitLab集成**: 完整的GitLab API集成
2. **类型安全**: 完整的TypeScript类型定义
3. **错误处理**: 统一的错误处理和用户友好的提示
4. **模块化设计**: 分层架构，易于维护和扩展

## 技术栈

- **TypeScript**: 类型安全的JavaScript超集
- **Model Context Protocol SDK**: 官方MCP SDK
- **Express**: Web框架（HTTP服务器版本）
- **Axios**: HTTP客户端
- **CORS**: 跨域资源共享

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
  checkGitLabToken, 
  getGitLabProjects, 
  handleGitLabError 
} from "./services/index.js";
import { getServerConfig } from "./services/config.js";
import { generateProjectsListText } from "./utils/index.js";
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

项目设计具有良好的扩展性，采用分层架构：

1. **类型层** (`src/types/`): 定义所有接口和类型
2. **服务层** (`src/services/`): 业务逻辑和API调用
3. **工具层** (`src/utils/`): 通用工具函数
4. **入口层** (`src/index.ts`, `src/http-server.ts`): 服务器启动和路由

### 扩展示例

要添加新的GitLab功能：

1. **定义类型** (`src/types/gitlab.ts`):
```typescript
export interface GitLabIssue {
  id: number;
  title: string;
  description: string;
}
```

2. **添加服务** (`src/services/gitlab.ts`):
```typescript
export async function getGitLabIssues(projectId: number): Promise<GitLabIssue[]> {
  const axiosInstance = createAxiosInstance();
  const response = await axiosInstance.get<GitLabIssue[]>(`${GITLAB_URL}/api/v4/projects/${projectId}/issues`);
  return response.data;
}
```

3. **注册工具** (`src/index.ts` 或 `src/http-server.ts`):
```typescript
server.registerTool(
  "list_issues",
  {
    title: "GitLab问题列表",
    description: "获取指定项目的所有问题",
    inputSchema: {
      type: "object",
      properties: {
        projectId: { type: "number" }
      },
      required: ["projectId"]
    }
  },
  async (args) => {
    const issues = await getGitLabIssues(args.projectId);
    return {
      content: [{ type: "text", text: formatIssues(issues) }]
    };
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