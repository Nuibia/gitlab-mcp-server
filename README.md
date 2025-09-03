# GitLab MCP 服务器

一个基于 TypeScript 的 Model Context Protocol (MCP) 服务器，用于查询和管理 GitLab 项目。

## 功能特性

- 🔍 **项目列表**: 获取 GitLab 实例中的所有项目
- 🌿 **按分支名搜索项目**: 支持模糊匹配（不区分大小写）
- 🧭 **按项目名搜索**: 支持精确与模糊匹配
- 🧩 **模块化设计**: `services` 负责请求，`utils` 负责纯数据处理
- 🔒 **自签名证书**: 默认忽略 SSL 校验，便于内网/自签名环境接入
- 🌐 **HTTP 模式**: 提供 HTTP 传输，适配更多客户端

## 项目结构

```
gitlab-mcp-server/
├── README.md
├── docs/
│   ├── index.md                # 文档首页（VitePress）
│   ├── USAGE.md                # 使用方式（Cursor 配置示例）
│   ├── guide/
│   │   ├── quickstart.md       # 快速开始
│   │   └── http.md             # HTTP 模式指南
│   ├── reference/
│   │   └── tools.md            # 工具参考
│   ├── recipes/
│   │   └── examples.md         # 常见场景
│   └── contributing/
│       └── coding-rules.md     # 代码规范
├── src/
│   ├── index.ts                # Stdio 服务器入口
│   ├── http-server.ts          # HTTP 服务器入口
│   ├── mcp/
│   │   └── register-tools.ts   # 统一注册工具
│   ├── services/
│   │   ├── gitlab.ts           # GitLab API 封装与错误处理
│   │   ├── config.ts           # 运行时配置
│   │   └── index.ts
│   ├── utils/
│   │   ├── format.ts           # 文本格式化纯函数
│   │   └── index.ts
│   └── types/
│       ├── gitlab.ts
│       ├── config.ts
│       └── index.ts
├── test-http-client.js
├── test-server.js
├── package.json
├── tsconfig.json
└── yarn.lock
```

## 技术栈

- TypeScript 5
- MCP 官方 SDK
- Express（HTTP 服务器）
- Axios
- Zod（工具参数校验）

## 安装与环境变量

1) 安装依赖

```bash
yarn install
```

2) 设置环境变量（至少需要 `GITLAB_TOKEN`）

```bash
# zsh/bash 示例（当前会话生效）
export GITLAB_TOKEN=glpat_xxx
export GITLAB_URL=https://gitlab.com/
export PORT=3000

# 或命令前缀方式
GITLAB_TOKEN=glpat_xxx yarn dev
```

获取令牌：登录 GitLab → Settings → Access Tokens，勾选 `read_api` 权限。

## 启动方式

```bash
# 开发（Stdio）
yarn dev

# 生产（Stdio，需要先构建）
yarn build && yarn start

# 开发（HTTP）
yarn http:dev

# 生产（HTTP，需要先构建）
yarn build && yarn http
```

## 已注册工具

- `list_projects`: 获取GitLab项目列表
- `list_projects_with_branch`: 按分支名搜索项目
  - 参数：`{ branchName: string }`
- `get_project_by_name`: 按项目名搜索项目
  - 参数：`{ projectName: string }`

## 使用方式

本项目支持两种 MCP 使用方式：

- **Stdio模式**：适合本地开发，直接与Cursor集成，无需手动启动服务器
- **HTTP模式**：适合内网环境、自签名证书环境，或需要跨进程通信的场景

详见：[使用方式（Cursor配置）](/USAGE)

## 故障排除

- 启动即退出，提示需设置 token：请设置 `GITLAB_TOKEN` 环境变量
- 401 Unauthorized：检查 token 是否正确且具备 `read_api` 权限
- 403 Forbidden：当前 token 或用户无访问项目权限
- 404 Not Found：检查 `GITLAB_URL` 是否正确、版本是否支持 v4 API
- 网络错误（ECONNREFUSED/ENOTFOUND）：检查网络、地址、VPN 等

## 开发约定

- `services/` 放请求与含副作用逻辑
- `utils/` 放纯函数与数据处理
- 详见 `docs/contributing/coding-rules.md`

## 许可证与贡献

- 许可证：MIT
- 欢迎通过 Issue/PR 参与改进
  - 提交前请阅读 `docs/CODING_RULES.md`

## 相关链接

- MCP: https://modelcontextprotocol.io/
- GitLab API: https://docs.gitlab.com/ee/api/