# Spec Delta

## ADDED Requirements

### Requirement: Code review uses available project intent without a setup prerequisite
When the workflow performs a code review, it SHALL use the originating OpenSpec requirements or other task requirements supplied by the user as the Spec review source and SHALL NOT require the optional Matt Pocock repository setup.

#### Scenario: OpenSpec requirements are available
- **WHEN** a review is run for a change with OpenSpec requirements
- **THEN** the Spec review evaluates the diff against those requirements without requiring issue-tracker setup

#### Scenario: No review requirements are available
- **WHEN** a standalone review has no OpenSpec requirements or user-provided task criteria
- **THEN** the workflow reports that no Spec source is available and asks for one only if a Spec review is required
