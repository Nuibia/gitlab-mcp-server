# GitLab MCP 服务器使用实例

本文档提供了GitLab MCP服务器的详细使用实例，包括各种场景下的配置和使用方法。

## 目录

- [基础使用实例](#基础使用实例)
- [网络访问实例](#网络访问实例)
- [代理配置实例](#代理配置实例)
- [HTTP服务器实例](#http服务器实例)
- [错误处理实例](#错误处理实例)
- [扩展功能实例](#扩展功能实例)

## 基础使用实例

### 实例1: 标准 GitLab 访问

**场景**: 访问标准的GitLab实例

**环境变量**:
```bash
export GITLAB_URL=https://gitlab.com/
export GITLAB_TOKEN=glpat-xxxxxxxxxxxxxxxxxxxx
export PORT=3000
```

**使用步骤**:
```bash
# 1. 安装依赖
yarn install

# 2. 构建项目
yarn build

# 3. 启动HTTP服务器
yarn http:dev
```

**预期输出**:
```
🚀 启动GitLab MCP HTTP服务器...
📡 GitLab URL: https://gitlab.com/
🌐 HTTP服务器端口: 3000
✅ HTTP服务器已启动: http://localhost:3000
```

**测试连接**:
```bash
# 测试GitLab API连接
curl -k https://gitlab.com/api/v4/version

# 测试服务器健康状态
curl http://localhost:3000/health
```

**MCP客户端配置**:
```json
{
  "mcpServers": {
    "gitlab": {
      "transport": "http",
      "url": "http://localhost:3000/mcp",
      "env": {
        "GITLAB_URL": "https://gitlab.com/",
        "GITLAB_TOKEN": "glpat-xxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

## 网络访问实例

### 实例2: 企业内网 GitLab 访问

**场景**: 访问企业内网的GitLab实例

**环境变量**:
```bash
export GITLAB_URL=https://gitlab.internal.company.com/
export GITLAB_TOKEN=glpat-xxxxxxxxxxxxxxxxxxxx
export PORT=3000
```

**使用步骤**:
```bash
# 1. 启动HTTP服务器（推荐用于内网）
yarn http:dev
```

**测试连接**:
```bash
# 检查服务器状态
curl http://localhost:3000/health

# 预期输出
{
  "status": "ok",
  "timestamp": "2024-01-15T14:30:25.123Z",
  "gitlabUrl": "https://gitlab.internal.company.com/",
  "hasToken": true
}
```

**MCP 客户端配置**:
```json
{
  "mcpServers": {
    "gitlab": {
      "transport": "http",
      "url": "http://localhost:3000/mcp",
      "env": {
        "GITLAB_URL": "https://gitlab.internal.company.com/",
        "GITLAB_TOKEN": "glpat-xxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

### 实例3: 自签名证书 GitLab 访问

**场景**: 访问使用自签名证书的GitLab实例

**环境变量**:
```bash
export GITLAB_URL=https://gitlab.internal.company.com/
export GITLAB_TOKEN=glpat-xxxxxxxxxxxxxxxxxxxx
export PORT=3000
```

**使用步骤**:
```bash
# 1. 启动服务器
yarn http:dev

# 2. 查看日志确认SSL验证已禁用
# 预期输出: ⚠️  已禁用SSL证书验证
```

## 代理配置实例

### 实例4: 通过企业代理访问

**场景**: 需要通过企业代理服务器访问GitLab

**环境变量**:
```bash
export GITLAB_URL=https://gitlab.internal.company.com/
export GITLAB_TOKEN=glpat-xxxxxxxxxxxxxxxxxxxx
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080
export PORT=3000
```

**使用步骤**:
```bash
# 1. 启动服务器
yarn http:dev

# 2. 查看日志确认代理已配置
# 预期输出: 🔗 使用代理: http://proxy.company.com:8080
```

**测试连接**:
```bash
# 测试代理连接（示例）
curl -x http://proxy.company.com:8080 https://gitlab.internal.company.com/api/v4/version
```

## HTTP服务器实例

### 实例5: HTTP 服务器模式完整配置

**场景**: 使用HTTP服务器模式，支持多种MCP客户端

**环境变量**:
```bash
export GITLAB_URL=https://gitlab.com/
export GITLAB_TOKEN=glpat-xxxxxxxxxxxxxxxxxxxx
export PORT=3000
```

**启动服务器**:
```bash
# 开发模式（推荐）
yarn http:dev

# 生产模式
yarn build
yarn http
```

**服务器端点测试**:

1. **健康检查**:
```bash
curl http://localhost:3000/health
```

2. **MCP初始化**:
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {
        "tools": {}
      },
      "clientInfo": {
        "name": "test-client",
        "version": "1.0.0"
      }
    }
  }'
```

3. **工具列表**:
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "mcp-session-id: your-session-id" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list",
    "params": {}
  }'
```

4. **调用工具**:
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "mcp-session-id: your-session-id" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "list_projects",
      "arguments": {}
    }
  }'
```

## 错误处理实例

### 实例6: 认证失败处理

**场景**: GitLab token无效或过期

**错误输出**:
```
❌ 获取GitLab项目失败 (状态码: 401): 401 Unauthorized

💡 认证失败提示:
1. 检查GITLAB_TOKEN是否正确
2. 确认令牌具有read_api权限
3. 检查令牌是否已过期
```

**解决方案**:
```bash
# 1. 检查token是否正确
echo $GITLAB_TOKEN

# 2. 重新生成token
# 访问 GitLab > Settings > Access Tokens
# 创建新的个人访问令牌，确保勾选 read_api 权限

# 3. 更新.env文件
GITLAB_TOKEN=glpat-new-token-here
```

### 实例7: 网络连接失败处理

**场景**: 无法连接到GitLab服务器

**错误输出**:
```
❌ 获取GitLab项目失败 (状态码: 0): connect ECONNREFUSED

💡 内网访问提示:
1. 检查网络连接是否正常
2. 确认GitLab URL是否正确
3. 如需代理，请设置 HTTP_PROXY 或 HTTPS_PROXY 环境变量
4. 本项目已默认忽略 SSL 校验，无需额外配置
```

**解决方案**:
```bash
# 1. 检查网络连接
ping gitlab.internal.company.com

# 2. 检查GitLab URL
curl -k https://gitlab.internal.company.com/api/v4/version

# 3. 配置代理（如需要）
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080

# 4. 禁用SSL验证（如需要）
export VERIFY_SSL=false
```

## 扩展功能实例

### 实例8: 添加新的GitLab功能

**场景**: 添加获取项目详情的功能

**步骤1: 在 `src/services/gitlab.ts` 中添加新函数**:
```typescript
// 获取项目详情（位于 services/gitlab.ts）
export async function getProjectDetails(projectId: number) {
  const axiosInstance = createAxiosInstance();
  const response = await axiosInstance.get(`${GITLAB_URL}/api/v4/projects/${projectId}`);
  return response.data;
}
```

**步骤2: 在 `src/mcp/register-tools.ts` 中注册新工具**:
```typescript
// 注册获取项目详情工具（位于 mcp/register-tools.ts）
server.registerTool(
  "get_project_details",
  {
    title: "获取项目详情",
    description: "获取指定项目的详细信息",
    inputSchema: { projectId: z.number() }
  },
  async ({ projectId }) => {
    try {
      const projectDetails = await getProjectDetails(projectId);
      return {
        content: [{
          type: "text",
          text: `📁 项目详情:\n\n` +
                `**${projectDetails.name_with_namespace}**\n` +
                `- 描述: ${projectDetails.description || '无描述'}\n` +
                `- 可见性: ${projectDetails.visibility}\n` +
                `- 默认分支: ${projectDetails.default_branch}\n` +
                `- 星标: ${projectDetails.star_count} | 分支: ${projectDetails.forks_count}\n` +
                `- 创建时间: ${new Date(projectDetails.created_at).toLocaleString('zh-CN')}\n` +
                `- 最后更新: ${new Date(projectDetails.updated_at).toLocaleString('zh-CN')}\n` +
                `- 链接: ${projectDetails.web_url}`
        }]
      };
    } catch (error) {
      const errorMessage = handleGitLabError(error);
      return {
        content: [{
          type: "text",
          text: errorMessage
        }]
      };
    }
  }
);

// 注册获取项目分支工具
server.registerTool(
  "get_project_branches",
  {
    title: "获取项目分支",
    description: "获取指定项目的所有分支",
    inputSchema: { projectId: z.number() }
  },
  async ({ projectId }) => {
    try {
      const branches = await getProjectBranches(projectId);
      const branchList = branches.map(branch => 
        `- ${branch.name} (${branch.commit.short_id})`
      ).join('\n');
      
      return {
        content: [{
          type: "text",
          text: `🌿 项目分支列表:\n\n${branchList}`
        }]
      };
    } catch (error) {
      const errorMessage = handleGitLabError(error);
      return {
        content: [{
          type: "text",
          text: errorMessage
        }]
      };
    }
  }
);
```

**步骤3: 测试新功能**:
```bash
# 重新构建项目
yarn build

# 启动服务器
yarn start
```

**步骤4: 调用新工具**:
```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "get_project_details",
    "arguments": {
      "projectId": 12345
    }
  }
}
```

## 测试实例

### 实例9: 完整测试流程

**场景**: 测试GitLab MCP服务器的完整功能

**测试脚本** (`test-complete.js`):
```javascript
#!/usr/bin/env node

import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function runCompleteTest() {
  console.log('🚀 开始完整测试...\n');

  // 1. 健康检查
  console.log('1️⃣ 健康检查测试');
  try {
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ 健康检查通过:', healthResponse.data);
  } catch (error) {
    console.error('❌ 健康检查失败:', error.message);
    return;
  }

  // 2. MCP初始化
  console.log('\n2️⃣ MCP初始化测试');
  try {
    const initResponse = await axios.post(`${BASE_URL}/mcp`, {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        clientInfo: { name: "test-client", version: "1.0.0" }
      }
    });
    console.log('✅ MCP初始化成功:', initResponse.data);
    const sessionId = initResponse.headers['mcp-session-id'];
    console.log('📝 会话ID:', sessionId);

    // 3. 工具列表
    console.log('\n3️⃣ 工具列表测试');
    const toolsResponse = await axios.post(`${BASE_URL}/mcp`, {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
      params: {}
    }, {
      headers: { 'mcp-session-id': sessionId }
    });
    console.log('✅ 工具列表获取成功:', toolsResponse.data);

    // 4. 调用工具
    console.log('\n4️⃣ 工具调用测试');
    const callResponse = await axios.post(`${BASE_URL}/mcp`, {
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "list_projects",
        arguments: {}
      }
    }, {
      headers: { 'mcp-session-id': sessionId }
    });
    console.log('✅ 工具调用成功:', callResponse.data);

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }

  console.log('\n🎉 测试完成！');
}

runCompleteTest().catch(console.error);
```

**运行测试**:
```bash
# 启动服务器
yarn http:dev

# 在另一个终端运行测试
node test-complete.js
```

## 常见问题实例

### 实例10: 环境变量配置问题

**问题**: 环境变量未正确加载

**症状**:
```
错误: 请设置GITLAB_TOKEN环境变量
```

**解决方案**:
```bash
# 1. 检查环境变量是否存在
echo $GITLAB_TOKEN

# 2. 确认令牌具备 read_api 权限

# 3. 如使用 shell 启动脚本，确保已 export 对应变量

# 4. 重新启动服务器
yarn http:dev
```

### 实例11: 端口占用问题

**问题**: 端口3000已被占用

**症状**:
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方案**:
```bash
# 1. 查看端口占用
lsof -i :3000

# 2. 杀死占用进程
kill -9 <PID>

# 3. 或者使用不同端口
PORT=3001 yarn http:dev
```

## 总结

这些实例涵盖了GitLab MCP服务器的各种使用场景，包括：

- ✅ 基础配置和使用
- ✅ 内网访问配置
- ✅ 代理和SSL配置
- ✅ HTTP服务器模式
- ✅ 错误处理和调试
- ✅ 功能扩展
- ✅ 完整测试流程
- ✅ 常见问题解决

通过这些实例，你可以快速上手并解决实际使用中遇到的问题。 