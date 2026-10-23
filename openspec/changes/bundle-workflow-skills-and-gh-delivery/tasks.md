# Tasks

## 1. Bundle fixed workflow skills

- [x] 1.1 Extend Plugin artifact tests to require every fixed workflow skill, setup onboarding metadata, and upstream notices; run the focused test and confirm it fails before implementation.
- [x] 1.2 Vendor OpenSpec, conditional engineering, and GitHub skills with supporting files; record source, revision or snapshot date, and licenses; verify every declared skill has a valid `SKILL.md` and supporting paths.
- [x] 1.3 Update Plugin completeness checks and package metadata for the expanded bundle; verify the npm dry-run artifact contains every skill and license notice.

## 2. Prepare local and delivery prerequisites

- [x] 2.1 Add installer tests for OpenSpec auto-install, default `--tools codex` initialization, preserved project-local OpenSpec copies, and GitHub readiness independent of local readiness; run the focused tests and confirm the new readiness case fails first.
- [x] 2.2 Implement idempotent setup and read-only doctor reporting for Node/npm/OpenSpec and Git/gh/auth; only install a missing pinned OpenSpec CLI, then verify with the full installer test suite.

## 3. Orchestrate implementation and GitHub delivery

- [x] 3.1 Update the main workflow, setup, planning, skill selection, implementation, review, and delivery references so full workflows run setup, create/reuse the task branch before tracked artifacts, use phase-triggered skills, and perform the authorized GitHub lifecycle; verify all named skill paths resolve.
- [x] 3.2 Adapt bundled `create-pull-request` and `babysit-pr` guidance to the Plugin layout, Windows/PowerShell 7, task-only commits, COMMENT-only AI reviews, bounded retries, and repository-rule auto-merge; run their documented local checks where available.

## 4. Document and validate the release

- [x] 4.1 Rewrite both READMEs with matching horizontal Mermaid workflows, setup/update guidance, bundled skill inventory, and GitHub behavior; verify diagrams render structurally and bilingual claims agree.
- [x] 4.2 Run `npm test`, `npm run check`, OpenSpec validation, and npm pack inspection; resolve failures and verify the complete package contents.
- [ ] 4.3 Re-run `npm run test:integration` when GitHub DNS/network access is available; the current attempt fails while cloning `mattpocock/skills` because `github.com` cannot be resolved.

## Workflow follow-up

- Sync the completed capability specs and archive this change after review and all tracked tasks pass.
- Commit and push the task branch and create a PR when GitHub authentication is valid; otherwise leave the verified commit local and report the exact recovery command.
- After PR creation, post the authorized COMMENT review, monitor through merge/close, and use repository-rule auto-merge when eligible.
