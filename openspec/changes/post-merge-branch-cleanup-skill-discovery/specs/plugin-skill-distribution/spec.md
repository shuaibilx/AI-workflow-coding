# Spec Delta

## MODIFIED Requirements

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
