# Proposal

## Why

The Plugin already packages its fixed skills under the repository root `skills/`, but six ignored OpenSpec skill copies remain under `.agents/skills/` from an earlier initialization. Codex discovers both sets in this workspace, which makes the OpenSpec entries appear twice and obscures how users should browse or invoke bundled skills. The full workflow also monitors PRs through merge without cleaning up the completed task branch or returning the local checkout to an updated `main`.

## What Changes

- Remove the six identical, ignored OpenSpec skill copies from this Plugin repository while keeping the root `skills/` bundle and marketplace metadata.
- Document `/skills` browsing and `$ai-workflow:<skill-name>` direct invocation in both READMEs.
- After a full-workflow PR is confirmed merged, delete its remote task branch and, when the local checkout is safe, fast-forward local `main` to `origin/main` and delete the local task branch.
- Preserve local state and report when the merge is incomplete, the branch is not the workflow task branch, or the working tree and branch graph do not allow safe cleanup. Leave repository-wide branch deletion settings unchanged.
- Increment the Plugin patch version consistently across package manifests.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `workflow-orchestration`: define safe remote and local task-branch cleanup after a merged full-workflow PR.
- `plugin-skill-distribution`: keep the packaged skill bundle discoverable from one canonical directory and explain direct skill discovery and invocation.

## Impact

The change updates AI Workflow delivery guidance, plugin discovery documentation, distribution metadata, and the affected OpenSpec specifications. It removes only ignored local duplicates under `.agents/skills/`; it adds no runtime dependencies and does not modify repository-wide GitHub settings.
