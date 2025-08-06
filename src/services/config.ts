import dotenv from "dotenv";
import { Config, ServerConfig } from "../types/index.js";

// 加载环境变量
dotenv.config();

// 获取环境配置
export function getConfig(): Config {
  return {
    gitlabUrl: process.env.GITLAB_URL || "https://gitlab.com/",
    gitlabToken: process.env.GITLAB_TOKEN || "",
    port: parseInt(process.env.PORT || "3000", 10)
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