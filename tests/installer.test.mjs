import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, access, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execute } from '../skills/ai-workflow/scripts/lib/installer.mjs';

// External package downloads/CLI execution are replaced; all local file effects are real.
async function fixture(t, { failDownload = false, existingCli = true, activateCli = true, skillDependencies = [{ name: 'grilling', repository: 'mattpocock/skills', ref: 'a'.repeat(40) }] } = {}) {
  const root = await mkdtemp(join(tmpdir(), 'ai workflow 中文 '));
  t.after(() => rm(root, { recursive: true, force: true }));
  const home = join(root, 'user');
  const packageRoot = join(root, 'package');
  const project = join(root, 'project with spaces');
  await mkdir(join(packageRoot, 'skills', 'ai-workflow', 'references'), { recursive: true });
  await mkdir(join(packageRoot, 'config'), { recursive: true });
  await mkdir(project, { recursive: true });
  await writeFile(join(packageRoot, 'package.json'), JSON.stringify({ version: '0.1.0' }));
  await writeFile(join(packageRoot, 'skills', 'ai-workflow', 'SKILL.md'), '---\nname: ai-workflow\ndescription: fixture\n---\nworkflow\n');
  await writeFile(join(packageRoot, 'skills', 'ai-workflow', 'references', 'planning.md'), 'planning fixture');
  await writeFile(join(packageRoot, 'config', 'dependencies.json'), JSON.stringify({
    schemaVersion: 1, workflowVersion: '0.1.0',
    skillsCli: { version: '1.7.4' },
    openspec: { package: '@fission-ai/openspec', version: '1.14.3' },
    skills: skillDependencies,
  }));
  const calls = [];
  let cliAvailable = existingCli;
  const run = async (tool, args, options = {}) => {
    calls.push({ tool, args, options });
    if (tool === 'git') return { stdout: args[0] === '--version' ? 'git version 2.50.0\n' : `${'b'.repeat(40)}\tHEAD\n`, code: 0 };
    if (tool === 'npm' && args[0] === '--version') return { stdout: '10.9.0\n', code: 0 };
    if (tool === 'openspec' && args[0] === '--version') {
      if (!cliAvailable) throw new Error('openspec not found');
      return { stdout: '1.14.3\n', code: 0 };
    }
    if (tool === 'openspec' && args[0] === 'list') {
      try {
        await access(join(options.cwd, 'openspec', 'config.yaml'));
        return { stdout: JSON.stringify({ root: { path: options.cwd }, changes: [] }), code: 0 };
      } catch {
        return { stdout: JSON.stringify({ root: null, changes: [] }), code: 1 };
      }
    }
    if (tool === 'openspec' && args[0] === 'init') {
      await mkdir(join(options.cwd, 'openspec'), { recursive: true });
      await writeFile(join(options.cwd, 'openspec', 'config.yaml'), 'schema: spec-driven\n');
      return { stdout: '', code: 0 };
    }
    if (tool === 'npm' && args[0] === 'view') return { stdout: '1.15.0\n', code: 0 };
    if (tool === 'npm' && args[0] === 'install' && activateCli) cliAvailable = true;
    if (tool === 'npm' && args.includes('add')) {
      if (failDownload) throw new Error('network unavailable');
      const name = args[args.indexOf('--skill') + 1];
      const destination = join(home, '.agents', 'skills', name);
      await mkdir(destination, { recursive: true });
      await writeFile(join(destination, 'SKILL.md'), `---\nname: ${name}\ndescription: downloaded\n---\nupstream\n`);
    }
    return { stdout: '', code: 0 };
  };
  const skillRoot = join(packageRoot, 'skills', 'ai-workflow');
  await mkdir(join(skillRoot, 'config'));
  await writeFile(join(skillRoot, 'config', 'dependencies.json'), await readFile(join(packageRoot, 'config', 'dependencies.json')));
  const invoke = (options = {}) => execute({ command: 'install', home, skillRoot, ...options }, { run, log: () => {} });
  return { root, home, packageRoot, project, run, calls, invoke };
}

test('the bundled manifest installs pr and leaves conditional skills opt-in', async (t) => {
  const manifestPath = new URL('../skills/ai-workflow/config/dependencies.json', import.meta.url);
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const pr = manifest.skills.find((skill) => skill.name === 'pr');
  assert.ok(pr, 'pr must be part of the standard dependency set');
  assert.equal(pr.repository, 'mattpocock/skills');
  assert.match(pr.ref, /^[a-f0-9]{40}$/);
  for (const name of ['tdd', 'diagnosing-bugs', 'research', 'domain-modeling', 'writing-for-agents', 'setup-matt-pocock-skills']) {
    assert.equal(manifest.skills.some((skill) => skill.name === name), false, `${name} must remain conditional`);
  }

  const f = await fixture(t, { skillDependencies: manifest.skills });
  await f.invoke();
  const call = f.calls.find(({ args }) => args.includes('--skill') && args[args.indexOf('--skill') + 1] === 'pr');
  assert.ok(call, 'the installer must fetch the declared PR skill');
  assert.ok(call.args.includes('--global'));
  assert.equal(call.args[call.args.indexOf('add') + 1], `https://github.com/${pr.repository}/tree/${pr.ref}`);
});

