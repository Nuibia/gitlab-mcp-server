# 🚀 GitHub Pages 快速设置指南

## 📋 前置条件

- ✅ 项目已推送到 GitHub 公开仓库
- ✅ 已配置 GitHub Actions 工作流 (`.github/workflows/deploy-docs.yml`)
- ✅ VitePress 配置已更新支持 GitHub Pages

## ⚡ 5分钟设置步骤

### 步骤1：启用 GitHub Pages

1. 打开你的 GitHub 仓库
2. 点击 **Settings** 标签
3. 在左侧菜单中找到 **Pages**
4. 在 **Source** 下拉菜单中选择 **"Deploy from a branch"**
5. 在 **Branch** 下拉菜单中选择：
   - **Branch**: `gh-pages`
   - **Folder**: `/(root)`

### 步骤2：推送文档更改

```bash
# 提交当前的文档更改
git add .
git commit -m "docs: setup GitHub Pages deployment"
git push origin master  # 或 main
```

### 步骤3：等待自动部署

1. 转到仓库的 **Actions** 标签
2. 你会看到一个新的工作流运行："Deploy VitePress to GitHub Pages"
3. 等待构建完成（通常需要 2-3 分钟）

### 步骤4：访问你的文档站点

部署完成后，你可以通过以下地址访问：

```
https://[你的GitHub用户名].github.io/[仓库名]/
```

例如：
```
https://johndoe.github.io/gitlab-mcp-server/
```

## 🔧 故障排除

### 问题1：Pages设置中没有gh-pages分支

**原因**：GitHub Actions还没有创建gh-pages分支

**解决**：
1. 等待第一次部署完成
2. 刷新Pages设置页面
3. 重新选择分支

### 问题2：构建失败

**原因**：依赖安装或构建过程出错

**解决**：
1. 检查 Actions 日志中的错误信息
2. 确认 `package.json` 中的脚本配置正确
3. 检查 Node.js 版本兼容性

### 问题3：样式或内容没有更新

**原因**：浏览器缓存

**解决**：
- 强制刷新浏览器：`Ctrl+F5` (Windows/Linux) 或 `Cmd+Shift+R` (macOS)
- 清除浏览器缓存

## 📝 自定义设置

### 添加自定义域名

1. 在 `docs/` 目录下创建 `CNAME` 文件：
   ```
   docs.yourdomain.com
   ```

2. 在 GitHub Pages 设置中配置自定义域名

3. 更新 DNS 解析指向 GitHub Pages

### 修改部署路径

如果你的仓库不是根路径部署，修改 `docs/.vitepress/config.ts`：

```typescript
export default defineConfig({
  base: '/your-repo-name/', // 修改为你的仓库名
  // ... 其他配置
})
```

## 🎉 完成！

设置完成后，每次你推送 `docs/` 目录的更改时，都会自动触发重新部署。你的文档站点将始终保持最新状态！

---

💡 **提示**：如果遇到问题，请查看 [部署说明文档](./docs/DEPLOYMENT.md) 获取更多详细信息。
