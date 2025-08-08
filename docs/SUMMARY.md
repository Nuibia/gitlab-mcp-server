# GitLab MCP 服务器项目总结

## 概述

一个基于 TypeScript 的 Model Context Protocol (MCP) 服务器，聚焦 GitLab 项目查询与检索，支持 Stdio 与 HTTP 两种运行方式。

## 核心特性

- **工具即服务**：开箱即用的 3 个工具（项目列表、按分支搜索、按名称搜索）
- **类型安全**：完善的 TypeScript 类型与 Zod 入参校验
- **统一错误提示**：对常见网络/权限问题给出人性化引导
- **分层架构**：`services` 请求侧、`utils` 纯数据侧，清晰可维护

## 技术栈

- TypeScript 5
- MCP 官方 SDK
- Express（HTTP 服务器）
- Axios
- Zod

## 项目结构

```
gitlab-mcp-server/
├── src/
│   ├── index.ts                # Stdio 服务器
│   ├── http-server.ts          # HTTP 服务器
│   ├── mcp/
│   │   └── register-tools.ts   # 统一注册工具
│   ├── services/
│   │   ├── gitlab.ts           # GitLab API & 错误处理
│   │   ├── config.ts           # 配置读取
│   │   └── index.ts
│   ├── utils/
│   │   ├── format.ts           # 文本格式化纯函数
│   │   └── index.ts
│   └── types/
│       ├── gitlab.ts
│       ├── config.ts
│       └── index.ts
├── test-http-client.js         # HTTP 快速联通测试
├── test-server.js              # Stdio 启动测试
├── README.md
├── docs/
│   ├── USAGE.md
│   ├── EXAMPLES.md
│   ├── HTTP_SERVER_GUIDE.md
│   ├── BRANCH_FEATURE.md
│   ├── CODING_RULES.md
│   └── SUMMARY.md
└── package.json / tsconfig.json / yarn.lock
```

## 已注册工具

- `list_projects`：列出所有项目（无参数）
- `list_projects_with_branch`：按分支名搜索项目（参数：`branchName`，默认 `master`）
- `get_project_by_name`：按项目名（或命名空间全名）搜索

## 使用要点

1. Node.js ≥ 18，建议使用 nvm：`nvm install 18 && nvm use 18`
2. 必需环境变量：`GITLAB_TOKEN`（需 `read_api` 权限）；可选：`GITLAB_URL`（默认 `https://gitlab.com/`）、`PORT`（默认 `3000`）
3. 启动方式：Stdio（`yarn dev` / `yarn start`）或 HTTP（`yarn http:dev` / `yarn http`）

## 扩展指南（简版）

1) 在 `src/types/` 定义类型
2) 在 `src/services/gitlab.ts` 编写请求逻辑
3) 在 `src/mcp/register-tools.ts` 里通过 `server.registerTool` 注册新工具

## 常见问题（摘）

- 未设置 Token：进程会直接退出，请设置 `GITLAB_TOKEN`
- 401/403：校验令牌权限与项目访问权限
- 404：确认 `GITLAB_URL` 正确且支持 v4 API
- 网络错误：检查网络/VPN/DNS

更多细节与示例见 `docs/USAGE.md` 与 `docs/EXAMPLES.md`。