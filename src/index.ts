import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerGitLabTools } from "./mcp/register-tools.js";
import { getServerConfig } from "./services/config.js";

// 获取服务器配置
const serverConfig = getServerConfig();

// 创建MCP服务器
const server = new McpServer({
  name: serverConfig.name,
  version: serverConfig.version
});

// 统一注册工具
registerGitLabTools(server);

// 启动服务器
async function main() {
  try {
    console.log("🚀 启动GitLab MCP服务器...");

    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.log("✅ GitLab MCP服务器已启动，等待连接...");
  } catch (error) {
    console.error("❌ 启动服务器失败:", error);
    process.exit(1);
  }
}

// 处理进程退出
process.on("SIGINT", () => {
  console.log("\n🛑 正在关闭GitLab MCP服务器...");
  process.exit(0);
});

// 启动服务器
main(); 