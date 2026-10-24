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
