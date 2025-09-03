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

## 🚀 自动部署到 GitHub Pages

### 方法一：GitHub Actions（推荐）

本项目已配置 GitHub Actions 自动部署：

1. **推送代码**：当你推送 `docs/` 目录的更改时，自动触发构建
2. **自动部署**：GitHub Actions 会自动构建并部署到 `gh-pages` 分支
3. **访问文档**：部署完成后可通过 `https://[用户名].github.io/[仓库名]/` 访问

#### 启用 GitHub Pages

1. 进入 GitHub 仓库设置
2. 找到 "Pages" 选项卡
3. Source 选择 "Deploy from a branch"
4. Branch 选择 `gh-pages` 分支和 `/ (root)` 目录

#### 自定义域名（可选）

如需使用自定义域名：
1. 在仓库设置中添加你的域名
2. 创建 `CNAME` 文件在 `docs/` 目录下：
   ```
   docs.yourdomain.com
   ```
3. 更新 DNS 解析指向 GitHub Pages

### 方法二：手动部署

如果需要手动部署：

```bash
# 1. 构建文档
yarn docs:build

# 2. 进入构建目录
cd docs/.vitepress/dist

# 3. 初始化git仓库（如果还没有）
git init
git checkout -b gh-pages

# 4. 添加并提交文件
git add .
git commit -m "deploy: docs"

# 5. 推送到gh-pages分支
git remote add origin <your-repo-url>
git push -f origin gh-pages
```

### 📝 注意事项

- **构建时间**：GitHub Actions 部署通常需要 2-3 分钟
- **缓存清理**：如果样式或内容没有更新，尝试强制刷新浏览器 (`Ctrl+F5`)
- **分支保护**：建议保护 `main/master` 分支，防止意外推送


