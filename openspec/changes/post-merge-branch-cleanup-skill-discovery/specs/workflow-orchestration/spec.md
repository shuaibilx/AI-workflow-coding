# Spec Delta

## ADDED Requirements

### Requirement: Merged full-workflow PRs clean up their remote task branch
After GitHub confirms that a full-workflow PR is merged, the workflow SHALL delete that PR's remote task branch only when it still points to the merged PR head at the point of deletion. The workflow SHALL leave repository-wide branch deletion settings unchanged.

#### Scenario: Merged PR still has its task branch
- **WHEN** the full-workflow PR is merged and its same-repository remote task branch still points to the PR head SHA
- **THEN** the workflow deletes that remote task branch

#### Scenario: GitHub already deleted the remote branch
- **WHEN** the full-workflow PR is merged and the remote task branch is already absent
- **THEN** the workflow treats remote cleanup as complete without retrying deletion

#### Scenario: PR did not merge or its head moved
- **WHEN** the PR is open or closed without merge, or its task branch no longer points to the merged PR head SHA
- **THEN** the workflow preserves the remote branch and reports why cleanup was skipped

#### Scenario: Remote task branch advances during cleanup
- **WHEN** the remote task branch advances after it was checked but before the conditional deletion is applied
- **THEN** the deletion is rejected, the workflow preserves the advanced branch, and reports that the ref moved

### Requirement: Merged local task branches return to an updated default branch when safe
After a full-workflow PR is merged, the workflow SHALL switch the clean local checkout to its default branch, fast-forward it from the matching remote, and remove the local task branch only when the local task head matches the merged PR head and no local changes or commits would be lost.

#### Scenario: Local checkout is safe to clean
- **WHEN** the PR is merged, the worktree is clean, the local task head matches the PR head, and the local default branch can fast-forward to its remote
- **THEN** the workflow switches to the default branch, fast-forwards it, deletes the local task branch, and reports the resulting branch

#### Scenario: Local checkout cannot be cleaned safely
- **WHEN** the worktree is dirty, the task branch has local-only commits, the default branch cannot fast-forward, or the checkout cannot safely switch
- **THEN** the workflow leaves the local checkout and task branch intact and reports the recovery state
