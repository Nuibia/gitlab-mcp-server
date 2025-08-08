// 格式化相关的工具函数
import { GitLabBranch, GitLabProject, ProjectWithBranches } from "../types/index.js";

// 格式化日期
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('zh-CN');
}

// 格式化分支信息
export function formatBranchDisplayText(branch: GitLabBranch): string {
  const status = branch.default ? "🌿 默认分支" : 
                 branch.protected ? "🛡️ 受保护分支" : 
                 branch.merged ? "✅ 已合并" : "🌱 活跃分支";
  
  return `   ${status} **${branch.name}**\n` +
    `      - 最新提交: ${branch.commit.short_id} - ${branch.commit.title}\n` +
    `      - 作者: ${branch.commit.author_name}\n` +
    `      - 提交时间: ${formatDate(branch.commit.committed_date)}\n` +
    `      - 链接: ${branch.web_url}`;
}

// 格式化项目显示文本
export function formatProjectDisplayText(project: GitLabProject): string {
  return `📁 **${project.name_with_namespace}**\n` +
    `   - 描述: ${project.description ?? '无描述'}\n` +
    `   - 可见性: ${project.visibility}\n` +
    `   - 默认分支: ${project.default_branch}\n` +
    `   - 星标: ${project.star_count} | 分叉: ${project.forks_count}\n` +
    `   - 链接: ${project.web_url}\n` +
    `   - 最后更新: ${formatDate(project.updated_at)}\n`;
}

// 格式化包含分支的项目显示文本
export function formatProjectWithBranchesDisplayText(project: ProjectWithBranches): string {
  let text = `📁 **${project.name_with_namespace}**\n` +
    `   - 描述: ${project.description ?? '无描述'}\n` +
    `   - 可见性: ${project.visibility}\n` +
    `   - 默认分支: ${project.default_branch}\n` +
    `   - 星标: ${project.star_count} | 分叉: ${project.forks_count}\n` +
    `   - 链接: ${project.web_url}\n` +
    `   - 最后更新: ${formatDate(project.updated_at)}\n` +
    `   - 匹配分支 (${project.branches.length} 个):\n`;
  
  project.branches.forEach(branch => {
    text += formatBranchDisplayText(branch) + '\n';
  });
  
  return text;
}

// 生成项目列表文本
export function generateProjectsListText(projects: GitLabProject[]): string {
  return `✅ 成功获取到 ${projects.length} 个项目:\n\n${projects.map(project => 
    formatProjectDisplayText(project)
  ).join('\n')}`;
}

// 生成包含分支的项目列表文本
export function generateProjectsWithBranchesListText(projects: ProjectWithBranches[], branchName: string): string {
  if (projects.length === 0) {
    return `🔍 未找到包含分支名 "${branchName}" 的项目。`;
  }
  
  return `✅ 找到 ${projects.length} 个包含分支名 "${branchName}" 的项目:\n\n${projects.map(project => 
    formatProjectWithBranchesDisplayText(project)
  ).join('\n\n')}`;
} 