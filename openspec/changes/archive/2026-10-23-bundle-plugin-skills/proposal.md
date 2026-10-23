# Proposal

## Why

The Plugin currently installs its fixed workflow skill dependencies into user-global skill directories. Codex therefore discovers them as separate global skills, and users must run a setup skill before the workflow has all of its capabilities. Packaging the fixed dependencies with the Plugin makes them available through the Plugin namespace as soon as the Plugin is installed.

## What Changes

- Bundle the fixed skills `grilling`, `find-skills`, `codebase-design`, `code-review`, and `pr` under the Plugin's `skills/` directory, including required references and third-party notices.
- In Plugin mode, check bundled skills in place and never download or update them into a user's global skill directory. Keep standalone installation behavior unchanged.
- Remove the setup skill as a mandatory onboarding entry; retain the CLI's optional environment and OpenSpec CLI setup commands for users who need them.
- Keep the OpenSpec CLI as an npm-global executable prerequisite and keep OpenSpec-generated project skills project-scoped.
- Update bilingual installation, invocation, and maintenance guidance and bump the Plugin version.

## Capabilities

### New Capabilities

- `plugin-skill-distribution`: Fixed AI Workflow skill dependencies are bundled and discoverable as part of the installed Plugin.

### Modified Capabilities

None.

## Impact

Affected: Plugin skill package layout and manifests, dependency CLI behavior in Plugin mode, third-party notices, package version, and bilingual README/setup documentation. Standalone `skills add` distribution and its global dependency installation remain supported. OpenSpec CLI remains outside `skills/` because it is an executable, not an agent skill.
