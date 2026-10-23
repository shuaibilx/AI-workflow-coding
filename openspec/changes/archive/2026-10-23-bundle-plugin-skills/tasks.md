# Tasks

## 1. Vendor the fixed workflow skills

- [x] 1.1 Copy grilling, find-skills, codebase-design, code-review, and pr into `skills/<name>/` from the declared upstream refs, preserving supporting files and verify each directory has a valid `SKILL.md`.
- [x] 1.2 Add third-party license and attribution notices for the bundled skills, including the Apache-2.0 material credited by `pr`, and verify the package contains every required notice.

## 2. Make Plugin mode use bundled skills

- [x] 2.1 Update Plugin-mode dependency discovery so declared skills resolve under the Plugin's `skills/` tree and report bundled availability without installing or updating user-global workflow skills; cover install, doctor, setup, and update behavior with installer tests.
- [x] 2.2 Ensure a missing bundled skill is reported as an incomplete Plugin package and cannot trigger a global `skills add` fallback; verify the failure path with a focused test.
- [x] 2.3 Remove the setup skill's mandatory onboarding declaration from both manifests while keeping the setup skill available as an optional OpenSpec CLI environment helper; verify both manifests remain consistent.

## 3. Document and release the packaging change

- [x] 3.1 Update English and Chinese README, architecture, setup, and publishing docs to explain bundled skill discovery, optional setup, the separate OpenSpec CLI requirement, and how maintainers refresh vendored sources; verify commands and paths against the packaged layout.
- [x] 3.2 Bump package and Plugin manifests to 0.3.0 and verify all version references agree.
- [x] 3.3 Run unit, syntax, package, and isolated Codex installation checks; verify the npm artifact exposes the main workflow and all five bundled skills under the `ai-workflow` namespace. Attempt the network-dependent standalone smoke test and record any external blocker.

## Workflow follow-up

- Archive this change after implementation, verification, and review are complete.

The network smoke test was attempted but could not complete because the environment could not resolve `github.com`; local unit/package checks and installation of the packed artifact into an isolated Codex home passed.
