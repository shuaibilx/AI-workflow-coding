# Skill + CLI architecture

AI Workflow Plugin uses two cooperating layers: skills guide Codex through development decisions; the CLI performs repeatable environment, dependency, and project setup operations. OpenSpec remains responsible for change artifacts and task progress.

## Layout

```text
AI-workflow-coding/
├── plugin.json                       Portable Plugin identity and onboarding
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
│   └── ai-workflow-setup/
│       ├── SKILL.md                  First-run intent and result explanation
│       └── agents/openai.yaml
├── tests/                            CLI, file effects, and package contracts
└── scripts/smoke.mjs                 Real downloads in an isolated user home
```

The executable source lives inside the main skill intentionally. Both Plugin distribution and `skills add --skill ai-workflow` carry the same CLI, configuration, and references. The npm `bin` is only a loader; it does not contain a second installer. Setup resolves its sibling workflow from its actual installed location, so it works in a versioned Plugin cache without this Git checkout.

## Responsibilities

| Layer | Owns | Calls |
| --- | --- | --- |
| `ai-workflow` skill | Task-size routing, requirements, design, skill selection, phase handoffs, review | Supporting skills and OpenSpec workflows |
| `ai-workflow-setup` skill | Setup vs check-only intent, explicit project selection, explaining results | Bundled `setup --plugin --json`, or read-only `doctor` |
| AI Workflow CLI | Toolchain prerequisites, dependency presence, missing installs, managed update protection, explicit project initialization | npm, skills CLI, Git, OpenSpec CLI |
| OpenSpec | Current change artifacts, schema/context, task checkbox state, spec synchronization and archive | Its generated skills and CLI |

The AI Workflow installer ownership record is provenance for installed dependencies. It is not another development plan. OpenSpec artifacts remain the durable implementation plan; task checkboxes do not replace runtime verification or review.

## CLI contract

| Command | Behavior |
| --- | --- |
| `setup --plugin --json` | Check toolchain, inspect dependencies, install missing items, run final doctor; never initialize a project |
| `doctor --plugin --json` | Read-only dependency presence report; missing items exit 1 |
| `install --plugin --dry-run --json` | Preview missing dependency installs without writes or downloads |
| `install --plugin` | Prepare missing external dependencies using the bundled workflow |
| `update --plugin` | Update managed dependencies to declared pins, protecting local edits |
| `init --project <directory>` | Resolve the explicit project and delegate initialization to OpenSpec |

Standalone CLI use omits `--plugin`; the existing `install` path can install the main skill globally. In Plugin mode the enclosing manifest is checked, the bundled main skill is treated as available, and standalone copies/ownership records are preserved. Plugin files update through the Plugin manager. The dependency CLI does not rewrite a cached Plugin.

`--json` is available on all operational commands. Successful setup returns `ok`, final `items`, `prerequisites`, performed `changes`, and diagnostic `messages`. Missing dependencies from `doctor` return `ok: false` with `items`; execution errors return `ok: false` with `error.message` and prior messages. Only messages beginning `completed` confirm an installation was verified and its ownership saved; planned install/update messages are not completion evidence. Every non-ready/error result exits 1. Skills must check both structured status and exit code. Partial successful installs remain recorded, so a retry resumes missing work.

## Patterns adapted from OpenSpec

The reference implementation is OpenSpec 1.14.3:

- [`bin/openspec.js`](https://github.com/Fission-AI/OpenSpec/blob/v1.14.3/bin/openspec.js) and [`src/cli/index.ts`](https://github.com/Fission-AI/OpenSpec/blob/v1.14.3/src/cli/index.ts) separate command entry/presentation from operations. Our `bin` and bundled CLI follow that split without a compilation step.
- [`src/commands/workflow/instructions.ts`](https://github.com/Fission-AI/OpenSpec/blob/v1.14.3/src/commands/workflow/instructions.ts) supplies machine-readable inputs while the skill decides how to use them. Our setup skill consumes a JSON result from deterministic setup operations.
- [`src/core/templates/workflows/`](https://github.com/Fission-AI/OpenSpec/tree/v1.14.3/src/core/templates/workflows) separates phase-specific guidance. Our router loads `references/` by phase and has a distinct onboarding skill.
- [`src/core/shared/skill-generation.ts`](https://github.com/Fission-AI/OpenSpec/blob/v1.14.3/src/core/shared/skill-generation.ts) and [`scripts/generate-skillssh.mjs`](https://github.com/Fission-AI/OpenSpec/blob/v1.14.3/scripts/generate-skillssh.mjs) publish skills from a shared source. For one supported host, the same physical `skills/` directories serve both distribution channels, without generated copies.

OpenSpec's schemas, artifact engine, store support, and multi-tool generators already serve their own workflow. AI Workflow delegates to them and focuses its CLI on dependency readiness and project setup. No additional execution runtime, MCP server, or performance evaluation system is needed for this Plugin.
