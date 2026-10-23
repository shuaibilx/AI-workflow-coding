# Design

## Context

See [proposal.md](proposal.md). The Plugin already vendors skills under `skills/`, validates them from `dependencies.json`, and exposes a Node CLI with an injected command runner for tests. OpenSpec generates project-local Codex skills with `openspec init --tools codex`; that behavior is retained.

## Goals / Non-Goals

**Goals:** Bundle every fixed workflow skill; make OpenSpec setup an idempotent full-workflow preflight; distinguish local readiness from GitHub delivery readiness; encode the agreed push, review, monitoring, and merge boundaries.

**Non-Goals:** Build a second GitHub client in the Plugin CLI, install `gh`, rewrite OpenSpec's generated paths, or bundle every possible stack-specific skill.

## Decisions

- Treat `skills/` as the Plugin's curated runtime package. `pluginSkills` defines the complete fixed Plugin bundle; the standalone installer keeps its smaller `skills` dependency set. Preserve each upstream skill's supporting files and separate license/attribution notices.
- Require the stable Node.js version declared in the dependency manifest before any mutating CLI operation. `doctor` reports the runtime, and `setup` stops before installation when unsupported. Keep OpenSpec CLI as a pinned global npm executable; Plugin `setup` installs it only when missing and verifies the active version. It reports Git/GitHub readiness separately so missing `gh` or authentication pauses publication without blocking local work. The existing injected command adapter and temp-directory fixtures are the test seam for this behavior.
- Keep OpenSpec project initialization explicit and unchanged: `init --project` runs `openspec init --tools codex`; project-local generated skills remain at the CLI's default `.agents/skills/` path and are never deleted or redirected.
- Keep `ai-workflow` as the router and distribute detailed phase behavior through its existing references. `ai-workflow-setup` becomes the setup/onboarding entry; the main workflow runs setup before a full route and skips it for a small fix.
- Use the bundled GitHub skills plus `git`/`gh` for remote operations rather than extending the Plugin CLI. Full-workflow delivery starts from `codex/<change-slug>`, stages only this change, posts AI review as COMMENT, monitors through a live Codex session, and enables auto-merge only under GitHub's own required checks, approvals, and merge method.
- Use OpenSpec as the sole durable implementation plan. Plan mode and `openspec-explore` remain conditional inputs before propose, never a second required plan.

## Risks / Trade-offs

- More vendored skills increase package size and update work → pin sources where available, preserve notices, and verify the complete npm artifact.
- Plugin and project-local OpenSpec skills can both be discovered → preserve OpenSpec's default behavior as requested and make the workflow use the project's generated OpenSpec skills for initialized projects.
- A full workflow may finish locally while GitHub is unavailable → report `deliveryReady: false`, preserve the topic branch, and make the PR step resumable.
- Auto-merge depends on repository policy and permissions → use GitHub's auto-merge mechanism without bypass flags; stop and report when the API cannot enable it.
