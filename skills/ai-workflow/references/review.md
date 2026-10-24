# Verification, two-axis review, and closure

## Verify the result

Run the project's relevant checks and the acceptance scenarios from the current plan. Include build/type/lint checks or runtime inspection where they materially validate the change. Read full results and exit codes. Record what was not checked and why. Do not repeatedly broaden a passing check run without a new reason.

## Review the complete intended change

Resolve and read `code-review`. Its upstream workflow separates **Standards** and **Spec**, and by default inspects a fixed Git point through committed `HEAD`. Supply the recorded starting SHA and the explicit OpenSpec spec/design paths. Local specs are the requirements source; an issue tracker is unnecessary when those sources were explicitly provided.

Before invoking the normal review, check its prerequisites and coverage:

- If committed changes exist, pass the resolved base and use the upstream review flow, including its parallel agents where available.
- If staged, unstaged, or untracked implementation exists, the upstream three-dot `HEAD` diff does not cover it. Add a review of `git diff <base> --` and relevant untracked files, comparing against the initial working-tree observations so unrelated prior work is excluded. Never create a commit merely to hide this coverage gap.
- If all implementation is uncommitted, or no Git baseline exists, the normal upstream invocation cannot establish its required diff. Explain that limitation and perform the same two axes directly over the bounded changed-file set and acceptance source. If independent reviewers are unavailable, report a single-agent fallback, not an independent review.

Keep the reports separate. Standards checks repo conventions and design/maintainability concerns; Spec checks acceptance, omissions, incorrect behavior, and unrequested additions. Report actionable findings with locations, impact, and evidence. Do not claim an issue-tracker setup or independent review happened when it did not.

Fix blocking defects, rerun the checks affected by those fixes, and re-review the changed areas. Resolve or explicitly disclose lower-priority tradeoffs. Do not accept an agent's summary without inspecting the cited files and outcomes.

## Archive only completed, verified work

For a small fix with no OpenSpec change, finish with the changed behavior, checks, review result, and limitations; there is nothing to archive.

For a full workflow, load `$ai-workflow:openspec-archive-change` only when:

1. Required artifacts and tracked tasks are complete or legitimately skipped by the schema.
2. Acceptance has been exercised, required checks pass, and review found no unresolved blocking defects.
3. Planning artifacts match the implementation and no required task is merely deferred.
4. The user's implementation authorization includes synchronization and archival of this change.

Within that already authorized scope, assess and display the spec merge, synchronize using `$ai-workflow:openspec-sync-specs` when required, verify the resulting main specs, and archive using the bundled workflow. An explicit authorization for this normal sync/archive path supplies the user's choice; do not ask it again. If the authorization was narrower, or a real conflict/incomplete state requires an exception, stop before that action and explain the precise source and available choices.

Respect CLI-returned paths and store selection. Wait for spec synchronization to finish before moving a change. Confirm the archived path exists and the selected change is no longer active. Keep failed checks or unresolved spec conflicts visible; never force archive to make the workflow appear complete.

## Delivery

Report what changed and why, checks and their results, the two review axes, any remaining limitations, and the archive/spec result when applicable. Full workflows use the standing GitHub delivery authorization in this Plugin; small fixes do not publish, deploy, push, or merge unless the user separately requests those actions.

For a full workflow, after successful verification/review and authorized OpenSpec synchronization/archive, read and use the bundled `pr` skill to draft a PR body from the final change. Follow its Summary, Evidence, and Merge Danger structure. Include actual before/after signals when available, verified after-results, merge direction, and blast radius; disclose missing baseline evidence instead of inventing it. Small fixes skip the automatic draft.

After the local review is clean, a full workflow follows the standing GitHub authorization in [delivery.md](delivery.md): commit task-only changes, push, create a PR, publish the AI review as COMMENT, monitor in the current Codex session, and enable auto-merge only under repository rules. If GitHub prerequisites are unavailable, finish local work and pause only remote delivery. Small fixes use GitHub operations only when the user explicitly asks. Do not confuse a local `code-review` report with the later posted GitHub COMMENT.
