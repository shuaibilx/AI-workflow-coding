# Spec Delta

## ADDED Requirements

### Requirement: PR descriptions follow repository conventions
For a full workflow, the AI Workflow SHALL draft the PR description from verified change evidence and follow the repository's PR template when one exists.

#### Scenario: Repository provides a PR template
- **WHEN** the workflow prepares a PR for a repository with a PR template
- **THEN** it fills the template using verified change details and preserves the template structure

#### Scenario: Repository has no PR template
- **WHEN** the workflow prepares a PR and no repository template exists
- **THEN** it drafts concise Summary, Evidence, and Merge Danger sections, including merge direction and blast radius
