# Plugin setup and project initialization

Read this reference before full OpenSpec workflows, environment repair, or explicit project initialization. Paths are relative to the installed skill, not the user's project.

## Full-workflow preflight

All fixed workflow skills, including conditional engineering and GitHub skills, ship inside the Plugin. Codex discovers them without downloading global copies. Stack-specific skills remain project-specific and are selected separately.

Before a full workflow, resolve and read `ai-workflow-setup`, then run the sibling CLI:

```sh
node "<plugin-root>/skills/ai-workflow/scripts/cli.mjs" setup --plugin --json
```

The command checks that Node.js meets the packaged minimum of 22.20.0, the packaged skills are complete, and OpenSpec CLI, Git, GitHub CLI (`gh`), and `gh auth status` are available. An unsupported Node.js version stops setup before dependency installation. If OpenSpec is missing, setup installs only the pinned `@fission-ai/openspec` version globally through npm, then checks the active executable again. It does not install `gh`, alter global skills, or initialize a project. A package-completeness, Node.js, or OpenSpec failure blocks the OpenSpec workflow; missing Git/GitHub readiness pauses remote delivery but does not prevent local planning, implementation, and review.

`setup` is idempotent and may be run at the start of each full workflow. When `ok` is true, local OpenSpec work is ready. `deliveryReady` and `deliveryPrerequisites` independently report whether GitHub operations are ready. If `gh-auth` is unavailable, report `gh auth login` as the recovery action and complete only local work until authentication is restored. If `gh` is missing, explain that it must be installed by the user. The setup CLI never installs Git or `gh`.

For a read-only diagnostic, use:

```sh
node "<plugin-root>/skills/ai-workflow/scripts/cli.mjs" doctor --plugin --json
```

Parse JSON and the process exit code. `runtimePrerequisite` reports the Node.js version check, `items` represent local workflow dependencies, and `deliveryReady` is separate. Claim setup success only when `ok` is true and the command exits 0. `changes` record actual installs only. A missing bundled skill means the Plugin package is incomplete; refresh or reinstall it rather than downloading an alternate copy.

## Initialize an explicitly selected project

Only initialize the project the user selected. An uninitialized project is not a reason to assume the current directory or initialize it automatically. Use the bundled CLI:

```sh
node "<plugin-root>/skills/ai-workflow/scripts/cli.mjs" init --project "<absolute-project-directory>"
```

This delegates to `openspec init --tools none`. OpenSpec creates its project structure under the selected project, while the Plugin supplies the `openspec-*` skill guidance. Existing project-local OpenSpec skill copies from an earlier initialization remain untouched; explicitly select the bundled skills by their `ai-workflow:<skill-name>` identities.

If a project already resolves to an OpenSpec root, reuse it. Invalid store pointers or unresolved existing `openspec/` data are errors to diagnose, not invitations to reinitialize. Existing projects do not need `openspec update` to use the Plugin-bundled skills.

## Standalone skill installation

The standalone distribution remains available for users who do not install the Plugin. `skills add` does not execute dependency installation hooks. Use the standalone CLI without `--plugin` only for that installation path. Its `install` command installs the five declared global baseline skills and a missing OpenSpec CLI; all workflow skills are already included in the Plugin distribution.

## Preserve other installations

Plugin setup never copies, deletes, or updates user-global skills or previously generated project OpenSpec skills. New project initialization uses `--tools none`, so it creates no project-local `openspec-*` skill copies. Existing `.agents/skills/openspec-*` directories remain in place; select the Plugin-bundled copy by its `ai-workflow:<skill-name>` identity. Plugin-bundled updates arrive with a Plugin release.
