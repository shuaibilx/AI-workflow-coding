---
name: ai-workflow-setup
description: Check or prepare the AI Workflow Plugin environment when the user asks for diagnostics, dependency repair, or OpenSpec CLI setup. Bundled Plugin skills need no setup.
license: MIT
metadata:
  author: shuaibilx
  version: "0.3.0"
---

# Optional AI Workflow environment setup

The Plugin bundles its fixed dependency skills, so ordinary development does not require this skill. Use it only when the user asks to inspect or prepare the environment, or when an OpenSpec-backed workflow needs the missing CLI.

## Locate the bundled installer

Resolve this skill's installed directory from the host catalog. The CLI is at `../ai-workflow/scripts/cli.mjs` relative to this directory. The Plugin root contains `plugin.json` and/or `.codex-plugin/plugin.json`. Do not assume this Git checkout or a global `ai-workflow` command exists. Read the sibling workflow's [setup reference](../ai-workflow/references/setup.md) for install and project-initialization rules.

## Check or prepare

1. Check `node --version`; the bundled CLI requires Node.js >=22.20.0. Do not install or switch the user's runtime.
2. For a read-only check, run `doctor --plugin --json`. This reports bundled skills and the OpenSpec CLI without installing anything.
3. For an explicitly requested setup, run `setup --plugin --json`. It uses the packaged skills and installs only a missing OpenSpec CLI via npm. It does not run `skills add`, alter existing global skill copies, or initialize a project unless the user explicitly identifies one.
4. Parse the JSON result and exit code. `items` show final dependency status, `prerequisites` show checked tools, `changes` show performed installs, and `messages` explain results. Claim readiness only when `ok` is true and the command exits 0. A missing bundled skill indicates an incomplete Plugin; tell the user to refresh or reinstall the Plugin rather than downloading a substitute.

Use the CLI from its actual installed path:

```sh
node "<absolute-plugin-path>/skills/ai-workflow/scripts/cli.mjs" doctor --plugin --json
node "<absolute-plugin-path>/skills/ai-workflow/scripts/cli.mjs" setup --plugin --json
```

Only initialize OpenSpec when the user explicitly requests setup for a clearly identified project:

```sh
node "<absolute-plugin-path>/skills/ai-workflow/scripts/cli.mjs" init --project "<absolute-project-directory>"
```

Report bundled skill availability, OpenSpec CLI status, any verified installation, and project initialization only when requested.
