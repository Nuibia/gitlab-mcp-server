import { defineConfig } from 'vitepress';

export default defineConfig({
  lang: 'zh-CN',
  title: 'GitLab MCP Server',
  description: '基于 MCP 的 GitLab 项目查询与管理服务',
  base: '/', // GitHub Pages部署到根路径
  cleanUrls: true,
  lastUpdated: true,

  vite: {
    server: {
      host: '0.0.0.0', // 支持本地IP访问
      port: 4173
    }
  },
  themeConfig: {

    nav: [
       { text: '🏠 首页', link: '/' },
      {
        text: '👥 使用者指南',
        items: [
          { text: '快速开始', link: '/guide/quickstart' },
          { text: '完整使用指南', link: '/guide/usage' },
          { text: '配置说明', link: '/guide/config' },
          { text: '工具参考', link: '/reference/tools' }
        ]
      },
      {
        text: '👨‍💻 开发者指南',
        items: [
          { text: '项目架构', link: '/guide/architecture' },
          { text: '代码规范', link: '/contributing/coding-rules' },
          { text: '部署说明', link: '/guide/deployment' }
        ]
      },
      { text: '🚀 技术分享', link: '/guide/tech-share' }
    ],
    sidebar: {
      '/': [
        {
          text: '👥 使用者指南',
          collapsed: false,
          items: [
            { text: '快速开始', link: '/guide/quickstart' },
            { text: '完整使用指南', link: '/guide/usage' },
            { text: '配置说明', link: '/guide/config' },
            { text: '工具参考', link: '/reference/tools' }
          ]
        },
        {
          text: '👨‍💻 开发者指南',
          collapsed: false,
          items: [
            { text: '项目架构', link: '/guide/architecture' },
            { text: '代码规范', link: '/contributing/coding-rules' },
            { text: '部署说明', link: '/guide/deployment' }
          ]
        },
        {
          text: '🚀 技术分享',
          collapsed: false,
          items: [
            { text: '技术分享', link: '/guide/tech-share' }
          ]
        }
      ],
      // 使用者指南页面 - 只显示使用者指南导航
      '/guide/quickstart': [
        {
          text: '👥 使用者指南',
          collapsed: false,
          items: [
            { text: '快速开始', link: '/guide/quickstart' },
            { text: '完整使用指南', link: '/guide/usage' },
            { text: '配置说明', link: '/guide/config' },
            { text: '工具参考', link: '/reference/tools' }
          ]
        }
      ],

      '/guide/usage': [
        {
          text: '👥 使用者指南',
          collapsed: false,
          items: [
            { text: '快速开始', link: '/guide/quickstart' },
            { text: '完整使用指南', link: '/guide/usage' },
            { text: '配置说明', link: '/guide/config' },
            { text: '工具参考', link: '/reference/tools' }
          ]
        }
      ],

      '/guide/config': [
        {
          text: '👥 使用者指南',
          collapsed: false,
          items: [
            { text: '快速开始', link: '/guide/quickstart' },
            { text: '完整使用指南', link: '/guide/usage' },
            { text: '配置说明', link: '/guide/config' },
            { text: '工具参考', link: '/reference/tools' }
          ]
        }
      ],

      '/reference/tools': [
        {
          text: '👥 使用者指南',
          collapsed: false,
          items: [
            { text: '快速开始', link: '/guide/quickstart' },
            { text: '完整使用指南', link: '/guide/usage' },
            { text: '配置说明', link: '/guide/config' },
            { text: '工具参考', link: '/reference/tools' }
          ]
        }
      ],

      // 开发者指南页面 - 只显示开发者指南导航
      '/guide/architecture': [
        {
          text: '👨‍💻 开发者指南',
          collapsed: false,
          items: [
            { text: '项目架构', link: '/guide/architecture' },
            { text: '代码规范', link: '/contributing/coding-rules' },
            { text: '部署说明', link: '/guide/deployment' }
          ]
        }
      ],

      '/contributing/coding-rules': [
        {
          text: '👨‍💻 开发者指南',
          collapsed: false,
          items: [
            { text: '项目架构', link: '/guide/architecture' },
            { text: '代码规范', link: '/contributing/coding-rules' },
            { text: '部署说明', link: '/guide/deployment' }
          ]
        }
      ],

      '/guide/deployment': [
        {
          text: '👨‍💻 开发者指南',
          collapsed: false,
          items: [
            { text: '项目架构', link: '/guide/architecture' },
            { text: '代码规范', link: '/contributing/coding-rules' },
            { text: '部署说明', link: '/guide/deployment' }
          ]
        }
      ]
    },

    outline: 'deep',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Nuibia/gitlab-mcp-server' }
    ],
    footer: {
      message: 'MIT License',
      copyright: 'Copyright © 2025'
    }
  }
});


