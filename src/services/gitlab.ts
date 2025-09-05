import axios, { AxiosInstance } from "axios";
import https from "https";
import { GitLabBranch, GitLabProject, ProjectWithBranches } from "../types/index.js";
import { configManager } from "./config.js";

// ==================== 错误分类系统 ====================

/**
 * GitLab API 错误类型枚举
 */
export enum GitLabErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  API_LIMIT_ERROR = 'API_LIMIT_ERROR',
  CONFIG_ERROR = 'CONFIG_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * GitLab API 错误类
 */
export class GitLabAPIError extends Error {
  constructor(
    message: string,
    public type: GitLabErrorType,
    public statusCode?: number,
    public originalError?: any
  ) {
    super(message);
    this.name = 'GitLabAPIError';
  }
}

// ==================== 配置检查 ====================
// 检查GitLab token
export function checkGitLabToken(forceExit: boolean = true, sessionId?: string): void {
  const config = configManager.getConfig(sessionId);

  if (!config.gitlabToken) {
    console.warn("⚠️  警告: 未设置GITLAB_TOKEN环境变量");

    if (forceExit) {
      // Stdio模式：强制退出
      console.error("❌ 错误: 请设置GITLAB_TOKEN环境变量");
      console.error("💡 提示: 可以通过环境变量设置: export GITLAB_TOKEN=your_token");
      console.error("   或运行: GITLAB_TOKEN=your_token yarn start");
      process.exit(1);
    } else {
      // HTTP模式：仅警告，不退出
      console.info("💡 提示: 可通过Cursor客户端的HTTP头传递配置，或使用环境变量配置");
    }
  } else {
    console.log("✅ GitLab Token 已配置");
  }
}

// 验证GitLab配置
export function validateGitLabConfig(sessionId?: string): { url: string; token: string } {
  const config = configManager.getConfig(sessionId);

  if (!config.gitlabUrl || !config.gitlabToken) {
    throw new Error("GitLab配置缺失。请通过环境变量或运行时参数配置GITLAB_URL和GITLAB_TOKEN");
  }

  return {
    url: config.gitlabUrl,
    token: config.gitlabToken
  };
}

// 创建axios实例
/**
 * 创建 axios 实例（默认忽略 SSL 校验，便于内网/自签名环境）。
 * 支持运行时配置覆盖默认配置。
 */
export function createAxiosInstance(sessionId?: string): AxiosInstance {
  const config = configManager.getConfig(sessionId);

  if (!config.gitlabToken) {
    throw new Error("GitLab token 未配置");
  }

  const axiosConfig = {
    timeout: 30000, // 30秒超时
    headers: {
      "PRIVATE-TOKEN": config.gitlabToken,
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
export async function getGitLabProjects(sessionId?: string): Promise<GitLabProject[]> {
  // 验证配置
  const { url } = validateGitLabConfig(sessionId);

  // 使用统一的axios实例创建函数
  const axiosInstance = createAxiosInstance(sessionId);

  const response = await axiosInstance.get<GitLabProject[]>(`${url}/api/v4/projects`, {
    params: {
      per_page: 100,
      order_by: "updated_at",
      sort: "desc"
    }
  });
  return response.data;
}

// 通过项目名查询项目信息
/**
 * 通过项目名或完整命名空间搜索项目，优先返回精确匹配；否则返回第一个近似匹配或空。
 * @param projectName 项目名称
 * @param sessionId 会话ID（用于获取运行时配置）
 */
export async function getProjectByName(projectName: string, sessionId?: string): Promise<GitLabProject | null> {
  // 验证配置
  const { url } = validateGitLabConfig(sessionId);

  const axiosInstance = createAxiosInstance(sessionId);
  const response = await axiosInstance.get<GitLabProject[]>(`${url}/api/v4/projects`, {
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
 * @param projectId 项目ID
 * @param sessionId 会话ID（用于获取运行时配置）
 */
export async function getProjectBranches(projectId: number, sessionId?: string): Promise<GitLabBranch[]> {
  // 验证配置
  const { url } = validateGitLabConfig(sessionId);

  const axiosInstance = createAxiosInstance(sessionId);

  try {
    const response = await axiosInstance.get<GitLabBranch[]>(`${url}/api/v4/projects/${projectId}/repository/branches`, {
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
 * @param branchName 分支名
 * @param sessionId 会话ID（用于获取运行时配置）
 */
export async function getProjectsWithBranch(branchName: string, sessionId?: string): Promise<ProjectWithBranches[]> {
  try {
    // 首先获取所有项目
    const projects = await getGitLabProjects(sessionId);
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
            const branches = await getProjectBranches(project.id, sessionId);
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

/**
 * 分类GitLab API错误
 */
export function classifyGitLabError(error: any): GitLabErrorType {
  if (!axios.isAxiosError(error)) {
    return GitLabErrorType.UNKNOWN_ERROR;
  }

  const status = error.response?.status;
  const code = (error as any).code;

  // 网络错误
  if (status === 0 || code === 'ECONNREFUSED' || code === 'ENOTFOUND' || code === 'ETIMEDOUT') {
    return GitLabErrorType.NETWORK_ERROR;
  }

  // HTTP状态码分类
  switch (status) {
    case 401:
      return GitLabErrorType.AUTH_ERROR;
    case 403:
      return GitLabErrorType.PERMISSION_ERROR;
    case 404:
      return GitLabErrorType.NOT_FOUND_ERROR;
    case 429:
      return GitLabErrorType.API_LIMIT_ERROR;
    case 500:
    case 502:
    case 503:
    case 504:
      return GitLabErrorType.SERVER_ERROR;
    default:
      return GitLabErrorType.UNKNOWN_ERROR;
  }
}

/**
 * 创建分类的GitLab错误
 */
export function createGitLabError(error: any, context?: string): Error {
  const errorType = classifyGitLabError(error);
  const message = handleGitLabError(error);

  if (axios.isAxiosError(error)) {
    return new GitLabAPIError(
      message,
      errorType,
      error.response?.status,
      error
    );
  }

  return new Error(`${context ? context + ': ' : ''}${message}`);
} 