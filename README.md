# GitLab MCP 服务器

这是一个基于TypeScript的Model Context Protocol (MCP) 服务器，用于管理GitLab项目。

## 功能特性

- 🔍 **查看所有项目**: 获取GitLab实例中的所有项目列表
- 📊 **项目详情**: 显示项目名称、描述、可见性、星标数、分支数等信息
- 🎯 **SSL支持**: 自动支持自签名证书
- 🚀 **现代化架构**: 基于最新的MCP SDK和TypeScript
- 🌐 **HTTP服务器**: 支持HTTP传输，解决网络访问问题
- 🧹 **智能构建**: 自动清理旧文件，确保构建干净
- 🔒 **VPN支持**: 支持VPN环境下的GitLab访问
- 🏗️ **模块化设计**: 分层架构，易于维护和扩展

## 项目结构

```
gitlab-mcp-server/
├── README.md                    # 项目说明
├── docs/                        # 文档文件夹
│   ├── USAGE.md                # 使用指南
│   ├── EXAMPLES.md             # 使用实例
│   ├── HTTP_SERVER_GUIDE.md    # HTTP服务器指南
│   └── SUMMARY.md              # 项目总结
├── src/                         # 源代码
│   ├── index.ts               # 主入口文件（Stdio版本）
│   ├── http-server.ts         # HTTP服务器版本
│   ├── utils.ts               # 通用工具函数
│   ├── types/                 # 类型定义
│   │   ├── index.ts
│   │   ├── gitlab.ts
│   │   └── config.ts
│   └── services/              # 服务层
│       ├── index.ts
│       ├── gitlab.ts
│       └── config.ts
├── env.example                 # 环境变量示例
├── package.json                # 项目配置
├── tsconfig.json              # TypeScript配置
└── .gitignore                 # Git忽略文件
```

## 技术栈

- **TypeScript**: 类型安全的JavaScript超集
- **Model Context Protocol SDK**: 官方MCP SDK
- **Express**: Web框架（HTTP服务器版本）
- **Axios**: HTTP客户端
- **CORS**: 跨域资源共享

## 安装和设置

### 1. 克隆项目

```bash
git clone <repository-url>
cd gitlab-mcp-server
```

### 2. 安装依赖

```bash
yarn install
```

### 3. 配置环境变量

```bash
cp env.example .env
```

编辑 `.env` 文件：

```env
# GitLab配置
GITLAB_URL=https://gitlab.com/
GITLAB_TOKEN=glpat-xxxxxxxxxxxxxxxxxxxx

# 服务器配置
PORT=3000
```

### 4. 获取GitLab访问令牌

1. 访问你的GitLab实例
2. 进入 **Settings** > **Access Tokens**
3. 创建新的个人访问令牌，确保勾选 `read_api` 权限
4. 复制令牌并粘贴到 `.env` 文件的 `GITLAB_TOKEN` 变量中

## 使用方法

### 构建项目

```bash
# 清理并构建
yarn build

# 监听模式构建
yarn build:watch
```

### 启动服务器

#### Stdio版本（推荐用于MCP客户端）

```bash
# 生产模式
yarn start

# 开发模式
yarn dev
```

#### HTTP版本（推荐用于内网环境）

```bash
# 生产模式
yarn http

# 开发模式（热重载）
yarn http:dev
```

### 验证安装

#### HTTP版本验证

```bash
# 健康检查
curl http://localhost:3000/health

# 预期输出
{
  "status": "ok",
  "timestamp": "2024-01-15T14:30:25.123Z",
  "gitlabUrl": "https://gitlab.com/",
  "hasToken": true
}
```

## MCP客户端配置

### Claude Desktop配置

```json
{
  "mcpServers": {
    "gitlab": {
      "command": "node",
      "args": ["/path/to/gitlab-mcp-server/dist/index.js"],
      "env": {
        "GITLAB_URL": "https://gitlab.com/",
        "GITLAB_TOKEN": "your_token_here"
      }
    }
  }
}
```

### HTTP版本配置

```json
{
  "mcpServers": {
    "gitlab": {
      "transport": "http",
      "url": "http://localhost:3000/mcp",
      "env": {
        "GITLAB_URL": "https://gitlab.com/",
        "GITLAB_TOKEN": "your_token_here"
      }
    }
  }
}
```

## 代码架构

### 分层设计

- **类型层** (`src/types/`): 定义所有接口和类型
- **服务层** (`src/services/`): 业务逻辑和API调用
- **工具层** (`src/utils.ts`): 通用工具函数
- **入口层** (`src/index.ts`, `src/http-server.ts`): 服务器启动和路由

### 核心服务

#### GitLab服务 (`src/services/gitlab.ts`)

```typescript
// 检查GitLab token
checkGitLabToken(): void

// 创建axios实例
createAxiosInstance(): AxiosInstance

// 格式化项目信息
formatProjects(projects: GitLabProject[]): FormattedProject[]

// 获取GitLab项目列表
getGitLabProjects(): Promise<FormattedProject[]>

// 处理GitLab API错误
handleGitLabError(error: any): string
```

#### 配置服务 (`src/services/config.ts`)

```typescript
// 获取环境配置
getConfig(): Config

// 获取服务器配置
getServerConfig(): Implementation
```

## 开发

### 添加新功能

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
  // 实现逻辑
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

## 故障排除

### 常见问题

1. **认证失败**: 确保 `GITLAB_TOKEN` 已正确设置且具有 `read_api` 权限
2. **网络错误**: 检查 `GITLAB_URL` 是否正确，确保网络连接正常
3. **权限不足**: 确保访问令牌具有足够的权限来读取项目信息
4. **编译错误**: 确保已安装所有依赖并运行 `yarn build`

### 调试模式

服务器会输出详细的日志信息，包括启动信息、连接状态和错误信息。

### 日志输出

服务器会输出以下日志信息：
- 🚀 启动信息
- 📡 GitLab URL配置
- ✅ 连接成功信息
- 🔍 工具调用信息
- ❌ 错误信息

## 网络访问

如果你的GitLab在内网，推荐使用HTTP服务器版本：

1. **启动HTTP服务器**: `yarn http:dev`
2. **配置MCP客户端**: 使用HTTP传输方式
3. **测试连接**: 访问 `http://localhost:3000/health`

详细说明请参考：
- [HTTP服务器指南](docs/HTTP_SERVER_GUIDE.md)
- [使用实例](docs/EXAMPLES.md)

## 文档

- [使用指南](docs/USAGE.md) - 详细的使用说明
- [使用实例](docs/EXAMPLES.md) - 各种场景的使用实例
- [HTTP服务器指南](docs/HTTP_SERVER_GUIDE.md) - HTTP服务器模式使用指南
- [项目总结](docs/SUMMARY.md) - 项目概述和技术细节

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request来改进这个项目！

- 请先阅读项目的代码规则：[docs/CODING_RULES.md](docs/CODING_RULES.md)

## 相关链接

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [GitLab API Documentation](https://docs.gitlab.com/ee/api/) 