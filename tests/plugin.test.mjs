import test from 'node:test';
import assert from 'node:assert/strict';
import { access, mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runCommand } from '../skills/ai-workflow/scripts/lib/system.mjs';

const repo = fileURLToPath(new URL('../', import.meta.url));
const readJson = async (path) => JSON.parse(await readFile(join(repo, path), 'utf8'));

test('the npm artifact contains manifests, the main skill, bundled skills, and third-party notices', async () => {
  const portable = await readJson('plugin.json');
  const compatibility = await readJson('.codex-plugin/plugin.json');
  const marketplace = await readJson('.agents/plugins/marketplace.json');
  const pkg = await readJson('package.json');
  assert.equal(compatibility.name, portable.name);
  assert.equal(compatibility.version, portable.version);
  assert.equal(portable.version, pkg.version);
  assert.equal(pkg.version, '0.5.1');
  assert.deepEqual(compatibility.interface, portable.extensions['com.openai'].interface);
  const entry = marketplace.plugins.find(({ name }) => name === portable.name);
  assert.ok(entry, 'the plugin must be addressable from its marketplace');
  assert.equal(fileURLToPath(new URL(entry.source.path, new URL('../', import.meta.url))), repo);
  assert.equal(portable.extensions['com.openai'].onboardingSkill, 'ai-workflow-setup');
  assert.equal(compatibility.extensions['com.openai'].onboardingSkill, 'ai-workflow-setup');
  const readme = await readFile(join(repo, 'README.md'), 'utf8');
  const readmeZh = await readFile(join(repo, 'README.zh-CN.md'), 'utf8');
  assert.ok(readme.includes('/skills'), 'English README must explain how to browse installed skills');
  assert.ok(readme.includes('$ai-workflow:<skill-name>'), 'English README must explain direct skill invocation');
  assert.ok(readme.includes('all 21 skills bundled'), 'English README must distinguish autocomplete from the full catalog');
  assert.ok(readmeZh.includes('/skills'), 'Chinese README must explain how to browse installed skills');
  assert.ok(readmeZh.includes('$ai-workflow:<skill-name>'), 'Chinese README must explain direct skill invocation');
  assert.ok(readmeZh.includes('全部 21 个技能'), 'Chinese README must distinguish autocomplete from the full catalog');
  assert.match(readme, /autocomplete is filtered/i);
  assert.match(readmeZh, /自动补全会按匹配项筛选/);
  const packed = JSON.parse((await runCommand('npm', ['pack', '--dry-run', '--json'], { cwd: repo })).stdout)[0];
  const paths = new Set(packed.files.map(({ path }) => path));
  assert.equal([...paths].some((path) => path.startsWith('.agents/skills/openspec-')), false,
    'generated project-local OpenSpec copies must not be included in the Plugin artifact');
  for (const path of ['plugin.json', '.codex-plugin/plugin.json', '.agents/plugins/marketplace.json',
    'THIRD_PARTY_NOTICES.md', 'licenses/MIT-mattpocock-skills.txt', 'licenses/MIT-vercel-labs-skills.txt',
    'licenses/Apache-2.0-humanlayer.txt', 'licenses/Apache-2.0-cline.txt', 'licenses/Apache-2.0-openai-codex.txt',
    'licenses/MIT-fission-ai-openspec.txt', 'skills/ai-workflow-setup/agents/openai.yaml',
    'skills/ai-workflow/SKILL.md', 'skills/ai-workflow/scripts/cli.mjs',
    'skills/ai-workflow/config/dependencies.json', 'skills/ai-workflow/scripts/lib/installer.mjs']) {
    assert.ok(paths.has(path), `missing plugin resource in npm artifact: ${path}`);
  }
  const manifest = JSON.parse(await readFile(join(repo, 'skills/ai-workflow/config/dependencies.json'), 'utf8'));
  assert.equal(manifest.workflowVersion, pkg.version);
  for (const path of ['skills/ai-workflow/SKILL.md', 'skills/ai-workflow-setup/SKILL.md']) {
    assert.match(await readFile(join(repo, path), 'utf8'), new RegExp(`version: "${pkg.version}"`));
  }
  const bundledNames = manifest.pluginSkills.map(({ name }) => name);
  assert.deepEqual(bundledNames, [
    'grilling', 'find-skills', 'codebase-design', 'code-review', 'pr',
    'openspec-explore', 'openspec-propose', 'openspec-apply-change', 'openspec-archive-change', 'openspec-sync-specs', 'openspec-update-change',
    'tdd', 'diagnosing-bugs', 'research', 'domain-modeling', 'writing-for-agents', 'setup-matt-pocock-skills',
    'create-pull-request', 'babysit-pr',
  ]);
  for (const { name } of manifest.pluginSkills) {
    const bundledPath = `skills/${name}/SKILL.md`;
    assert.ok(paths.has(bundledPath), `the plugin artifact must carry ${name}`);
    const skill = await readFile(join(repo, bundledPath), 'utf8');
    assert.match(skill, new RegExp(`^---\\nname: ${name}\\n`), `${name} must have matching skill metadata`);
    assert.ok(manifest.pluginSkills.find((entry) => entry.name === name).source.startsWith('https://github.com/'));
    assert.ok(manifest.pluginSkills.find((entry) => entry.name === name).revision);
    assert.ok(manifest.pluginSkills.find((entry) => entry.name === name).license);

    async function list(directory) {
      const entries = await readdir(directory, { withFileTypes: true });
      return (await Promise.all(entries.map(async (entry) => {
        const path = join(directory, entry.name);
        return entry.isDirectory() ? list(path) : [path];
      }))).flat();
    }
    for (const markdownPath of (await list(join(repo, 'skills', name))).filter((path) => path.endsWith('.md'))) {
      const content = await readFile(markdownPath, 'utf8');
      for (const [, rawTarget] of content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
        const target = rawTarget.trim().replace(/^<|>$/g, '').split('#')[0].split('?')[0];
        if (!target || /^(?:https?:|mailto:|[a-z]+:\/\/)/i.test(target) || target.startsWith('/')) continue;
        if (/^(?:\.\/)?src\//.test(target)) continue; // Example project paths are not skill support files.
        let decoded;
        try { decoded = decodeURIComponent(target); } catch { decoded = target; }
        assert.ok(await access(join(markdownPath, '..', decoded)).then(() => true, () => false),
          `broken local skill link in ${markdownPath}: ${rawTarget}`);
      }
    }
  }
});

async function pluginFixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'workflow plugin 中文 '));
  t.after(() => rm(root, { recursive: true, force: true }));
  const home = join(root, 'user');
  const prefix = join(root, 'npm');
  const manifest = await readJson('skills/ai-workflow/config/dependencies.json');
  for (const { name } of manifest.skills) {
    const directory = join(home, '.agents', 'skills', name);
    await mkdir(directory, { recursive: true });
    await writeFile(join(directory, 'SKILL.md'), `---\nname: ${name}\ndescription: existing dependency\n---\n`);
  }
  const openspec = join(prefix, 'node_modules', '@fission-ai', 'openspec', 'bin');
  await mkdir(openspec, { recursive: true });
  await writeFile(join(openspec, 'openspec.js'), 'process.stdout.write("1.14.3\\n");');
  const blockedNpm = join(prefix, 'blocked-npm-cli.js');
  await writeFile(blockedNpm, 'process.stderr.write("unexpected npm invocation in bundled Plugin test\\n"); process.exit(97);');
  const env = { ...process.env, HOME: home, USERPROFILE: home };
  env.npm_config_prefix = prefix;
  env.npm_execpath = blockedNpm;
  const originalPath = env.PATH || env.Path || '';
  delete env.PATH;
  delete env.Path;
  env[process.platform === 'win32' ? 'Path' : 'PATH'] = [prefix, originalPath].join(delimiter);
  const cli = join(repo, 'skills', 'ai-workflow', 'scripts', 'cli.mjs');
  const run = (args, options = {}) => runCommand(process.execPath, [cli, ...args], { env, cwd: root, ...options });
  return { root, home, prefix, env, cli, run };
}

