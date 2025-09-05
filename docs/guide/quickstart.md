# ⚡ 快速开始

> **📖 面向对象**：新用户，希望快速上手GitLab MCP服务器
>
> 5分钟内完成环境搭建和基本使用。

### 环境要求
- Node.js 18+（建议：`nvm install 18 && nvm use 18`）
- 包管理器：yarn

### 安装与配置
```bash
# 1. 安装依赖
yarn install

# 2. 配置环境变量（至少需要GITLAB_TOKEN）
export GITLAB_TOKEN=glpat_xxx  # 从GitLab Settings > Access Tokens获取
export GITLAB_URL=https://gitlab.com/  # 可选，默认值
```

### 启动测试
```bash
# HTTP模式启动（便于测试）
yarn http:dev
```

### 验证连接
```bash
# 健康检查
curl http://localhost:3000/health

# 测试工具调用
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": { "name": "list_projects", "arguments": {} }
  }'
```

### 在 Cursor 中配置

**推荐方式：Stdio 模式**
```json
{
  "mcpServers": {
    "gitlab": {
      "transport": "stdio",
      "command": "yarn",
      "args": ["tsx", "/PATH/TO/gitlab-mcp-server/src/index.ts"],
      "env": {
        "GITLAB_URL": "https://gitlab.com/",
        "GITLAB_TOKEN": "your_token_here"
      }
    }
  }
}
```

---

## 📚 下一步

🎯 **恭喜！** 你已经成功启动了GitLab MCP服务器

📖 **深入了解**：
- [完整使用指南](./usage.md) - 详细配置选项和高级用法
- [配置说明](config.md) - 环境变量详解
- [架构说明](architecture.md) - 项目设计理念


