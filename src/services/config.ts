import dotenv from "dotenv";
import { Config, ServerConfig } from "../types/index.js";

// 加载环境变量
dotenv.config();

// 获取环境配置
export function getConfig(): Config {
  return {
    gitlabUrl: process.env.GITLAB_URL || "https://gitlab.com/",
    gitlabToken: process.env.GITLAB_TOKEN || "",
    port: parseInt(process.env.PORT || "3000", 10),
    nodeEnv: process.env.NODE_ENV || "development"
  };
}

// 获取服务器配置
export function getServerConfig(): ServerConfig {
  return {
    name: "gitlab-mcp-server",
    version: "1.0.0",
    port: parseInt(process.env.PORT || "3000", 10)
  };
}

// 验证配置
export function validateConfig(config: Config): void {
  if (!config.gitlabToken) {
    console.error("❌ 错误: 请设置GITLAB_TOKEN环境变量");
    console.error("💡 提示: 请访问GitLab > Settings > Access Tokens 创建个人访问令牌");
    process.exit(1);
  }
} 