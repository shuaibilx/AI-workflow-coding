<div align="center">

# AI Workflow

**Carry a clear requirement all the way to verified delivery in Codex.**

[English](README.md) · [简体中文](README.zh-CN.md)

[![CI](https://github.com/shuaibilx/AI-workflow-coding/actions/workflows/ci.yml/badge.svg)](https://github.com/shuaibilx/AI-workflow-coding/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Agent: Codex](https://img.shields.io/badge/Agent-Codex-black.svg)](skills/ai-workflow/SKILL.md)

</div>

AI Workflow is a Codex skill that connects requirements discovery, technology choices, relevant skills, OpenSpec planning, implementation, and review. It carries decisions between those steps and scales the process to the task.

## Why this exists

Good tools still need handoffs. A thorough interview can become a second interview during planning. A technology skill can arrive after the architecture is decided. A review of committed code can miss the implementation still sitting in the working tree.

This workflow makes those handoffs explicit:

- **Clarify once.** Reuse decisions; explore only the unknowns that remain.
- **Let expertise inform the plan.** Read candidate skills before finalizing the design; install the selected project skills afterward.
- **Keep a single implementation plan.** Carry discovery into OpenSpec artifacts.
- **Verify before closing.** Check behavior, review both standards and requirements, fix defects, then archive.
- **Match the task.** A local, well-understood fix takes the short path.

OpenSpec supplies the change/spec machinery. AI Workflow coordinates it with complementary skills. It is an independent project, initially targeting Codex.

## See the workflow

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontSize":"14px"},"flowchart":{"nodeSpacing":18,"rankSpacing":35,"wrappingWidth":180}}}%%
flowchart LR
    G[Describe goal]:::start --> C["1. Clarify<br/><span style='color:#174ea6'><b>grilling</b></span> · requirements<br/><span style='color:#174ea6'><b>Plan mode</b></span> · complex work<br/><span style='color:#174ea6'><b>openspec-explore</b></span> · unresolved facts"]:::stage
    C --> P["2. Plan + propose<br/><span style='color:#174ea6'><b>find-skills</b></span> · skill fit<br/><span style='color:#174ea6'><b>research</b></span> · uncertain external facts<br/><span style='color:#174ea6'><b>domain-modeling</b></span> · lasting terms/decisions<br/><span style='color:#174ea6'><b>codebase-design</b></span> · interfaces<br/><span style='color:#174ea6'><b>openspec-propose</b></span> · decisions + tasks"]:::stage
    P -->|User requests implementation| I["3. Implement<br/><span style='color:#174ea6'><b>openspec-apply-change</b></span> · tasks<br/><span style='color:#174ea6'><b>tdd</b></span> · agreed test seams<br/><span style='color:#174ea6'><b>diagnosing-bugs</b></span> · hard bugs/perf regressions<br/><span style='color:#174ea6'><b>writing-for-agents</b></span> · agent docs only"]:::stage
    I --> V["4. Verify + close<br/>Checks · behavior<br/><span style='color:#174ea6'><b>code-review</b></span> · standards + spec<br/><span style='color:#174ea6'><b>sync + archive</b></span> · full changes<br/><span style='color:#174ea6'><b>pr</b></span> · PR draft only"]:::stage
    G -->|Small fix| I
    V -->|Fix and recheck| I
    G -.->|User asks for repository setup| R["Optional Git setup<br/><span style='color:#174ea6'><b>delivery.md</b></span> · git init + origin"]:::optional
    R -.-> C
    V -.->|User explicitly requests delivery| D["Optional GitHub delivery<br/><span style='color:#174ea6'><b>create-pull-request</b></span> · commit/push or open PR"]:::optional
    D -.->|User explicitly requests monitoring| M["Open PR follow-up<br/><span style='color:#174ea6'><b>babysit-pr</b></span> · CI + review feedback"]:::optional
    G -.->|Opt-in repository setup| S["Optional onboarding<br/><span style='color:#174ea6'><b>setup-matt-pocock-skills</b></span> · tracker + domain docs"]:::optional
    S -.-> C
    classDef start fill:#ffffff,stroke:#64748b,color:#334155,stroke-width:1.5px
    classDef stage fill:#f8fafc,stroke:#cbd5e1,color:#334155,stroke-width:1.5px
    classDef optional fill:#fff7ed,stroke:#f97316,color:#7c2d12,stroke-width:1.5px,stroke-dasharray:5 5
```

Blue labels identify skills and tools; regular text describes their role and trigger. Dashed branches are optional and user-invoked. Of the additional skills, only `pr` joins the standard global dependency set; the other task-specific skills are installed in the project when selected.

Plan mode is an optional Codex aid for complex, risky, or underspecified work; it does not create a second source of truth. `openspec-explore` investigates repository facts or feasibility only when questions remain. The OpenSpec proposal carries confirmed decisions, selected skills, test seams, and tasks, then waits for your implementation request. Small fixes go straight to implementation and review. Full changes sync specs and archive after checks pass, then draft PR text; commit, push, and PR creation remain separate opt-in actions. Unresolved design questions use `openspec-explore`; this workflow does not route to `prototype`.

| Stage | Skills and tools | Role |
| --- | --- | --- |
| Clarify | `grilling`; Codex Plan mode (optional); `openspec-explore` (when unknowns remain) | Clarify scope and acceptance; reason through complex paths; investigate unresolved repository facts or feasibility. |
| Plan and propose | `find-skills`; `research` and `domain-modeling` (when triggered); `codebase-design`; `openspec-propose` | Assess candidates before the proposal; capture cited research, durable domain language, test seams, decisions, and tasks where relevant. |
| Implement | `openspec-apply-change`; `tdd` or `diagnosing-bugs` (when triggered); `writing-for-agents` (agent docs only); `codebase-design` | Execute tasks with confirmed test seams, a disciplined bug loop, or agent-document guidance as appropriate. |
| Verify and close | Checks; `code-review`; `openspec-sync-specs`; `openspec-archive-change`; `pr` | Verify behavior, review standards and spec locally, fix and recheck findings, sync/archive full changes, then draft PR text. |
| Optional Git setup | `delivery.md` (explicit request) | Initialize a local repository or add a remote only when the user asks for repository setup. |
| Optional GitHub delivery | `create-pull-request` (explicit request) | Commit/push only when requested; create a PR only when the user asks to open one. |
| Optional PR monitoring | `babysit-pr` (explicit request) | Follow CI and published review feedback on an existing PR; may push branch fixes under its safety rules. |
| Optional onboarding | `setup-matt-pocock-skills` (explicit user opt-in) | Configure the broader Matt Pocock repository conventions once; it is not required for OpenSpec. |

## Quick start

Requires **Codex, Node.js 22.20.0 or newer, npm, and Git**. The installer is designed for Windows, macOS, and Linux; CI exercises the supported systems. Use PowerShell 7 on Windows.

### Install with the skills CLI

```sh
npx skills add https://github.com/shuaibilx/AI-workflow-coding --skill ai-workflow --global --agent codex
```

Then open your project in Codex and start with:

```text
$ai-workflow Set up the missing dependencies and initialize OpenSpec in this project.
Then help me plan a CSV export feature. Ask about material requirements before proposing it.
```

This explicit setup request lets Codex run the bundled installer. The standard `skills add` command installs the main skill and its files; it does not execute dependency-installation hooks.

### Or install the workflow and its global dependencies in one command

```sh
npx --yes --package=github:shuaibilx/AI-workflow-coding ai-workflow install
```

This uses the package directly from GitHub; no separately published npm package is required. It installs the workflow plus missing global skills and OpenSpec CLI, preserving existing dependencies. It leaves project initialization for the project you explicitly select.

### Continue after reviewing a proposal

```text
$ai-workflow Apply the proposal. Include verification, code review, fixes,
spec synchronization, and archive once all completion checks pass.
```

For a small fix:

```text
$ai-workflow Fix this label typo. Keep the scope local and verify the affected screen.
```

For an interrupted task:

```text
$ai-workflow Continue the existing CSV export change from its current state.
```

## What gets installed

The installer adds AI Workflow, missing global workflow skills (`grilling`, `find-skills`, `codebase-design`, `code-review`, and `pr`), and the OpenSpec CLI. Task-specific skills and optional repository setup are handled separately:

| Item | Location / behavior |
| --- | --- |
| AI Workflow and standard skills | User `.agents/skills/`; existing legacy `.codex/skills/` dependencies are detected too |
| OpenSpec CLI | npm global; an existing CLI is preserved |
| OpenSpec project files | Initialized only in an explicitly selected project |
| Task-specific skills (`tdd`, `diagnosing-bugs`, `research`, `domain-modeling`, `writing-for-agents`, `create-pull-request`, `babysit-pr`, or a better-fit candidate) | Project `.agents/skills/`, selected for the task and installed when authorized |
| `setup-matt-pocock-skills` | Optional, user-invoked repository onboarding; not an OpenSpec prerequisite |
| Installer ownership record | User `.ai-workflow/state.json`; separate from the skills CLI's own lock |

Third-party skills are downloaded from their original repositories. Their sources and fixed Git commits are declared in [dependencies.json](skills/ai-workflow/config/dependencies.json). We do not vendor their source into this skill.

On full workflows, `pr` drafts a PR body from the final diff and verified evidence. Commit, push, and PR creation are separate opt-in actions: `create-pull-request` is used only for the operation the user requested. `babysit-pr` is reserved for monitoring an existing PR when requested. Git initialization is handled by the workflow's setup guidance, not an extra dependency. The other listed skills are selected only when their task triggers fit; the optional setup skill keeps issue tracking for backlog/triage and does not replace OpenSpec's change plan.

Existing unmanaged skills are reused and preserved, including during dependency updates. A directory's presence does not establish its provenance or compatibility. The installer records ownership only for dependencies it installs and detects edits before updating managed content.

## Check, initialize, and update

After a global installation, this path works in a POSIX shell or PowerShell:

```sh
node "$HOME/.agents/skills/ai-workflow/scripts/cli.mjs" doctor
node "$HOME/.agents/skills/ai-workflow/scripts/cli.mjs" install --dry-run
node "$HOME/.agents/skills/ai-workflow/scripts/cli.mjs" init --project "/absolute/path/to/project"
```

On Windows, provide a Windows project path such as `C:/work/my-project`. Resolve the actual skill path when using a custom Codex installation or project-scoped skills.

To update the main skill from this repository:

```sh
npx skills add https://github.com/shuaibilx/AI-workflow-coding --skill ai-workflow --global --agent codex
```

Then update the dependencies managed by this installer:

```sh
node "$HOME/.agents/skills/ai-workflow/scripts/cli.mjs" update --dry-run
node "$HOME/.agents/skills/ai-workflow/scripts/cli.mjs" update
```

Default updates use this release's declared versions/commits. Add `--latest` to explicitly resolve current upstream versions; that channel has not been compatibility-verified. No dependency updates run automatically during ordinary development.

After an OpenSpec CLI upgrade, project instruction refresh is a separate deliberate operation (`openspec update` in the selected project). The installer does not silently refresh every project.

## Small entry, focused references

```text
skills/ai-workflow/
├── SKILL.md                    Routing and essential handoffs
├── references/
│   ├── setup.md                Setup, scope, and updates
│   ├── planning.md             Discovery, design, and proposal
│   ├── skill-selection.md      Candidate review and project installation
│   ├── implementation.md       Apply and scope changes
│   ├── review.md               Checks, two-axis review, and closure
│   ├── delivery.md             Git setup and opt-in GitHub delivery
│   └── resume.md               Recover the current state
├── scripts/                    Cross-platform installer
├── config/dependencies.json    Versioned dependency sources
└── agents/openai.yaml          Codex UI metadata
```

Codex reads the relevant reference when entering that phase. The entrypoint does not load every procedure or duplicate upstream manuals.

## Boundaries worth knowing

- **Plan mode is host-controlled and optional.** The OpenSpec proposal remains the single durable plan.
- **Explore is optional** when the requirements and implementation approach are already clear.
- **Review coverage is explicit.** Uncommitted and untracked implementation needs supplemental review. Without Git or independent agents, the workflow reports the fallback it actually performed.
- **A passed review is not a passed test.** Completion requires actual evidence appropriate to the change.
- **Publication and deployment need their own instruction.** Finishing a development task does not automatically push or deploy it.

## Development and distribution

```sh
npm test
npm run check
npm run test:integration
npm pack --dry-run
```

The package has no runtime npm dependencies; it invokes fixed external tool versions when needed. Integration downloads require network access. See [publishing](docs/publishing.md) for release and Skills.sh checks.

The workflow diagram is Mermaid code embedded directly in this README and rendered by GitHub. Keep the English and Chinese diagrams aligned when editing them.

Skills.sh discovers public GitHub skills through normal `skills add` installation telemetry. Search/ranking updates are controlled by that service, and immediate indexing is not guaranteed. See the [official FAQ](https://www.skills.sh/docs/faq).

## Credits and license

Built around [OpenSpec](https://github.com/Fission-AI/OpenSpec), [Matt Pocock's skills](https://github.com/mattpocock/skills), and [Vercel's skills ecosystem](https://github.com/vercel-labs/skills). Their projects keep their own licenses and release cycles.

This project's instructions and installer are [MIT licensed](LICENSE).
