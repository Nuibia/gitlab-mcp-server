## 架构与分层

本项目采用「入口解耦 + 服务/工具分层」的结构以提升可维护性。

- 入口层：
  - `src/index.ts`：Stdio 模式入口，仅负责进程生命周期与传输绑定。
  - `src/http-server.ts`：HTTP 模式入口，提供 `/health` 与 `/mcp` 端点。
- 功能层：
  - `src/mcp/register-tools.ts`：集中注册所有 MCP 工具，统一参数校验与输出格式。
  - `src/services/**`：封装 GitLab API、配置读取与带副作用的逻辑。
  - `src/utils/**`：纯函数，负责格式化与数据整形，不做 I/O。
  - `src/types/**`：类型定义，便于跨模块共享。

依赖方向：`入口 -> mcp -> services -> utils/types`。

### 关键设计要点

- 集中注册工具：所有 `server.registerTool` 仅出现在 `mcp/register-tools.ts`，便于扩展与审阅。
- 纯函数隔离：`utils` 不包含任何 I/O 或环境访问，便于测试与复用。
- 错误处理统一：GitLab 相关错误通过 `handleGitLabError` 统一描述，提升用户可读性。
- HTTP 并发控制：`getProjectsWithBranch` 支持通过 `GITLAB_FETCH_CONCURRENCY` 控制并发，避免 API 限流。

### 扩展新工具的步骤

1. 在 `services` 编写对 GitLab 的调用或业务逻辑。
2. 在 `utils` 准备输出格式化函数（如有需要）。
3. 在 `mcp/register-tools.ts` 中注册工具，使用 `zod` 定义 `inputSchema`。
4. 在 `docs/reference/tools.md` 中补充说明与示例。


