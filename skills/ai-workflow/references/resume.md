# Resume an interrupted workflow

Recover the existing state before choosing a phase. A request to continue is not a reason to rerun setup, interview the user again, or create a duplicate change.

1. Read current user instructions and the latest confirmed decision summary. Inspect repository guidance and the working tree.
2. If a change is already identified, query its OpenSpec status and current apply instructions, preserving the selected store. Read the returned artifacts and task state from disk. If multiple plausible changes exist, ask which one to continue; do not choose the most recent by guesswork.
3. Check which dependency files actually exist. Treat the installer's state as provenance, not proof that files or CLI executables still exist. Use `doctor` when setup itself is in question.
4. Reuse the recorded implementation baseline and distinguish existing user work from workflow edits. Do not silently replace the baseline with today's HEAD.
5. Determine the next incomplete outcome rather than replaying the last named command.

| Observed state | Next action |
| --- | --- |
| Discovery still has an unresolved decision | Continue only that branch in planning |
| Proposal presented; implementation not authorized | Remain at the proposal handoff |
| Current user explicitly asks to apply an approved proposal | Enter implementation; do not re-propose |
| Tasks incomplete | Continue apply using current instructions |
| Tasks complete but checks/review absent | Verify and review; do not archive yet |
| Fixes after review | Recheck affected behavior and findings |
| Sync conflict or failed check | Resolve the blocker within scope; keep change active |
| Already archived | Confirm delivery, or start a separately scoped follow-up if requested |

For a long-running full workflow, leave concise handoff notes alongside the existing task/progress record: confirmed decisions, selected change/root/store, starting baseline, checks actually run, unresolved findings, and next step. Avoid a second detailed plan, secrets, or speculative completion claims. For a small fix, a clear conversational handoff is sufficient unless persistence was requested.
