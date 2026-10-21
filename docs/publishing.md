# Release and Skills.sh verification

The distribution source is `https://github.com/shuaibilx/AI-workflow-coding`. The public skill identifier is `ai-workflow`; keep the folder, frontmatter name, README commands, and metadata consistent.

## Before publishing a release

1. Run `npm test`, `npm run check`, and `npm pack --dry-run`. Run the skill-creator validator when available.
2. Exercise real dependency downloads in an isolated home; check pinned Git refs in the actual skills lock and rerun installation for idempotence.
3. Check the Windows/macOS/Linux CI results. Do not describe an unrun matrix as passing.
4. Keep `package.json`, skill frontmatter, and `config/dependencies.json` workflow versions in sync.
5. Update dependency pins only after reading upstream changes and exercising the relevant workflow. Installer integration tests alone do not validate the behavior of every upstream instruction.
6. Keep English and Chinese README behavior and diagrams aligned. Validate the GitHub rendering after pushing.

The npm package is private by design: the documented all-in-one command fetches its source from GitHub. A later npm-registry release requires choosing an available package name and deliberately changing that setting; publishing to npm is not required for skills CLI installation.

## Skills.sh

The [official FAQ](https://www.skills.sh/docs/faq) describes automatic discovery through normal installation telemetry. Publish a public GitHub repository containing the skill and documentation, then perform a real installation:

```sh
npx skills add https://github.com/shuaibilx/AI-workflow-coding --skill ai-workflow --global --agent codex
```

Respect the user's telemetry preferences. Do not unset their opt-out flags, impersonate installs, or generate repeated installs to inflate ranking. An installation that does not send telemetry can verify usability without establishing discovery.

Check the expected detail page and search separately:

- `https://skills.sh/shuaibilx/AI-workflow-coding/ai-workflow`
- `npx skills find ai-workflow`

The service may canonicalize repository capitalization. Inspect the actual response rather than treating a guessed URL as proof. The [customization docs](https://www.skills.sh/docs/customize) describe background processing and caching, not a guaranteed search-index SLA. Audit generation timing is not search timing.

Report publication status precisely: GitHub public, remote install verified, detail page available, search found/not yet found. If indexing is pending, say so. Do not claim a skill is searchable because a repository was pushed or the installer exited successfully.
