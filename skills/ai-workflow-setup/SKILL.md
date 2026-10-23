---
name: ai-workflow-setup
description: Prepare AI Workflow Plugin dependencies when the user runs plugin setup or asks to install, repair, or check its development environment.
license: MIT
metadata:
  author: shuaibilx
  version: "0.2.0"
---

# AI Workflow Plugin setup

Make the plugin ready to use and report what is actually available. Respond in the user's language. A request to run setup authorizes installing missing workflow dependencies; reuse that authorization through the final check. A check-only request stays read-only.

## Locate the bundled installer

Resolve this skill's actual installed directory from the host catalog. The CLI is at `../ai-workflow/scripts/cli.mjs` relative to this directory; the dependency manifest is at `../ai-workflow/config/dependencies.json`. Resolve both to absolute paths. Do not assume this Git repository or a global `ai-workflow` command exists.

The plugin root contains `plugin.json` and/or `.codex-plugin/plugin.json`. If the sibling workflow or plugin manifest is missing, explain the incomplete installation and use the plugin's documented install path instead of silently downloading a different workflow version. Read the sibling workflow's [setup reference](../ai-workflow/references/setup.md) for preservation and update rules.

## Prepare dependencies

1. Check that `node --version` is available. The CLI requires Node.js >=22.20.0. If Node is missing or too old, report the prerequisite to fix; do not install or switch the user's runtime.
2. For a setup request, run the bundled CLI with `setup --plugin --json`. This single command checks npm/Git before mutation, checks dependencies, installs missing ones, and runs the final dependency check. Do not reimplement that sequence in ad hoc shell code or ask for the same setup authorization again.
3. Parse the JSON result: `prerequisites` lists tool versions, `changes` lists performed installations, `items` contains the final dependency statuses, and `messages` contains diagnostics and duplicate-entry notices. Claim readiness only when `ok` is true and the process exits 0. A failure returns `ok: false` and `error.message` with diagnostics; only `completed ...` messages confirm verified, recorded installations. Other install/update messages describe proposed actions. Report confirmed partial completion and stop. Rerunning setup resumes missing dependencies. Presence checks do not prove compatibility or measure workflow quality.
4. For a check-only request, run `npm --version`, `git --version`, and `doctor --plugin --json` without setup/installation. Missing dependencies cause exit 1 with structured `items`; an operational error has `error.message`. If the user wants a read-only installation preview, use `install --plugin --dry-run --json`. Report the runnable setup command without executing it.

Use quoted absolute paths in the actual commands; this example contains a placeholder:

```sh
node "<absolute-plugin-path>/skills/ai-workflow/scripts/cli.mjs" setup --plugin --json
```

An empty `changes` list on a successful setup means no installs were needed. Keep existing skills and OpenSpec CLI; do not substitute `update`, `--latest`, or an unrelated installer. Plugin mode uses the bundled main workflow without copying it globally. Show duplicate standalone-workflow notices and explain how to select the plugin's workflow entry; preserve those files and their installer ownership records.

## Optional project initialization and handoff

Only when the user requested initialization in a clearly identified project, resolve its directory and run the bundled CLI with `init --project "<absolute-project-directory>"`. Reuse an existing OpenSpec root. Report unresolved store declarations or configuration problems instead of recreating them. A dependency-only setup does not initialize the current working directory.

Report: prerequisite versions, dependencies reused/installed/missing, final doctor outcome, duplicate standalone entries, and the project initialization result if requested. Then show how to select the plugin's `ai-workflow` skill in Codex and start a task, for example `$ai-workflow:ai-workflow Help me clarify and propose a CSV export feature.` Follow the exact namespaced entry shown by the host. Leave task-specific skills for selection during the development workflow.
