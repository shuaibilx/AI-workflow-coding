# Plugin Skill Distribution Specification

## Purpose

Make AI Workflow's fixed skill dependencies available as part of the installed Plugin so Codex can discover and invoke them through the Plugin namespace without a separate user-global skill installation.

## Requirements

### Requirement: Plugin bundles fixed workflow skills
The Plugin SHALL package every fixed skill used by its workflow, including planning, OpenSpec, conditional engineering, and GitHub delivery skills, under the canonical root `skills/` directory with required supporting files and upstream license notices.

#### Scenario: Install Plugin with bundled dependencies
- **WHEN** a user installs the AI Workflow Plugin
- **THEN** Codex can discover the main workflow and all fixed workflow skills from the Plugin package

#### Scenario: Invoke a bundled dependency explicitly
- **WHEN** a user selects a bundled dependency by its Plugin-namespaced skill name
- **THEN** Codex loads that skill from the installed Plugin without requiring a global copy

#### Scenario: Browse the Plugin's fixed skills
- **WHEN** a user browses `/skills` with the Plugin installed and no other same-named project or global skill copies
- **THEN** Codex presents one entry for each fixed skill under the Plugin namespace

#### Scenario: Keep a single package source
- **WHEN** the Plugin package is assembled or the repository is opened as a project
- **THEN** the fixed skills are sourced from root `skills/` and no generated OpenSpec copies are stored under `.agents/skills/`

### Requirement: Plugin setup does not download bundled skills
Plugin-mode setup, installation, diagnostics, and updates SHALL use the packaged dependency skills and SHALL NOT download or update those skills in user-global skill directories.

#### Scenario: Verify a complete Plugin package
- **WHEN** the Plugin contains each declared bundled skill
- **THEN** Plugin-mode diagnostics report those skills as available from the package

#### Scenario: A declared bundled skill is missing
- **WHEN** a Plugin package lacks one of its declared bundled skills
- **THEN** Plugin-mode setup reports an incomplete package and does not substitute a downloaded global skill

### Requirement: OpenSpec CLI remains an executable prerequisite
The Plugin SHALL provide the pinned OpenSpec CLI globally before a full OpenSpec-backed workflow proceeds, while project initialization SHALL create OpenSpec data in the selected project without generating duplicate project-local OpenSpec skills.

#### Scenario: OpenSpec CLI is missing
- **WHEN** a full workflow begins and the `openspec` executable is unavailable
- **THEN** setup installs the pinned CLI globally, verifies its active version, and proceeds only after verification succeeds

#### Scenario: Initialize OpenSpec in a project
- **WHEN** the user selects a project for OpenSpec initialization
- **THEN** the installer runs `openspec init --tools none`, creates the `openspec/` structure in that project, and uses the Plugin-bundled OpenSpec skills
