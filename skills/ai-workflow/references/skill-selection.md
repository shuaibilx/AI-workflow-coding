# Discover and select project skills

The Plugin already bundles all fixed workflow skills: `grilling`, `find-skills`, `codebase-design`, `code-review`, `pr`, six OpenSpec skills, `tdd`, `diagnosing-bugs`, `research`, `domain-modeling`, `writing-for-agents`, `setup-matt-pocock-skills`, `create-pull-request`, and `babysit-pr`. Resolve and read them from the Plugin when their trigger applies; do not install duplicate copies. Use `find-skills` only to discover stack-specific skills that are not in this fixed set. Prefer a short relevant set. Existing project skills that already cover the need are candidates too; do not reinstall merely because a new workflow started.

## Selection criteria

For each serious candidate, inspect its actual `SKILL.md`, supporting scripts when execution matters, source, maintenance history, license, and supported versions. Evaluate:

1. Fit with the project's chosen framework, major versions, runtime, and task.
2. Useful guidance beyond what existing project rules already provide.
3. Consistency with project conventions and the other selected skills.
4. Source reputation and real usage. Install counts and stars are supporting signals, not proof of correctness or safety.
5. Installation scope, external requirements, and effects of bundled scripts.

Reject redundant or conflicting skills. A technology in the stack does not automatically require a skill. If no suitable skill exists, record the gap and use project documentation and official technical sources; do not install a weak match just to fill a checklist.

## Workflow-specific candidates

Use these triggers to decide which additional skills belong in a task's proposal. They are not all baseline dependencies:

| Skill | Select when | Workflow boundary |
| --- | --- | --- |
| `tdd` | The user asks for test-first work, or a behavior change benefits from a red/green loop | Agree public test seams before writing tests; record them in the proposal for full changes. |
| `diagnosing-bugs` | A bug is difficult to reproduce, a regression has multiple plausible causes, or performance regressed | Build and run a symptom-specific feedback loop before hypothesizing; follow its cleanup and regression-test rules. A clear small fix may skip phases only with explicit justification. |
| `research` | External, version-sensitive, or otherwise uncertain technical facts could change a decision | Follow the skill's background-research and primary-source citation requirements; save one findings note in the repo's existing notes location and link relevant conclusions from OpenSpec. |
| `domain-modeling` | The change resolves domain language or establishes a durable domain/architecture decision | Update a glossary lazily and keep it free of implementation details; create ADRs only for hard-to-reverse, surprising decisions with real trade-offs. |
| `writing-for-agents` | Editing this workflow, another skill, `AGENTS.md`/`CLAUDE.md`, or agent-facing documentation | Read `SKILL-MECHANICS.md` when authoring a skill; keep task instructions and conditional references progressively disclosed. |
| `create-pull-request` | Every completed full workflow with GitHub delivery prerequisites ready; also for standalone delivery requests | The full-workflow standing authorization covers task-only commit/push and PR creation after verification/review/archive. Adapt instructions to the repository and host. Never force-push. |
| `babysit-pr` | Immediately after the workflow creates a PR; also when the user asks to monitor an existing PR | Monitor in the current Codex session through merge/close. Follow the authorized boundary: up to three likely-flaky retries, fix and push branch-caused problems, no replies to human comments, and auto-merge only by repository rules. |

`pr` drafts the PR body after checks, review, and OpenSpec closure; `create-pull-request` performs the actual authorized full-workflow GitHub delivery. `setup-matt-pocock-skills` remains an opt-in, user-invoked, once-per-repository onboarding path only when the user chooses the broader Matt Pocock engineering conventions. It is not required by OpenSpec: treat the tracker as backlog/triage, OpenSpec as the current change plan, and glossary/ADR files as durable domain knowledge. Respect the setup skill's own confirmation and file-selection rules.

`code-review` covers the local branch/PR diff against Standards and Spec before delivery. After PR creation, the workflow may publish its actionable review as a GitHub COMMENT only. Ask before submitting APPROVE or REQUEST_CHANGES. Repository initialization (`git init`) is handled by [delivery.md](delivery.md), not a reason to install a low-fit skill.

Do not route to `prototype` in this workflow. Use `$ai-workflow:openspec-explore` for unresolved design questions.

Summarize the selected names, sources, version/ref when available, purpose, and relevant conflicts in the proposal's design. Reopen a technology decision only if the new evidence materially changes its tradeoffs.

## Install after selection

Once the proposal is ready and implementation is authorized, install only selected stack-specific project skills. The fixed workflow set is already in the Plugin. Full-workflow GitHub delivery uses the bundled delivery skills under the standing authorization; no extra install or proposal is needed. For a standalone request to monitor an existing PR, use bundled `babysit-pr` directly. A new stack-specific dependency that changes the confirmed stack or scope returns to the decision step first. Respect actual host Plan mode restrictions.

From the code project's root, use a source-specific command such as:

```sh
npx skills add <reviewed-source> --skill <selected-name> --agent codex --yes
```

Omit `--global`: these are project dependencies. Prefer a fixed Git ref for reproducible content. Determine the real supported CLI syntax from the installed version; angle-bracket examples here are placeholders, not runnable literal commands.

Inspect existing project/global skills before installation. Do not overwrite customized or same-named content without resolving the conflict. Verify the expected project `SKILL.md` files and include applicable source/lock changes in the review. Read each installed skill before relying on it; listing a name in the plan is not activation.

If the current host does not expose a newly installed skill yet, read its actual local file explicitly. Never claim that an unavailable skill tool was invoked. Where required external access is unavailable, report the limitation and proceed only with work that does not depend on it.
