# Design

## Context

See [proposal.md](proposal.md) for motivation and [specs](specs/) for the behavior contract. The `pluginSkills` list is already the source of truth for Plugin dependency completeness, while the `skills` list supplies the standalone installer baseline. Codex discovers skills from directories under root `skills/`, so removed entries must not remain there as hidden duplicates. The package currently has 21 skills total: two first-party skills and 19 fixed dependencies.

## Goals / Non-Goals

**Goals:**
- Reduce the exposed Plugin catalog by two skills while retaining all workflow behavior.
- Keep `create-pull-request` and `babysit-pr` as the phase-specific GitHub helpers.
- Make OpenSpec or the user's task criteria sufficient as the code-review Spec source.
- Keep PR-body guidance in one first-party delivery reference, with repository templates taking precedence.
- Preserve notices for any upstream material retained in the fallback PR-body structure.

**Non-Goals:**
- Add another GitHub operations skill or CLI.
- Change OpenSpec, setup CLI, GitHub authorization, monitoring, auto-merge, or branch-cleanup behavior.
- Remove the first-party `ai-workflow-setup` skill.

## Decisions

### Remove the two standalone skill directories and manifest entries

Delete `skills/setup-matt-pocock-skills/` and `skills/pr/`, remove their entries from both dependency arrays, and update the exact Plugin inventory and package tests. The setup skill is not used by OpenSpec or the current fixed workflow. The `pr` skill's only workflow role is PR-body authoring, which moves into the main delivery guidance. Keep `create-pull-request` and `babysit-pr` unchanged as upstream snapshots.

**Alternative considered:** retain `setup-matt-pocock-skills` as an optional packaged entry. Rejected because the Plugin does not include its main companion workflows and the user chose to remove it from this Plugin. Users who want that broader ecosystem can install it separately from its source.

### Keep code review independent of the removed setup skill

Replace the bundled `code-review` skill's setup prerequisite with a source-selection rule: use the active OpenSpec requirements or task criteria supplied by the user; when no source exists and a Spec review is required, report the gap and ask for the source. This keeps standalone and orchestrated reviews usable without inventing an issue-tracker configuration.

### Draft PR text inside the main delivery path

Keep the GitHub lifecycle in `ai-workflow` and the two specialized helpers. The delivery reference will direct the workflow to read a repository PR template and follow its structure when one exists. With no template, draft concise Summary, Evidence, and Merge Danger sections using verified results, merge direction, and blast radius. Do not call a separate PR-writing skill.

Retain the HumanLayer attribution and Apache-2.0 license text because the fallback structure adapts material carried by the removed `pr` skill. Remove the local `pr/CREDITS.md` copy with that skill directory and put the source note in the project-level notices.

**Alternative considered:** add GitHub's general `gh-cli` reference skill or ECC `github-ops`. Rejected because those document GitHub command and repository-management operations but do not replace this Plugin's task-scoped local-to-merge orchestration; the current workflow already owns that lifecycle.

### Publish the removal as a breaking pre-1.0 update

Bump package, Plugin manifests, workflow metadata, and dependency metadata together to `0.6.0`. The two removed skill names are user-visible invocation entry points, so a patch-only release would understate the change. Keep the onboarding entry `ai-workflow-setup` unchanged.

## Risks / Trade-offs

- **Users invoking either removed skill by name lose that Plugin entry point** → Keep the behavior users need in `ai-workflow`, and document the smaller catalog and upgrade path.
- **The code-review snapshot may drift from its upstream revision** → Keep its original source, revision, and license in notices; limit the local change to its issue-tracker prerequisite.
- **PR templates may differ from the fallback format** → Always prefer the repository template; use the fallback only when no template exists.
- **Bundle counts can drift between docs, manifests, and package output** → Assert the exact inventory and version agreement in package tests, then run packaging and integration checks.
