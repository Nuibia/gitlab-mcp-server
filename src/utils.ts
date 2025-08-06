import axios from "axios";
import https from "https";
import dotenv from "dotenv";

// 加载环境变量
dotenv.config();

// GitLab API配置
export const GITLAB_URL = process.env.GITLAB_URL || "https://gitlab.xiaomawang.com/";
export const GITLAB_TOKEN = process.env.GITLAB_TOKEN;

// 代理配置
const HTTP_PROXY = process.env.HTTP_PROXY;
const HTTPS_PROXY = process.env.HTTPS_PROXY;

// 证书验证配置
const VERIFY_SSL = process.env.VERIFY_SSL !== "false"; // 默认验证SSL

// 检查GitLab token
export function checkGitLabToken() {
  if (!GITLAB_TOKEN) {
    console.error("错误: 请设置GITLAB_TOKEN环境变量");
    process.exit(1);
  }
}

// 创建axios实例，支持内网访问
export function createAxiosInstance() {
  const config: any = {
    timeout: 30000, // 30秒超时
    headers: {
      "PRIVATE-TOKEN": GITLAB_TOKEN,
      "Content-Type": "application/json"
    }
  };

  // 配置代理
  if (HTTP_PROXY || HTTPS_PROXY) {
    config.proxy = {
      host: HTTP_PROXY || HTTPS_PROXY,
      port: 80,
      protocol: 'http'
    };
    console.log(`🔗 使用代理: ${config.proxy.host}`);
  }

  // 配置HTTPS选项（用于自签名证书）
  if (!VERIFY_SSL) {
    config.httpsAgent = new https.Agent({
      rejectUnauthorized: false
    });
    console.log("⚠️  已禁用SSL证书验证");
  }

  return axios.create(config);
}

// 定义GitLab项目接口
export interface GitLabProject {
  id: number;
  name: string;
  name_with_namespace: string;
  description: string | null;
  web_url: string;
  created_at: string;
  updated_at: string;
  visibility: string;
  default_branch: string;
  star_count: number;
  forks_count: number;
}

// 格式化项目信息
export function formatProjects(projects: GitLabProject[]) {
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

// 处理GitLab API错误
export function handleGitLabError(error: any) {
  console.error("获取GitLab项目失败:", error);
  
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    
    let errorMessage = `❌ 获取GitLab项目失败 (状态码: ${status}): ${message}`;
    
    // 针对内网访问的特殊错误处理
    if (status === 0 || error.code === 'ECONNREFUSED') {
      errorMessage += '\n\n💡 内网访问提示:\n' +
        '1. 检查网络连接是否正常\n' +
        '2. 确认GitLab URL是否正确\n' +
        '3. 如需代理，请设置HTTP_PROXY或HTTPS_PROXY环境变量\n' +
        '4. 如果是自签名证书，请设置VERIFY_SSL=false';
    } else if (status === 401) {
      errorMessage += '\n\n💡 认证失败提示:\n' +
        '1. 检查GITLAB_TOKEN是否正确\n' +
        '2. 确认令牌具有read_api权限\n' +
        '3. 检查令牌是否已过期';
    } else if (status === 404) {
      errorMessage += '\n\n💡 API路径错误提示:\n' +
        '1. 检查GitLab URL是否正确\n' +
        '2. 确认GitLab版本支持v4 API\n' +
        '3. 检查网络连接';
    }
    
    return errorMessage;
  }
  
  return `❌ 获取GitLab项目失败: ${error instanceof Error ? error.message : '未知错误'}`;
} 