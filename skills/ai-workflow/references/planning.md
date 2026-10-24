# Discovery, design, and proposal

## Gather facts before interviewing

Read repository guidance, relevant implementation and tests, existing specs, build configuration, and project constraints. Establish whether this is a new project or a change to existing behavior. Inspect facts the environment can answer; reserve user questions for goals, tradeoffs, and acceptance decisions.

Before entering the full route, use `$ai-workflow:ai-workflow-setup` to run the Plugin setup preflight described in [setup.md](setup.md). When Git is available, create or reuse the task branch before any tracked project setup or change artifacts, following [delivery.md](delivery.md). Then treat the user's current project request as selecting that project: resolve its OpenSpec root and, if none exists, initialize it with the bundled CLI's `init --project <absolute-project-directory>`. This delegates to `openspec init --tools none`, creates OpenSpec data under the selected project, and leaves OpenSpec skill guidance to the Plugin bundle. Missing GitHub CLI/authentication pauses only the eventual remote-delivery phase; do not install those tools automatically.

Plan mode is an optional host mode, not a workflow prerequisite or a second plan document. Use it when the task is still underspecified, risky, or likely to touch several systems and an implementation path would help before the OpenSpec proposal. Skip it when the confirmed requirements and repository facts already give `openspec-propose` enough direction. Carry any useful Plan mode reasoning into the proposal; the approved OpenSpec artifacts and tasks remain the single durable implementation plan. If the host does not expose Plan mode controls, continue with ordinary planning and do not claim that the mode changed.

Respect the host's rules for writing while in Plan mode. If they prevent creating OpenSpec artifacts, leave the mode through actual host controls before running `openspec-propose`, or explain that the user needs to switch modes. Defer package installation and source changes to an authorized execution phase.

## Clarify once

Resolve and read `grilling`. Use it to explore the live decision frontier, supplying grounded recommendations. Do not ask for settled answers again. Cover only branches that affect this task:

- Who needs the result, the present problem, and measurable acceptance.
- Scope, non-goals, constraints, compatibility, and risks relevant to the change.
- Existing stack versus proposed alternatives, including operations and maintenance.
- Important user-visible interactions and failure behavior.
- How the result will be validated.

Follow the invoked skill's actual interview and shared-understanding rules. Present a concise decision summary for confirmation when discovery is complete. Existing explicit confirmation can satisfy this step; do not add another ceremonial approval.

## Investigate unknowns with explore

Use `$ai-workflow:openspec-explore` only when codebase facts, feasibility, or competing designs still need investigation. It is not a required predecessor of propose and does not establish hidden CLI session state. Reuse the grilling record as input, investigate the remaining questions, and transfer any new decisions back into the summary.

When both requirements and the implementation approach are sufficiently clear, skip explore and explain that the investigation is already complete. No new empty change or duplicate interview is needed.

## Let design and candidate skills inform the proposal

Read `codebase-design` before choosing module interfaces and seams. Respect existing architecture and repo standards; this skill's design vocabulary does not replace them. Avoid adding abstractions only to satisfy a design slogan.

Read [skill-selection.md](skill-selection.md). The Plugin already bundles fixed workflow candidates; read relevant ones now, before finalizing the design. Use `find-skills` to discover stack-specific candidates only when the selected project stack warrants them. Their recommendations can change the technology choice or implementation approach. Keep installation of any newly selected project-specific skill until the proposal is ready and implementation is authorized.

Apply the task-specific planning triggers from `skill-selection.md` before proposing:

- When external or fast-changing technical facts could change the design, use `research` before locking the proposal. Follow its background-agent, primary-source, and cited-note requirements, then point to material findings from the OpenSpec design. If host Plan mode prevents writing the note, collect sources read-only and finish the note only after moving to a write-capable phase; do not claim the research handoff is complete until the note exists.
- When domain terms or relationships need durable clarification, use `domain-modeling`. Keep the glossary to domain language and reserve ADRs for hard-to-reverse, surprising trade-offs; OpenSpec remains the plan for this change.
- When `tdd` fits, identify proposed public test seams and what each seam catches or misses. Confirm them with the user before writing tests, and carry the agreed seams into the OpenSpec design/tasks.

## Capture one authoritative plan

Resolve and read `$ai-workflow:openspec-propose` from the installed Plugin. Pass the confirmed decision summary and candidate skill selection into it. Use CLI-returned roots, schema requirements, and output paths; do not assume artifacts always live in the code repo.

For the normal spec-driven schema, transfer:

| Artifact | Information carried forward |
| --- | --- |
| proposal | Problem, intended outcome, scope and exclusions |
| delta specs | Observable behavior and concrete acceptance scenarios |
| design | Stack rationale, interfaces, tradeoffs, selected skills and checks |
| tasks | Implementable work, meaningful validation, review/fix work, and completion checks |

Use the actual schema rather than forcing these names on every project. Record the selected skills with source and reason in the existing design artifact; do not create a second long plan or an exhaustive catalog.

Keep synchronization/archive as closure follow-ups outside tracked implementation tasks, unless the schema explicitly separates their lifecycle. A tracked task to archive the change would otherwise prevent the pre-archive task-completion check from ever passing.

Present the artifacts, outstanding decisions, planned checks, and delivery scope. The default full workflow includes implementation, verification, review/fixes, spec synchronization, archive, task-only commit/push, PR creation, a COMMENT-only AI review, current-session PR monitoring, and repository-rule-compliant auto-merge when eligible. If GitHub prerequisites are unavailable, clearly state that only the local portion can proceed until they are restored.

Stop after presenting the proposal and wait for a new request to implement. If Plan mode was used, leave it after presenting the proposal through available host controls; never claim that the skill itself toggled the host mode. If no controls are available, explain that the user may need to switch modes before the next phase.