test('dry-run shows missing dependencies without creating user files or downloading', async (t) => {
  const f = await fixture(t);
  const result = await f.invoke({ dryRun: true });
  assert.equal(result.ok, true);
  assert.equal(result.items.find((item) => item.name === 'grilling').action, 'install');
  await assert.rejects(access(f.home));
  assert.equal(f.calls.some((call) => call.args.includes('add')), false);
});

test('install copies the complete modular skill and records managed dependencies', async (t) => {
  const f = await fixture(t);
  await f.invoke();
  assert.equal(await readFile(join(f.home, '.agents', 'skills', 'ai-workflow', 'references', 'planning.md'), 'utf8'), 'planning fixture');
  const state = JSON.parse(await readFile(join(f.home, '.ai-workflow', 'state.json'), 'utf8'));
  assert.equal(state.skills.grilling.ref, 'a'.repeat(40));
  assert.equal(state.skills.grilling.managed, true);
  assert.equal(f.calls.some((call) => call.args.includes('https://github.com/mattpocock/skills/tree/' + 'a'.repeat(40))), true);
});

test('repeated install preserves existing skills and avoids downloads', async (t) => {
  const f = await fixture(t);
  await f.invoke();
  f.calls.length = 0;
  const result = await f.invoke();
  assert.equal(result.items.find((item) => item.name === 'grilling').action, 'skip');
  assert.equal(f.calls.some((call) => call.args.includes('add')), false);
});

test('plugin setup supplies its bundled workflow without making a global copy', async (t) => {
  const f = await fixture(t, { existingCli: false });
  await writeFile(join(f.packageRoot, 'plugin.json'), JSON.stringify({ name: 'ai-workflow' }));
  const before = await f.invoke({ command: 'doctor', plugin: true });
  assert.equal(before.items.find((item) => item.name === 'ai-workflow').action, 'ok');
  assert.equal(before.ok, false, 'missing external dependencies still fail doctor');
  await assert.rejects(access(f.home), 'doctor must stay read-only');
  await f.invoke({ plugin: true });
  assert.equal((await f.invoke({ command: 'doctor', plugin: true })).ok, true);
  await assert.rejects(access(join(f.home, '.agents', 'skills', 'ai-workflow')));
  const state = JSON.parse(await readFile(join(f.home, '.ai-workflow', 'state.json'), 'utf8'));
  assert.equal(state.main, undefined, 'the plugin manager owns the bundled workflow');
  f.calls.length = 0;
  await f.invoke({ plugin: true });
  assert.equal(f.calls.some(({ args }) => args.includes('add') || args[0] === 'install'), false);
});

test('plugin dependency updates preserve a customized standalone workflow and report it', async (t) => {
  const f = await fixture(t);
  await f.invoke();
  const target = join(f.home, '.agents', 'skills', 'ai-workflow', 'SKILL.md');
  await writeFile(target, 'my customized standalone workflow');
  const previous = JSON.parse(await readFile(join(f.home, '.ai-workflow', 'state.json'), 'utf8')).main;
  await writeFile(join(f.packageRoot, 'plugin.json'), JSON.stringify({ name: 'ai-workflow' }));
  const logs = [];
  await execute({ command: 'update', home: f.home, skillRoot: join(f.packageRoot, 'skills', 'ai-workflow'), plugin: true }, { run: f.run, log: (line) => logs.push(line) });
  assert.equal(await readFile(target, 'utf8'), 'my customized standalone workflow');
  assert.deepEqual(JSON.parse(await readFile(join(f.home, '.ai-workflow', 'state.json'), 'utf8')).main, previous);
  assert.ok(logs.some((line) => line.includes('standalone') && line.includes('preserved')));
});

test('plugin mode refuses to substitute an unrelated or absent package for the workflow', async (t) => {
  const f = await fixture(t);
  await assert.rejects(f.invoke({ plugin: true }), /plugin/i);
  await writeFile(join(f.packageRoot, 'plugin.json'), JSON.stringify({ name: 'unrelated' }));
  await assert.rejects(f.invoke({ plugin: true }), /plugin/i);
  await assert.rejects(access(f.home));
});

