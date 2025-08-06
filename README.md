# GitLab MCP 服务器

这是一个基于TypeScript的Model Context Protocol (MCP) 服务器，用于管理GitLab项目。

## 功能特性

- 🔍 **查看所有项目**: 获取GitLab实例中的所有项目列表
- 📊 **项目详情**: 显示项目名称、描述、可见性、星标数、分支数等信息
- 🎯 **简洁易用**: 单一文件实现，专注于核心功能
- 🚀 **现代化架构**: 基于最新的MCP SDK和TypeScript
- 🌐 **HTTP服务器**: 支持HTTP传输，解决内网访问问题

## 安装和设置

### 1. 安装依赖

```bash
# 使用yarn安装依赖
yarn install
```

### 2. 环境配置

复制环境变量示例文件并配置：

```bash
cp env.example .env
```

编辑 `.env` 文件，设置以下变量：

```env
# GitLab配置
GITLAB_URL=https://gitlab.xiaomawang.com/
GITLAB_TOKEN=your_gitlab_personal_access_token

# 服务器配置
PORT=3000
NODE_ENV=development
```

### 3. 获取GitLab访问令牌

1. 登录到你的GitLab账户
2. 进入 **Settings** > **Access Tokens**
3. 创建一个新的个人访问令牌，确保勾选 `read_api` 权限
4. 复制令牌并粘贴到 `.env` 文件的 `GITLAB_TOKEN` 变量中

## 使用方法

### 方式一：HTTP服务器（推荐用于内网环境）

#### 开发模式运行
```bash
yarn http:dev
```

#### 生产模式运行
```bash
yarn build
yarn http
```

#### 测试服务器
```bash
# 检查服务器状态
curl http://localhost:3000/health

# 测试MCP连接
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}'
```

### 方式二：Stdio服务器（传统方式）

#### 开发模式运行
```bash
yarn dev
```

#### 生产模式运行
```bash
yarn build
yarn start
```

## MCP工具

### list_projects

获取所有GitLab项目列表。

**参数**: 无

**返回**: 项目列表，包含以下信息：
- 项目名称和完整路径
- 项目描述
- 可见性设置
- 默认分支
- 星标数和分支数
- 项目链接
- 最后更新时间

## 示例输出

```
✅ 成功获取到 5 个项目:

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

## 技术栈

- **TypeScript**: 类型安全的JavaScript
- **MCP SDK**: Model Context Protocol官方SDK
- **Axios**: HTTP客户端
- **Express**: Web框架（HTTP服务器）
- **Zod**: 类型验证
- **Dotenv**: 环境变量管理

## 项目结构

```
gitlab-mcp-server/
├── src/
│   ├── index.ts          # Stdio服务器文件
│   └── http-server.ts    # HTTP服务器文件
├── dist/                 # 构建输出目录
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript配置
├── env.example           # 环境变量示例
├── test-server.js        # 测试脚本
├── README.md            # 项目说明
├── USAGE.md             # 使用指南
├── HTTP_SERVER_GUIDE.md # HTTP服务器指南
├── INTRANET_GUIDE.md    # 内网访问指南
└── SUMMARY.md           # 项目总结
```

## 开发

### 代码结构

- `src/index.ts`: Stdio版本的MCP服务器实现
- `src/http-server.ts`: HTTP版本的MCP服务器实现
  - GitLab API集成
  - MCP工具定义
  - 错误处理
  - 日志记录

### 添加新功能

要添加新的GitLab功能，只需在相应的服务器文件中：

1. 使用 `server.registerTool()` 注册新工具
2. 实现相应的GitLab API调用
3. 处理错误和返回格式化结果

## 故障排除

### 常见问题

1. **认证失败**: 确保 `GITLAB_TOKEN` 已正确设置且具有 `read_api` 权限
2. **网络错误**: 检查 `GITLAB_URL` 是否正确，确保网络连接正常
3. **权限不足**: 确保访问令牌具有足够的权限来读取项目信息
4. **编译错误**: 确保已安装所有依赖并运行 `yarn build`
5. **内网访问问题**: 使用HTTP服务器版本，参考 `INTRANET_GUIDE.md`

### 调试模式

设置 `NODE_ENV=development` 来启用详细日志输出。

### 日志输出

服务器会输出以下日志信息：
- 🚀 启动信息
- 📡 GitLab URL配置
- ✅ 连接成功信息
- 🔍 工具调用信息
- ❌ 错误信息

## 内网访问

如果你的GitLab在内网，推荐使用HTTP服务器版本：

1. **启动HTTP服务器**: `yarn http:dev`
2. **配置MCP客户端**: 使用HTTP传输方式
3. **测试连接**: 访问 `http://localhost:3000/health`

详细说明请参考：
- [HTTP服务器指南](HTTP_SERVER_GUIDE.md)
- [内网访问指南](INTRANET_GUIDE.md)

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request来改进这个项目！

## 相关链接

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [GitLab API文档](https://docs.gitlab.com/ee/api/) 