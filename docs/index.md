---
layout: home
title: GitLab MCP Server
titleTemplate: 基于 MCP 的 GitLab 项目管理服务器
hero:
  name: GitLab MCP Server
  text: 简洁 · 可扩展 · 贴合内网环境
  tagline: 基于 TypeScript 与 MCP SDK 的 GitLab 查询与检索服务，支持 Stdio 与 HTTP 运行方式。
  actions:
    - theme: brand
      text: 快速开始
      link: /USAGE
    - theme: alt
      text: HTTP 模式
      link: /HTTP_SERVER_GUIDE
features:
  - title: 一键上手
    details: 使用 yarn 与 nvm 即可快速启动，提供 Stdio / HTTP 双入口。
  - title: 贴合企业内网
    details: 默认忽略 SSL 校验，轻松适配 VPN、自签名证书与内网 GitLab。
  - title: 分层清晰
    details: services 负责请求，utils 负责纯处理，类型定义完备。
---

## 主要功能

- 列出所有项目：`list_projects`
- 按分支名搜索项目：`list_projects_with_branch`
- 按项目名搜索项目：`get_project_by_name`


更多内容见 使用指南 与 HTTP 服务器指南。


