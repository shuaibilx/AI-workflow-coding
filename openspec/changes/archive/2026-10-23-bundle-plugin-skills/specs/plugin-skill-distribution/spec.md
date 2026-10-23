# Spec Delta

## Purpose

Make AI Workflow's fixed skill dependencies available as part of the installed Plugin so Codex can discover and invoke them through the Plugin namespace without a separate user-global skill installation.

## ADDED Requirements

### Requirement: Plugin bundles fixed workflow skills
The Plugin SHALL include the fixed dependencies grilling, find-skills, codebase-design, code-review, and pr under its discoverable `skills/` directory, together with their required supporting files and redistribution notices.

#### Scenario: Install Plugin with bundled dependencies
- **WHEN** a user installs the AI Workflow Plugin
- **THEN** Codex can discover the main workflow and all five fixed dependency skills from the Plugin package

#### Scenario: Invoke a bundled dependency explicitly
- **WHEN** a user selects a bundled dependency by its Plugin-namespaced skill name
- **THEN** Codex loads that skill from the installed Plugin without requiring a global copy

### Requirement: Plugin setup does not download bundled skills
Plugin-mode setup, installation, diagnostics, and updates SHALL use the packaged dependency skills and SHALL NOT download or update those skills in user-global skill directories.

#### Scenario: Verify a complete Plugin package
- **WHEN** the Plugin contains each declared bundled skill
- **THEN** Plugin-mode diagnostics report those skills as available from the package

#### Scenario: A declared bundled skill is missing
- **WHEN** a Plugin package lacks one of its declared bundled skills
- **THEN** Plugin-mode setup reports an incomplete package and does not substitute a downloaded global skill

### Requirement: Plugin installation has no required setup onboarding
The Plugin SHALL make the main workflow and fixed skill dependencies available without requiring users to invoke a setup skill after installation.

#### Scenario: Start a workflow immediately after installation
- **WHEN** a user invokes the main workflow after installing the Plugin
- **THEN** all fixed dependency skills are available without running a dependency installer

### Requirement: OpenSpec CLI remains an executable prerequisite
The Plugin SHALL distinguish the OpenSpec CLI executable from bundled agent skills and SHALL report when the executable is unavailable for a requested OpenSpec workflow.

#### Scenario: OpenSpec CLI is missing
- **WHEN** a user requests an OpenSpec-backed workflow and the `openspec` executable is unavailable
- **THEN** the workflow reports the missing executable and provides the optional CLI setup path
