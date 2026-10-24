# Tasks

## 1. Project OpenSpec initialization

- [x] 1.1 Change the installer initialization test seam to model OpenSpec's `--tools` behavior; assert the command is `openspec init --tools none`, the selected project receives `openspec/config.yaml`, and no new `.agents/skills/openspec-*` files are generated.
- [x] 1.2 Change the CLI to pass `--tools none` and update the real integration smoke check to verify the project structure is created without a generated OpenSpec skill.

## 2. Workflow routing and documentation

- [x] 2.1 Update the workflow router and planning, implementation, review, setup, and setup-skill guidance to select Plugin-namespaced OpenSpec skills explicitly; confirm no active instructions still recommend project-generated OpenSpec skill copies.
- [x] 2.2 Update English and Chinese README invocation guidance, OpenSpec location behavior, existing-project preservation, and Plugin refresh steps; verify both languages show the same behavior.
- [x] 2.3 Update architecture and publishing docs to describe `openspec init --tools none` and Plugin skill invocation/refresh; search active docs for stale `--tools codex` instructions.

## 3. Plugin package version

- [x] 3.1 Bump both Plugin manifests, `package.json`, and workflow skill metadata to 0.5.0; assert all exposed package versions and the dependency manifest agree.
- [x] 3.2 Verify the package artifact includes all 21 skill directories and manifests at version 0.5.0 with `npm pack --dry-run --json` and the Plugin packaging test.

## 4. Integration verification

- [x] 4.1 Run `npm test`, `npm run check`, `npm run test:integration`, and `openspec validate project-openspec-plugin-skill-routing --strict`; inspect the actual project path and skill inventory in the integration result.
- [x] 4.2 Review the full change against the modified workflow spec and repository standards, fix any blocking findings, and rerun the checks affected by fixes.

## Workflow follow-up

- Synchronize the updated main OpenSpec requirements and archive this change after implementation, verification, and review pass.
