# Tasks

## 1. Define safe post-merge cleanup

- [x] 1.1 Update `delivery.md` and its GitHub adapter pointer so cleanup runs only after a full-workflow PR is confirmed merged, verifies the repository and head SHA, deletes only that workflow's remote task branch, and skips safely when its ref is absent or moved.
- [x] 1.2 Document local cleanup preconditions: clean worktree, matching PR head, no competing worktree, and a fast-forwardable default branch; verify unsafe cases preserve the checkout and report the reason.
- [x] 1.3 Update the `workflow-orchestration` main spec from the delta and verify `openspec validate --all --strict` passes.

## 2. Keep skill discovery unambiguous

- [x] 2.1 Remove the six identical ignored `.agents/skills/openspec-*` directories from this repository, preserve `.agents/plugins/marketplace.json`, and verify the root `skills/` bundle remains complete.
- [x] 2.2 Clarify in both READMEs that `/skills` browses the installed catalog, `$ai-workflow:<skill-name>` directly invokes a bundled skill, and `/ai workflow` autocomplete is filtered; update the workflow summary to mention post-merge cleanup and verify the English and Chinese descriptions agree.
- [x] 2.3 Update the `plugin-skill-distribution` main spec from the delta and verify `openspec validate --all --strict` passes.

## 3. Version and validate the Plugin

- [x] 3.1 Bump the Plugin patch version consistently across package/Plugin manifests, the workflow dependency manifest, and first-party workflow skill metadata; update the package test's expected version and add assertions for the bilingual skill-discovery guidance.
- [x] 3.2 Run `npm test`, `npm run check`, `npm run test:integration`, and `openspec validate --all --strict`; report the results and any environment limitation.

## Workflow follow-up

- Sync and archive this OpenSpec change after implementation and review are complete.
