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
PORT=3000
NODE_ENV=development

# 代理配置（可选）
HTTP_PROXY=http://proxy.company.com:8080
HTTPS_PROXY=http://proxy.company.com:8080

# SSL证书验证（内网GitLab可能需要）
VERIFY_SSL=false
```

### 4. 构建项目

```bash
# 清理并构建（推荐）
yarn build

# 仅清理构建目录
yarn clean

# 监听模式构建（开发时使用）
yarn build:watch
```

### 5. 运行服务器

```bash
# 开发模式
yarn dev

# 或者生产模式
yarn start

# HTTP服务器模式（推荐用于内网）
yarn http:dev
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
✅ 成功获取到 3 个项目:

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

## 项目结构

```
gitlab-mcp-server/
├── src/
│   ├── utils.ts          # 共享工具函数
│   │   ├── GitLab API配置和认证
│   │   ├── Axios实例创建（支持代理和SSL）
│   │   ├── 项目数据格式化
│   │   └── 错误处理
│   ├── index.ts          # Stdio服务器实现
│   └── http-server.ts    # HTTP服务器实现
├── dist/                 # 构建输出目录
├── test-http-client.js   # HTTP客户端测试脚本
└── test-server.js        # 服务器测试脚本
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

4. **内网访问问题**
   - 配置代理设置（如需要）
   - 设置 `VERIFY_SSL=false`（如使用自签名证书）
   - 使用HTTP服务器模式

### 调试模式

设置 `NODE_ENV=development` 来启用详细日志输出。

## 扩展功能

要添加新的GitLab功能，你可以：

1. 在 `src/utils.ts` 中添加共享工具函数
2. 在 `src/index.ts` 或 `src/http-server.ts` 中添加新的工具
3. 使用 `server.registerTool()` 注册工具
4. 实现相应的GitLab API调用

示例：

```typescript
// 在 src/utils.ts 中添加新的工具函数
export async function getProjectDetails(projectId: number) {
  const axiosInstance = createAxiosInstance();
  const response = await axiosInstance.get(`${GITLAB_URL}/api/v4/projects/${projectId}`);
  return response.data;
}

// 在 src/index.ts 中注册新工具
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
          text: `项目详情: ${JSON.stringify(projectDetails, null, 2)}`
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

## 支持

如果你遇到问题，请：

1. 检查 [README.md](README.md) 中的故障排除部分
2. 查看 [GitLab API文档](https://docs.gitlab.com/ee/api/)
3. 提交Issue到项目仓库 