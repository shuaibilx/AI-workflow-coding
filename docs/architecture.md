# Skill + CLI architecture

AI Workflow Plugin uses two cooperating layers: skills guide Codex through development choices; a small CLI makes setup and project initialization repeatable. OpenSpec remains responsible for change artifacts and task progress. All 19 fixed workflow skills ship inside the Plugin; stack-specific skills remain project-discovered.

## Layout

```text
AI-workflow-coding/
├── plugin.json                       Portable Plugin identity and onboarding skill
├── .codex-plugin/plugin.json         Codex compatibility manifest
├── .agents/plugins/marketplace.json  Repository distribution catalog
├── bin/ai-workflow.mjs               Thin npm command entry
├── skills/
│   ├── ai-workflow/
│   │   ├── SKILL.md                  Main workflow router
│   │   ├── references/               Setup, phases, review, delivery, resume
│   │   ├── config/dependencies.json  Standalone baseline + complete Plugin inventory
│   │   ├── scripts/                  CLI, installer, subprocess adapter
│   │   └── agents/openai.yaml        Codex UI metadata
│   ├── ai-workflow-setup/            Full-workflow preflight skill
│   ├── <19 bundled dependency skills>/ Fixed upstream skills and their resources
├── licenses/                         Upstream MIT and Apache-2.0 texts
└── THIRD_PARTY_NOTICES.md            Sources, revisions/snapshots, and license mapping
```

The same skill directories serve Plugin and standalone skill distribution; the npm `bin` is only a loader. Plugin setup resolves its root from the installed `ai-workflow` directory and checks all declared bundled skill paths. It does not need a repository checkout or global skill copies.

## Responsibilities

| Layer | Owns | Calls |
| --- | --- | --- |
| `ai-workflow` | Task-size routing, requirements, design, skill selection, phase handoffs, review, delivery | Fixed workflow skills and OpenSpec |
| `ai-workflow-setup` | Local readiness and delivery-prerequisite preflight | `setup --plugin --json`; missing OpenSpec CLI install |
| Fixed bundled skills | Clarification, skill discovery, OpenSpec phases, conditional engineering, local review, PR authoring and GitHub operations | Loaded by Codex from Plugin `skills/` |
| AI Workflow CLI | Package completeness, OpenSpec CLI readiness, standalone dependency install/update, explicit project init | npm, skills CLI, Git, `gh`, OpenSpec |
| OpenSpec | Change artifacts, task state, spec synchronization and archive | Global CLI; project data lives under the selected project |
| Stack-specific skills | Project technology guidance | Found with `find-skills`, selected after review |

The setup CLI distinguishes local readiness (`ok`) from remote delivery readiness (`deliveryReady`). It installs only the pinned OpenSpec CLI if missing. It never installs Git/`gh`, copies Plugin skills to global paths, or removes project-local skills created by earlier OpenSpec initialization. New project initialization uses `--tools none` and leaves OpenSpec skills to the Plugin bundle.

## CLI contract

| Command | Behavior |
| --- | --- |
| `setup --plugin --json` | Check all bundled skills, OpenSpec, Git, `gh`, and auth; install only missing pinned OpenSpec; report local and delivery readiness separately |
| `doctor --plugin --json` | Read-only report for the same local and delivery prerequisites |
| `install --plugin --dry-run --json` | Preview OpenSpec CLI installation; never download bundled skills |
| `install --plugin` | Install only the missing OpenSpec CLI |
| `update --plugin` | Update only an OpenSpec installation previously managed by this installer |
| `init --project <directory>` | Initialize only the named project using `openspec init --tools none`; create project OpenSpec data without generating duplicate project-local skills |

Without `--plugin`, the standalone installer retains its separate contract: install/update the main skill, five global baseline dependencies, and a missing OpenSpec CLI. It does not claim to install the Plugin's entire runtime dependency set globally.

The `pluginSkills` array in `skills/ai-workflow/config/dependencies.json` is the source of truth for Plugin completeness. `skills` remains the smaller standalone install set. All fixed skill names, upstream sources, immutable revisions or dated snapshots, and licenses are reviewed in tests and third-party notices.

`--json` returns structured local readiness, delivery prerequisites, performed changes, and diagnostic messages. `doctor` is read-only. Failed OpenSpec installation or package completeness blocks a full OpenSpec workflow; unavailable GitHub tools/auth only pause remote delivery.

## Patterns adapted from OpenSpec

The reference implementation is OpenSpec 1.14.3:

- [`bin/openspec.js`](https://github.com/Fission-AI/OpenSpec/blob/v1.14.3/bin/openspec.js) and [`src/cli/index.ts`](https://github.com/Fission-AI/OpenSpec/blob/v1.14.3/src/cli/index.ts) separate command entry/presentation from operations. Our `bin` and bundled CLI follow that split without a build step.
- [`src/commands/workflow/instructions.ts`](https://github.com/Fission-AI/OpenSpec/blob/v1.14.3/src/commands/workflow/instructions.ts) provides machine-readable inputs while skills guide how to use them. Our setup helper consumes deterministic JSON from the CLI.
- [`src/core/templates/workflows/`](https://github.com/Fission-AI/OpenSpec/tree/v1.14.3/src/core/templates/workflows) separates phase-specific guidance. Our router loads focused `references/` on demand.
- [`src/core/shared/skill-generation.ts`](https://github.com/Fission-AI/OpenSpec/blob/v1.14.3/src/core/shared/skill-generation.ts) generates project-local skills when an integration is selected. AI Workflow selects `none` so its installed Plugin remains the single source for OpenSpec skill guidance.

OpenSpec's schemas, artifact engine, store support, and multi-tool generators already own their workflow. AI Workflow coordinates fixed skills and GitHub delivery around them; its CLI stays focused on dependency readiness and explicit project setup. It does not add a second plan engine, MCP server, or performance evaluation system.
