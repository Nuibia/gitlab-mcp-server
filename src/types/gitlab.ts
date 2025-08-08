// GitLab 项目信息（与 GitLab /api/v4/projects 返回结构对齐）
export interface GitLabProject {
  /** 项目唯一 ID */
  id: number;
  /** 仓库名（不含命名空间） */
  name: string;
  /** 完整路径名（含命名空间），如 group/subgroup/repo */
  name_with_namespace: string;
  /** 项目描述（可能为 null） */
  description: string | null;
  /** Web 访问地址 */
  web_url: string;
  /** 创建时间 ISO 字符串 */
  created_at: string;
  /** 最后更新时间 ISO 字符串 */
  updated_at: string;
  /** 默认分支名 */
  visibility: string;
  /** 默认分支名 */
  default_branch: string;
  /** Star 数 */
  star_count: number;
  /** Fork 数 */
  forks_count: number;
}

// GitLab 分支信息（与 /repository/branches 对齐）
export interface GitLabBranch {
  /** 分支名 */
  name: string;
  /** 最新提交摘要 */
  commit: {
    /** 提交 SHA */
    id: string;
    /** 短 SHA */
    short_id: string;
    /** 提交标题 */
    title: string;
    /** 提交创建时间 */
    created_at: string;
    /** 父提交 SHA 列表 */
    parent_ids: string[];
    /** 提交信息全文 */
    message: string;
    /** 作者信息 */
    author_name: string;
    author_email: string;
    authored_date: string;
    /** 提交者信息 */
    committer_name: string;
    committer_email: string;
    committed_date: string;
  };
  /** 是否已合并 */
  merged: boolean;
  /** 是否受保护 */
  protected: boolean;
  /** 开发者是否可推送 */
  developers_can_push: boolean;
  /** 开发者是否可合并 */
  developers_can_merge: boolean;
  /** 当前用户是否可推送 */
  can_push: boolean;
  /** 是否为默认分支 */
  default: boolean;
  /** Web 访问地址 */
  web_url: string;
}

// 包含分支信息的项目（在项目基础上附加匹配到的分支）
export interface ProjectWithBranches extends GitLabProject {
  /** 匹配到的分支列表 */
  branches: GitLabBranch[];
}
