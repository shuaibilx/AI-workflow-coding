# Discover and select project skills

Use the installed `find-skills` to search and inspect candidates while planning. Prefer a short relevant set. Existing skills that already cover the need are candidates too; do not reinstall merely because a new workflow started.

## Selection criteria

For each serious candidate, inspect its actual `SKILL.md`, supporting scripts when execution matters, source, maintenance history, license, and supported versions. Evaluate:

1. Fit with the project's chosen framework, major versions, runtime, and task.
2. Useful guidance beyond what existing project rules already provide.
3. Consistency with project conventions and the other selected skills.
4. Source reputation and real usage. Install counts and stars are supporting signals, not proof of correctness or safety.
5. Installation scope, external requirements, and effects of bundled scripts.

Reject redundant or conflicting skills. A technology in the stack does not automatically require a skill. If no suitable skill exists, record the gap and use project documentation and official technical sources; do not install a weak match just to fill a checklist.

Summarize the selected names, sources, version/ref when available, purpose, and relevant conflicts in the proposal's design. Reopen a technology decision only if the new evidence materially changes its tradeoffs.

## Install after selection

Once the proposal is ready, install the selected skills during an authorized setup/implementation phase. A new dependency that changes the confirmed stack or scope returns to the decision step first. Respect actual host Plan mode restrictions.

From the code project's root, use a source-specific command such as:

```sh
npx skills add <reviewed-source> --skill <selected-name> --agent codex --yes
```

Omit `--global`: these are project dependencies. Prefer a fixed Git ref for reproducible content. Determine the real supported CLI syntax from the installed version; angle-bracket examples here are placeholders, not runnable literal commands.

Inspect existing project/global skills before installation. Do not overwrite customized or same-named content without resolving the conflict. Verify the expected project `SKILL.md` files and include applicable source/lock changes in the review. Read each installed skill before relying on it; listing a name in the plan is not activation.

If the current host does not expose a newly installed skill yet, read its actual local file explicitly. Never claim that an unavailable skill tool was invoked. Where required external access is unavailable, report the limitation and proceed only with work that does not depend on it.
