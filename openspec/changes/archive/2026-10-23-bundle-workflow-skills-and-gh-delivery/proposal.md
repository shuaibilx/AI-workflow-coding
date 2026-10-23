# Proposal

## Why

The Plugin currently packages only five of the fixed skills used by its workflow, leaving conditional engineering and GitHub skills unavailable unless users install them separately. Its setup and delivery guidance also treats OpenSpec preparation and GitHub publishing as optional, which conflicts with the agreed full-workflow experience.

## What Changes

- Package every fixed workflow skill, including OpenSpec, conditional engineering, and GitHub delivery skills, with source pins and applicable license notices.
- Make setup a required preflight for full workflows: validate bundled assets and local delivery prerequisites, and install the pinned OpenSpec CLI globally only when it is missing.
- Preserve OpenSpec's default project initialization behavior and generated `.agents/skills/openspec-*` copies.
- Route full workflows through verified local review, task-branch commit/push, PR creation, COMMENT review publication, PR monitoring, and repository-rule-compliant auto-merge.
- Refresh the English and Chinese READMEs to describe the bundled workflow and its stage-specific skills.

## Capabilities

### New Capabilities
- `workflow-orchestration`: Full and small-task routing, setup gates, and phase-specific skill use.
- `github-delivery`: Authorized branch publication, PR review comments, monitoring, and auto-merge behavior.

### Modified Capabilities
- `plugin-skill-distribution`: Expand bundled dependencies and make OpenSpec setup and project-local skill generation explicit.

## Impact

The Plugin manifest, bundled skill tree, setup CLI and its tests, workflow references, delivery instructions, third-party notices, and bilingual README files change. OpenSpec remains a global CLI dependency; project initialization continues to use `openspec init --tools codex` and its default project-local skill path.
