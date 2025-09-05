import { Implementation } from "@modelcontextprotocol/sdk/types.js";
import { Config } from "../types/index.js";

// ==================== 配置管理器 ====================

/**
 * 配置源优先级枚举
 */
export enum ConfigSource {
  DEFAULT = 0,
  ENVIRONMENT = 1,
  RUNTIME = 2
}

/**
 * GitLab配置接口
 */
export interface GitLabConfig {
  gitlabUrl: string;
  gitlabToken: string;
  port?: number;
}

/**
 * 运行时配置接口
 */
export interface RuntimeConfig extends GitLabConfig {
  sessionId?: string;
  source: ConfigSource;
  timestamp: number;
}

/**
 * 配置管理器 - 统一管理所有配置源
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private runtimeConfigs = new Map<string, RuntimeConfig>();

  private constructor() {}

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * 获取默认配置
   */
  private getDefaultConfig(): GitLabConfig {
    return {
      gitlabUrl: "https://gitlab.com/",
      gitlabToken: "",
      port: 3000
    };
  }

  /**
   * 获取环境变量配置
   */
  private getEnvironmentConfig(): Partial<GitLabConfig> {
    return {
      gitlabUrl: process.env.GITLAB_URL,
      gitlabToken: process.env.GITLAB_TOKEN,
      port: process.env.PORT ? parseInt(process.env.PORT, 10) : undefined
    };
  }

  /**
   * 获取最终配置（按优先级合并）
   */
  getConfig(sessionId?: string): Config {
    // 1. 运行时配置（最高优先级）
    if (sessionId) {
      const runtimeConfig = this.runtimeConfigs.get(sessionId);
      if (runtimeConfig && this.isConfigValid(runtimeConfig)) {
        return {
          gitlabUrl: runtimeConfig.gitlabUrl,
          gitlabToken: runtimeConfig.gitlabToken,
          port: runtimeConfig.port || 3000
        };
      }
    }

    // 2. 环境变量配置
    const envConfig = this.getEnvironmentConfig();

    // 3. 默认配置
    const defaultConfig = this.getDefaultConfig();

    return {
      gitlabUrl: envConfig.gitlabUrl || defaultConfig.gitlabUrl,
      gitlabToken: envConfig.gitlabToken || defaultConfig.gitlabToken,
      port: envConfig.port || defaultConfig.port || 3000
    };
  }

  /**
   * 设置运行时配置
   */
  setRuntimeConfig(sessionId: string, config: Partial<GitLabConfig>): void {
    const currentConfig = this.getConfig();

    this.runtimeConfigs.set(sessionId, {
      gitlabUrl: config.gitlabUrl || currentConfig.gitlabUrl,
      gitlabToken: config.gitlabToken || currentConfig.gitlabToken,
      port: config.port || currentConfig.port,
      sessionId,
      source: ConfigSource.RUNTIME,
      timestamp: Date.now()
    });
  }

  /**
   * 获取运行时配置
   */
  getRuntimeConfig(sessionId: string): RuntimeConfig | null {
    return this.runtimeConfigs.get(sessionId) || null;
  }

  /**
   * 清理过期的运行时配置
   */
  cleanupExpiredConfigs(maxAge: number = 30 * 60 * 1000): void { // 默认30分钟
    const now = Date.now();
    for (const [sessionId, config] of this.runtimeConfigs) {
      if (now - config.timestamp > maxAge) {
        this.runtimeConfigs.delete(sessionId);
      }
    }
  }

  /**
   * 验证配置是否有效
   */
  private isConfigValid(config: Partial<GitLabConfig>): boolean {
    return !!(config.gitlabUrl && config.gitlabToken);
  }

  /**
   * 获取配置信息（用于调试）
   */
  getConfigInfo(sessionId?: string): {
    hasToken: boolean;
    hasUrl: boolean;
    source: ConfigSource;
    sessionId?: string;
  } {
    const config = this.getConfig(sessionId);
    const runtimeConfig = sessionId ? this.runtimeConfigs.get(sessionId) : null;

    return {
      hasToken: !!config.gitlabToken,
      hasUrl: !!config.gitlabUrl,
      source: runtimeConfig?.source || ConfigSource.ENVIRONMENT,
      sessionId
    };
  }
}

// ==================== 向后兼容的导出 ====================

/**
 * 获取环境配置（动态读取最新值）
 * @deprecated 请使用 ConfigManager.getInstance().getConfig()
 */
export function getConfig(): Config {
  return ConfigManager.getInstance().getConfig();
}

/**
 * 获取服务器配置
 */
export function getServerConfig(): Implementation {
  return {
    name: "gitlab-mcp-server",
    version: "1.0.0"
  };
}

// ==================== 导出配置管理器实例 ====================

export const configManager = ConfigManager.getInstance(); 