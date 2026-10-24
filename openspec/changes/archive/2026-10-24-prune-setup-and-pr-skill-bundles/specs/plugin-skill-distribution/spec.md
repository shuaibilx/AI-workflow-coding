# Spec Delta

## ADDED Requirements

### Requirement: Plugin exposes only skills used by its workflow
The Plugin SHALL distribute its main workflow and the fixed skills needed by supported workflow phases, without exposing unrelated optional convention setup or standalone helpers whose behavior is owned by the main workflow.

#### Scenario: User browses the Plugin skill catalog
- **WHEN** the Plugin package is built after this change
- **THEN** its skill catalog omits `setup-matt-pocock-skills` and the standalone `pr` body-writing skill while retaining `create-pull-request` and `babysit-pr`
