import { Implementation } from "@modelcontextprotocol/sdk/types.js";
import { Config } from "../types/index.js";

/**
 * 读取运行时配置（来源于环境变量）。
 * - GITLAB_URL: GitLab 实例地址，默认 https://gitlab.com/
 * - GITLAB_TOKEN: 访问令牌（必填）
 * - PORT: HTTP 端口（仅 http-server 使用），默认 3000
 */

// 获取环境配置（动态读取最新值）
export function getConfig(): Config {
  return {
    gitlabUrl: process.env.GITLAB_URL || "",
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