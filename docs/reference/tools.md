## 工具参考

### list_projects
- 描述：获取当前GitLab实例中所有可访问的项目列表，返回项目的完整信息（项目名称、命名空间、描述、可见性、默认分支、统计信息、最后更新时间等）
- 入参：无
- 返回：按更新时间倒序排列的最多100个项目列表

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
- 描述：搜索包含指定分支名的GitLab项目，支持模糊匹配和大小写不敏感
- 入参：`{ branchName: string }`（必需，要搜索的分支名）
- 返回：匹配的项目及其分支详细信息（分支状态、最新提交信息等）

环境变量优化：
- `GITLAB_FETCH_CONCURRENCY`（可选，默认 `8`）：控制并发抓取分支的并发度，避免API限流

### get_project_by_name
- 描述：通过项目名称或命名空间搜索GitLab项目，支持精确匹配和模糊搜索
- 入参：`{ projectName: string }`（必需，项目名称或命名空间）
- 返回：匹配的项目详细信息或搜索建议


