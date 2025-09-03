import axios, { AxiosInstance } from "axios";
import https from "https";
import { GitLabBranch, GitLabProject, ProjectWithBranches } from "../types/index.js";

// 获取GitLab配置（动态读取）
function getGitLabConfig() {
  return {
    url: process.env.GITLAB_URL,
    token: process.env.GITLAB_TOKEN
  };
}

// 检查GitLab token
export function checkGitLabToken(forceExit: boolean = true): void {
  const config = getGitLabConfig();
  if (!config.token) {
    console.warn("⚠️  警告: 未设置GITLAB_TOKEN环境变量");

    if (forceExit) {
      // Stdio模式：强制退出
      console.error("❌ 错误: 请设置GITLAB_TOKEN环境变量");
      console.error("💡 提示: 可以通过环境变量设置: export GITLAB_TOKEN=your_token");
      console.error("   或运行: GITLAB_TOKEN=your_token yarn start");
      process.exit(1);
    } else {
      // HTTP模式：仅警告，不退出
      console.info("💡 提示: 可通过Cursor客户端的env字段注入配置，或使用POST /config端点更新配置");
    }
  } else {
    console.log("✅ GitLab Token 已配置");
  }
}

// 创建axios实例
/**
 * 创建 axios 实例（默认忽略 SSL 校验，便于内网/自签名环境）。
 */
export function createAxiosInstance(): AxiosInstance {
  const config = getGitLabConfig();

  const axiosConfig = {
    timeout: 30000, // 30秒超时
    headers: {
      "PRIVATE-TOKEN": config.token,
      "Content-Type": "application/json"
    },
    // 禁用SSL验证（支持自签名证书）
    httpsAgent: new https.Agent({
      rejectUnauthorized: false
    })
  };

  return axios.create(axiosConfig);
}

// 获取GitLab项目列表
/**
 * 拉取项目列表，默认每页 100 个，按更新时间倒序。
 */
export async function getGitLabProjects(): Promise<GitLabProject[]> {
  const config = getGitLabConfig();

  // 运行时检查配置
  if (!config.url || !config.token) {
    throw new Error("GitLab配置缺失。请通过Cursor客户端的env字段配置GITLAB_URL和GITLAB_TOKEN");
  }

  const axiosInstance = createAxiosInstance();

  const response = await axiosInstance.get<GitLabProject[]>(`${config.url}/api/v4/projects`, {
    params: {
      per_page: 100, // 每页100个项目
      order_by: "updated_at",
      sort: "desc"
    }
  });
  return response.data;
}

// 通过项目名查询项目信息
/**
 * 通过项目名或完整命名空间搜索项目，优先返回精确匹配；否则返回第一个近似匹配或空。
 */
export async function getProjectByName(projectName: string): Promise<GitLabProject | null> {
  const config = getGitLabConfig();

  // 运行时检查配置
  if (!config.url || !config.token) {
    throw new Error("GitLab配置缺失。请通过Cursor客户端的env字段配置GITLAB_URL和GITLAB_TOKEN");
  }

  const axiosInstance = createAxiosInstance();
  const response = await axiosInstance.get<GitLabProject[]>(`${config.url}/api/v4/projects`, {
    params: {
      search: projectName,
      simple: true,
      per_page: 100,
      order_by: "updated_at",
      sort: "desc"
    }
  });

  const candidates = response.data;
  if (!candidates || candidates.length === 0) return null;

  // 优先精确匹配 name 或完整命名空间
  const exact = candidates.find(p => p.name === projectName || p.name_with_namespace === projectName);
  const selected = exact ?? candidates.find(p => p.name_with_namespace.toLowerCase().includes(projectName.toLowerCase()) || p.name.toLowerCase().includes(projectName.toLowerCase())) ?? candidates[0];

  return selected ?? null;
}

// 获取项目的分支列表
/**
 * 拉取指定项目的分支列表。
 */