test('the bundled CLI checks and reuses plugin dependencies without creating standalone user files', async (t) => {
  const { root, home, env, cli, run } = await pluginFixture(t);
  const manifest = await readJson('skills/ai-workflow/config/dependencies.json');
  const checked = await run(['doctor', '--plugin']);
  assert.match(checked.stdout, /ok ai-workflow: .*provided by plugin/);
  const setup = JSON.parse((await run(['setup', '--plugin', '--json'])).stdout);
  assert.equal(setup.ok, true);
  assert.deepEqual(setup.changes, []);
  assert.deepEqual(setup.prerequisites.map(({ name }) => name), ['node', 'git', 'gh', 'gh-auth']);
  assert.equal(setup.items.every(({ action }) => action === 'ok'), true);
  assert.equal(setup.items.find(({ name }) => name === 'grilling').detail.includes('bundled by plugin'), true);
  const invalid = await runCommand(process.execPath, [cli, 'setup', '--plugin', '--dry-run', '--json'], { env, cwd: root, allowFailure: true });
  assert.equal(invalid.code, 1);
  assert.equal(JSON.parse(invalid.stdout).ok, false);
  assert.match(JSON.parse(invalid.stdout).error.message, /install --dry-run/);
  await run(['install', '--plugin']);
  await run(['install', '--plugin']);
  await assert.rejects(access(join(home, '.agents', 'skills', 'ai-workflow')));
  for (const { name } of manifest.pluginSkills) {
    const bundled = await readFile(join(repo, 'skills', name, 'SKILL.md'), 'utf8');
    assert.match(bundled, /^---/);
    assert.equal((await run(['doctor', '--plugin'])).code, 0);
  }
  if (setup.changes.length === 0) await assert.rejects(access(join(home, '.ai-workflow', 'state.json')));
  await assert.rejects(access(join(root, 'openspec')));
});

test('plugin setup preserves pre-existing global skills and does not call the skills installer', async (t) => {
  const { home, run } = await pluginFixture(t);
  const before = await readFile(join(home, '.agents', 'skills', 'grilling', 'SKILL.md'), 'utf8');
  await run(['setup', '--plugin', '--json']);
  assert.equal(await readFile(join(home, '.agents', 'skills', 'grilling', 'SKILL.md'), 'utf8'), before);
  assert.equal(await readFile(join(home, '.agents', 'skills', 'find-skills', 'SKILL.md'), 'utf8')
    .then((value) => value.includes('existing dependency')), true);
});
