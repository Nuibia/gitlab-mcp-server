## 快速开始

### 环境
- Node.js 18+（建议：`nvm install 18 && nvm use 18`）
- 包管理器：yarn

### 安装
```bash
yarn install
```

### 配置环境变量
至少需要 `GITLAB_TOKEN`（`read_api` 权限）。可选：`GITLAB_URL`（默认 `https://gitlab.com/`）、`PORT`（默认 `3000`）。

```bash
export GITLAB_TOKEN=glpat_xxx
export GITLAB_URL=https://gitlab.com/
export PORT=3000
```

### 启动
```bash
# Stdio（推荐在支持 MCP 的客户端中）
yarn dev          # 开发
yarn build && yarn start  # 生产

# HTTP（更通用，适合内网环境）
yarn http:dev     # 开发
yarn build && yarn http   # 生产
```

### 验证（HTTP）
```bash
curl http://localhost:3000/health
```

### 调用示例（HTTP + curl）
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


