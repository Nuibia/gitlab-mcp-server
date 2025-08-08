## HTTP 模式

### 为什么使用 HTTP
- 适配内网 GitLab、VPN、自签名证书等环境
- 更便于跨语言/跨进程接入 MCP

### 启动
```bash
yarn http:dev           # 开发
yarn build && yarn http # 生产
```

### 端点
- GET `/health`：健康检查
- POST `/mcp`：MCP JSON-RPC 通信

### MCP 客户端配置（HTTP 传输）
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

### 快速排障
- 401/403：检查 `GITLAB_TOKEN` 是否有效且具备 `read_api`
- 404：确认 `GITLAB_URL` 是否正确、是否支持 v4 API
- 网络错误：检查网络/VPN/DNS/代理


