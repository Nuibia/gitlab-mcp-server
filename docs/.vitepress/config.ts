import { defineConfig } from 'vitepress';

export default defineConfig({
  lang: 'zh-CN',
  title: 'GitLab MCP Server',
  description: '基于 MCP 的 GitLab 项目查询与管理服务',
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    nav: [
       { text: '🏠 首页', link: '/' },
      {
        text: '👥 使用者指南',
        items: [
          { text: '快速开始', link: '/guide/quickstart' },
          { text: '完整使用指南', link: '/USAGE' },
          { text: '配置说明', link: '/guide/config' },
          { text: '工具参考', link: '/reference/tools' }
        ]
      },
      {
        text: '👨‍💻 开发者指南',
        items: [
          { text: '项目架构', link: '/guide/architecture' },
          { text: '代码规范', link: '/contributing/coding-rules' },
          { text: '部署说明', link: '/DEPLOYMENT' }
        ]
      }
    ],
    sidebar: {
      '/': [
        {
          text: '👥 使用者指南',
          items: [
            { text: '快速开始', link: '/guide/quickstart' },
            { text: '完整使用指南', link: '/USAGE' },
            { text: '配置说明', link: '/guide/config' },
            { text: '工具参考', link: '/reference/tools' }
          ]
        },
        {
          text: '👨‍💻 开发者指南',
          items: [
            { text: '项目架构', link: '/guide/architecture' },
            { text: '代码规范', link: '/contributing/coding-rules' },
            { text: '部署说明', link: '/DEPLOYMENT' }
          ]
        }
      ],
      '/guide/': [
        {
          text: '📖 快速开始',
          items: [
            { text: '快速开始', link: '/guide/quickstart' },
            { text: '配置说明', link: '/guide/config' }
          ]
        },
        {
          text: '🏗️ 项目架构',
          items: [
            { text: '架构与分层', link: '/guide/architecture' }
          ]
        }
      ],
      '/reference/': [
        {
          text: '🔧 工具参考',
          items: [
            { text: 'MCP工具说明', link: '/reference/tools' }
          ]
        }
      ],

      '/contributing/': [
        {
          text: '📝 开发规范',
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


