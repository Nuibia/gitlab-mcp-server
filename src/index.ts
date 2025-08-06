import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { 
  GITLAB_URL, 
  GITLAB_TOKEN, 
  checkGitLabToken, 
  createAxiosInstance, 
  GitLabProject, 
  formatProjects, 
  handleGitLabError 
} from "./utils.js";

// 检查GitLab token
checkGitLabToken();

// 创建MCP服务器
const server = new McpServer({
  name: "gitlab-mcp-server",
  version: "1.0.0"
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
      const formattedProjects = formatProjects(projects);
      
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
    console.log(`📡 GitLab URL: ${GITLAB_URL}`);
    
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

process.on("SIGTERM", () => {
  console.log("\n🛑 正在关闭GitLab MCP服务器...");
  process.exit(0);
});

// 启动服务器
main().catch((error) => {
  console.error("❌ 服务器启动失败:", error);
  process.exit(1);
}); 