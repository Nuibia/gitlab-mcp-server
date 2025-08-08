## 常见场景示例

### 企业内网 GitLab 访问
```bash
export GITLAB_URL=https://gitlab.internal.company.com/
export GITLAB_TOKEN=glpat_xxx
export PORT=3000

yarn http:dev
curl http://localhost:3000/health
```

### 通过代理访问（示例）
```bash
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080
yarn http:dev
```

### 调用工具（HTTP + curl）
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": { "name": "list_projects_with_branch", "arguments": { "branchName": "main" } }
  }'
```


