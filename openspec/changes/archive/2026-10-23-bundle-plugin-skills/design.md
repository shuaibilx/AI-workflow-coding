# Design

## Context

See proposal.md - Why. The portable Plugin already exposes the repository `skills/` directory, while the dependency installer currently installs five fixed skills into user-global directories. The OpenSpec executable and project-generated OpenSpec skills have different lifecycles: the executable is installed with npm, and OpenSpec generates project-local skills when a project is initialized.

## Goals / Non-Goals

**Goals:**
- Let Codex discover the five fixed workflow skills from the Plugin namespace immediately after installing the Plugin.
- Keep standalone skill installation and its existing global dependency workflow intact.
- Keep OpenSpec CLI setup available as an optional prerequisite check.
- Preserve upstream files and required licenses/attribution when vendoring skills.

**Non-Goals:**
- Bundle the OpenSpec CLI executable or Node/npm runtime into the Plugin.
- Bundle project-specific OpenSpec generated skills or optional task-specific skills.
- Change the standalone `skills add` distribution channel.

## Decisions

1. Copy the pinned skill sources into `skills/<skill-name>/` in this repository. The Plugin manifest already points at this directory, so Codex can discover each skill when it installs the package. Keep each upstream skill's supporting files, metadata, and attribution; add a third-party notices document with source refs and applicable MIT/Apache-2.0 licenses.
2. In Plugin mode, dependency checks resolve paths relative to the Plugin's bundled `skills/` root. Packaged dependencies are available and are never passed to `skills add`; missing packaged files are an incomplete Plugin error. Standalone mode continues to use global discovery and installation.
3. Remove `onboardingSkill` from both manifests so installation does not direct users to run setup first. Retain `ai-workflow-setup` as an optional environment helper for the separate OpenSpec executable. The main workflow remains the normal entry point and references setup guidance only when a prerequisite is missing.
4. Keep OpenSpec CLI global and OpenSpec-generated skill files project-scoped. The CLI is an executable, not an Agent Skill, and its project-generated skills may track the project's OpenSpec version. Avoid creating duplicate plugin and project entries for the `openspec-*` skill names.
5. Bump the Plugin/package version to 0.3.0. Users receive the new bundled skills by refreshing/reinstalling the Plugin; they do not need a post-install skill dependency download.

## Risks / Trade-offs

- Bundled third-party skill content can become stale → Record repository/ref per skill and document an explicit maintainer update process; normal Plugin releases carry reviewed upstream changes.
- Installing the new Plugin alongside existing global skills may make duplicate names visible → Plugin namespace gives the bundled versions a distinct, selectable identity; existing global files remain untouched.
- The OpenSpec executable can still be absent on a new machine → Keep setup as optional and clearly surface its install command only when an OpenSpec-backed workflow needs it.
- Upstream terms vary → Include the complete applicable license texts and preserve file-level credits, especially the Apache-licensed `show-me` material credited by `pr`.

## Migration Plan

Ship version 0.3.0 with the dependency skill directories and no onboarding hook. Existing 0.2.0 installations remain unchanged until users refresh the marketplace and reinstall the Plugin. A rollback uses the prior Plugin release; no global skill copies or ownership state are removed.
