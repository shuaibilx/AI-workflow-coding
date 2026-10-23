# GitHub Delivery Specification

## Purpose

Automates safe GitHub delivery for a completed AI Workflow change, from a task-scoped branch through PR review and monitoring, while preserving repository protections and user approval boundaries.

## Requirements

### Requirement: Full workflow publishes an isolated task branch
After local verification and review, a full workflow SHALL commit only task changes, push a topic branch, and create a PR to the repository's default branch when GitHub delivery is ready.

#### Scenario: Start from the default branch
- **WHEN** a full workflow is authorized on the default branch
- **THEN** it creates a `codex/<change-slug>` branch before writing OpenSpec artifacts or implementation changes

#### Scenario: Existing topic branch is active
- **WHEN** a full workflow is already on a suitable topic branch
- **THEN** it reuses that branch and stages only reviewed task changes

#### Scenario: Existing changes cannot be isolated safely
- **WHEN** pre-existing work cannot be separated from the requested change
- **THEN** the workflow completes local work but pauses before commit or remote publication

### Requirement: GitHub readiness gates remote writes
The workflow SHALL require an authenticated GitHub CLI for remote delivery and SHALL use an existing remote when available.

#### Scenario: No GitHub remote exists
- **WHEN** the repository has no GitHub remote
- **THEN** the workflow asks for repository name and visibility before creating a remote repository

#### Scenario: GitHub CLI is unavailable or unauthenticated
- **WHEN** local implementation is complete but remote delivery prerequisites are missing
- **THEN** the workflow reports the exact recovery command and leaves the completed work local

### Requirement: AI review publication requires explicit review-state boundaries
The workflow SHALL publish its PR review as a non-approval COMMENT and SHALL ask the user before submitting APPROVE or REQUEST_CHANGES.

#### Scenario: Publish AI review
- **WHEN** a PR exists and the local review is ready to publish
- **THEN** the workflow posts actionable findings as a COMMENT review without changing the approval state

#### Scenario: A formal review state is requested
- **WHEN** the workflow would submit APPROVE or REQUEST_CHANGES
- **THEN** it waits for the user's explicit authorization for that review state

### Requirement: PR monitoring follows repository merge rules
After creating a PR, the workflow SHALL monitor it until merged or closed, may retry likely flaky checks up to three times and fix branch-caused issues, and SHALL enable auto-merge only under the repository's required checks, approvals, and merge method.

#### Scenario: CI reports a branch-caused failure
- **WHEN** failed checks are attributable to the current branch
- **THEN** the workflow fixes the issue, verifies it, pushes the fix, and resumes monitoring

#### Scenario: CI reports a likely flaky failure
- **WHEN** the watcher classifies a failed check as likely flaky
- **THEN** it may retry the failed checks no more than three times

#### Scenario: Required checks and approvals pass
- **WHEN** GitHub reports all required checks and approvals satisfied and the PR is mergeable
- **THEN** the workflow enables merge using the repository's permitted merge method and continues monitoring until terminal state

#### Scenario: Monitoring session is interrupted
- **WHEN** the active Codex session ends before the PR is merged or closed
- **THEN** the workflow reports the PR state and can resume monitoring from that PR in a later session
