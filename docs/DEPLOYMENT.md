# 👨‍💻 开发者指南 - 部署说明

> **📖 面向对象**：负责部署和运维的开发者
>
> 本文档介绍如何将GitLab MCP服务器部署到生产环境。

本项目使用 VitePress 搭建文档系统，支持本地预览与静态托管部署。

## 本地预览

```bash
# 安装依赖
yarn install

# 本地启动文档站点（开发模式）
yarn docs:dev
```

预期输出：终端将显示本地访问地址（默认 `http://localhost:5173` 或类似端口）。

## 构建静态站点

```bash
# 构建文档（输出到 docs/.vitepress/dist）
yarn docs:build
```

产物目录：`docs/.vitepress/dist`。

## 预览构建产物

```bash
# 预览打包后的静态内容
yarn docs:preview
```

## 部署到静态托管

你可以将 `docs/.vitepress/dist` 上传到任意静态站点托管平台（如自建 Nginx、GitHub Pages、Vercel 等）。

### Nginx 配置示例

```nginx
server {
  listen 80;
  server_name docs.example.com;

  root /var/www/gitlab-mcp-server/docs/.vitepress/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

### GitHub Pages 简要流程

1. 确保仓库启用 Pages。
2. 将 `docs/.vitepress/dist` 内容推送到 `gh-pages` 分支。
3. 在仓库设置中指定 `gh-pages` 分支为 Pages 来源。

```bash
# 例：使用子目录作为临时发布目录
cd docs/.vitepress/dist

git init

git add .

git commit -m "deploy: docs"

git branch -M gh-pages

git remote add origin <your-repo-url>

git push -f origin gh-pages
```

如需 CI/CD 集成或自定义域名，可在后续迭代补充专门的部署说明。


