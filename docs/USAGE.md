# GitLab MCP 服务器使用指南

## 1. 环境与安装

- 需要 Node.js 18+，建议使用 nvm：`nvm install 18 && nvm use 18`
- 包管理器使用 yarn：

```bash
yarn install
```

## 2. 配置环境变量

至少需要设置 `GITLAB_TOKEN`（read_api 权限）。可选项：`GITLAB_URL`（默认 `https://gitlab.com/`）、`PORT`（默认 `3000`）。

```bash
# 临时设置（当前终端会话有效）
export GITLAB_TOKEN=glpat_xxx
export GITLAB_URL=https://gitlab.com/
export PORT=3000

# 或在命令前内联设置
GITLAB_TOKEN=glpat_xxx yarn dev
```

## 3. 构建与运行

```bash
# 构建
yarn build

# Stdio 模式
yarn dev        # 开发
yarn start      # 生产（需先构建）

# HTTP 模式
yarn http:dev   # 开发
yarn http       # 生产（需先构建）
```

HTTP 服务器端点：

- GET `/health`：健康检查
- POST `/mcp`：MCP 协议 JSON-RPC 通信

## 4. 在 MCP 客户端中使用（示例）

Claude Desktop / 其他客户端可选两种方式之一：

```json
{
  "mcpServers": {
    "gitlab": {
      "command": "node",
      "args": ["/absolute/path/to/gitlab-mcp-server/dist/index.js"],
      "env": {
        "GITLAB_URL": "https://gitlab.com/",
        "GITLAB_TOKEN": "your_token_here"
      }
    }
  }
}
```

或使用 HTTP 传输：

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

## 5. 已注册工具与示例

- `list_projects`（无参数）
- `list_projects_with_branch`（参数：`{ branchName: string }`，默认 `master`）
- `get_project_by_name`（参数：`{ projectName: string }`）

调用示例（HTTP + curl）：

```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": { "name": "list_projects", "arguments": {} }
  }'
```

## 6. 常见问题

- 进程提示未设置 Token 并退出：设置 `GITLAB_TOKEN`
- 401/403：检查令牌有效性与权限（需 `read_api`）
- 404：检查 `GITLAB_URL` 是否正确、是否支持 v4 API
- 网络错误：检查网络/VPN/DNS

## 7. 进一步阅读

- `README.md`：概览与指引
- `docs/HTTP_SERVER_GUIDE.md`：HTTP 模式使用说明
- `docs/EXAMPLES.md`：常见场景示例