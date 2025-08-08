// GitLab项目接口定义
export interface GitLabProject {
  id: number;
  name: string;
  name_with_namespace: string;
  description: string | null;
  web_url: string;
  created_at: string;
  updated_at: string;
  visibility: string;
  default_branch: string;
  star_count: number;
  forks_count: number;
}


// GitLab分支接口定义
export interface GitLabBranch {
  name: string;
  commit: {
    id: string;
    short_id: string;
    title: string;
    created_at: string;
    parent_ids: string[];
    message: string;
    author_name: string;
    author_email: string;
    authored_date: string;
    committer_name: string;
    committer_email: string;
    committed_date: string;
  };
  merged: boolean;
  protected: boolean;
  developers_can_push: boolean;
  developers_can_merge: boolean;
  can_push: boolean;
  default: boolean;
  web_url: string;
}

// 包含分支信息的项目
export interface ProjectWithBranches extends GitLabProject {
  branches: GitLabBranch[];
}
