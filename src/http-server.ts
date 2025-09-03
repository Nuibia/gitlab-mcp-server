import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import cors from "cors";
import express from "express";
import { registerGitLabTools } from "./mcp/register-tools.js";
import { getConfig, getServerConfig } from "./services/config.js";
import { checkGitLabToken } from "./services/index.js";

// 注意：GitLab配置将在运行时通过Cursor客户端注入，无需启动时强制检查
checkGitLabToken(false);

// 获取配置
const config = getConfig();
const serverConfig = getServerConfig();

// 创建Express应用
const app = express();

// 配置CORS - 必须在其他中间件之前
app.use(cors({
  origin: true, // 允许所有来源，生产环境应该限制
  credentials: true,
  exposedHeaders: ['Mcp-Session-Id'],
  allowedHeaders: ['Content-Type', 'Mcp-Session-Id', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());

// 存储活跃的transport实例
const activeTransports = new Map<string, StreamableHTTPServerTransport>();

// 生成session ID
function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// 创建新的MCP服务器实例和transport
function createServerInstance(sessionId: string) {
  // 为每个session创建独立的服务器实例
  const server = new McpServer({
    name: serverConfig.name,
    version: serverConfig.version
  });

  // 注册工具
  registerGitLabTools(server);

  // 创建transport
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => sessionId,
    enableDnsRebindingProtection: false, // 本地开发禁用
  });

  return { server, transport };
}

// 处理所有MCP请求
app.all('/mcp', async (req, res) => {
  try {
    let sessionId = req.headers['mcp-session-id'] as string;
    let transport: StreamableHTTPServerTransport | undefined;

    // 检查是否是初始化请求
    if (!sessionId && isInitializeRequest(req.body)) {
      // 新初始化请求 - 创建新的transport
      console.log(`🚀 创建新的transport for 初始化请求`);
      const sessionIdForTransport = generateSessionId();
      const { server, transport: newTransport } = createServerInstance(sessionIdForTransport);
      transport = newTransport;

      // 连接服务器到transport
      await server.connect(transport);

      // 设置session ID到响应头（优先使用transport的sessionId，如果没有则使用我们生成的）
      const actualSessionId = transport.sessionId || sessionIdForTransport;
      res.setHeader('Mcp-Session-Id', actualSessionId);

      // 存储transport以供后续请求使用
      activeTransports.set(actualSessionId, transport);

      // 设置清理定时器
      setTimeout(() => {
        console.log(`🧹 清理过期session: ${actualSessionId}`);
        transport?.close();
        activeTransports.delete(actualSessionId);
      }, 30 * 60 * 1000); // 30分钟后清理

    } else if (sessionId && activeTransports.has(sessionId)) {
      // 使用现有的transport
      transport = activeTransports.get(sessionId);
      console.log(`🔄 使用现有transport for session: ${sessionId}`);

    } else {
      // 无效请求
      res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Bad Request: No valid session ID provided'
        },
        id: null
      });
      return;
    }

    // 处理请求
    if (transport) {
      await transport.handleRequest(req, res, req.body);
    } else {
      res.status(500).json({ error: 'Transport not initialized' });
    }

  } catch (error) {
    console.error('处理MCP请求失败:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: '内部服务器错误' });
    }
  }
});

// 配置更新端点（用于Cursor客户端注入配置）
app.post('/config', (req, res) => {
  try {
    const { gitlabUrl, gitlabToken } = req.body;

    if (gitlabUrl) {
      process.env.GITLAB_URL = gitlabUrl;
      console.log(`🔧 更新GitLab URL: ${gitlabUrl}`);
    }

    if (gitlabToken) {
      process.env.GITLAB_TOKEN = gitlabToken;
      console.log(`🔧 更新GitLab Token: ${gitlabToken ? '***已设置***' : '已清除'}`);
    }

    const currentConfig = getConfig();
    res.json({
      success: true,
      message: '配置已更新',
      config: {
        gitlabUrl: currentConfig.gitlabUrl || "未配置",
        hasToken: !!currentConfig.gitlabToken,
        ready: !!(currentConfig.gitlabUrl && currentConfig.gitlabToken)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '配置更新失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 健康检查端点
app.get('/health', (req, res) => {
  // 重新获取最新配置（支持动态更新）
  const currentConfig = getConfig();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    gitlabUrl: currentConfig.gitlabUrl || "未配置 (请通过Cursor客户端注入)",
    hasToken: !!currentConfig.gitlabToken,
    ready: !!(currentConfig.gitlabUrl && currentConfig.gitlabToken)
  });
});

// 根路径
app.get('/', (req, res) => {
  // 重新获取最新配置
  const currentConfig = getConfig();
  res.json({
    name: serverConfig.name,
    version: serverConfig.version,
    description: 'GitLab MCP HTTP服务器',
    config: {
      gitlabUrl: currentConfig.gitlabUrl || "未配置",
      hasToken: !!currentConfig.gitlabToken,
      ready: !!(currentConfig.gitlabUrl && currentConfig.gitlabToken)
    },
    endpoints: {
      health: '/health',
      mcp: '/mcp',
      config: '/config (POST - 更新配置)'
    }
  });
});

// 启动服务器
async function main() {
  try {
    console.log("🚀 启动GitLab MCP HTTP服务器...");
    console.log(`📡 GitLab URL: ${config.gitlabUrl}`);
    console.log(`🌐 HTTP服务器端口: ${config.port}`);

    // 启动Express服务器
    app.listen(config.port, () => {
      console.log(`✅ HTTP服务器已启动: http://localhost:${config.port}`);
      console.log(`🔗 MCP端点: http://localhost:${config.port}/mcp`);
      console.log(`💚 健康检查: http://localhost:${config.port}/health`);
    });
  } catch (error) {
    console.error("❌ 启动服务器失败:", error);
    process.exit(1);
  }
}

// 处理进程退出
process.on("SIGINT", () => {
  console.log("\n🛑 正在关闭GitLab MCP HTTP服务器...");

  // 清理所有活跃的transport
  for (const [sessionId, transport] of activeTransports) {
    console.log(`🧹 关闭session: ${sessionId}`);
    transport.close();
  }
  activeTransports.clear();

  process.exit(0);
});

// 启动服务器
main(); 