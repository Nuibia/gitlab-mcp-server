import axios, { AxiosInstance } from "axios";
import https from "https";
import { FormattedProject, GitLabBranch, GitLabProject, ProjectWithBranches } from "../types/index.js";
import { formatProjects } from "../utils/index.js";

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

// 通过项目名查询项目信息（优先精确匹配，其次包含匹配）
export async function getProjectByName(projectName: string): Promise<FormattedProject | null> {
  const axiosInstance = createAxiosInstance();
  const response = await axiosInstance.get<GitLabProject[]>(`${GITLAB_URL}/api/v4/projects`, {
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

  return formatProjects([selected])[0] ?? null;
}

// 获取项目的分支列表
export async function getProjectBranches(projectId: number): Promise<GitLabBranch[]> {
  const axiosInstance = createAxiosInstance();
  
  try {
    const response = await axiosInstance.get<GitLabBranch[]>(`${GITLAB_URL}/api/v4/projects/${projectId}/repository/branches`, {
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
export async function getProjectsWithBranch(branchName: string): Promise<ProjectWithBranches[]> {
  const axiosInstance = createAxiosInstance();
  
  try {
    // 首先获取所有项目
    const projects = await getGitLabProjects();
    const projectsWithBranches: ProjectWithBranches[] = [];
    
    console.log(`🔍 正在搜索包含分支 "${branchName}" 的项目...`);
    
    // 遍历每个项目，检查是否包含指定分支
    for (const project of projects) {
      try {
        const branches = await getProjectBranches(project.id);
        
        // 检查是否包含指定分支名
        const matchingBranches = branches.filter(branch => 
          branch.name.toLowerCase().includes(branchName.toLowerCase())
        );
        
        if (matchingBranches.length > 0) {
          projectsWithBranches.push({
            ...project,
            branches: matchingBranches
          });
        }
      } catch (error) {
        console.warn(`⚠️ 获取项目 ${project.name} 的分支失败:`, error);
        continue;
      }
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