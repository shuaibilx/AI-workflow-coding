# Discovery, design, and proposal

## Gather facts before interviewing

Read repository guidance, relevant implementation and tests, existing specs, build configuration, and project constraints. Establish whether this is a new project or a change to existing behavior. Inspect facts the environment can answer; reserve user questions for goals, tradeoffs, and acceptance decisions.

If the host provides Plan mode controls, use them when planning is requested. If unavailable, state that you are following a planning phase without asserting that the host mode changed. While planning, inspect and research; defer package installation and source changes to an authorized execution phase. OpenSpec planning artifacts are the intended planning output when the host allows writing them.

## Clarify once

Resolve and read `grilling`. Use it to explore the live decision frontier, supplying grounded recommendations. Do not ask for settled answers again. Cover only branches that affect this task:

- Who needs the result, the present problem, and measurable acceptance.
- Scope, non-goals, constraints, compatibility, and risks relevant to the change.
- Existing stack versus proposed alternatives, including operations and maintenance.
- Important user-visible interactions and failure behavior.
- How the result will be validated.

Follow the invoked skill's actual interview and shared-understanding rules. Present a concise decision summary for confirmation when discovery is complete. Existing explicit confirmation can satisfy this step; do not add another ceremonial approval.

## Investigate unknowns with explore

Use the project's generated `openspec-explore` only when codebase facts, feasibility, or competing designs still need investigation. It is not a required predecessor of propose and does not establish hidden CLI session state. Reuse the grilling record as input, investigate the remaining questions, and transfer any new decisions back into the summary.

When both requirements and the implementation approach are sufficiently clear, skip explore and explain that the investigation is already complete. No new empty change or duplicate interview is needed.

## Let design and candidate skills inform the proposal

Read `codebase-design` before choosing module interfaces and seams. Respect existing architecture and repo standards; this skill's design vocabulary does not replace them. Avoid adding abstractions only to satisfy a design slogan.

Read [skill-selection.md](skill-selection.md). Search and inspect relevant skill candidates now, before finalizing the design. Their recommendations can change the technology choice or implementation approach. Keep installation until the proposal is ready and setup/implementation is authorized.

## Capture one authoritative plan

Resolve and read the project's `openspec-propose`. Pass the confirmed decision summary and candidate skill selection into it. Use CLI-returned roots, schema requirements, and output paths; do not assume artifacts always live in the code repo.

For the normal spec-driven schema, transfer:

| Artifact | Information carried forward |
| --- | --- |
| proposal | Problem, intended outcome, scope and exclusions |
| delta specs | Observable behavior and concrete acceptance scenarios |
| design | Stack rationale, interfaces, tradeoffs, selected skills and checks |
| tasks | Implementable work, meaningful validation, review/fix work, and completion checks |

Use the actual schema rather than forcing these names on every project. Record the selected skills with source and reason in the existing design artifact; do not create a second long plan or an exhaustive catalog.

Keep synchronization/archive as closure follow-ups outside tracked implementation tasks, unless the schema explicitly separates their lifecycle. A tracked task to archive the change would otherwise prevent the pre-archive task-completion check from ever passing.

Present the artifacts, outstanding decisions, planned checks, and the delivery scope. The default full delivery includes implementation, verification, review/fixes, spec synchronization, and archive after all completion conditions pass. The user can narrow that scope.

Stop after presenting the proposal and wait for a new request to implement. Only then leave actual Plan mode through available host controls or explain that the user must switch it. Do not promise that a skill can toggle host modes itself.
