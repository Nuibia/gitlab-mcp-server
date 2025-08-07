import { Config } from "../types/index.js";
import { Implementation } from "@modelcontextprotocol/sdk/types.js";

// 获取环境配置
export function getConfig(): Config {
  return {
    gitlabUrl: process.env.GITLAB_URL || "https://gitlab.com/",
    gitlabToken: process.env.GITLAB_TOKEN || "",
    port: parseInt(process.env.PORT || "3000", 10)
  };
}

// 获取服务器配置
export function getServerConfig(): Implementation {
  return {
    name: "gitlab-mcp-server",
    version: "1.0.0"
  };
} 