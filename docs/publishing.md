# Plugin release and standalone skill distribution

The distribution source is `https://github.com/shuaibilx/AI-workflow-coding`. The Plugin identity is `ai-workflow@ai-workflow-coding` (plugin@marketplace); its display name is **AI Workflow Plugin**. Its skills are `ai-workflow` and `ai-workflow-setup`, namespaced by Codex as `ai-workflow:ai-workflow` and `ai-workflow:ai-workflow-setup`. The standalone public skill identifier remains `ai-workflow`.

## Plugin package and repository marketplace

- Root `plugin.json` is the portable manifest. `.codex-plugin/plugin.json` supplies compatibility with Codex clients that use that layout. Keep their identity, version, interface metadata, and onboarding declaration consistent; OpenAI settings are not merged across both files.
- `.agents/plugins/marketplace.json` points to the repository root. Its source paths resolve relative to the marketplace root, not the `.agents/plugins` directory.
- The manifests declare `./skills/ai-workflow-setup/SKILL.md` as onboarding. Setup invokes the sibling workflow's bundled CLI with `setup --plugin --json`; it never copies a second global workflow. The CLI owns environment checks, installation and final diagnostics; the skill interprets its result. No MCP server, lifecycle hook, or install-time script is required.
- Repository marketplace distribution is separate from official Plugin Directory submission. This release makes no official-directory listing claim.

Test from a local checkout before pushing:

```sh
codex plugin marketplace add "/absolute/path/to/AI-workflow-coding"
codex plugin add ai-workflow@ai-workflow-coding
codex plugin list --marketplace ai-workflow-coding --json
```

Use an isolated `CODEX_HOME` for installation checks instead of changing a real user's Plugin installation. Check the consuming host's skill list and onboarding metadata, not just the files on disk. Restart the client/open a new chat, then select the Plugin's Setup action or its namespaced setup skill. Verify dependency-only setup and explicitly requested project initialization separately. Test missing dependencies, no-op reruns, and coexistence with an older standalone workflow; a check-only request must stay read-only.

After pushing, test the remote path with a fresh Plugin home:

```sh
codex plugin marketplace add shuaibilx/AI-workflow-coding
codex plugin add ai-workflow@ai-workflow-coding
```

Refresh a Git source with `codex plugin marketplace upgrade ai-workflow-coding` before reinstalling a new release. Local-path sources read the checkout; update the checkout first. See the [official packaging documentation](https://developers.openai.com/plugins/build/plugins) for current host compatibility and onboarding fields.

## Before publishing a release

1. Run `npm test`, `npm run check`, and `npm pack --dry-run`. Run the skill-creator validator when available.
2. Exercise real dependency downloads in an isolated home; check pinned Git refs in the actual skills lock and rerun installation for idempotence.
3. Check the Windows/macOS/Linux CI results. Do not describe an unrun matrix as passing.
4. Keep both Plugin manifests, `package.json`, skill frontmatter, and `skills/ai-workflow/config/dependencies.json` workflow versions in sync. Keep Plugin manifests, marketplace, both skills, and sibling CLI/config files in the npm artifact.
5. Update dependency pins only after reading upstream changes and exercising the relevant workflow. Installer integration tests alone do not validate the behavior of every upstream instruction.
6. Keep English and Chinese README behavior and diagrams aligned. Validate the GitHub rendering after pushing.

The npm package is private by design: the documented all-in-one command fetches its source from GitHub. A later npm-registry release requires choosing an available package name and deliberately changing that setting; publishing to npm is not required for skills CLI installation.

CI runs real dependency setup once on Ubuntu/Node 22.20.0 in addition to package/unit checks across the matrix. A local network failure is not an integration pass; check the remote integration step before reporting release verification.

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
