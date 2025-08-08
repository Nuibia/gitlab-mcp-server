# 项目代码规则

为保持代码结构清晰、职责单一，现新增以下规则：

## 目录职责
- services：只存放“请求相关处理”和其他含副作用的业务逻辑
  - 示例：HTTP 请求、GitLab API 封装、鉴权校验、网络重试、带有 I/O 的操作
  - 本项目示例：`src/services/gitlab.ts` 内的 `createAxiosInstance`、`getGitLabProjects`、`getProjectBranches`、`getProjectByName` 等
- utils：只存放“数据处理（纯函数）”
  - 示例：数据格式化、转换、计算、字符串与日期处理等，不做网络请求，不做 I/O
  - 本项目示例：`src/utils/format.ts` 内的 `formatDate`、`generateProjectsListText`、`generateProjectsWithBranchesListText`

## 设计要点
- 数据流：请求获取的数据在 `services` 层完成拉取与聚合；任何结构化、格式化与展示前的处理在 `utils` 层完成
- 纯函数优先：`utils` 禁止引入环境变量、网络请求与本地 I/O，保证可测试性与可复用性
- 依赖方向：`services` 可以调用 `utils`；`utils` 不得依赖 `services`

## 代码示例（推荐）
- 在 `services` 获取数据：
  - `const projects = await getGitLabProjects();`
- 在 `utils` 纯处理：
  - `const text = generateProjectsListText(projects);`

遵循以上规则有助于降低耦合、提升可维护性与测试友好度。
