import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { 
  checkGitLabToken, 
  getGitLabProjects, 
  handleGitLabError 
} from "./services/index.js";
import { getServerConfig } from "./services/config.js";
import { generateProjectsListText } from "./utils.js";

// 检查GitLab token
checkGitLabToken();

// 获取服务器配置
const serverConfig = getServerConfig();

// 创建MCP服务器
const server = new McpServer({
  name: serverConfig.name,
  version: serverConfig.version
});

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
      
      const projects = await getGitLabProjects();
      const projectsText = generateProjectsListText(projects);
      
      return {
        content: [
          {
            type: "text",
            text: projectsText
          }
        ]
      };
    } catch (error) {
      const errorMessage = handleGitLabError(error);
      return {
        content: [
          {
            type: "text",
            text: errorMessage
          }
        ]
      };
    }
  }
);

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