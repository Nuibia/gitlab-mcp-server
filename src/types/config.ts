// 环境配置接口
export interface Config {
  gitlabUrl: string;
  gitlabToken: string;
  port: number;
  nodeEnv: string;
}

// 服务器配置接口
export interface ServerConfig {
  name: string;
  version: string;
  port?: number;
}

// Axios配置接口
export interface AxiosConfig {
  timeout: number;
  headers: Record<string, string>;
  httpsAgent?: any;
  proxy?: {
    host: string;
    port: number;
    protocol: string;
  };
} 