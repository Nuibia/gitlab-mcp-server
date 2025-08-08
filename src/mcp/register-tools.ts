import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  getGitLabProjects,
  getProjectsWithBranch,
  getProjectByName,
  handleGitLabError
} from "../services/index.js";
import {
  generateProjectsListText,
  generateProjectsWithBranchesListText
} from "../utils/index.js";

// 统一注册GitLab相关工具
export function registerGitLabTools(server: McpServer): void {
  // 1) 获取所有项目
  server.registerTool(
    "list_projects",
    {
      title: "GitLab项目列表",
      description: "获取所有GitLab项目列表",
      inputSchema: {}
    },
    async () => {
      try {
        const projects = await getGitLabProjects();
        const projectsText = generateProjectsListText(projects);
        return {
          content: [{ type: "text", text: projectsText }]
        };
      } catch (error) {
        const errorMessage = handleGitLabError(error);
        return { content: [{ type: "text", text: errorMessage }] };
      }
    }
  );

  // 2) 根据分支名筛选项目
  server.registerTool(
    "list_projects_with_branch",
    {
      title: "获取包含指定分支名的项目",
      description: "获取所有包含指定分支名的GitLab项目",
      inputSchema: {
        branchName: z.string().describe("要搜索的分支名（支持模糊匹配）").default("master")
      }
    },
    async ({ branchName }) => {
      try {
        const projects = await getProjectsWithBranch(branchName);
        const projectsText = generateProjectsWithBranchesListText(projects, branchName);
        return {
          content: [{ type: "text", text: projectsText }]
        };
      } catch (error) {
        const errorMessage = handleGitLabError(error);
        return { content: [{ type: "text", text: errorMessage }] };
      }
    }
  );

  // 3) 按项目名查询项目信息
  server.registerTool(
    "get_project_by_name",
    {
      title: "按项目名查询项目信息",
      description: "根据项目名（支持精确与模糊）查询项目信息",
      inputSchema: {
        projectName: z.string().describe("项目名或完整命名空间，如 group/subgroup/repo")
      }
    },
    async ({ projectName }) => {
      try {
        const project = await getProjectByName(projectName);
        if (!project) {
          return { content: [{ type: "text", text: `🔍 未找到与 "${projectName}" 匹配的项目` }] };
        }
        const text = generateProjectsListText([project]);
        return { content: [{ type: "text", text }] };
      } catch (error) {
        const errorMessage = handleGitLabError(error);
        return { content: [{ type: "text", text: errorMessage }] };
      }
    }
  );
}
