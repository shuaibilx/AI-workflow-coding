# Tasks

## 1. Project-language configuration

- [x] 1.1 Update the explicit project initialization CLI to add adaptive artifact-language context to a resolvable project-local OpenSpec config when no context exists; preserve existing context, other keys, and external stores, and verify behavior through the confirmed CLI seam.
- [x] 1.2 Update CLI usage and initialization guidance to explain adaptive user-language behavior and existing-context preservation; verify the documented command and behavior match the CLI.

## 2. Verified automatic closure

- [x] 2.1 Update `openspec-apply-change` so `all_done` continues through project checks and the AI Workflow Standards/Spec review before archive; verify failures, unresolved findings, and user interruption leave the change active.
- [x] 2.2 Update `openspec-archive-change` to honor the verified apply-closure handoff by selecting delta sync or archive automatically, while retaining prompts for standalone archive requests; verify both invocation paths are documented consistently.
- [x] 2.3 Update the AI Workflow router and review references to avoid duplicate checks/archive, stop on blockers, and continue GitHub delivery only when the parent full workflow authorized it; verify phase handoffs are consistent.

## 3. Request-language artifacts and documentation

- [x] 3.1 Add adaptive user-language context to this repository's OpenSpec config and proposal guidance; verify Chinese and English request scenarios preserve schema-required headings, keywords, and technical identifiers.
- [x] 3.2 Update Chinese and English READMEs with automatic verified closure and request-language defaults; verify both describe the same behavior and existing custom context preservation.
- [x] 3.3 Bump and synchronize the Plugin/package workflow version and document any local adaptation to bundled OpenSpec skills; verify all manifests and dependency metadata agree.

## 4. Integration verification

- [x] 4.1 Run `npm test`, `npm run check`, `npm run test:integration`, strict validation for this change, and strict validation for the main specs after sync; record exact results before archiving.

## Verification results

- `npm test` — passed, 39 tests.
- `npm run check` — passed.
- `npm run test:integration` — passed with the real OpenSpec CLI and isolated temporary project.
- `openspec validate auto-archive-and-user-language --strict` — passed.
- `openspec validate --specs --strict` — passed, 3 main specs.

## Workflow follow-up

- Sync the delta spec into `openspec/specs/workflow-orchestration/spec.md` and verify it matches the change before archiving.
- Archive this change only after all tracked tasks, checks, and review requirements pass.
