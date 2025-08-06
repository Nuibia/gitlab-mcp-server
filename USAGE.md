# GitLab MCP 服务器使用指南

## 快速开始

### 1. 环境准备

确保你已经安装了Node.js 18+和yarn。

### 2. 安装依赖

```bash
yarn install
```

### 3. 配置环境变量

复制环境变量示例文件：

```bash
cp env.example .env
```

编辑 `.env` 文件，设置你的GitLab访问令牌：

```env
# GitLab配置
GITLAB_URL=https://gitlab.com
GITLAB_TOKEN=your_actual_gitlab_token_here

# 服务器配置
NODE_ENV=development
```

### 4. 构建项目

```bash
yarn build
```

### 5. 运行服务器

```bash
# 开发模式
yarn dev

# 或者生产模式
yarn start
```

## 使用示例

### 作为MCP客户端

如果你有一个支持MCP的客户端（如Claude Desktop），你可以这样配置：

```json
{
  "mcpServers": {
    "gitlab": {
      "command": "node",
      "args": ["/path/to/your/gitlab-mcp-server/dist/index.js"],
      "env": {
        "GITLAB_URL": "https://gitlab.com",
        "GITLAB_TOKEN": "your_token_here"
      }
    }
  }
}
```

### 测试工具

服务器启动后，你可以使用MCP客户端调用 `list_projects` 工具来获取GitLab项目列表。

## 工具说明

### list_projects

这个工具会返回你的GitLab实例中的所有项目列表。

**输入参数**: 无

**返回格式**: 格式化的文本，包含项目信息

**示例输出**:
```
成功获取到 3 个项目:

📁 **username/my-project**
   - 描述: 这是一个示例项目
   - 可见性: private
   - 默认分支: main
   - 星标: 3 | 分支: 1
   - 链接: https://gitlab.com/username/my-project
   - 最后更新: 2024/1/15 14:30:25

📁 **username/another-project**
   - 描述: 另一个项目
   - 可见性: public
   - 默认分支: develop
   - 星标: 0 | 分支: 0
   - 链接: https://gitlab.com/username/another-project
   - 最后更新: 2024/1/10 09:15:30
```

## 故障排除

### 常见问题

1. **"请设置GITLAB_TOKEN环境变量"错误**
   - 确保你已经在 `.env` 文件中设置了 `GITLAB_TOKEN`
   - 确保令牌具有 `read_api` 权限

2. **"获取GitLab项目失败"错误**
   - 检查网络连接
   - 验证GitLab URL是否正确
   - 确认访问令牌是否有效

3. **编译错误**
   - 运行 `yarn install` 确保所有依赖已安装
   - 检查TypeScript版本是否兼容

### 调试模式

设置 `NODE_ENV=development` 来启用详细日志输出。

## 扩展功能

要添加新的GitLab功能，你可以：

1. 在 `src/index.ts` 中添加新的工具
2. 使用 `server.registerTool()` 注册工具
3. 实现相应的GitLab API调用

示例：

```typescript
server.registerTool(
  "get_project_details",
  {
    title: "获取项目详情",
    description: "获取指定项目的详细信息",
    inputSchema: { projectId: z.number() }
  },
  async ({ projectId }) => {
    // 实现项目详情获取逻辑
    const response = await axios.get(`${GITLAB_URL}/api/v4/projects/${projectId}`, {
      headers: {
        "Authorization": `Bearer ${GITLAB_TOKEN}`,
        "Content-Type": "application/json"
      }
    });
    
    return {
      content: [{
        type: "text",
        text: `项目详情: ${JSON.stringify(response.data, null, 2)}`
      }]
    };
  }
);
```

## 支持

如果你遇到问题，请：

1. 检查 [README.md](README.md) 中的故障排除部分
2. 查看 [GitLab API文档](https://docs.gitlab.com/ee/api/)
3. 提交Issue到项目仓库 