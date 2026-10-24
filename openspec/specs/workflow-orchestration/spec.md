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

### Requirement: Code review uses available project intent without setup
When the workflow performs a code review, it SHALL use the originating OpenSpec requirements or other task requirements supplied by the user as the Spec review source and SHALL NOT require optional repository-convention setup.

#### Scenario: OpenSpec requirements are available
- **WHEN** a review is run for a change with OpenSpec requirements
- **THEN** the Spec review evaluates the diff against those requirements without requiring issue-tracker setup

#### Scenario: No review requirements are available
- **WHEN** a standalone review has no OpenSpec requirements or user-provided task criteria
- **THEN** the workflow reports that no Spec source is available and asks for one only if a Spec review is required

### Requirement: OpenSpec initialization keeps project data local and uses bundled skills
When initializing a selected project, the workflow SHALL create OpenSpec project data in that project without generating duplicate project-local OpenSpec skill copies.

#### Scenario: Initialize a selected project
- **WHEN** the user selects and authorizes OpenSpec setup for an uninitialized project
- **THEN** the workflow runs `openspec init --tools none` from that project, creates the `openspec/` structure there, and uses the Plugin-bundled OpenSpec skills

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
After a full-workflow PR is merged, the workflow SHALL switch the clean local checkout to its default branch, fast-forward it from the matching remote, and remove the local task branch only when it still matches the merged PR head at the point of deletion and no local changes or commits would be lost.

#### Scenario: Local checkout is safe to clean
- **WHEN** the PR is merged, the worktree is clean, the local task head matches the PR head, and the local default branch can fast-forward to its remote
- **THEN** the workflow switches to the default branch, fast-forwards it, deletes the local task branch, and reports the resulting branch

#### Scenario: Local checkout cannot be cleaned safely
- **WHEN** the worktree is dirty, the task branch has local-only commits, the default branch cannot fast-forward, or the checkout cannot safely switch
- **THEN** the workflow leaves the local checkout and task branch intact and reports the recovery state

#### Scenario: Local task branch advances during cleanup
- **WHEN** the local task branch advances after it was checked but before the conditional deletion is applied
- **THEN** the deletion is rejected, the workflow preserves the advanced branch, and reports that the local ref moved

### Requirement: Apply completion enters verified OpenSpec closure
When all tracked apply tasks are complete, the workflow SHALL run verification and local review, synchronize applicable delta specs, and archive the change only after each required stage succeeds.

#### Scenario: Verification and review pass
- **WHEN** all tracked tasks are complete and project checks and local Standards/Spec review pass
- **THEN** the workflow synchronizes applicable delta specs, verifies the sync, archives the change, and reports the archive result without another confirmation

#### Scenario: Verification, review, or synchronization is blocked
- **WHEN** a required check fails, review has unresolved actionable findings, or delta spec synchronization cannot be verified
- **THEN** the workflow leaves the change active, reports the blocker, and does not archive

#### Scenario: User interrupts before closure
- **WHEN** the user interrupts or asks to stop before archive completes
- **THEN** the workflow stops without archiving and reports the current change state

### Requirement: OpenSpec artifacts follow the current user language
When the workflow creates OpenSpec change artifacts, it SHALL use the language of the user's current request unless the user explicitly requests another language, while preserving schema-required structure and technical identifiers.

#### Scenario: User describes a change in Chinese
- **WHEN** the user asks in Chinese for a new OpenSpec change
- **THEN** proposal, delta specs, design, and tasks use Simplified Chinese while required headings, keywords, code identifiers, and CLI commands retain their required or original forms

#### Scenario: User describes a change in English
- **WHEN** the user asks in English for a new OpenSpec change
- **THEN** proposal, delta specs, design, and tasks use English while required structure and identifiers remain valid

#### Scenario: User explicitly requests another artifact language
- **WHEN** the user names a language for OpenSpec artifacts
- **THEN** the workflow uses that language regardless of the language used in the rest of the request

### Requirement: OpenSpec initialization records adaptive artifact-language guidance
When the AI Workflow CLI prepares a project with a resolvable OpenSpec root and no project context, it SHALL add a context rule that follows the user's current request language and preserve all existing project configuration.

#### Scenario: New project is initialized
- **WHEN** AI Workflow initializes the explicitly selected project
- **THEN** OpenSpec data is created in that project with a context rule for the user's current request language and no project-local OpenSpec skill copies

#### Scenario: Existing project has no context
- **WHEN** the selected project already has a resolvable OpenSpec root but no top-level context field
- **THEN** the CLI adds the adaptive language context without replacing other configuration fields

#### Scenario: Existing project has custom context
- **WHEN** the selected project already has a top-level context field
- **THEN** the CLI preserves the entire existing configuration and the workflow follows the current request language unless the preserved context explicitly sets another language

#### Scenario: OpenSpec root cannot be resolved
- **WHEN** the project has an invalid store declaration or an unresolved existing root
- **THEN** the CLI reports the error and makes no configuration changes

#### Scenario: OpenSpec resolves to an external store
- **WHEN** the selected project resolves to an OpenSpec root in a registered external store
- **THEN** the CLI skips configuration changes and reports that the root is outside the selected project
