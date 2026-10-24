---
name: ai-workflow-setup
description: Prepare and verify local OpenSpec and GitHub prerequisites for an AI Workflow full-development task, or diagnose the Plugin environment when requested.
license: MIT
metadata:
  author: shuaibilx
  version: "0.7.0"
---

# AI Workflow setup

Use this skill at the start of a full workflow or when the user asks to check/repair the Plugin environment. Small local fixes do not require setup.

## Locate the packaged CLI

Resolve this skill's absolute Plugin directory from the host catalog. The CLI is at `../ai-workflow/scripts/cli.mjs` relative to this skill. Never assume a repository checkout or a global `ai-workflow` executable.

## Run setup once per full workflow

Run:

```sh
node "<plugin-root>/skills/ai-workflow/scripts/cli.mjs" setup --plugin --json
```

This checks that Node.js meets the packaged minimum (22.20.0), every fixed skill is present in the installed Plugin, and OpenSpec, Git, `gh`, and GitHub authentication are available; it installs only a missing pinned OpenSpec CLI globally via npm. An unsupported Node.js version stops setup before dependency installation. It does not install Git or `gh`, download skills, change global skill copies, or initialize any project. OpenSpec installation is automatic within this explicitly invoked setup flow; no extra confirmation is needed.

Read the complete JSON result and exit code:

- `ok: true` and exit code 0 means local OpenSpec workflow setup is ready.
- `runtimePrerequisite.available: false` means Node.js is below the required version; upgrade Node.js before retrying setup.
- `deliveryReady: true` means Git and authenticated `gh` are available for the later GitHub phase.
- `deliveryReady: false` does not block local planning/implementation/review. Report the missing prerequisite and pause push/PR operations.
- `changes` lists only verified dependency installations performed by this invocation.
- A missing bundled skill means the Plugin installation is incomplete; ask the user to refresh/reinstall the Plugin instead of downloading a replacement.

When GitHub auth is missing, the recovery command is `gh auth login`. If the CLI is unavailable, tell the user to install GitHub CLI. Do not ask users to manually run setup on every invocation; the main workflow invokes this skill automatically before full workflows.

For read-only checks, use `doctor --plugin --json`. Do not initialize a project as part of general setup. Only when the user has selected and authorized a specific project, initialize it with:

```sh
node "<plugin-root>/skills/ai-workflow/scripts/cli.mjs" init --project "<absolute-project-directory>"
```

Initialize the selected project with `openspec init --tools none`. OpenSpec's project data stays in that project's `openspec/` directory; the Plugin supplies OpenSpec skill guidance under its own namespace. Existing `.agents/skills/openspec-*` copies from earlier initialization remain untouched; call the bundled copy by its `$ai-workflow:<skill-name>` identity.
