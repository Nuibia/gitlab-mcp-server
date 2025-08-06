# GitLab MCP HTTP服务器使用指南

## 概述

这个HTTP服务器版本解决了内网GitLab访问的问题。通过在本地启动HTTP服务器，MCP客户端可以通过HTTP方式访问，避免了Node.js直接访问内网GitLab的网络问题。

## 优势

1. **解决内网访问问题**: 本地HTTP服务器可以正常访问内网GitLab
2. **简化配置**: 无需复杂的代理设置
3. **更好的调试**: 可以通过浏览器访问健康检查端点
4. **支持多种客户端**: 任何支持HTTP传输的MCP客户端都可以使用

## 启动服务器

### 开发模式
```bash
yarn http:dev
```

### 生产模式
```bash
yarn build
yarn http
```

## 服务器端点

### 1. MCP端点
- **URL**: `http://localhost:3000/mcp`
- **方法**: POST, GET, DELETE
- **用途**: MCP协议通信

### 2. 健康检查
- **URL**: `http://localhost:3000/health`
- **方法**: GET
- **用途**: 检查服务器状态

## 客户端配置

### Claude Desktop配置

在Claude Desktop的配置文件中添加：

```json
{
  "mcpServers": {
    "gitlab": {
      "command": "curl",
      "args": ["-X", "POST", "http://localhost:3000/mcp"],
      "env": {
        "GITLAB_URL": "https://your-internal-gitlab.com/",
        "GITLAB_TOKEN": "your_token_here"
      }
    }
  }
}
```

### 其他MCP客户端

对于支持HTTP传输的MCP客户端，配置：

```json
{
  "mcpServers": {
    "gitlab": {
      "transport": "http",
      "url": "http://localhost:3000/mcp",
      "env": {
        "GITLAB_URL": "https://your-internal-gitlab.com/",
        "GITLAB_TOKEN": "your_token_here"
      }
    }
  }
}
```

## 环境变量配置

在 `.env` 文件中设置：

```env
# GitLab配置
GITLAB_URL=https://your-internal-gitlab.company.com/
GITLAB_TOKEN=your_gitlab_token

# 服务器配置
PORT=3000
NODE_ENV=development

# 内网访问配置（如需要）
HTTP_PROXY=http://proxy.company.com:8080
HTTPS_PROXY=http://proxy.company.com:8080
VERIFY_SSL=false
```

## 测试连接

### 1. 检查服务器状态
```bash
curl http://localhost:3000/health
```

预期输出：
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T14:30:25.123Z",
  "gitlabUrl": "https://your-gitlab-url/",
  "hasToken": true
}
```

### 2. 测试MCP连接
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {
        "name": "test-client",
        "version": "1.0.0"
      }
    }
  }'
```

## 故障排除

### 问题1: 服务器无法启动
**解决方案**:
1. 检查端口是否被占用
2. 确认环境变量配置正确
3. 检查依赖是否安装完整

### 问题2: 无法访问内网GitLab
**解决方案**:
1. 确认GitLab URL正确
2. 检查网络连接
3. 配置代理（如需要）
4. 禁用SSL验证（如需要）

### 问题3: MCP客户端连接失败
**解决方案**:
1. 确认服务器正在运行
2. 检查客户端配置
3. 验证端点URL正确

## 调试技巧

### 启用详细日志
```bash
# 设置环境变量
export DEBUG=*
export NODE_ENV=development

# 启动服务器
yarn http:dev
```

### 检查网络连接
```bash
# 测试本地服务器
curl http://localhost:3000/health

# 测试GitLab连接
curl -k https://your-gitlab-url/api/v4/version
```

## 性能优化

### 1. 超时设置
服务器已配置30秒超时，适合内网环境。

### 2. 连接池
对于高并发场景，可以考虑添加连接池配置。

### 3. 缓存
可以添加Redis缓存来提升性能。

## 安全考虑

### 1. CORS配置
当前配置允许所有来源，生产环境应该限制：

```javascript
app.use(cors({
  origin: ['https://your-domain.com'],
  credentials: true
}));
```

### 2. 认证
可以添加API密钥认证：

```javascript
app.use('/mcp', (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});
```

## 部署建议

### 1. 使用PM2
```bash
npm install -g pm2
pm2 start dist/http-server.js --name gitlab-mcp-server
```

### 2. 使用Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "http"]
```

### 3. 使用Nginx反向代理
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location /mcp {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 总结

HTTP服务器版本提供了以下优势：

- ✅ 解决内网GitLab访问问题
- ✅ 简化客户端配置
- ✅ 提供健康检查端点
- ✅ 支持多种MCP客户端
- ✅ 便于调试和监控

通过这种方式，你可以轻松地在本地启动服务器，然后让MCP客户端通过HTTP方式访问，避免了直接访问内网GitLab的网络问题。 