test('setup owns prerequisite checks, missing installs, and final dependency verification', async (t) => {
  const f = await fixture(t, { existingCli: false });
  await writeFile(join(f.packageRoot, 'plugin.json'), JSON.stringify({ name: 'ai-workflow' }));
  const result = await f.invoke({ command: 'setup', plugin: true });
  assert.equal(result.ok, true);
  assert.deepEqual(result.prerequisites.map(({ name }) => name), ['node', 'npm', 'git']);
  assert.deepEqual(result.changes.map(({ name }) => name), ['openspec', 'grilling']);
  assert.equal(result.items.every(({ action }) => action === 'ok'), true);
  await assert.rejects(access(join(f.home, '.agents', 'skills', 'ai-workflow')));
  await assert.rejects(access(join(f.project, 'openspec')));
  f.calls.length = 0;
  const repeat = await f.invoke({ command: 'setup', plugin: true });
  assert.deepEqual(repeat.changes, []);
  assert.equal(f.calls.some(({ args }) => args.includes('add') || args[0] === 'install'), false);
});

test('setup stops before mutation if a toolchain prerequisite is unavailable', async (t) => {
  const f = await fixture(t);
  await assert.rejects(execute({ command: 'setup', home: f.home, skillRoot: join(f.packageRoot, 'skills', 'ai-workflow') }, {
    log: () => {},
    run: async (tool, args, options) => {
      if (tool === 'git' && args[0] === '--version') throw new Error('git is unavailable');
      return f.run(tool, args, options);
    },
  }), /git is unavailable/);
  await assert.rejects(access(f.home));
  assert.equal(f.calls.some(({ args }) => args.includes('add') || args[0] === 'install'), false);
});

test('a failed setup distinguishes verified completed installs from its proposed actions', async (t) => {
  const f = await fixture(t, { existingCli: false, failDownload: true });
  await writeFile(join(f.packageRoot, 'plugin.json'), JSON.stringify({ name: 'ai-workflow' }));
  const logs = [];
  await assert.rejects(execute({ command: 'setup', home: f.home, skillRoot: join(f.packageRoot, 'skills', 'ai-workflow'), plugin: true }, {
    run: f.run, log: (line) => logs.push(line),
  }), /network unavailable/);
  assert.deepEqual(logs.filter((line) => line.startsWith('completed ')), ['completed install openspec: 1.14.3']);
  const state = JSON.parse(await readFile(join(f.home, '.ai-workflow', 'state.json'), 'utf8'));
  assert.equal(state.openspec.version, '1.14.3');
  assert.equal(state.skills.grilling, undefined);
});

test('existing user skills in the legacy Codex location are preserved even by update', async (t) => {
  const f = await fixture(t);
  const target = join(f.home, '.codex', 'skills', 'grilling');
  await mkdir(target, { recursive: true });
  await writeFile(join(target, 'SKILL.md'), 'user customized content');
  await f.invoke();
  const result = await f.invoke({ command: 'update' });
  assert.equal(result.ok, true);
  assert.equal(result.items.find((item) => item.name === 'grilling').action, 'skip');
  assert.equal(await readFile(join(target, 'SKILL.md'), 'utf8'), 'user customized content');
  assert.equal(f.calls.some((call) => call.args.includes('add')), false);
});

test('an unmanaged main skill is preserved while missing dependencies are installed', async (t) => {
  const f = await fixture(t);
  const target = join(f.home, '.agents', 'skills', 'ai-workflow');
  await mkdir(target, { recursive: true });
  await writeFile(join(target, 'SKILL.md'), 'my workflow');
  const result = await f.invoke();
  assert.equal(result.items.find((item) => item.name === 'ai-workflow').action, 'skip');
  assert.equal(await readFile(join(target, 'SKILL.md'), 'utf8'), 'my workflow');
  assert.match(await readFile(join(f.home, '.agents', 'skills', 'grilling', 'SKILL.md'), 'utf8'), /upstream/);
});

test('a download failure does not record the dependency as successfully installed', async (t) => {
  const f = await fixture(t, { failDownload: true });
  await assert.rejects(f.invoke(), /network unavailable/);
  const state = JSON.parse(await readFile(join(f.home, '.ai-workflow', 'state.json'), 'utf8'));
  assert.equal(state.skills.grilling, undefined);
});

test('installing a missing CLI makes the subsequent doctor pass', async (t) => {
  const f = await fixture(t, { existingCli: false });
  await f.invoke();
  const result = await f.invoke({ command: 'doctor' });
  assert.equal(result.ok, true);
  const state = JSON.parse(await readFile(join(f.home, '.ai-workflow', 'state.json'), 'utf8'));
  assert.equal(state.openspec.version, '1.14.3');
  assert.equal(state.openspec.managed, true);
});

