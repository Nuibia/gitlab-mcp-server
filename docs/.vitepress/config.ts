import { defineConfig } from 'vitepress';

export default defineConfig({
  lang: 'zh-CN',
  title: 'GitLab MCP Server',
  description: '基于 MCP 的 GitLab 项目管理服务器',
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    nav: [
      { text: '使用指南', link: '/USAGE' },
      { text: 'HTTP 模式', link: '/HTTP_SERVER_GUIDE' },
      { text: '使用实例', link: '/EXAMPLES' },
      { text: '分支功能', link: '/BRANCH_FEATURE' },
      { text: '代码规则', link: '/CODING_RULES' },
      { text: '项目总结', link: '/SUMMARY' }
    ],
    sidebar: [
      {
        text: '快速开始',
        items: [
          { text: '项目首页', link: '/' },
          { text: '使用指南', link: '/USAGE' }
        ]
      },
      {
        text: '运行模式',
        items: [
          { text: 'HTTP 服务器指南', link: '/HTTP_SERVER_GUIDE' }
        ]
      },
      {
        text: '场景与示例',
        items: [
          { text: '使用实例', link: '/EXAMPLES' },
          { text: '分支功能', link: '/BRANCH_FEATURE' }
        ]
      },
      {
        text: '开发与规范',
        items: [
          { text: '代码规则', link: '/CODING_RULES' },
          { text: '项目总结', link: '/SUMMARY' }
        ]
      }
    ],
    outline: 'deep',
    socialLinks: [],
    footer: {
      message: 'MIT License',
      copyright: 'Copyright © 2025'
    }
  }
});


