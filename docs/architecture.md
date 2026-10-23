# Skill + CLI architecture

AI Workflow Plugin uses two cooperating layers: skills guide Codex through development decisions; the CLI performs repeatable environment, dependency, and project setup operations. OpenSpec remains responsible for change artifacts and task progress. Five fixed upstream skills ship inside the Plugin so Codex discovers them on installation.

## Layout

```text
AI-workflow-coding/
├── plugin.json                       Portable Plugin identity and interface
├── .codex-plugin/plugin.json         Codex compatibility manifest
├── .agents/plugins/marketplace.json  Repository distribution catalog
├── bin/ai-workflow.mjs               Thin npm command entry
├── skills/
│   ├── ai-workflow/
│   │   ├── SKILL.md                  Main workflow router
│   │   ├── references/               Phase-specific guidance
│   │   ├── config/dependencies.json  Versions and upstream Git revisions
│   │   ├── scripts/
│   │   │   ├── cli.mjs               Arguments, help, JSON, exit status
│   │   │   └── lib/
│   │   │       ├── installer.mjs     Setup, preservation, update, initialization
│   │   │       └── system.mjs        Shell-free subprocess adapter
│   │   └── agents/openai.yaml        Skill interface metadata
│   ├── ai-workflow-setup/            Optional OpenSpec CLI environment helper
│   ├── grilling/                     Bundled upstream skill + UI metadata
│   ├── find-skills/                  Bundled upstream skill
│   ├── codebase-design/              Bundled upstream skill + references
│   ├── code-review/                  Bundled upstream skill + UI metadata
│   └── pr/                           Bundled upstream skill + attribution
├── licenses/                         Upstream MIT and Apache-2.0 texts
└── THIRD_PARTY_NOTICES.md            Pinned sources and license mapping
├── tests/                            CLI, file effects, and package contracts
└── scripts/smoke.mjs                 Real downloads in an isolated user home
```

The executable source lives inside the main skill intentionally. Both Plugin distribution and `skills add --skill ai-workflow` carry the same CLI, configuration, and references. The npm `bin` is only a loader; it does not contain a second installer. Plugin mode resolves its root from the installed workflow path and checks the five bundled skill directories there; it does not need this Git checkout or a user-global skill installation.

## Responsibilities

| Layer | Owns | Calls |
| --- | --- | --- |
| `ai-workflow` skill | Task-size routing, requirements, design, skill selection, phase handoffs, review | Supporting skills and OpenSpec workflows |
| `ai-workflow-setup` skill | Optional environment checks, explicit project selection, explaining CLI results | Bundled `setup --plugin --json`, or read-only `doctor` |
| Bundled fixed skills | Clarification, skill discovery, codebase design, local review, PR text | Loaded from the Plugin's `skills/` directory |
| AI Workflow CLI | Bundled skill presence, OpenSpec CLI readiness, standalone dependency installs, managed update protection, explicit project initialization | npm, skills CLI, Git, OpenSpec CLI |
| OpenSpec | Current change artifacts, schema/context, task checkbox state, spec synchronization and archive | Its generated skills and CLI |

The AI Workflow installer ownership record is provenance for installed dependencies. It is not another development plan. OpenSpec artifacts remain the durable implementation plan; task checkboxes do not replace runtime verification or review.

## CLI contract

| Command | Behavior |
| --- | --- |
| `setup --plugin --json` | Check bundled skills and OpenSpec; if OpenSpec is missing, install only that CLI and run final doctor; never initialize a project |
| `doctor --plugin --json` | Read-only report of bundled skills and OpenSpec CLI; missing items exit 1 |
| `install --plugin --dry-run --json` | Preview OpenSpec CLI installation without writes or downloads |
| `install --plugin` | Install the missing OpenSpec CLI; never downloads bundled skills |
| `update --plugin` | Update only the installer-managed OpenSpec CLI |
| `init --project <directory>` | Resolve the explicit project and delegate initialization to OpenSpec |

Standalone CLI use omits `--plugin`; the existing `install` path can install the main skill and missing dependencies globally. In Plugin mode the enclosing manifest and all five bundled skills are checked, while global copies and ownership records are left untouched. Bundled skill changes arrive through a Plugin release; the dependency CLI does not rewrite the cached Plugin.

`--json` is available on all operational commands. Successful setup returns `ok`, final `items`, `prerequisites`, performed `changes`, and diagnostic `messages`. Missing dependencies from `doctor` return `ok: false` with `items`; execution errors return `ok: false` with `error.message` and prior messages. Only messages beginning `completed` confirm an installation was verified and its ownership saved; planned install/update messages are not completion evidence. Every non-ready/error result exits 1. Skills must check both structured status and exit code. Partial successful installs remain recorded, so a retry resumes missing work.

## Patterns adapted from OpenSpec

The reference implementation is OpenSpec 1.14.3:

- [`bin/openspec.js`](https://github.com/Fission-AI/OpenSpec/blob/v1.14.3/bin/openspec.js) and [`src/cli/index.ts`](https://github.com/Fission-AI/OpenSpec/blob/v1.14.3/src/cli/index.ts) separate command entry/presentation from operations. Our `bin` and bundled CLI follow that split without a compilation step.
- [`src/commands/workflow/instructions.ts`](https://github.com/Fission-AI/OpenSpec/blob/v1.14.3/src/commands/workflow/instructions.ts) supplies machine-readable inputs while the skill decides how to use them. Our optional environment helper consumes a JSON result from deterministic setup operations.
- [`src/core/templates/workflows/`](https://github.com/Fission-AI/OpenSpec/tree/v1.14.3/src/core/templates/workflows) separates phase-specific guidance. Our router loads `references/` by phase and keeps environment setup optional.
- [`src/core/shared/skill-generation.ts`](https://github.com/Fission-AI/OpenSpec/blob/v1.14.3/src/core/shared/skill-generation.ts) and [`scripts/generate-skillssh.mjs`](https://github.com/Fission-AI/OpenSpec/blob/v1.14.3/scripts/generate-skillssh.mjs) publish skills from a shared source. For one supported host, the same physical `skills/` directories serve both distribution channels, without generated copies.

OpenSpec's schemas, artifact engine, store support, and multi-tool generators already serve their own workflow. AI Workflow delegates to them and focuses its CLI on dependency readiness and project setup. No additional execution runtime, MCP server, or performance evaluation system is needed for this Plugin.
