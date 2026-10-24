# Tasks

## 1. Prune the bundled skill set

- [x] 1.1 Remove `skills/setup-matt-pocock-skills/` and `skills/pr/`, delete `pr` from both dependency arrays and revise `code-review` to use OpenSpec or supplied task requirements; verify the package inventory test rejects either removed skill and accepts the retained GitHub helpers.
- [x] 1.2 Move PR-body drafting guidance into `ai-workflow` delivery instructions with repository-template precedence and the Summary/Evidence/Merge Danger fallback; verify workflow references no longer invoke `pr` or `setup-matt-pocock-skills`.
- [x] 1.3 Bump package, Plugin manifests, workflow metadata, and dependency metadata together to `0.6.0`; verify all declared versions agree.

## 2. Keep distribution records accurate

- [x] 2.1 Update English and Chinese READMEs, architecture, publishing guidance, and skill-selection references to report 17 fixed dependencies and 19 total skills; verify no stale inventory counts or removed-skill install instructions remain.
- [x] 2.2 Update third-party notices for the removed Matt Pocock skills while retaining HumanLayer attribution and Apache-2.0 text for PR-body guidance that remains; verify every bundled source and license is represented.

## 3. Verify the Plugin artifact

- [x] 3.1 Update packaging tests for the reduced exact skill list, review-source fallback, PR-body guidance, and manifest versions; verify `npm test` passes.
- [x] 3.2 Run `npm run check`, `npm run test:integration`, `npm pack --dry-run`, and OpenSpec validation; verify the packed artifact contains 19 skills and neither removed skill directory.

## Workflow follow-up

- Archive this change after implementation review and specification synchronization.
