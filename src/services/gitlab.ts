import axios, { AxiosInstance } from "axios";
import https from "https";
import { GitLabProject, FormattedProject, GitLabApiResponse } from "../types/index.js";

// GitLab API配置
const GITLAB_URL = process.env.GITLAB_URL || "https://gitlab.com/";
const GITLAB_TOKEN = process.env.GITLAB_TOKEN;

// 检查GitLab token
export function checkGitLabToken(): void {
  if (!GITLAB_TOKEN) {
    console.error("❌ 错误: 请设置GITLAB_TOKEN环境变量");
    console.error("💡 提示: 请访问GitLab > Settings > Access Tokens 创建个人访问令牌");
    process.exit(1);
  }
}

// 创建axios实例
export function createAxiosInstance(): AxiosInstance {
  const config = {
    timeout: 30000, // 30秒超时
    headers: {
      "PRIVATE-TOKEN": GITLAB_TOKEN,
      "Content-Type": "application/json"
    },
    // 禁用SSL验证（支持自签名证书）
    httpsAgent: new https.Agent({
      rejectUnauthorized: false
    })
  };

  return axios.create(config);
}

// 格式化项目信息
export function formatProjects(projects: GitLabProject[]): FormattedProject[] {
  return projects.map(project => ({
    id: project.id,
    name: project.name,
    fullName: project.name_with_namespace,
    description: project.description || "无描述",
    url: project.web_url,
    visibility: project.visibility,
    defaultBranch: project.default_branch,
    stars: project.star_count,
    forks: project.forks_count,
    createdAt: project.created_at,
    updatedAt: project.updated_at
  }));
}

// 获取GitLab项目列表
export async function getGitLabProjects(): Promise<FormattedProject[]> {
  const axiosInstance = createAxiosInstance();
  
  const response = await axiosInstance.get<GitLabProject[]>(`${GITLAB_URL}/api/v4/projects`, {
    params: {
      per_page: 100, // 每页100个项目
      order_by: "updated_at",
      sort: "desc"
    }
  });

  return formatProjects(response.data);
}

// 处理GitLab API错误
export function handleGitLabError(error: any): string {
  console.error("获取GitLab项目失败:", error);
  
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    
    let errorMessage = `❌ 获取GitLab项目失败 (状态码: ${status}): ${message}`;
    
    // 连接失败时的提示
    if (status === 0 || error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
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