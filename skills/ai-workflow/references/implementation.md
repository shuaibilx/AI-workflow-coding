# Implementation

## Enter with the right authorization

For a full workflow, require the post-proposal implementation request. Re-read the current artifacts from disk; the user may have edited them. Continue the selected change instead of creating another one.

For a small fix, the user's fix request normally authorizes the scoped edit. State the acceptance criterion and intended check briefly, then proceed without manufacturing an OpenSpec proposal or a grilling round. If new behavior, an interface/migration decision, or substantial uncertainty emerges, stop expanding the patch and move the newly discovered scope to the full planning route.

## Prepare the implementation surface

1. Read `codebase-design`, repository standards, and the selected technology skills. Apply the design principles to the relevant interfaces, alongside the project's own conventions.
2. Check the actual Git state. When Git exists, record the starting commit SHA, branch, and pre-existing staged/unstaged/untracked work. Do not reset, commit, or include unrelated edits just to simplify review.
3. If no Git baseline exists, note that limitation and keep a bounded list of relevant files and initial observations. Do not initialize Git without a request merely to satisfy a review dependency.
4. Install the project skills selected in the plan, when authorized; use [skill-selection.md](skill-selection.md).

## Execute the selected route

For a full change, load and follow `openspec-apply-change`. Query current status and apply instructions, then read the CLI's concrete context paths. Respect blocked states, custom schemas, selected stores, and incomplete artifacts. Do not infer readiness from a single `tasks.md` or file-existence status.

Implement coherent task-sized changes, keeping progress truthful. Run checks proportional to each change; behavior changes need meaningful verification, while prose or mechanical edits may need inspection/build checks rather than implementation-shaped tests.

Where a test-first workflow is already required by the project or selected skills, follow it. Do not install a new testing methodology globally just because this workflow was invoked.

When implementation reveals a material requirement or design change, use `openspec-update-change` to reconcile planning artifacts before implementing that expansion. Minor implementation choices within the agreed behavior can be recorded without reopening every decision. Do not check off deferred work as completed.

For a small fix, apply the same relevant code and verification standards directly, using the stated acceptance criterion as the review source.

## Handoff to review

Collect the actual changed files, verification commands and outcomes, acceptance coverage, unresolved risks, and Git baseline (when available). Pass these to [review.md](review.md). Completed implementation tasks are a handoff to verification/review, not evidence of readiness to archive.
