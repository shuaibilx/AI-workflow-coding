# GitHub skill adapter

Read this adapter together with the complete bundled upstream skill when performing GitHub work. It resolves differences between generic upstream instructions and this Plugin's approved workflow.

## Source skill precedence

- `create-pull-request` is the bundled Cline skill for branch/diff analysis, task commits, push, and PR creation.
- `babysit-pr` is the bundled OpenAI Codex skill for CI/review monitoring and branch-related repair.
- These are vendored snapshots. Resolve each from the Codex Plugin catalog and read sibling files relative to that skill's actual directory. Do not assume `.codex/skills/`, a repository checkout, Unix `/tmp`, or a global installation path.
- Apply this workflow's standing authorization for full-workflow delivery. Generic upstream wording that asks the user to authorize each commit/push/PR step is already satisfied for this scope. Small fixes and standalone requests still use their own stated scope.

## Host and repository adaptation

- On Windows, use PowerShell 7 (`pwsh`). Translate shell examples to PowerShell; do not invoke Windows PowerShell 5.1. Use temporary files created by `New-TemporaryFile`, write UTF-8 content, pass their literal paths to `gh`, then remove only those exact files in `finally`.
- On Windows, pass an explicit `--state-file` to every `gh_pr_watch.py` invocation; derive it from `$env:TEMP` (for example, `Join-Path $env:TEMP 'codex-babysit-pr-<repo>-pr<number>.json'`) because the upstream default uses `/tmp`.
- Inspect repository rules, default branch, PR templates, required checks, merge queue, and allowed merge method. Do not override them.
- Stage only reviewed task paths, preserve all unrelated changes, and never force-push or bypass protection.
- The workflow allows up to three retries for failures assessed as likely flaky. Fixes attributable to the current task branch may be committed and pushed after local verification.
- Post the AI review only with COMMENT state. APPROVE and REQUEST_CHANGES require the user's explicit response.
- Do not reply to human comments. Enable `gh pr merge --auto` only when repository policy allows it, without `--admin`, and continue watching until GitHub reports merged or closed.

The upstream skills are distributed unchanged. Keep local policy in this adapter and the router rather than silently editing third-party instructions; preserve each upstream license and attribution notice when refreshing them.
