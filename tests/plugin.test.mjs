import test from 'node:test';
import assert from 'node:assert/strict';
import { access, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runCommand } from '../skills/ai-workflow/scripts/lib/system.mjs';

const repo = fileURLToPath(new URL('../', import.meta.url));
const readJson = async (path) => JSON.parse(await readFile(join(repo, path), 'utf8'));

test('the npm artifact contains the marketplace, both plugin manifests, and onboarding resources', async () => {
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
  const onboarding = portable.extensions['com.openai'].onboardingSkill;
  assert.equal(compatibility.extensions['com.openai'].onboardingSkill, onboarding);
  const packed = JSON.parse((await runCommand('npm', ['pack', '--dry-run', '--json'], { cwd: repo })).stdout)[0];
  const paths = new Set(packed.files.map(({ path }) => path));
  for (const path of ['plugin.json', '.codex-plugin/plugin.json', '.agents/plugins/marketplace.json',
    onboarding.replace(/^\.\//, ''), 'skills/ai-workflow-setup/agents/openai.yaml',
    'skills/ai-workflow/SKILL.md', 'skills/ai-workflow/scripts/cli.mjs',
    'skills/ai-workflow/config/dependencies.json', 'skills/ai-workflow/scripts/lib/installer.mjs']) {
    assert.ok(paths.has(path), `missing plugin resource in npm artifact: ${path}`);
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
  const env = { ...process.env, HOME: home, USERPROFILE: home };
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
  const checked = await run(['doctor', '--plugin']);
  assert.match(checked.stdout, /ok ai-workflow: .*provided by plugin/);
  const setup = JSON.parse((await run(['setup', '--plugin', '--json'])).stdout);
  assert.equal(setup.ok, true);
  assert.deepEqual(setup.changes, []);
  assert.deepEqual(setup.prerequisites.map(({ name }) => name), ['node', 'npm', 'git']);
  assert.equal(setup.items.every(({ action }) => action === 'ok'), true);
  const invalid = await runCommand(process.execPath, [cli, 'setup', '--plugin', '--dry-run', '--json'], { env, cwd: root, allowFailure: true });
  assert.equal(invalid.code, 1);
  assert.equal(JSON.parse(invalid.stdout).ok, false);
  assert.match(JSON.parse(invalid.stdout).error.message, /install --dry-run/);
  await run(['install', '--plugin']);
  await run(['install', '--plugin']);
  await assert.rejects(access(join(home, '.agents', 'skills', 'ai-workflow')));
  await assert.rejects(access(join(home, '.ai-workflow', 'state.json')));
  await assert.rejects(access(join(root, 'openspec')));
});

test('setup failure JSON identifies only installations that actually completed', async (t) => {
  const { home, prefix, env, run } = await pluginFixture(t);
  for (const name of ['grilling', 'find-skills']) await rm(join(home, '.agents', 'skills', name), { recursive: true });
  const fakeNpm = join(prefix, 'npm-cli.js');
  await writeFile(fakeNpm, [
    "const fs = require('node:fs'); const path = require('node:path');",
    "if (process.argv.includes('--version')) { console.log('10.9.0'); process.exit(0); }",
    "const name = process.argv[process.argv.indexOf('--skill') + 1];",
    "if (name !== 'grilling') { console.error('simulated download failure'); process.exit(1); }",
    "const directory = path.join(process.env.USERPROFILE || process.env.HOME, '.agents', 'skills', name);",
    "fs.mkdirSync(directory, { recursive: true }); fs.writeFileSync(path.join(directory, 'SKILL.md'), 'downloaded skill');",
  ].join('\n'));
  env.npm_execpath = fakeNpm;
  const result = await run(['setup', '--plugin', '--json'], { allowFailure: true });
  assert.equal(result.code, 1);
  const report = JSON.parse(result.stdout);
  assert.equal(report.ok, false);
  assert.match(report.error.message, /simulated download failure/);
  const completed = report.messages.filter((line) => line.startsWith('completed '));
  assert.equal(completed.length, 1);
  assert.match(completed[0], /^completed install grilling:/);
  const state = JSON.parse(await readFile(join(home, '.ai-workflow', 'state.json'), 'utf8'));
  assert.equal(state.skills.grilling.managed, true);
  assert.equal(state.skills['find-skills'], undefined);
});
