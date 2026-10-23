---
name: ai-workflow
description: Coordinate a Codex AI development workflow from requirements and technology choices through OpenSpec planning, implementation, verification, and code review. Use when the user asks to start, follow, or resume this workflow. Scale down for clear small fixes; do not take over standalone explanations, research, or an individually requested skill.
license: MIT
metadata:
  author: shuaibilx
  version: "0.3.0"
---

# AI Workflow

Carry confirmed decisions from discovery into implementation and verified delivery. Respond in the user's language. This file is the router: read only the reference needed for the current phase.

## Start or resume

1. Read the project's `AGENTS.md`, relevant code, tests, existing plans, and current working-tree state. Preserve unrelated user work.
2. Identify the intended outcome, acceptance criteria, authorization already given, and current phase. If resuming, read [resume.md](references/resume.md) before starting anything again.
3. Check only the dependencies needed now. The Plugin bundles its fixed skills; they do not need a first-run install. For a missing OpenSpec CLI, optional environment checks, installation, or an uninitialized project, read [setup.md](references/setup.md). The installer is bundled at `scripts/cli.mjs`, relative to this skill directory. In a Plugin installation, CLI commands use `--plugin`.
4. Select a route. Explain the choice in one sentence; ask only if material uncertainty prevents choosing it.

| Route | Use when | Continue with |
| --- | --- | --- |
| Small fix | Clear local correction (including copy/label fixes), no new capability, interface/data migration, or unresolved architectural decision | [implementation.md](references/implementation.md), then [review.md](references/review.md); no mandatory OpenSpec change or interview |
| Full workflow | New behavior, architecture, interfaces, migrations, multiple interacting modules, or material uncertainty | [planning.md](references/planning.md) |
| Existing change | A confirmed OpenSpec change already covers the request | [resume.md](references/resume.md) |

## Phase handoffs

| Phase | Required result | Next reference |
| --- | --- | --- |
| Discover and design | Confirmed scope, constraints, acceptance criteria, and justified technology choices | [planning.md](references/planning.md) |
| Select skills | Reviewed candidates inform design; install only the selected project skills after the proposal is ready and implementation/setup is authorized | [skill-selection.md](references/skill-selection.md) |
| Propose | OpenSpec artifacts reflect the confirmed decisions; present them and wait for a new implementation request | [implementation.md](references/implementation.md) |
| Implement | Read `codebase-design`; implement the selected change and keep task progress accurate | [implementation.md](references/implementation.md) |
| Verify and review | Actual check results, Standards and Spec findings, fixes and relevant rechecks | [review.md](references/review.md) |
| Close | Within the implementation scope authorized by the user, sync specs and archive only after completion checks pass; full workflows then draft PR text | [review.md](references/review.md) |
| Optional GitHub delivery | User explicitly requests repository initialization, commit/push, PR creation, or open-PR monitoring | [delivery.md](references/delivery.md) |

## Coordination rules

- Use the installed dependency skills; resolve their actual `SKILL.md` paths and read them at the point of use. Do not copy their full instructions into this workflow or invent skill tool calls.
- Reuse facts and decisions already established. OpenSpec explore is conditional; it does not create state required by propose.
- Keep the approved OpenSpec artifacts authoritative. Transfer discovery conclusions into them instead of maintaining a second detailed implementation plan.
- In a full workflow, use `pr` after verification, review, and OpenSpec closure to draft the PR body from the final change and actual evidence. This does not create or publish a PR; small fixes do not get a draft automatically.
- Git initialization and GitHub delivery are separate opt-in actions. Only load [delivery.md](references/delivery.md) when the user asks for repository setup, commit/push, PR creation, or PR monitoring; never infer permission to publish from a completed implementation.
- Distinguish a planning phase from the host's actual Plan mode. Use real mode controls only when available; never claim to have switched modes by writing text.
- Installing this skill does not execute its scripts. A workflow request is not permission to update global dependencies or publish/deploy. Reuse explicit setup and implementation authorization already given.
- If a dependency's workflow would introduce a new stop or conflict, first check existing user instructions and authorization. Explain any remaining real requirement with the exact source; do not silently bypass it or ask again for authorization already granted.
- Report observable results and limitations. Never equate completed task checkboxes, a clean review, or an archive command with passing runtime verification.
