# Spec Delta

## MODIFIED Requirements

### Requirement: Plugin bundles fixed workflow skills
The Plugin SHALL include every fixed skill used by its workflow, including planning, OpenSpec, conditional engineering, and GitHub delivery skills, with required supporting files and upstream license notices.

#### Scenario: Install Plugin with bundled dependencies
- **WHEN** a user installs the AI Workflow Plugin
- **THEN** Codex can discover the main workflow and all fixed workflow skills from the Plugin package

#### Scenario: Invoke a bundled dependency explicitly
- **WHEN** a user selects a bundled dependency by its Plugin-namespaced skill name
- **THEN** Codex loads that skill from the installed Plugin without requiring a global copy

### Requirement: OpenSpec CLI remains an executable prerequisite
The Plugin SHALL provide the pinned OpenSpec CLI globally before a full OpenSpec-backed workflow proceeds, while project initialization SHALL use OpenSpec's default Codex tool integration and project-local skill paths.

#### Scenario: OpenSpec CLI is missing
- **WHEN** a full workflow begins and the `openspec` executable is unavailable
- **THEN** setup installs the pinned CLI globally, verifies its active version, and proceeds only after verification succeeds

#### Scenario: Initialize OpenSpec in a project
- **WHEN** the user selects a project for OpenSpec initialization
- **THEN** the installer runs `openspec init --tools codex` and preserves the generated project-local `.agents/skills/openspec-*` files

## REMOVED Requirements

### Requirement: Plugin installation has no required setup onboarding
**Reason**: Full workflows now require a preflight that ensures the OpenSpec CLI and reports GitHub delivery readiness.
**Migration**: The Plugin exposes its setup skill during onboarding; small fixes remain available without setup.
