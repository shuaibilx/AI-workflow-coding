# Design

## Context

当前 `openspec-apply-change` 在 tasks 全部完成后结束于“建议 review/archive”；主工作流的 `review.md` 已定义检查、双轴 review 和 archive 条件。项目初始化 CLI 运行 `openspec init --tools none`，新建配置没有语言 context；现有 OpenSpec 项目则直接跳过。

## Goals / Non-Goals

**Goals:**

- 将 apply 完成作为验证和收尾的入口，确保自动 archive 受检查、review、spec sync 成功状态约束。
- 让 OpenSpec 新工件随当前请求语言变化，同时保留结构格式、标识符和显式语言要求。
- 让显式项目初始化为没有自定义 context 的项目写入自适应语言规则；已有 context 保持不变。

**Non-Goals:**

- 不让失败或部分完成的变更自动归档。
- 不更改 OpenSpec CLI 本身，也不添加语言检测服务或外部依赖。
- 不改写用户现有的 OpenSpec context，也不修改外部 store 的配置。
- 独立调用 archive skill 时仍保留原有交互式同步选择；自动选择只用于 apply 完成后的已验证收尾。

## Decisions

### Apply 完成复用 AI Workflow 收尾规则

在 `openspec-apply-change` 的 `all_done` 分支加载 `ai-workflow` 的 review reference，运行项目检查、Standards/Spec review、必要修复和 recheck，再把已验证的变更交给 `openspec-archive-change`。Archive skill 接收“verified apply closure”上下文后，自动选择同步 delta specs 或在已同步时直接归档；任何失败、未解决的问题、用户中断或同步不匹配都停止归档。完整 `ai-workflow` 调用继续其授权的 GitHub 发布步骤；单独调用 apply 只完成归档，不隐式发布 PR。

### 语言规则作为可更新的项目 context

`ai-workflow init --project` 在新建 OpenSpec 后，或发现当前项目 OpenSpec 根已存在时，只对项目本地根执行语言 context 初始化。若配置没有顶层 `context`，追加一段通用规则：“OpenSpec change artifacts follow the language used by the user in the current request unless they explicitly specify another language. Keep schema-required headings and keywords, identifiers, code, API names, and CLI commands in their required or original form.”

若已有 context，原样保留并报告跳过配置修改；`openspec-propose` 的输出语言指引仍按请求语言执行。使用项目配置路径时优先 `openspec/config.yaml`，否则复用已有 `openspec/config.yml`，都不存在时才创建 `config.yaml`。仅当 OpenSpec 根解析到所选项目本身时修改配置；store 根、无效 store 声明、不可解析根或配置符号链接都不写入。

OpenSpec `init --language` 适合设置项目固定语言，不用于本需求的动态规则；使用通用 `context` 使同一项目可以按每次请求语言生成工件。

### 技能按阶段负责，避免复制一套归档逻辑

Apply skill 负责实现并触发闭环；AI Workflow `review.md` 仍是检查、审查、同步/归档门槛的权威流程；OpenSpec archive skill 仍负责状态检查、语义同步、同步验证和移动变更。只给其增加来自 apply closure 的自动选择条件，不重复实现归档算法。

## Risks / Trade-offs

- [项目 context 采用非标准 YAML 写法] → 只在不存在顶层 context 时追加；已有 context 与符号链接不改写，并保留 skill 级语言规则。
- [代码审查无独立 agent 可用] → 遵循 `code-review` 的双轴审查边界并如实说明使用的 review 方式，不把单人检查描述为独立审查。
- [OpenSpec CLI 在 apply 完成前改变状态或工件] → 进入 closure 时重新读取 status、apply instructions 和归档输入，不沿用过期状态。
