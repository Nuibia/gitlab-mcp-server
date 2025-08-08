## 使用方式（以 Cursor 为例）

本项目支持两种 MCP 使用方式：

- Stdio 传输：客户端以子进程方式直接启动服务器，标准输入/输出通信
- HTTP 传输：服务器以 HTTP/SSE 暴露 MCP 端点，客户端通过网络通信

下面以 Cursor 为例，分别给出配置与验证步骤。

### 前置准备

- Node.js 18+（建议：`nvm install 18 && nvm use 18`）
- 包管理器：yarn
- 环境变量：至少 `GITLAB_TOKEN`（需 `read_api` 权限），可选 `GITLAB_URL`（默认 `https://gitlab.com/`）

```bash
yarn install
```

---

### 方式一：Stdio（推荐在本机直连）

Stdio 由 Cursor 直接拉起本项目进程，最少依赖、启动快。

有两种启动形态，二选一：

1) 生产运行（构建后，用 Node 执行 dist）

```bash
yarn build
```

在 Cursor 的 MCP 配置中添加（示例 JSON 片段）：

```json
{
  "mcpServers": {
    "gitlab": {
      "transport": "stdio",
      "command": "node",
      "args": [
        "/ABSOLUTE/PATH/TO/gitlab-mcp-server/dist/index.js"
      ],
      "env": {
        "GITLAB_URL": "https://gitlab.com/",
        "GITLAB_TOKEN": "your_token_here"
      }
    }
  }
}
```

2) 开发运行（直接用 tsx 执行源码）

```json
{
  "mcpServers": {
    "gitlab": {
      "transport": "stdio",
      "command": "tsx",
      "args": [
        "/ABSOLUTE/PATH/TO/gitlab-mcp-server/src/index.ts"
      ],
      "env": {
        "GITLAB_URL": "https://gitlab.com/",
        "GITLAB_TOKEN": "your_token_here"
      }
    }
  }
}
```

提示：

- 建议将路径替换为你本机的绝对路径，例如：`/Users/你/项目/gitlab-mcp-server/...`
- Stdio 模式下无需你手动启动服务器，Cursor 会按上述配置自动拉起进程。

---

### 方式二：HTTP（适合跨语言/跨进程或内网部署）

先在本机或服务器启动 HTTP 端：

```bash
# 开发
yarn http:dev

# 生产
yarn build && yarn http
```

默认监听 `http://localhost:3000`：

- 健康检查：`GET /health`
- MCP 端点：`POST /mcp`

在 Cursor 的 MCP 配置中添加（示例 JSON 片段）：

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

可选：若是自签名/内网环境，需在系统或代理层放行；本项目默认忽略 SSL 校验以降低接入门槛。

---

### 在 Cursor 中验证

1) 打开 Cursor，新建或进入任意工作区
2) 触发助手对话或工具使用（例如请求列出 GitLab 项目）
3) 若配置成功，`gitlab` 服务器会自动被识别，工具列表可见：`list_projects`、`list_projects_with_branch`、`get_project_by_name`

你也可以用 curl 验证 HTTP 端点（仅 HTTP 模式需要）：

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

---

### 常见问题

- 401/403：检查 `GITLAB_TOKEN` 是否有效且具备 `read_api` 权限
- 404：确认 `GITLAB_URL` 是否正确、实例是否支持 v4 API
- 连接不到 HTTP：确认端口是否开放、同网段可达、代理/VPN/DNS 设置
- Stdio 无法拉起：检查 `command/args` 路径是否为绝对路径、Node 版本是否为 18+


