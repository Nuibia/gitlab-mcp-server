## 工具参考

### list_projects
- 描述：列出所有可访问的项目
- 入参：无
- 返回：格式化文本

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
- 描述：按分支名搜索项目（模糊匹配）
- 入参：`{ branchName: string }`（默认 `master`）
- 返回：格式化文本

 环境变量优化：

 - `GITLAB_FETCH_CONCURRENCY`（可选，默认 `8`）：
   - 说明：控制并发抓取分支的并发度，避免 GitLab API 限流。
   - 建议：内网或限流严格的环境下可降低该值（如 2-4）。

### get_project_by_name
- 描述：按项目名或完整命名空间搜索
- 入参：`{ projectName: string }`
- 返回：格式化文本


