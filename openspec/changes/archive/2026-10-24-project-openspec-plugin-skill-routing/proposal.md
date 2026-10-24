# Proposal

## Why

The AI Workflow Plugin already bundles the OpenSpec skills, but project initialization currently generates another set of project-local copies. That creates duplicate entries and can make Codex select a project copy instead of the version shipped with the Plugin. The current Codex cache also predates the complete bundled skill set, so users need a clear update and invocation path.

## What Changes

- Initialize an explicitly selected project with `openspec init --tools none`, keeping OpenSpec data under that project while avoiding generated project-local OpenSpec skills.
- Route workflow phases explicitly to the corresponding Plugin-bundled, namespaced OpenSpec skills.
- Document how Codex discovers bundled skills, how to invoke them from `/skills` or by `$plugin:skill`, and why typing `/ai workflow` does not enumerate every skill.
- Bump the Plugin package version so Codex can fetch the complete bundled skill set instead of retaining its older 0.2.0 cache.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `workflow-orchestration`: initialize selected projects without generating duplicate OpenSpec skills and route to bundled OpenSpec skills.
- `plugin-skill-distribution`: keep OpenSpec CLI globally available while relying on bundled Plugin skills instead of generated project-local copies.

## Impact

The project initialization CLI, its unit and integration tests, workflow phase references, Plugin package version metadata, and bilingual README documentation change. OpenSpec remains globally installed as an executable prerequisite; each selected project's `openspec/` directory remains inside that project.
