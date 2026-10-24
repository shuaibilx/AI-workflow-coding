# Git and GitHub delivery

The user's standing authorization covers automatic GitHub delivery for a completed **full workflow**: prepare a task branch, commit only task changes, push, create a PR, publish an AI review as COMMENT, monitor it in the current Codex session, fix branch-caused failures, and enable auto-merge only under repository rules. Small fixes remain local unless the user asks for GitHub actions. Read [github-adapter.md](github-adapter.md) alongside the bundled `create-pull-request` or `babysit-pr` skill when using them.

## Prepare an isolated task branch

Run this before writing tracked OpenSpec artifacts in a full workflow:

1. Check `git --version`, repository root, current branch, default branch, remotes, and full working-tree state. Use `gh repo view --json defaultBranchRef` when a GitHub remote and auth exist; otherwise inspect Git refs and remote configuration without guessing.
2. If the folder is not a Git repository, inspect its files, initialize Git on `main`, then create `codex/<change-slug>`. This is part of the user's standing full-workflow Git setup authorization. Never discard files.
3. If already on the default branch, create `codex/<change-slug>` before OpenSpec artifacts. If on a suitable task/topic branch, reuse it. Do not switch branches when that would strand or overwrite unrelated work.
4. Record the starting commit and the baseline staged, unstaged, and untracked paths. Keep task edits distinct. If edits overlap in a way that makes task-only staging unsafe, continue local implementation if possible, but stop before commit/push and explain the conflict.

If Git is unavailable, do not install it. Finish only work that can be done safely and report that branch-based delivery is blocked. If Git is present but GitHub CLI/auth is unavailable, continue local work and pause only remote operations. For missing auth, report `gh auth login`; for missing `gh`, ask the user to install GitHub CLI.

## Existing remote or new repository

Use the existing GitHub remote when one is configured. Do not replace it. If there is no GitHub remote, ask once for the intended repository name (`owner/name` or name under the authenticated owner) and visibility (`private` or `public`). After the user supplies both, create the remote with `gh repo create`, attach it as `origin`, and continue the normal delivery. Do not guess visibility or repository ownership.

## Commit, push, and open a PR

After implementation, acceptance checks, local Standards/Spec review, OpenSpec sync/archive, and PR-body drafting are complete:

1. Recheck the current branch, base/default branch, remotes, auth, and full diff. Run the applicable project checks. Ensure all changes being committed belong to this workflow.
2. Read the bundled `create-pull-request` skill in full, then apply [github-adapter.md](github-adapter.md). Follow project commit conventions and PR templates. On Windows use PowerShell 7. Use explicit task file paths with `git add`; never use `git add .` or `git add -A` as a shortcut. Never amend, rebase shared history, force-push, or include unrelated work.
3. Commit task-only changes, push the task branch, and create a PR against the repository's default branch. Use the actual final diff, verification evidence, and the `pr` skill's Summary/Evidence/Merge Danger structure for the body. A PR creation failure must leave the local commit and report recovery state accurately.
4. Once the PR exists, run the bundled local `code-review` against the PR diff and relevant OpenSpec requirements if not already done on the final commit. Publish the result with `gh pr review <PR> --comment --body-file <file>` (or equivalent PowerShell-safe input). The automated review state is always COMMENT. Ask the user before running `--approve` or `--request-changes`; do not use either automatically.
5. Never bypass branch protection, required checks, approval rules, merge queues, or repository merge method. Start `babysit-pr` immediately after creation. During monitoring, enable `gh pr merge --auto` with the repository's allowed merge method only after all required checks and approvals are satisfied and the PR is mergeable; never pass `--admin`.
6. Keep monitoring in the current Codex session until the PR is merged or closed. If the session is interrupted, report the last known state and resume from that PR in a later session when asked or when the workflow resumes.

## Monitor and repair

Read the complete bundled `babysit-pr` skill, scripts, and referenced heuristics. Monitor checks, published feedback, mergeability, and terminal state. Retry likely flaky checks no more than three times. Fix and push issues attributable to this branch after verifying them locally. Never reply to or resolve human-authored review threads automatically; leave them unresolved and report the pushed fix, because resolving may post a comment. Do not approve, request changes, or merge manually. Enable repository auto-merge only after all required checks and approvals pass and the PR is mergeable. Stop and request user input when feedback is ambiguous, requires a product decision, affects unrelated code, or needs an approval-state action.

## Clean up the merged task branch

Run branch cleanup only after `babysit-pr` reports that this full-workflow PR is merged. A closed PR that did not merge keeps its branches. Read the PR's base repository, head repository, head branch, and head SHA. Continue only when the head belongs to the same repository used by this workflow and is not its default branch.

For the remote task branch, check the exact `origin` ref. If it is already absent, remote cleanup is complete. If it still points to the PR head SHA, delete that one branch with `git push origin --delete <head-branch>`. If it points elsewhere, preserve it and report that it moved after the PR head. Never change the repository-wide `delete_branch_on_merge` setting.

For the local checkout, continue only when the current branch is the PR task branch or the repository's default branch, the worktree is clean, the local task ref still equals the merged PR head SHA, and no other worktree has that task or default branch checked out. Fetch `origin` and verify the local default branch is an ancestor of `origin/<default-branch>`; otherwise preserve the checkout and report the blocking condition. Switch to the default branch if needed, fast-forward it with `git merge --ff-only origin/<default-branch>`, then remove the verified task ref with `git branch -D <head-branch>`. A squash or rebase merge may leave the PR commits outside the default branch's ancestry, so use `-D` only after the merged PR state, exact head SHA, clean worktree, and branch-availability checks all pass. If switching, fast-forwarding, or deletion fails, leave the remaining local state intact and report it.

Report the task branch, commit, push, PR URL, posted COMMENT review, checks, auto-merge status, and whether monitoring reached merged/closed. Do not claim merge if the session ended while the PR remains open.
