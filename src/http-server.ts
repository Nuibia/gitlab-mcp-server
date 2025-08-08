import express from "express";
import cors from "cors";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { checkGitLabToken } from "./services/index.js";
import { getServerConfig, getConfig } from "./services/config.js";
import { registerGitLabTools } from "./mcp/register-tools.js";

// 检查GitLab token
checkGitLabToken();

// 获取配置
const config = getConfig();
const serverConfig = getServerConfig();

// 创建MCP服务器
const server = new McpServer({
  name: serverConfig.name,
  version: serverConfig.version
});

// 统一注册工具
registerGitLabTools(server);

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
  if (!transport) {
    return res.status(503).json({ error: '服务器未初始化' });
  }

  try {
    await transport.handleRequest(req, res);
  } catch (error) {
    console.error('处理MCP请求失败:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: '内部服务器错误' });
    }
  }
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    gitlabUrl: config.gitlabUrl,
    hasToken: !!config.gitlabToken
  });
});

// 根路径
app.get('/', (req, res) => {
  res.json({
    name: serverConfig.name,
    version: serverConfig.version,
    description: 'GitLab MCP HTTP服务器',
    endpoints: {
      health: '/health',
      mcp: '/mcp'
    }
  });
});

// 启动服务器
async function main() {
  try {
    console.log("🚀 启动GitLab MCP HTTP服务器...");
    console.log(`📡 GitLab URL: ${config.gitlabUrl}`);
    console.log(`🌐 HTTP服务器端口: ${config.port}`);

    // 创建HTTP传输
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => Math.random().toString(36).substring(2, 15),
      enableDnsRebindingProtection: false, // 本地开发禁用
    });
    await server.connect(transport);

    // 启动Express服务器
    app.listen(config.port, () => {
      console.log(`✅ HTTP服务器已启动: http://localhost:${config.port}`);
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

// 启动服务器
main(); 