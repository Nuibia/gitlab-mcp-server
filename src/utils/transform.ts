import { FormattedProject, GitLabProject } from "../types/index.js";

// 纯数据转换：GitLabProject -> FormattedProject
export function formatProjects(projects: GitLabProject[]): FormattedProject[] {
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
