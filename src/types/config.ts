// 环境配置接口
export interface Config {
  /** GitLab 基础地址，例如 https://gitlab.com 或自建实例地址，末尾保留斜杠无影响 */
  gitlabUrl: string;
  /** 访问 GitLab API 的个人访问令牌（需具备 read_api 权限） */
  gitlabToken: string;
  /** 本地 HTTP 服务器监听端口（仅 http-server 入口使用） */
  port: number;
}
