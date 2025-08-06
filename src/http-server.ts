import express from "express";
import cors from "cors";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import axios from "axios";
import dotenv from "dotenv";
import https from "https";

// 加载环境变量
dotenv.config();

// GitLab API配置
const GITLAB_URL = process.env.GITLAB_URL || "https://gitlab.xiaomawang.com/";
const GITLAB_TOKEN = process.env.GITLAB_TOKEN || "Npg-dY3v7qsqb_YC_L5e";

// 代理配置
const HTTP_PROXY = process.env.HTTP_PROXY;
const HTTPS_PROXY = process.env.HTTPS_PROXY;
const NO_PROXY = process.env.NO_PROXY;

// 证书验证配置
const VERIFY_SSL = process.env.VERIFY_SSL !== "false"; // 默认验证SSL

// 服务器配置
const PORT = process.env.PORT || 3000;

if (!GITLAB_TOKEN) {
  console.error("错误: 请设置GITLAB_TOKEN环境变量");
  process.exit(1);
}

// 创建axios实例，支持内网访问
const createAxiosInstance = () => {
  const config: any = {
    timeout: 30000, // 30秒超时
    headers: {
      "PRIVATE-TOKEN": GITLAB_TOKEN,
      "Content-Type": "application/json"
    }
  };

  // 配置代理
  if (HTTP_PROXY || HTTPS_PROXY) {
    config.proxy = {
      host: HTTP_PROXY || HTTPS_PROXY,
      port: 80,
      protocol: 'http'
    };
    console.log(`🔗 使用代理: ${config.proxy.host}`);
  }

  // 配置HTTPS选项（用于自签名证书）
  if (!VERIFY_SSL) {
    config.httpsAgent = new https.Agent({
      rejectUnauthorized: false
    });
    console.log("⚠️  已禁用SSL证书验证");
  }

  return axios.create(config);
};

// 创建MCP服务器
const server = new McpServer({
  name: "gitlab-mcp-server",
  version: "1.0.0"
});

// 定义GitLab项目接口
interface GitLabProject {
  id: number;
  name: string;
  name_with_namespace: string;
  description: string | null;
  web_url: string;
  created_at: string;
  updated_at: string;
  visibility: string;
  default_branch: string;
  star_count: number;
  forks_count: number;
}

// 注册GitLab项目列表工具
server.registerTool(
  "list_projects",
  {
    title: "GitLab项目列表",
    description: "获取所有GitLab项目列表",
    inputSchema: {}
  },
  async () => {
    try {
      console.log("正在获取GitLab项目列表...");
      console.log(`📡 目标GitLab: ${GITLAB_URL}`);
      
      const axiosInstance = createAxiosInstance();
      
      // 调用GitLab API获取项目列表
      const response = await axiosInstance.get(`${GITLAB_URL}/api/v4/projects`, {
        params: {
          per_page: 100, // 每页100个项目
          order_by: "updated_at",
          sort: "desc"
        }
      });

      const projects: GitLabProject[] = response.data;
      
      // 格式化项目信息
      const formattedProjects = projects.map(project => ({
        id: project.id,
        name: project.name,
        fullName: project.name_with_namespace,
        description: project.description || "无描述",
        url: project.web_url,
        visibility: project.visibility,
        defaultBranch: project.default_branch,
        stars: project.star_count,
        forks: project.forks_count,
        createdAt: project.created_at,
        updatedAt: project.updated_at
      }));

      return {
        content: [
          {
            type: "text",
            text: `✅ 成功获取到 ${formattedProjects.length} 个项目:\n\n${formattedProjects.map(project => 
              `📁 **${project.fullName}**\n` +
              `   - 描述: ${project.description}\n` +
              `   - 可见性: ${project.visibility}\n` +
              `   - 默认分支: ${project.defaultBranch}\n` +
              `   - 星标: ${project.stars} | 分支: ${project.forks}\n` +
              `   - 链接: ${project.url}\n` +
              `   - 最后更新: ${new Date(project.updatedAt).toLocaleString('zh-CN')}\n`
            ).join('\n')}`
          }
        ]
      };
    } catch (error) {
      console.error("获取GitLab项目失败:", error);
      
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;
        
        let errorMessage = `❌ 获取GitLab项目失败 (状态码: ${status}): ${message}`;
        
        // 针对内网访问的特殊错误处理
        if (status === 0 || error.code === 'ECONNREFUSED') {
          errorMessage += '\n\n💡 内网访问提示:\n' +
            '1. 检查网络连接是否正常\n' +
            '2. 确认GitLab URL是否正确\n' +
            '3. 如需代理，请设置HTTP_PROXY或HTTPS_PROXY环境变量\n' +
            '4. 如果是自签名证书，请设置VERIFY_SSL=false';
        } else if (status === 401) {
          errorMessage += '\n\n💡 认证失败提示:\n' +
            '1. 检查GITLAB_TOKEN是否正确\n' +
            '2. 确认令牌具有read_api权限\n' +
            '3. 检查令牌是否已过期';
        } else if (status === 404) {
          errorMessage += '\n\n💡 API路径错误提示:\n' +
            '1. 检查GitLab URL是否正确\n' +
            '2. 确认GitLab版本支持v4 API\n' +
            '3. 检查网络连接';
        }
        
        return {
          content: [
            {
              type: "text",
              text: errorMessage
            }
          ]
        };
      }
      
      return {
        content: [
          {
            type: "text",
            text: `❌ 获取GitLab项目失败: ${error instanceof Error ? error.message : '未知错误'}`
          }
        ]
      };
    }
  }
);

