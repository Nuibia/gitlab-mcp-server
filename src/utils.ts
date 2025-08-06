
// 格式化日期
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('zh-CN');
}

// 格式化项目显示文本
export function formatProjectDisplayText(project: any): string {
  return `📁 **${project.fullName}**\n` +
    `   - 描述: ${project.description}\n` +
    `   - 可见性: ${project.visibility}\n` +
    `   - 默认分支: ${project.defaultBranch}\n` +
    `   - 星标: ${project.stars} | 分支: ${project.forks}\n` +
    `   - 链接: ${project.url}\n` +
    `   - 最后更新: ${formatDate(project.updatedAt)}\n`;
}

// 生成项目列表文本
export function generateProjectsListText(projects: any[]): string {
  return `✅ 成功获取到 ${projects.length} 个项目:\n\n${projects.map(project => 
    formatProjectDisplayText(project)
  ).join('\n')}`;
} 