# 👥 使用者指南 - 配置说明

> **📖 面向对象**：需要配置GitLab MCP服务器的用户
>
> 本文档介绍项目的环境变量配置和参数说明。

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

## 常见配置场景

### 企业内网 GitLab
```bash
export GITLAB_URL=https://gitlab.internal.company.com/
export GITLAB_TOKEN=glpat_xxx
export PORT=3000
```

### 通过代理访问
```bash
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080
export GITLAB_URL=https://gitlab.com/
export GITLAB_TOKEN=your_token_here
```

### 自签名证书环境
```bash
export GITLAB_URL=https://self-signed.gitlab.com/
export GITLAB_TOKEN=glpat_xxx
export NODE_TLS_REJECT_UNAUTHORIZED=0  # 仅用于测试环境
```

### 高并发优化
```bash
export GITLAB_FETCH_CONCURRENCY=2  # 降低并发避免限流
export PORT=3000
```


