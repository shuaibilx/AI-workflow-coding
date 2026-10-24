# Proposal

## Why

独立调用 OpenSpec apply skill 时，即使所有任务已经完成，流程仍停在“建议 review/archive”，容易让变更长期留在 active 状态。与此同时，新建 OpenSpec 项目和提案工件缺少随用户语言变化的默认规则，导致中文请求也常生成英文文档。

## What Changes

- tasks 全部完成后自动进入验证、本地双轴 review、delta spec 同步和归档；任一阶段发现阻塞、未解决问题或同步冲突时暂停，不归档。
- 在新建或首次由 AI Workflow 准备的 OpenSpec 项目配置中加入“跟随当前请求语言”的自适应 `context`，并在提案技能中明确相同的工件语言规则。
- 已有项目的自定义 OpenSpec context 保持原样；提案按当前请求语言写作，遵守用户明确指定的语言要求。
- 更新中英文文档和 CLI 初始化说明，反映自动收尾和语言规则。

## Capabilities

### New Capabilities

<!-- None. -->

### Modified Capabilities

- `workflow-orchestration`: apply 完成后自动验证、review、同步并归档；OpenSpec 工件跟随当前请求语言；初始化 CLI 安全补充语言 context。

## Impact

影响 `openspec-apply-change`、`openspec-propose`、`ai-workflow` 的规划与收尾说明，项目初始化 CLI 及其测试，当前仓库的 `openspec/config.yaml`，中英文 README 和 workflow-orchestration spec。无需新增外部依赖；保留 OpenSpec 的原始结构标题及 schema 规定的关键词。
