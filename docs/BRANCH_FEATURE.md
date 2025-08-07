# GitLab 分支功能使用指南

## 概述

GitLab MCP 服务器现在支持按分支名搜索项目的功能。这个功能可以帮助你快速找到包含特定分支的所有项目。

## 功能特性

- 🔍 **模糊匹配**: 支持分支名的模糊匹配，不区分大小写
- 📊 **详细信息**: 显示匹配分支的详细信息，包括最新提交、作者、提交时间等
- 🎯 **高效搜索**: 自动遍历所有项目，只返回包含匹配分支的项目
- 🌿 **分支状态**: 显示分支的状态（默认分支、受保护分支、已合并等）

## 使用方法

### 1. 启动服务器

```bash
# 开发模式
yarn dev

# 或者 HTTP 服务器模式
yarn http:dev
```

### 2. 调用工具

#### 使用 MCP 客户端

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "list_projects_with_branch",
    "arguments": {
      "branchName": "main"
    }
  }
}
```

#### 使用 HTTP 服务器

```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "list_projects_with_branch",
      "arguments": {
        "branchName": "main"
      }
    }
  }'
```

## 示例输出

### 成功找到项目

```
✅ 找到 2 个包含分支名 "main" 的项目:

📁 **username/my-project**
   - 描述: 这是一个示例项目
   - 可见性: private
   - 默认分支: main
   - 星标: 3 | 分支: 1
   - 链接: https://gitlab.com/username/my-project
   - 最后更新: 2024/1/15 14:30:25
   - 匹配分支 (1 个):
   🌿 默认分支 **main**
      - 最新提交: a1b2c3d - 更新README文档
      - 作者: John Doe
      - 提交时间: 2024/1/15 14:30:25
      - 链接: https://gitlab.com/username/my-project/-/tree/main

📁 **username/another-project**
   - 描述: 另一个项目
   - 可见性: public
   - 默认分支: develop
   - 星标: 0 | 分支: 0
   - 链接: https://gitlab.com/username/another-project
   - 最后更新: 2024/1/10 09:15:30
   - 匹配分支 (1 个):
   🌱 活跃分支 **main**
      - 最新提交: e4f5g6h - 修复bug
      - 作者: Jane Smith
      - 提交时间: 2024/1/10 09:15:30
      - 链接: https://gitlab.com/username/another-project/-/tree/main
```

### 未找到项目

```
🔍 未找到包含分支名 "nonexistent-branch" 的项目。
```

## 分支状态说明

- 🌿 **默认分支**: 项目的默认分支
- 🛡️ **受保护分支**: 受保护的分支
- ✅ **已合并**: 已经合并到主分支的分支
- 🌱 **活跃分支**: 活跃的开发分支

## 技术实现

### 核心功能

1. **获取所有项目**: 首先获取用户有权限访问的所有项目
2. **遍历项目分支**: 对每个项目获取其分支列表
3. **模糊匹配**: 使用不区分大小写的包含匹配
4. **格式化输出**: 生成格式化的文本输出

### API 调用

- **项目列表**: `GET /api/v4/projects`
- **项目分支**: `GET /api/v4/projects/{id}/repository/branches`

### 错误处理

- 网络错误：自动跳过有问题的项目，继续处理其他项目
- 权限错误：显示警告信息，继续处理其他项目
- API 错误：返回详细的错误信息和解决建议

## 注意事项

1. **性能考虑**: 由于需要遍历所有项目，对于大型 GitLab 实例可能需要较长时间
2. **权限要求**: 需要 `read_api` 权限来访问项目和分支信息
3. **网络限制**: 如果项目很多，可能会受到 API 速率限制
4. **分支数量**: 每个项目最多获取 100 个分支

## 故障排除

### 常见问题

1. **"未找到包含分支名的项目"**
   - 检查分支名是否正确
   - 确认你有权限访问包含该分支的项目
   - 尝试使用更通用的分支名（如 "main" 或 "master"）

2. **"获取项目分支失败"**
   - 检查网络连接
   - 确认 GitLab token 有效
   - 查看服务器日志获取详细错误信息

3. **搜索速度慢**
   - 这是正常现象，特别是对于大型 GitLab 实例
   - 考虑使用更具体的分支名来减少搜索结果

## 扩展功能

未来可能添加的功能：

- 🔍 **正则表达式搜索**: 支持正则表达式匹配分支名
- 📊 **分支统计**: 显示分支的统计信息（提交数、文件数等）
- 🎯 **精确匹配**: 支持精确匹配模式
- 🌿 **分支比较**: 比较不同项目的分支差异