// 创建Express应用
const app = express();

// 配置CORS
app.use(cors({
  origin: '*', // 允许所有来源，生产环境应该限制
  exposedHeaders: ['Mcp-Session-Id'],
  allowedHeaders: ['Content-Type', 'mcp-session-id'],
}));

app.use(express.json());

// 存储传输实例
let transport: StreamableHTTPServerTransport | null = null;

// 处理POST请求（客户端到服务器通信）
app.post('/mcp', async (req, res) => {
  try {
    if (!transport) {
      // 创建新的传输实例
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => Math.random().toString(36).substring(2, 15),
        enableDnsRebindingProtection: false, // 本地开发禁用
      });

      // 连接MCP服务器
      await server.connect(transport);
      console.log("✅ MCP服务器已连接");
    }

    // 处理请求
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("处理MCP请求失败:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal server error',
        },
        id: null,
      });
    }
  }
});

// 处理GET请求（服务器到客户端通知）
app.get('/mcp', async (req, res) => {
  try {
    if (!transport) {
      res.status(400).send('No active session');
      return;
    }
    await transport.handleRequest(req, res);
  } catch (error) {
    console.error("处理GET请求失败:", error);
    res.status(500).send('Internal server error');
  }
});

// 处理DELETE请求（会话终止）
app.delete('/mcp', async (req, res) => {
  try {
    if (!transport) {
      res.status(400).send('No active session');
      return;
    }
    await transport.handleRequest(req, res);
    transport = null;
    console.log("🛑 会话已终止");
  } catch (error) {
    console.error("处理DELETE请求失败:", error);
    res.status(500).send('Internal server error');
  }
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    gitlabUrl: GITLAB_URL,
    hasToken: !!GITLAB_TOKEN
  });
});

// 启动服务器
async function main() {
  try {
    console.log("🚀 启动GitLab MCP HTTP服务器...");
    console.log(`📡 GitLab URL: ${GITLAB_URL}`);
    console.log(`🌐 HTTP服务器端口: ${PORT}`);
    
    if (HTTP_PROXY || HTTPS_PROXY) {
      console.log(`🔗 代理配置: ${HTTP_PROXY || HTTPS_PROXY}`);
    }
    
    if (!VERIFY_SSL) {
      console.log("⚠️  SSL证书验证已禁用");
    }
    
    app.listen(PORT, () => {
      console.log(`✅ HTTP服务器已启动: http://localhost:${PORT}`);
      console.log(`📋 健康检查: http://localhost:${PORT}/health`);
      console.log(`🔌 MCP端点: http://localhost:${PORT}/mcp`);
      console.log("\n💡 使用说明:");
      console.log("1. 在MCP客户端中配置此服务器地址");
      console.log("2. 使用HTTP传输方式连接");
      console.log("3. 调用list_projects工具获取GitLab项目");
    });
  } catch (error) {
    console.error("❌ 启动服务器失败:", error);
    process.exit(1);
  }
}

// 处理进程退出
process.on("SIGINT", () => {
  console.log("\n🛑 正在关闭GitLab MCP HTTP服务器...");
  if (transport) {
    transport.close();
  }
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 正在关闭GitLab MCP HTTP服务器...");
  if (transport) {
    transport.close();
  }
  process.exit(0);
});

// 启动服务器
main().catch((error) => {
  console.error("❌ 服务器启动失败:", error);
  process.exit(1);
}); 