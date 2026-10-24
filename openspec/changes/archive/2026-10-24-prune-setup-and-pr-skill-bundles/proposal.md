# Proposal

## Why

The Plugin bundles a one-time Matt Pocock convention setup skill that the AI Workflow does not require, plus a separate PR-writing skill whose only responsibility can live in the main workflow. Removing these unnecessary discovery entries makes the Plugin's skill list clearer while preserving its complete OpenSpec and GitHub delivery flow.

## What Changes

- Remove `setup-matt-pocock-skills` and its templates from the Plugin bundle and dependency inventory; update code review guidance to use OpenSpec or the request's existing requirements instead of requiring that setup.
- Keep `create-pull-request` and `babysit-pr` as complementary GitHub delivery helpers.
- Remove the standalone `pr` skill and move its concise PR-body guidance into the AI Workflow delivery instructions. Follow a repository PR template when present; otherwise use Summary, Evidence, and Merge Danger sections.
- Update the Plugin inventory, notices, architecture and release documentation, and tests to match the smaller bundle.
- Do not add another upstream GitHub skill; the main `ai-workflow` remains the lifecycle orchestrator.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `plugin-skill-distribution`: ship only skills required by the workflow and preserve the two complementary GitHub helpers.
- `workflow-orchestration`: make code review independent of Matt Pocock setup and keep PR-body drafting in the main workflow.
- `github-delivery`: define repository-template precedence and the fallback PR-body structure.

## Impact

Changes affect the bundled `skills/` inventory, dependency metadata, notices, AI Workflow references, code-review guidance, English and Chinese READMEs, architecture and publishing documentation, and package tests. There are no runtime CLI or external dependency changes.
