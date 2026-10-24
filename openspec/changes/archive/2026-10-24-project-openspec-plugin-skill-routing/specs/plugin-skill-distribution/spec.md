## MODIFIED Requirements

### Requirement: OpenSpec CLI remains an executable prerequisite
The Plugin SHALL provide the pinned OpenSpec CLI globally before a full OpenSpec-backed workflow proceeds, while project initialization SHALL create OpenSpec data in the selected project without generating duplicate project-local OpenSpec skills.

#### Scenario: OpenSpec CLI is missing
- **WHEN** a full workflow begins and the `openspec` executable is unavailable
- **THEN** setup installs the pinned CLI globally, verifies its active version, and proceeds only after verification succeeds

#### Scenario: Initialize OpenSpec in a project
- **WHEN** the user selects a project for OpenSpec initialization
- **THEN** the installer runs `openspec init --tools none`, creates the `openspec/` structure in that project, and uses the Plugin-bundled OpenSpec skills