test('npm success cannot mask an OpenSpec executable that is still unavailable', async (t) => {
  const f = await fixture(t, { existingCli: false, activateCli: false });
  await assert.rejects(f.invoke(), /OpenSpec.*PATH/i);
  const state = JSON.parse(await readFile(join(f.home, '.ai-workflow', 'state.json'), 'utf8'));
  assert.equal(state.openspec, undefined);
});

test('corrupt ownership state is reported rather than replacing user files', async (t) => {
  const f = await fixture(t);
  await mkdir(join(f.home, '.ai-workflow'), { recursive: true });
  await writeFile(join(f.home, '.ai-workflow', 'state.json'), '{broken');
  await assert.rejects(f.invoke(), SyntaxError);
  await assert.rejects(access(join(f.home, '.agents', 'skills', 'ai-workflow')));
});

test('doctor is read-only and fails when a required dependency is absent', async (t) => {
  const f = await fixture(t);
  const result = await f.invoke({ command: 'doctor' });
  assert.equal(result.ok, false);
  assert.equal(result.items.find((item) => item.name === 'grilling').action, 'missing');
  await assert.rejects(access(f.home));
  assert.equal(f.calls.some((call) => call.args.includes('add')), false);
});

test('a skill installed by skills add can bootstrap from its own directory', async (t) => {
  const f = await fixture(t);
  const target = join(f.home, '.agents', 'skills', 'ai-workflow');
  const { cp } = await import('node:fs/promises');
  await cp(join(f.packageRoot, 'skills', 'ai-workflow'), target, { recursive: true });
  const result = await f.invoke({ skillRoot: target });
  assert.equal(result.ok, true);
  assert.match(await readFile(join(f.home, '.agents', 'skills', 'grilling', 'SKILL.md'), 'utf8'), /upstream/);
});

test('the package installer can reuse an identical workflow installed independently', async (t) => {
  const f = await fixture(t);
  const { cp } = await import('node:fs/promises');
  await cp(join(f.packageRoot, 'skills', 'ai-workflow'), join(f.home, '.agents', 'skills', 'ai-workflow'), { recursive: true });
  const result = await f.invoke();
  assert.equal(result.ok, true);
  assert.match(await readFile(join(f.home, '.agents', 'skills', 'grilling', 'SKILL.md'), 'utf8'), /upstream/);
});

test('update refuses to overwrite local edits in a managed third-party skill', async (t) => {
  const f = await fixture(t);
  await f.invoke();
  const path = join(f.home, '.agents', 'skills', 'grilling', 'SKILL.md');
  await writeFile(path, 'my edits');
  await assert.rejects(f.invoke({ command: 'update' }), /locally modified/);
  assert.equal(await readFile(path, 'utf8'), 'my edits');
});

test('an invalid OpenSpec store declaration does not trigger init', async (t) => {
  const f = await fixture(t);
  await assert.rejects(execute({ command: 'init', project: f.project }, {
    log: () => {},
    run: async () => ({ code: 1, stdout: JSON.stringify({ root: null, error: { message: 'Declared in config.yaml: store unavailable' } }) }),
  }), /not reinitializing/);
  await assert.rejects(access(join(f.project, 'openspec')));
});

test('init requires an explicit project and initializes only that directory', async (t) => {
  const f = await fixture(t);
  await assert.rejects(f.invoke({ command: 'init' }), /project/);
  await f.invoke({ command: 'init', project: f.project });
  assert.equal(await readFile(join(f.project, 'openspec', 'config.yaml'), 'utf8'), 'schema: spec-driven\n');
  await assert.rejects(access(join(f.root, 'openspec')));
  f.calls.length = 0;
  await f.invoke({ command: 'init', project: f.project });
  assert.equal(f.calls.some((call) => call.args[0] === 'init'), false);
});

test('update defaults to declared pins and latest resolves immutable upstream revisions explicitly', async (t) => {
  const f = await fixture(t);
  await f.invoke();
  f.calls.length = 0;
  await f.invoke({ command: 'update' });
  assert.equal(f.calls.some((call) => call.args.includes('https://github.com/mattpocock/skills/tree/' + 'a'.repeat(40))), true);
  f.calls.length = 0;
  await f.invoke({ command: 'update', latest: true });
  const state = JSON.parse(await readFile(join(f.home, '.ai-workflow', 'state.json'), 'utf8'));
  assert.equal(state.skills.grilling.ref, 'b'.repeat(40));
  assert.equal(state.skills.grilling.channel, 'upstream');
});