export async function getProjectBranches(projectId: number): Promise<GitLabBranch[]> {
  const config = getGitLabConfig();

  // 运行时检查配置
  if (!config.url || !config.token) {
    throw new Error("GitLab配置缺失。请通过Cursor客户端的env字段配置GITLAB_URL和GITLAB_TOKEN");
  }

  const axiosInstance = createAxiosInstance();

  try {
    const response = await axiosInstance.get<GitLabBranch[]>(`${config.url}/api/v4/projects/${projectId}/repository/branches`, {
      params: {
        per_page: 100 // 每页100个分支
      }
    });

    return response.data;
  } catch (error) {
    console.warn(`⚠️ 获取项目 ${projectId} 的分支失败:`, error);
    return [];
  }
}

// 获取包含指定分支名的所有项目
/**
 * 搜索包含给定分支名（模糊匹配）的所有项目，支持并发限制以规避 API 限流。
 */
export async function getProjectsWithBranch(branchName: string): Promise<ProjectWithBranches[]> {
  try {
    // 首先获取所有项目
    const projects = await getGitLabProjects();
    const projectsWithBranches: ProjectWithBranches[] = [];

    console.log(`🔍 正在搜索包含分支 "${branchName}" 的项目...`);
    
    // 并发限制（可通过环境变量覆盖），默认同时处理 8 个项目
    const concurrencyLimit = Math.max(1, parseInt(process.env.GITLAB_FETCH_CONCURRENCY || "8", 10));

    // 分批并发执行，避免同时请求过多导致 API 限流
    for (let i = 0; i < projects.length; i += concurrencyLimit) {
      const batch = projects.slice(i, i + concurrencyLimit);
      await Promise.all(
        batch.map(async (project) => {
          try {
            const branches = await getProjectBranches(project.id);
            const matchingBranches = branches.filter((branch) =>
              branch.name.toLowerCase().includes(branchName.toLowerCase())
            );
            if (matchingBranches.length > 0) {
              projectsWithBranches.push({
                ...project,
                branches: matchingBranches,
              });
            }
          } catch (error) {
            console.warn(`⚠️ 获取项目 ${project.name} 的分支失败:`, error);
          }
        })
      );
    }

    return projectsWithBranches;
  } catch (error) {
    throw error;
  }
}

// 处理GitLab API错误
export function handleGitLabError(error: any): string {
  console.error("获取GitLab项目失败:", error);

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    let errorMessage = `❌ 获取GitLab项目失败 (状态码: ${status}): ${message}`;

     // 连接失败时的提示
    if (status === 0 || (error as any).code === 'ECONNREFUSED' || (error as any).code === 'ENOTFOUND') {
      errorMessage += '\n\n💡 网络连接提示:\n' +
        '1. 请检查网络连接是否正常\n' +
        '2. 确认GitLab服务器地址正确\n' +
        '3. 如果使用VPN，请确保VPN连接正常';
    } else if (status === 401) {
      errorMessage += '\n\n💡 认证失败提示:\n' +
        '1. 检查GITLAB_TOKEN是否正确\n' +
        '2. 确认令牌具有read_api权限\n' +
        '3. 检查令牌是否已过期\n' +
        '4. 访问GitLab > Settings > Access Tokens 重新生成令牌';
    } else if (status === 404) {
      errorMessage += '\n\n💡 API路径错误提示:\n' +
        '1. 检查GitLab URL是否正确\n' +
        '2. 确认GitLab版本支持v4 API';
    } else if (status === 403) {
      errorMessage += '\n\n💡 权限不足提示:\n' +
        '1. 确认令牌具有足够的权限\n' +
        '2. 检查用户是否有访问项目的权限\n' +
        '3. 联系GitLab管理员确认权限设置';
    }

    return errorMessage;
  }

  return `❌ 获取GitLab项目失败: ${error instanceof Error ? error.message : '未知错误'}`;
} 