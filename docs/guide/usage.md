# 🔧 完整使用指南

> **📖 面向对象**：需要完整配置和高级用法的用户
>
> 前提：请先完成[快速开始](/guide/quickstart)的基本设置

本项目支持两种 MCP 使用方式：

- **Stdio 传输**：客户端以子进程方式直接启动服务器，标准输入/输出通信
- **HTTP 传输**：服务器以 HTTP/SSE 暴露 MCP 端点，客户端通过网络通信

下面以 Cursor 为例，分别给出详细配置与验证步骤。

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
      "command": "yarn",
      "args": [
        "tsx",
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

HTTP 模式适合内网环境、自签名证书环境，或需要跨进程通信的场景。

#### 1. 启动HTTP服务器

先启动GitLab MCP HTTP服务器：

```bash
# 开发环境
yarn http:dev

# 生产环境
yarn build && yarn http
```

服务器将在 `http://localhost:3000` 启动，提供以下端点：
- `GET /health` - 健康检查
- `POST /mcp` - MCP协议通信

#### 2. 配置Cursor

在 Cursor 的 MCP 配置中添加：

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

#### 3. 验证连接

HTTP 服务器启动后，可以通过以下方式验证：

**健康检查**：
```bash
curl http://localhost:3000/health
```

**测试工具调用**：
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "list_projects",
      "arguments": {}
    }
  }'
```

> 💡 **提示**：更多验证方法请参考[快速开始](/guide/quickstart)的验证部分

---

### 在 Cursor 中验证

1) 打开 Cursor，新建或进入任意工作区
2) 触发助手对话或工具使用（例如请求列出 GitLab 项目）
3) 若配置成功，`gitlab` 服务器会自动被识别，工具列表可见：
   - `list_projects`：获取项目列表
   - `list_projects_with_branch`：按分支名搜索项目
   - `get_project_by_name`：按项目名搜索项目

**提示**：
- HTTP 模式需要确保服务器正在运行
- Stdio 模式由 Cursor 自动启动，无需手动启动服务器

---

### 常见问题

#### 认证与权限问题
- **401/403**：检查 `GITLAB_TOKEN` 是否有效且具备 `read_api` 权限
- **404**：确认 `GITLAB_URL` 是否正确、实例是否支持 v4 API
- **Token 过期**：重新生成访问令牌

#### Stdio 模式问题
- **无法拉起服务器**：检查 `command/args` 路径是否为绝对路径、Node 版本是否为 18+
- **路径问题**：确保指向正确的可执行文件或源码文件

#### HTTP 模式问题
- **连接超时**：检查 HTTP 服务器是否正在运行（`yarn http:dev`）
- **端口占用**：确认 3000 端口未被其他服务使用
- **网络问题**：检查防火墙、代理设置，确保客户端能访问服务器
- **跨域问题**：确保客户端和服务器在同一网络或正确配置 CORS

#### 工具调用问题
- **工具不可用**：确认 MCP 配置正确，服务器正常运行
- **参数错误**：检查工具参数格式是否正确
- **权限不足**：确认 token 有足够权限访问目标项目


