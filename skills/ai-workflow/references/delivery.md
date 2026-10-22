# Git setup and GitHub delivery

Load this reference only when the user explicitly asks to initialize a Git repository, commit/push work, create a GitHub PR, or monitor an open PR. Completing implementation, verification, review, or OpenSpec archival does not authorize remote writes.

## Initialize a repository

Before running `git init`, confirm the requested project directory and inspect its files. If it already has a `.git` directory, reuse it. Initialize Git only when the user asked for repository setup or their request clearly requires creating a repository. Do not create a GitHub remote repository unless the user asked for one; if owner, repository name, or visibility is undecided, ask before `gh repo create`.

After initialization, check the current branch and remotes. Do not add or replace `origin` without confirming the intended remote URL. Keep OpenSpec initialization separate: `git init` does not imply `openspec init`, and vice versa.

## Commit, push, and create a PR

Use this path only after the user asks to publish changes, push a branch, or create a PR. A request to implement a feature or finish a full workflow still ends with a local review and a drafted PR body by default.

1. Confirm the required checks and local Standards/Spec review are complete. Run `git status --short --branch`, inspect the intended diff, identify the base branch and remote, and check `gh --version` plus `gh auth status`.
2. Keep unrelated pre-existing changes out of the commit. Stage only the reviewed files; never use `git add .` or `git add -A` as a shortcut. Do not commit secrets, generated artifacts, or unverified changes.
3. If the user requested a PR while on a protected/default branch, use a clearly named topic branch after checking for collisions. Do not silently switch away from a branch with unrelated work.
4. Resolve and read `create-pull-request` from the reviewed source `https://github.com/cline/cline`. It covers branch/diff analysis, pushing commits, and opening a PR with `gh`. The installed skill is conditional, not a standard dependency. Adapt shell examples and temporary-file paths to the current OS, and follow the repository's actual PR template when one exists.
5. Do not force-push or use `--force-with-lease` by default. The upstream skill mentions it after rebasing; if a non-fast-forward update requires rewriting remote history, stop and get explicit authorization for that specific rewrite.
6. Create the PR only after the requested commits are pushed and the target/base are confirmed. Preserve any repository requirement for draft PRs or required metadata. Report the commit SHA, push result, PR URL, and checks/review state.

If `gh` is missing or unauthenticated, report the exact setup needed and stop before remote writes. Do not substitute credentials, change account context, or create a remote repository without the user's request.

## Review and monitor an open PR

`code-review` is the normal pre-delivery Standards/Spec review and can analyze a branch or PR diff. It returns findings to the user; it does not approve, request changes, or post review comments to GitHub.

For a user-requested first-pass local review of a PR, use `code-review` with the PR's actual base and spec. For a formal review posted to GitHub, do not infer permission to write comments or submit an approval from a request to inspect code; confirm the requested review action and use an appropriate reviewed tool.

When the user explicitly asks to watch an already-open PR, resolve and read OpenAI Codex's `babysit-pr` from `https://github.com/openai/codex`. It monitors CI and published review feedback; the upstream skill can also rerun checks and commit/push branch-related fixes. Monitoring alone is read-only here: take those write actions only when the user explicitly authorized the corresponding fix, rerun, or push. It does not create the PR or merge it. Read its complete instructions and bundled scripts before use; verify `gh` authentication and any runtime requirements first. Never post a response to a human review comment, merge, or keep monitoring after the user asks to stop.

Treat `pr` as the PR-body formatter, `code-review` as the local Standards/Spec reviewer, `create-pull-request` as the explicit push-and-create path, and `babysit-pr` as opt-in follow-up for a PR that already exists.
