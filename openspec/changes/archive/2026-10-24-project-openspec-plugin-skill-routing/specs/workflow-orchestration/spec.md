# Spec Delta

## MODIFIED Requirements

### Requirement: Workflow selects skills by phase and task trigger
The workflow SHALL route to bundled fixed skills at the phases where their guidance applies, invoke bundled OpenSpec skills through the Plugin namespace, and discover technology-specific skills only when the selected stack and task justify them.

#### Scenario: Full workflow has unresolved design questions
- **WHEN** requirements, feasibility, or competing designs need investigation
- **THEN** the workflow uses grilling and OpenSpec explore as needed before propose, with OpenSpec artifacts as the durable implementation plan

#### Scenario: An OpenSpec phase begins in Codex
- **WHEN** a full workflow needs an OpenSpec phase
- **THEN** the workflow invokes the matching Plugin-namespaced skill (such as `$ai-workflow:openspec-propose`) and uses the OpenSpec CLI for project and change artifacts

#### Scenario: Implementation enters code changes
- **WHEN** implementation is authorized to begin
- **THEN** the workflow reads codebase-design and invokes conditional skills such as TDD, debugging, research, domain modeling, or agent-document writing only when their triggers apply

## ADDED Requirements

### Requirement: OpenSpec initialization keeps project data local and uses bundled skills
When initializing a selected project, the workflow SHALL create OpenSpec project data in that project without generating duplicate project-local OpenSpec skill copies.

#### Scenario: Initialize a selected project
- **WHEN** the user selects and authorizes OpenSpec setup for an uninitialized project
- **THEN** the workflow runs `openspec init --tools none` from that project, creates the `openspec/` structure there, and uses the Plugin-bundled OpenSpec skills

## REMOVED Requirements

### Requirement: OpenSpec initialization preserves its default project skills
When initializing a selected project, the workflow SHALL use OpenSpec's default Codex integration and preserve generated project-local OpenSpec skills.

#### Scenario: Initialize a selected project
- **WHEN** the user authorizes OpenSpec setup for a project
- **THEN** the workflow runs `openspec init --tools codex` and leaves generated `.agents/skills/openspec-*` files in place

**Reason**: OpenSpec skills are now bundled in the Plugin, so generating project copies creates duplicate entry points and separate update paths.
**Migration**: Existing project-local copies remain untouched; use the Plugin-namespaced skill names. New project initialization uses `--tools none`.
