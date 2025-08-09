## 配置说明

项目通过环境变量进行配置：

- `GITLAB_URL`：GitLab 实例地址，默认 `https://gitlab.com/`
- `GITLAB_TOKEN`：GitLab 访问令牌（必须，需 `read_api` 权限）
- `PORT`：HTTP 服务器端口，默认 `3000`
 - `GITLAB_FETCH_CONCURRENCY`：并发抓取分支的并发度，默认 `8`

示例：

```bash
export GITLAB_TOKEN=glpat_xxx
export GITLAB_URL=https://gitlab.com/
export PORT=3000
export GITLAB_FETCH_CONCURRENCY=4 # 可选：降低并发以减小限流风险
```

提示：令牌可在 GitLab → Settings → Access Tokens 创建，勾选 `read_api`。


