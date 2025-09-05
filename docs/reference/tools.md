# 👥 使用者指南 - 工具参考

> **📖 面向对象**：需要了解可用工具功能的用户
>
> 本文档详细介绍GitLab MCP服务器提供的三个主要工具及其使用方法。

### list_projects
- **标题**: 获取GitLab项目列表
- **描述**: 获取当前GitLab实例中所有可访问的项目列表。返回项目的完整信息：项目名称、命名空间、描述、可见性、默认分支、统计信息（星标数、Fork数）以及最后更新时间。项目按更新时间倒序排列，最多返回100个项目。
- **入参**: 无
- **返回**: 格式化的项目列表文本

调用示例（HTTP + curl）：
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

### list_projects_with_branch
- **标题**: 按分支名搜索项目
- **描述**: 搜索包含指定分支名的GitLab项目。不区分大小写，支持模糊匹配。返回匹配的项目及其分支详细信息，包括分支状态（默认分支/保护分支/活跃分支/已合并）、最新提交信息（提交SHA、提交标题、作者、时间）等。
- **入参**: `{ branchName: string }`（必需，要搜索的分支名，支持模糊匹配。不区分大小写。例如：'main'、'develop'、'feature'、'hotfix'等）
- **返回**: 包含匹配分支的项目列表文本

环境变量优化：
- `GITLAB_FETCH_CONCURRENCY`（可选，默认 `8`）：控制并发抓取分支的并发度，避免API限流

### get_project_by_name
- **标题**: 按项目名搜索项目
- **描述**: 通过项目名称或命名空间搜索GitLab项目。支持精确匹配和模糊搜索。返回匹配的项目详细信息，包括项目URL、创建时间、统计信息等。如果未找到匹配项目，会提供搜索建议。
- **入参**: `{ projectName: string }`（必需，项目名称或命名空间，支持精确和模糊匹配。例如：'myproject'、'group/subgroup/project'、'frontend-app'等）
- **返回**: 匹配的项目详细信息或搜索建议


