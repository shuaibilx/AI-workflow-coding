---
name: ai-workflow
description: Coordinate a Codex AI development workflow from requirements and technology choices through OpenSpec planning, implementation, verification, code review, and GitHub delivery. Use when the user asks to start, follow, or resume this workflow. Scale down for clear small fixes; do not take over standalone explanations, research, or an individually requested skill.
license: MIT
metadata:
  author: shuaibilx
  version: "0.4.0"
---

# AI Workflow

Carry confirmed decisions through verified delivery. Respond in the user's language. This file is the router; load only the phase references needed now.

## Start or resume

1. Read project instructions, relevant code/tests, existing plans, and Git state. Preserve unrelated user work.
2. Identify the goal, acceptance criteria, existing authorization, and current phase. On resume, read [resume.md](references/resume.md) before restarting any phase.
3. Choose a route and explain it briefly:

| Route | Use when | Continue with |
| --- | --- | --- |
| Small fix | Clear, low-risk local correction with no new behavior, interface, migration, or unresolved design choice | [implementation.md](references/implementation.md), then [review.md](references/review.md); no mandatory OpenSpec setup or GitHub delivery |
| Full workflow | New behavior, architecture, interfaces, migrations, multiple interacting modules, or material uncertainty | [planning.md](references/planning.md) |
| Existing change | A confirmed OpenSpec change already covers the request | [resume.md](references/resume.md) |

4. Before a full workflow, load `ai-workflow-setup` and run the bundled CLI's `setup --plugin --json`. It checks bundled files and local prerequisites, installs only a missing pinned OpenSpec CLI globally, and reports GitHub readiness separately. Small fixes skip setup. If OpenSpec cannot be verified, stop before creating change artifacts. If GitHub readiness is false, continue local work and report that remote delivery is paused.
5. In a full workflow, prepare or reuse the task branch as described in [delivery.md](references/delivery.md) before creating tracked OpenSpec artifacts. Do not stage or absorb unrelated changes.

## Phase handoffs

| Phase | Required result | Next reference |
| --- | --- | --- |
| Discover and design | Confirmed scope, constraints, acceptance criteria, and justified technology choices | [planning.md](references/planning.md) |
| Select skills | Read relevant bundled candidates before design is finalized; discover stack-specific skills only when justified | [skill-selection.md](references/skill-selection.md) |
| Propose | OpenSpec artifacts capture confirmed decisions and the single implementation plan; present them and wait for implementation authorization | [implementation.md](references/implementation.md) |
| Implement | Read `codebase-design`; follow the approved tasks and update progress truthfully | [implementation.md](references/implementation.md) |
| Verify and review | Actual check results and separate Standards/Spec review findings, with fixes and rechecks | [review.md](references/review.md) |
| Close and deliver | Sync/archive a complete OpenSpec change, draft PR text, then perform authorized full-workflow GitHub delivery | [review.md](references/review.md), [delivery.md](references/delivery.md) |

## Coordination rules

- All fixed workflow skills ship in this Plugin. Resolve their actual Plugin-namespaced paths and read each at its trigger point; do not download another copy. Technology-specific skills are dynamic: discover only those that fit the selected stack, review them before finalizing the proposal, then install the chosen project skill after the proposal is ready and implementation is authorized.
- Reuse confirmed decisions. `openspec-explore` is conditional and does not create state required by `openspec-propose`.
- Keep OpenSpec artifacts as the only durable implementation plan. Plan mode is optional and only helps resolve complex pre-proposal decisions; transfer useful conclusions into OpenSpec.
- For a full workflow, use `pr` to draft the PR body from the verified change, then follow the standing full-workflow GitHub authorization in [delivery.md](references/delivery.md): task-only commit, push, PR, COMMENT-only AI review, current-session monitoring, and repository-rule-compliant auto-merge. If `gh` or auth is unavailable, finish local work and pause the remote part.
- Small fixes do not auto-publish or auto-merge. Follow [delivery.md](references/delivery.md) only if the user separately asks for GitHub operations.
- Respect the host's real Plan mode controls; never claim to have switched modes by writing text.
- Installing a Plugin does not run its CLI. Full workflows invoke setup automatically; do not repeatedly ask users to run the setup command themselves.
- If pre-existing changes cannot be safely separated from this task, stop before committing or publishing and explain the exact conflict.
- Report observable results and limitations. Task checkboxes, clean reviews, and archive commands do not substitute for runtime verification.
