# Design

## Context

The portable Plugin package discovers skills from root `skills/`, and the Codex compatibility manifest points to that same directory. Six ignored OpenSpec copies in `.agents/skills/` are byte-identical local workspace artifacts. The delivery flow already watches its PR until merge or close, so cleanup belongs in the AI Workflow delivery policy after `babysit-pr` reports a terminal state. The upstream `babysit-pr` snapshot remains unchanged; repository-specific behavior belongs in the Plugin's delivery adapter.

## Goals / Non-Goals

**Goals:**
- Keep the Plugin's fixed skill bundle in one package directory and teach users how to browse and directly invoke its skills.
- Remove the local OpenSpec duplicates from this source checkout.
- Clean up only the task branch belonging to a confirmed merged full-workflow PR, with checks that protect newer or local-only work.

**Non-Goals:**
- Change GitHub's repository-wide `delete_branch_on_merge` setting.
- Delete user-global skills or OpenSpec copies inside other projects.
- Add a branch-management CLI or change the upstream `babysit-pr` files.
- Reinstall the Plugin as part of this change.

## Decisions

- Keep root `skills/` as the only bundled source. Remove the six identical ignored `.agents/skills/openspec-*` folders in this checkout and retain `.agents/plugins/marketplace.json`. Continue initializing projects with `openspec init --tools none`.
- Explain `/skills` as the browse entry point and `$ai-workflow:<skill-name>` as direct invocation. Avoid promising that typing `/ai workflow` lists every bundled dependency; the slash picker filters suggestions.
- Treat GitHub's merged PR state as the authority for remote cleanup. Before deleting, verify the PR targets this repository and the remote task ref still points to the merged PR head. Delete with an explicit `--force-with-lease` expectation pinned to that SHA so a concurrent ref update is rejected. Skip deletion if the ref is absent or has moved.
- For local cleanup, require the current local task ref and PR head SHA to match, a clean worktree, the matching default branch not checked out in another worktree, and the local default branch to be an ancestor of its fetched remote. Then switch to the default branch, fast-forward only, and remove the task ref with `git update-ref -d` conditioned on the PR head SHA, so a concurrent local ref update is preserved. If any check fails, preserve the local state and report the exact reason.
- Use the PR's recorded merged state and matching head SHA to authorize removal of the local task ref even when the repository's merge method (for example, squash) does not make the task commits ancestors of the default branch. Never force-push or alter repository settings.
- Bump the Plugin patch version consistently in `package.json`, `plugin.json`, and `.codex-plugin/plugin.json` so manual refresh can identify the update.

## Risks / Trade-offs

- [A branch ref may advance after merge] → Compare remote and local task heads with the PR head SHA, use a lease-protected remote delete and an expected-old-SHA local ref transaction to close both check/delete races, and retain any advanced ref.
- [The user may have local edits after PR creation] → Require a clean worktree and exact head match before changing branches or deleting the local ref.
- [Some users have duplicate skills outside the Plugin] → Scope the README's one-entry guarantee to the Plugin package and clarify that same-named project/global skills can still appear separately.
- [A Codex picker may not immediately reflect a package update] → The user will refresh/reinstall the Plugin manually and can then verify browsing with `/skills` and direct invocation with a namespaced skill call.
