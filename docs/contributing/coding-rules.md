## 代码规范

- `services/`：请求与含副作用逻辑（如 GitLab API 调用、鉴权校验）
- `utils/`：纯函数与数据处理（无 I/O、无环境变量读取）
- 依赖方向：`services` 可依赖 `utils`，反之不行

示例：

```ts
// services
const projects = await getGitLabProjects();

// utils
const text = generateProjectsListText(projects);
```


