import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import cors from "cors";
import express from "express";
import { registerGitLabTools } from "./mcp/register-tools.js";
import { configManager, getServerConfig } from "./services/config.js";
import { checkGitLabToken } from "./services/index.js";

// 注意：GitLab配置将在运行时通过Cursor客户端注入，无需启动时强制检查
checkGitLabToken(false);

// 获取配置
const config = configManager.getConfig();
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

// 全局运行时配置存储（按session隔离）
const runtimeConfigStore = new Map<string, { gitlabUrl: string; gitlabToken: string }>();

// 当前正在处理的session ID（用于工具函数获取配置）
let currentProcessingSessionId: string | null = null;

// 获取当前请求的运行时配置
export function getCurrentRuntimeConfig(sessionId?: string): { gitlabUrl?: string; gitlabToken?: string } | null {
  const targetSessionId = sessionId || currentProcessingSessionId;
  if (!targetSessionId) return null;
  return runtimeConfigStore.get(targetSessionId) || null;
}

// 设置当前处理的session ID
function setCurrentProcessingSession(sessionId: string) {
  currentProcessingSessionId = sessionId;
}

// 清除当前处理的session ID
function clearCurrentProcessingSession() {
  currentProcessingSessionId = null;
}

// 运行时配置注入函数 - 每次请求都检查配置
function injectRuntimeConfig(req: any): { gitlabUrl: string; gitlabToken: string } | null {
  // 按优先级顺序获取配置：MCP扩展参数 > HTTP头 > 查询参数
  const configSources = [
    // 方式1：从MCP扩展参数获取（优先级最高）
    req.body?.params?._gitlabConfig && {
      gitlabUrl: req.body.params._gitlabConfig.gitlabUrl,
      gitlabToken: req.body.params._gitlabConfig.gitlabToken
    },
    // 方式2：从HTTP请求头获取
    req.headers['x-gitlab-url'] && req.headers['x-gitlab-token'] && {
      gitlabUrl: req.headers['x-gitlab-url'] as string,
      gitlabToken: req.headers['x-gitlab-token'] as string
    },
    // 方式3：从查询参数获取
    req.query?.gitlabUrl && req.query?.gitlabToken && {
      gitlabUrl: req.query.gitlabUrl as string,
      gitlabToken: req.query.gitlabToken as string
    }
  ];

  // 返回第一个有效的配置
  return configSources.find(config => config && config.gitlabUrl && config.gitlabToken) || null;
}

// 创建新的MCP服务器实例和transport
function createServerInstance(sessionId: string) {
  // 为每个session创建独立的服务器实例
  const server = new McpServer({
    name: serverConfig.name,
    version: serverConfig.version
  });

  // 注册工具（传递sessionId以支持运行时配置）
  registerGitLabTools(server, sessionId);

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

    if (!sessionId && isInitializeRequest(req.body)) {
      // 自动注入配置（如果提供的话）
      injectRuntimeConfig(req);

      // 新初始化请求 - 创建新的transport
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
        transport?.close();
        activeTransports.delete(actualSessionId);
      }, 30 * 60 * 1000); // 30分钟后清理

    } else if (sessionId && activeTransports.has(sessionId)) {
      // 使用现有的transport
      transport = activeTransports.get(sessionId);

      // 设置当前处理的session ID
      setCurrentProcessingSession(sessionId);

      // 对于工具调用请求，检查是否有运行时配置
      if (req.body?.method === 'tools/call') {
        const runtimeConfig = injectRuntimeConfig(req);
        if (runtimeConfig) {
          // 使用新的配置管理器设置运行时配置
          configManager.setRuntimeConfig(sessionId, runtimeConfig);
        }
      }

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
      try {
        await transport.handleRequest(req, res, req.body);
      } finally {
        // 清除当前处理的session ID
        clearCurrentProcessingSession();
      }
    } else {
      clearCurrentProcessingSession();
      res.status(500).json({ error: 'Transport not initialized' });
    }

  } catch (error) {
    console.error('处理MCP请求失败:', error);
    clearCurrentProcessingSession();
    if (!res.headersSent) {
      res.status(500).json({ error: '内部服务器错误' });
    }
  }
});


// 健康检查端点
app.get('/health', (req, res) => {
  // 重新获取最新配置（支持动态更新）
  const currentConfig = configManager.getConfig();
  const configInfo = configManager.getConfigInfo();

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    gitlabUrl: currentConfig.gitlabUrl || "未配置 (请通过Cursor客户端注入)",
    hasToken: !!currentConfig.gitlabToken,
    ready: !!(currentConfig.gitlabUrl && currentConfig.gitlabToken),
    configSource: configInfo.source,
    sessionId: configInfo.sessionId
  });
});

// 根路径
app.get('/', (req, res) => {
  // 重新获取最新配置
  const currentConfig = configManager.getConfig();
  const configInfo = configManager.getConfigInfo();

  res.json({
    name: serverConfig.name,
    version: serverConfig.version,
    description: 'GitLab MCP HTTP服务器',
    config: {
      gitlabUrl: currentConfig.gitlabUrl || "未配置",
      hasToken: !!currentConfig.gitlabToken,
      ready: !!(currentConfig.gitlabUrl && currentConfig.gitlabToken),
      source: configInfo.source
    },
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