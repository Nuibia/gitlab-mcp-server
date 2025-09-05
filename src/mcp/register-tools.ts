import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  getGitLabProjects,
  getProjectByName,
  getProjectsWithBranch,
  handleGitLabError
} from "../services/index.js";
import {
  generateProjectsListText,
  generateProjectsWithBranchesListText
} from "../utils/index.js";

// 导入错误类型

/**
 * 统一的工具执行包装器
 */
function createToolHandler<T extends any[]>(
  handler: (...args: T) => Promise<string>
) {
  return async (...args: T) => {
    try {
      const result = await handler(...args);
      return {
        content: [{ type: "text" as const, text: result }]
      };
    } catch (error) {
      return {
        content: [{ type: "text" as const, text: handleGitLabError(error) }]
      };
    }
  };
}

// 统一注册GitLab相关工具
export function registerGitLabTools(server: McpServer, sessionId?: string): void {
  // 1) 获取所有项目
  server.registerTool(
    "list_projects",
    {
      title: "获取GitLab项目列表",
      description: "获取当前GitLab实例中所有可访问的项目列表。返回项目的完整信息：项目名称、命名空间、描述、可见性、默认分支、统计信息（星标数、Fork数）以及最后更新时间。项目按更新时间倒序排列，最多返回100个项目。",
      inputSchema: {}
    },
    createToolHandler(async () => {
      const projects = await getGitLabProjects(sessionId);
      return generateProjectsListText(projects);
    })
  );

  // 2) 根据分支名筛选项目
  server.registerTool(
    "list_projects_with_branch",
    {
      title: "按分支名搜索项目",
      description: "搜索包含指定分支名的GitLab项目。不区分大小写，支持模糊匹配。返回匹配的项目及其分支详细信息，包括分支状态（默认分支/保护分支/活跃分支/已合并）、最新提交信息（提交SHA、提交标题、作者、时间）等。",
      inputSchema: {
        branchName: z.string().min(1).describe("要搜索的分支名，支持模糊匹配。不区分大小写。例如：'main'、'develop'、'feature'、'hotfix'等")
      }
    },
    createToolHandler(async ({ branchName }: { branchName: string }) => {
      const projects = await getProjectsWithBranch(branchName, sessionId);
      return generateProjectsWithBranchesListText(projects, branchName);
    })
  );

  // 3) 按项目名查询项目信息
  server.registerTool(
    "get_project_by_name",
    {
      title: "按项目名搜索项目",
      description: "通过项目名称或命名空间搜索GitLab项目。支持精确匹配和模糊搜索。返回匹配的项目详细信息，包括项目URL、创建时间、统计信息等。如果未找到匹配项目，会提供搜索建议。",
      inputSchema: {
        projectName: z.string().min(1).describe("项目名称或命名空间，支持精确和模糊匹配。例如：'myproject'、'group/subgroup/project'、'frontend-app'等")
      }
    },
    createToolHandler(async ({ projectName }: { projectName: string }) => {
      const project = await getProjectByName(projectName, sessionId);
      if (!project) {
        return `🔍 未找到与 "${projectName}" 匹配的项目\n\n💡 搜索建议：\n- 检查项目名称拼写是否正确\n- 尝试使用更短的关键词进行模糊搜索\n- 可以使用命名空间格式，如 'group/project'\n- 确保你有访问该项目的权限`;
      }
      return generateProjectsListText([project]);
    })
  );
}
