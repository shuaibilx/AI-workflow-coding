# Plugin release and standalone skill distribution

The distribution source is `https://github.com/shuaibilx/AI-workflow-coding`. The Plugin identity is `ai-workflow@ai-workflow-coding` (plugin@marketplace); its display name is **AI Workflow Plugin**. It includes two first-party skills, 17 fixed dependency skills, a CLI, and a full-workflow setup skill; Codex exposes them under `ai-workflow:`. The standalone public skill identifier remains `ai-workflow`.

## Plugin package and repository marketplace

- Root `plugin.json` is the portable manifest. `.codex-plugin/plugin.json` supplies compatibility with Codex clients that use that layout. Keep their identity, version, and interface metadata consistent; OpenAI settings are not merged across both files. Both expose `ai-workflow-setup` as the onboarding skill for full workflow preparation; small fixes are routed around setup by the main skill.
- `.agents/plugins/marketplace.json` points to the repository root. Its source paths resolve relative to the marketplace root, not the `.agents/plugins` directory.
- All 17 fixed dependency skills and two first-party skills live under `skills/` and ship in the Plugin package. Codex loads the installed package version; users can browse with `/skills` or explicitly invoke a skill as `$ai-workflow:<skill-name>`. Updating the source checkout alone does not refresh an already cached package. `ai-workflow-setup` is invoked by the workflow before a full OpenSpec change. It checks local and delivery readiness and installs only a missing pinned OpenSpec CLI through the bundled `setup --plugin --json` command. No MCP server, lifecycle hook, or install-time script is required.
- Repository marketplace distribution is separate from official Plugin Directory submission. This release makes no official-directory listing claim.

Test from a local checkout before pushing:

```sh
codex plugin marketplace add "/absolute/path/to/AI-workflow-coding"
codex plugin add ai-workflow@ai-workflow-coding
codex plugin list --marketplace ai-workflow-coding --json
```

Use an isolated `CODEX_HOME` for installation checks instead of changing a real user's Plugin installation. Check the consuming host's skill list, not just the files on disk, and verify all 19 skills (17 fixed dependencies and two first-party skills) appear under the Plugin namespace. Browse with `/skills` and test a direct `$ai-workflow:<skill-name>` invocation, then restart the client/open a new chat after updating the package. Verify setup checks OpenSpec/Git/gh/auth, installs a missing OpenSpec CLI only, separates local readiness from delivery readiness, and initializes a selected project with `openspec init --tools none` without generating project-local OpenSpec skills. Existing project-local skills from earlier initialization remain untouched. Test incomplete packages, idempotent setup, and coexistence with an older standalone workflow; `doctor` must stay read-only.

After pushing, test the remote path with a fresh Plugin home:

```sh
codex plugin marketplace add shuaibilx/AI-workflow-coding
codex plugin add ai-workflow@ai-workflow-coding
```

Refresh a Git source with `codex plugin marketplace upgrade ai-workflow-coding` before reinstalling a new release. Local-path sources read the checkout; update the checkout first. Start a new chat so Codex discovers skills from the refreshed package. See the [official packaging documentation](https://developers.openai.com/plugins/build/plugins) for current host compatibility and onboarding fields.

## Before publishing a release

1. Run `npm test`, `npm run check`, and `npm pack --dry-run`; confirm all 19 skills, notices, and license texts are in the package. Run the skill-creator validator when available.
2. Exercise standalone real dependency downloads in an isolated home; check pinned Git refs in the actual skills lock and rerun installation for idempotence. For Plugin mode, verify the skills resolve from the package with no global copies or `skills add` calls.
3. Check the Windows/macOS/Linux CI results. Do not describe an unrun matrix as passing.
4. Keep both Plugin manifests, `package.json`, skill frontmatter, and `skills/ai-workflow/config/dependencies.json` workflow versions in sync. Keep Plugin manifests, marketplace, bundled skills, notices, licenses, and CLI/config files in the npm artifact.
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
