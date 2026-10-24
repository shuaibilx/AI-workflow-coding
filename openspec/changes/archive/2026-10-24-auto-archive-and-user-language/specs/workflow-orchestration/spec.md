# Spec Delta

## ADDED Requirements

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
