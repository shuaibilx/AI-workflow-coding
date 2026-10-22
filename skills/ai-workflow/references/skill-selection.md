# Discover and select project skills

Use the installed `find-skills` to search and inspect candidates while planning. Prefer a short relevant set. Existing skills that already cover the need are candidates too; do not reinstall merely because a new workflow started.

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
| `create-pull-request` | The user explicitly requests commit/push or opening a GitHub PR | Use only for the requested operation after verification/review where applicable, with `gh` installed and authenticated; adapt its instructions to the host and repository. Never force-push by default. |
| `babysit-pr` | The user explicitly asks to monitor an already-open GitHub PR's CI and review feedback | This is post-creation monitoring. Monitoring is read-only unless the user also authorizes fixes, reruns, or pushes. Read its complete skill and bundled scripts before use. |

`pr` is the standard dependency for full workflows and drafts a PR body after checks, review, and OpenSpec closure. It never creates or publishes the PR. `setup-matt-pocock-skills` is an opt-in, user-invoked, once-per-repository onboarding path only when the user chooses the broader Matt Pocock engineering conventions. It is not required by OpenSpec: treat the tracker as backlog/triage, OpenSpec as the current change plan, and glossary/ADR files as durable domain knowledge. Respect the setup skill's own confirmation and file-selection rules.

`code-review` already covers a local branch/PR diff against Standards and Spec. It produces a review report; it does not submit an approval or inline review to GitHub. Do not add another generic reviewer unless the user specifically wants reviews posted to the remote. Repository initialization (`git init`) is a small setup operation handled by [delivery.md](delivery.md), not a reason to install a low-fit skill.

Do not route to `prototype` in this workflow. Use `openspec-explore` for unresolved design questions.

Summarize the selected names, sources, version/ref when available, purpose, and relevant conflicts in the proposal's design. Reopen a technology decision only if the new evidence materially changes its tradeoffs.

## Install after selection

Once the proposal is ready, install selected implementation skills during an authorized setup/implementation phase. The user explicitly requesting GitHub delivery or monitoring an existing PR also authorizes selecting the corresponding delivery skill for that requested operation; no OpenSpec proposal is needed for a standalone delivery/follow-up request. A new dependency that changes the confirmed stack or scope returns to the decision step first. Respect actual host Plan mode restrictions.

From the code project's root, use a source-specific command such as:

```sh
npx skills add <reviewed-source> --skill <selected-name> --agent codex --yes
```

Omit `--global`: these are project dependencies. Prefer a fixed Git ref for reproducible content. Determine the real supported CLI syntax from the installed version; angle-bracket examples here are placeholders, not runnable literal commands.

Inspect existing project/global skills before installation. Do not overwrite customized or same-named content without resolving the conflict. Verify the expected project `SKILL.md` files and include applicable source/lock changes in the review. Read each installed skill before relying on it; listing a name in the plan is not activation.

If the current host does not expose a newly installed skill yet, read its actual local file explicitly. Never claim that an unavailable skill tool was invoked. Where required external access is unavailable, report the limitation and proceed only with work that does not depend on it.
