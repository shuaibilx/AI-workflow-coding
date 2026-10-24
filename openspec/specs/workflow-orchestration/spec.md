# Workflow Orchestration Specification

## Purpose

Coordinates Codex skills and setup checks across the AI Workflow's planning, implementation, and verification phases, with a lighter route for clear, low-risk fixes.

## Requirements

### Requirement: Full workflows prepare required dependencies
Before a full workflow, the Plugin SHALL validate its minimum Node.js runtime, bundled skills, and OpenSpec CLI; install a missing pinned OpenSpec CLI; and report GitHub readiness separately from local workflow readiness.

#### Scenario: Full workflow has all local prerequisites
- **WHEN** the bundled package and OpenSpec CLI are available
- **THEN** the workflow proceeds and reports whether GitHub delivery is ready

#### Scenario: Node.js is below the supported minimum
- **WHEN** setup runs under a Node.js version below 22.20.0
- **THEN** it reports the required version and stops before installing dependencies or mutating files

#### Scenario: OpenSpec installation fails
- **WHEN** setup cannot install or verify the pinned OpenSpec CLI
- **THEN** the workflow stops before creating OpenSpec artifacts and reports the failed prerequisite

#### Scenario: GitHub prerequisites are unavailable
- **WHEN** Git, `gh`, or GitHub authentication is unavailable
- **THEN** local planning, implementation, and review may continue, while remote delivery is paused with a recovery instruction

### Requirement: Clear small fixes may use a reduced route
For a clear, low-risk correction with no new behavior, interface, migration, or unresolved design decision, the workflow SHALL allow implementation and verification without mandatory OpenSpec setup.

#### Scenario: Small fix is requested
- **WHEN** the request meets the small-fix criteria
- **THEN** the workflow uses the focused implementation and review route without requiring OpenSpec initialization or GitHub publication

### Requirement: Workflow selects skills by phase and task trigger
The workflow SHALL route to bundled fixed skills at the phases where their guidance applies, invoke bundled OpenSpec skills through the Plugin namespace, and SHALL discover technology-specific skills only when the selected stack and task justify them.

#### Scenario: Full workflow has unresolved design questions
- **WHEN** requirements, feasibility, or competing designs need investigation
- **THEN** the workflow uses grilling and OpenSpec explore as needed before propose, with OpenSpec artifacts as the durable implementation plan

#### Scenario: An OpenSpec phase begins in Codex
- **WHEN** a full workflow needs an OpenSpec phase
- **THEN** the workflow invokes the matching Plugin-namespaced skill (such as `$ai-workflow:openspec-propose`) and uses the OpenSpec CLI for project and change artifacts

#### Scenario: Implementation enters code changes
- **WHEN** implementation is authorized to begin
- **THEN** the workflow reads codebase-design and invokes conditional skills such as TDD, debugging, research, domain modeling, or agent-document writing only when their triggers apply

### Requirement: OpenSpec initialization keeps project data local and uses bundled skills
When initializing a selected project, the workflow SHALL create OpenSpec project data in that project without generating duplicate project-local OpenSpec skill copies.

#### Scenario: Initialize a selected project
- **WHEN** the user selects and authorizes OpenSpec setup for an uninitialized project
- **THEN** the workflow runs `openspec init --tools none` from that project, creates the `openspec/` structure there, and uses the Plugin-bundled OpenSpec skills

### Requirement: Merged full-workflow PRs clean up their remote task branch
After GitHub confirms that a full-workflow PR is merged, the workflow SHALL delete that PR's remote task branch when it still points to the merged PR head. The workflow SHALL leave repository-wide branch deletion settings unchanged.

#### Scenario: Merged PR still has its task branch
- **WHEN** the full-workflow PR is merged and its same-repository remote task branch still points to the PR head SHA
- **THEN** the workflow deletes that remote task branch

#### Scenario: GitHub already deleted the remote branch
- **WHEN** the full-workflow PR is merged and the remote task branch is already absent
- **THEN** the workflow treats remote cleanup as complete without retrying deletion

#### Scenario: PR did not merge or its head moved
- **WHEN** the PR is open or closed without merge, or its task branch no longer points to the merged PR head SHA
- **THEN** the workflow preserves the remote branch and reports why cleanup was skipped

### Requirement: Merged local task branches return to an updated default branch when safe
After a full-workflow PR is merged, the workflow SHALL switch the clean local checkout to its default branch, fast-forward it from the matching remote, and remove the local task branch only when the local task head matches the merged PR head and no local changes or commits would be lost.

#### Scenario: Local checkout is safe to clean
- **WHEN** the PR is merged, the worktree is clean, the local task head matches the PR head, and the local default branch can fast-forward to its remote
- **THEN** the workflow switches to the default branch, fast-forwards it, deletes the local task branch, and reports the resulting branch

#### Scenario: Local checkout cannot be cleaned safely
- **WHEN** the worktree is dirty, the task branch has local-only commits, the default branch cannot fast-forward, or the checkout cannot safely switch
- **THEN** the workflow leaves the local checkout and task branch intact and reports the recovery state
