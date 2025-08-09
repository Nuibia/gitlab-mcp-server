import { defineConfig } from 'vitepress';

export default defineConfig({
  lang: 'zh-CN',
  title: 'GitLab MCP Server',
  description: '基于 MCP 的 GitLab 项目查询与管理服务',
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    nav: [
      { text: '快速开始', link: '/guide/quickstart' },
      { text: '使用方式', link: '/USAGE' },
      { text: 'HTTP 模式', link: '/guide/http' },
      { text: '工具参考', link: '/reference/tools' },
      { text: '常见场景', link: '/recipes/examples' },
      { text: '代码规范', link: '/contributing/coding-rules' },
      { text: '部署', link: '/DEPLOYMENT' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: '快速开始', link: '/guide/quickstart' },
            { text: 'HTTP 模式', link: '/guide/http' },
            { text: '配置说明', link: '/guide/config' },
            { text: '架构与分层', link: '/guide/architecture' }
          ]
        }
      ],
      '/reference/': [
        {
          text: '参考',
          items: [
            { text: '工具列表', link: '/reference/tools' }
          ]
        }
      ],
      '/recipes/': [
        {
          text: '场景与示例',
          items: [
            { text: '常见场景', link: '/recipes/examples' }
          ]
        }
      ],
      '/contributing/': [
        {
          text: '贡献指南',
          items: [
            { text: '代码规范', link: '/contributing/coding-rules' }
          ]
        }
      ]
    },
    outline: 'deep',
    socialLinks: [],
    footer: {
      message: 'MIT License',
      copyright: 'Copyright © 2025'
    }
  }
});


