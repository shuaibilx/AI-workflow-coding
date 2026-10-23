import test from 'node:test';
import assert from 'node:assert/strict';
import { access, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
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
  assert.deepEqual(compatibility.interface, portable.extensions['com.openai'].interface);
  const entry = marketplace.plugins.find(({ name }) => name === portable.name);
  assert.ok(entry, 'the plugin must be addressable from its marketplace');
  assert.equal(fileURLToPath(new URL(entry.source.path, new URL('../', import.meta.url))), repo);
  assert.equal(portable.extensions['com.openai'].onboardingSkill, undefined, 'setup is not a mandatory onboarding action');
  assert.equal(compatibility.extensions?.['com.openai']?.onboardingSkill, undefined);
  const packed = JSON.parse((await runCommand('npm', ['pack', '--dry-run', '--json'], { cwd: repo })).stdout)[0];
  const paths = new Set(packed.files.map(({ path }) => path));
  for (const path of ['plugin.json', '.codex-plugin/plugin.json', '.agents/plugins/marketplace.json',
    'THIRD_PARTY_NOTICES.md', 'licenses/MIT-mattpocock-skills.txt', 'licenses/MIT-vercel-labs-skills.txt',
    'licenses/Apache-2.0-humanlayer.txt', 'skills/ai-workflow-setup/agents/openai.yaml',
    'skills/ai-workflow/SKILL.md', 'skills/ai-workflow/scripts/cli.mjs',
    'skills/ai-workflow/config/dependencies.json', 'skills/ai-workflow/scripts/lib/installer.mjs']) {
    assert.ok(paths.has(path), `missing plugin resource in npm artifact: ${path}`);
  }
  for (const { name } of JSON.parse(await readFile(join(repo, 'skills/ai-workflow/config/dependencies.json'), 'utf8')).skills) {
    assert.ok(paths.has(`skills/${name}/SKILL.md`), `the plugin artifact must carry ${name}`);
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
  assert.deepEqual(setup.prerequisites.map(({ name }) => name), ['node']);
  assert.equal(setup.items.every(({ action }) => action === 'ok'), true);
  assert.equal(setup.items.find(({ name }) => name === 'grilling').detail.includes('bundled by plugin'), true);
  const invalid = await runCommand(process.execPath, [cli, 'setup', '--plugin', '--dry-run', '--json'], { env, cwd: root, allowFailure: true });
  assert.equal(invalid.code, 1);
  assert.equal(JSON.parse(invalid.stdout).ok, false);
  assert.match(JSON.parse(invalid.stdout).error.message, /install --dry-run/);
  await run(['install', '--plugin']);
  await run(['install', '--plugin']);
  await assert.rejects(access(join(home, '.agents', 'skills', 'ai-workflow')));
  for (const { name } of manifest.skills) {
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
