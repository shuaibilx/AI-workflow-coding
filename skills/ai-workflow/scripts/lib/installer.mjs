import { access, cp, lstat, mkdir, readFile, readdir, realpath, rename, rm, writeFile } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runCommand } from './system.mjs';

const bundledSkillRoot = fileURLToPath(new URL('../../', import.meta.url));
const exists = async (path) => { try { await access(path); return true; } catch (error) { if (error.code === 'ENOENT') return false; throw error; } };
const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));

async function digestTree(root) {
  const hash = createHash('sha256');
  async function visit(directory, prefix = '') {
    for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
      const path = join(directory, entry.name);
      const relative = `${prefix}${entry.name}`;
      if (entry.isSymbolicLink()) throw new Error(`Refusing a symlink inside a managed skill: ${path}`);
      if (entry.isDirectory()) await visit(path, `${relative}/`);
      else if (entry.isFile()) hash.update(relative).update('\0').update(await readFile(path)).update('\0');
    }
  }
  await visit(root);
  return hash.digest('hex');
}

async function saveState(path, state) {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.${randomUUID()}.tmp`;
  await writeFile(temporary, `${JSON.stringify(state, null, 2)}\n`, { flag: 'wx' });
  await rename(temporary, path);
}

async function installMain(source, target) {
  await mkdir(dirname(target), { recursive: true });
  const staging = `${target}.stage-${randomUUID()}`;
  const backup = `${target}.backup-${randomUUID()}`;
  let moved = false;
  try {
    await cp(source, staging, { recursive: true, errorOnExist: true, force: false });
    if (await exists(target)) { await rename(target, backup); moved = true; }
    try { await rename(staging, target); }
    catch (error) { if (moved) await rename(backup, target); throw error; }
    if (moved) await rm(backup, { recursive: true });
  } finally {
    await rm(staging, { recursive: true, force: true });
  }
}

async function locateSkill(home, name) {
  for (const base of ['.agents', '.codex']) {
    const path = join(home, base, 'skills', name);
    if (await exists(join(path, 'SKILL.md'))) return path;
    if (await exists(path)) throw new Error(`Incomplete skill directory: ${path}. Inspect it before installing.`);
  }
  return null;
}

function validateManifest(manifest) {
  const semver = /^\d+\.\d+\.\d+(?:-[\w.-]+)?$/;
  if (manifest.schemaVersion !== 1 || !semver.test(manifest.skillsCli?.version)
      || !/^\d+\.\d+\.\d+$/.test(manifest.runtime?.minimumNodeVersion)
      || manifest.openspec?.package !== '@fission-ai/openspec' || !semver.test(manifest.openspec.version)
      || !Array.isArray(manifest.skills) || !Array.isArray(manifest.pluginSkills)) throw new Error('Invalid dependency manifest');
  const names = new Set(['ai-workflow']);
  for (const skill of manifest.skills) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(skill.name) || names.has(skill.name)
        || !/^[\w.-]+\/[\w.-]+$/.test(skill.repository) || !/^[a-f0-9]{40}$/.test(skill.ref)) throw new Error('Invalid skill dependency');
    names.add(skill.name);
  }
  const pluginNames = new Set(['ai-workflow', 'ai-workflow-setup']);
  for (const skill of manifest.pluginSkills) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(skill.name) || pluginNames.has(skill.name)
        || typeof skill.source !== 'string' || !/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/.test(skill.source)
        || typeof skill.revision !== 'string' || skill.revision.trim().length < 7
        || typeof skill.license !== 'string' || !skill.license.trim()) throw new Error('Invalid bundled Plugin skill dependency');
    pluginNames.add(skill.name);
  }
}

function checkRuntimePrerequisite(version, minimumVersion) {
  const parse = (value) => {
    const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(value || '');
    return match ? match.slice(1).map(Number) : null;
  };
  const actual = parse(version);
  const minimum = parse(minimumVersion);
  const available = Boolean(actual && minimum && (actual[0] > minimum[0]
    || (actual[0] === minimum[0] && (actual[1] > minimum[1]
      || (actual[1] === minimum[1] && actual[2] >= minimum[2])))));
  return {
    name: 'node',
    available,
    version,
    minimumVersion,
    ...(!available ? { detail: `Node.js >=${minimumVersion} is required (found ${version || 'unknown'})` } : {}),
  };
}

function assertPluginSkillsComplete(items) {
  const missing = items.filter(({ name, action }) => !['ai-workflow', 'openspec'].includes(name) && action === 'missing');
  if (missing.length) throw new Error(`Plugin package is incomplete; missing bundled skills: ${missing.map(({ name }) => name).join(', ')}. Refresh or reinstall the Plugin.`);
}

async function verifyPlugin(skillRoot) {
  const root = resolve(skillRoot, '../..');
  const portable = join(root, 'plugin.json');
  const path = await exists(portable) ? portable : join(root, '.codex-plugin', 'plugin.json');
  if (!await exists(path) || (await readJson(path)).name !== 'ai-workflow'
      || resolve(skillRoot) !== join(root, 'skills', 'ai-workflow')
      || !await exists(join(skillRoot, 'SKILL.md'))
      || !await exists(join(root, 'skills', 'ai-workflow-setup', 'SKILL.md'))) {
    throw new Error('--plugin requires the bundled skills/ai-workflow directory in an AI Workflow Plugin package.');
  }
}

async function checkDeliveryPrerequisites(run, log) {
  const checkVersion = async (tool, name) => {
    try {
      const result = await run(tool, ['--version'], { allowFailure: true });
      const available = result.code === 0;
      const version = result.stdout.trim().split(/\r?\n/)[0] || '';
      log(`${available ? 'ok' : 'missing'} delivery prerequisite ${name}${version ? `: ${version}` : ''}`);
      return { name, available, ...(version ? { version } : {}) };
    } catch (error) {
      log(`missing delivery prerequisite ${name}: ${error.message}`);
      return { name, available: false, detail: error.message };
    }
  };
  const git = await checkVersion('git', 'git');
  const gh = await checkVersion('gh', 'gh');
  let auth;
  if (!gh.available) {
    auth = { name: 'gh-auth', available: false, detail: 'GitHub CLI is unavailable' };
  } else {
    try {
      const result = await run('gh', ['auth', 'status'], { allowFailure: true });
      auth = { name: 'gh-auth', available: result.code === 0,
        ...(result.code === 0 ? {} : { detail: result.stderr.trim() || 'gh auth status did not succeed' }) };
    } catch (error) {
      auth = { name: 'gh-auth', available: false, detail: error.message };
    }
  }
  log(`${auth.available ? 'ok' : 'missing'} delivery prerequisite gh-auth${auth.detail ? `: ${auth.detail}` : ''}`);
  const prerequisites = [git, gh, auth];
  return { deliveryReady: prerequisites.every(({ available }) => available), deliveryPrerequisites: prerequisites };
}

async function initProject({ project, dryRun }, { run, log }) {
  if (!project) throw new Error('init requires --project <directory>; the current directory is never assumed.');
  const cwd = await realpath(resolve(project));
  if (!(await lstat(cwd)).isDirectory()) throw new Error('--project must name an existing directory');
  const result = await run('openspec', ['list', '--json'], { cwd, allowFailure: true });
  let context;
  try { context = JSON.parse(result.stdout); }
  catch { throw new Error(`OpenSpec did not return valid project context: ${result.stderr || result.stdout}`); }
  if (context.root) {
    if (result.code !== 0) throw new Error(context.error?.message || context.message || 'OpenSpec project lookup failed');
    log(`skip OpenSpec project: ${context.root.path || cwd}`);
    return { ok: true, items: [{ name: 'openspec-project', action: 'skip' }] };
  }
  const detail = JSON.stringify(context.error || context);
  if (context.root !== null || await exists(join(cwd, 'openspec')) || /Declared in|Invalid store declaration/i.test(detail)) {
    throw new Error(`OpenSpec context cannot be resolved; not reinitializing: ${detail}`);
  }
  log(`${dryRun ? 'would initialize' : 'initialize'} OpenSpec: ${cwd}`);
  if (!dryRun) {
    await run('openspec', ['init', '--tools', 'codex'], { cwd });
    const verified = await run('openspec', ['list', '--json'], { cwd });
    if (!JSON.parse(verified.stdout).root) throw new Error('OpenSpec initialization did not produce a resolvable project');
  }
  return { ok: true, items: [{ name: 'openspec-project', action: 'init' }] };
}

export async function execute(options = {}, { run = runCommand, log = console.log, nodeVersion = process.versions.node } = {}) {
  const { command = 'install', home = homedir(), skillRoot = bundledSkillRoot, dryRun = false, latest = false, plugin = false } = options;
  if (!['setup', 'install', 'update', 'doctor', 'init'].includes(command)) throw new Error(`Unknown command: ${command}`);
  if (latest && command !== 'update') throw new Error('--latest is supported only by update');
  if (command === 'setup' && dryRun) throw new Error('For a read-only installation preview use install --dry-run; setup performs installation and verification.');
  if (plugin) await verifyPlugin(skillRoot);
  const manifest = await readJson(join(skillRoot, 'config', 'dependencies.json'));
  validateManifest(manifest);
  const runtimePrerequisite = checkRuntimePrerequisite(nodeVersion, manifest.runtime.minimumNodeVersion);
  log(`${runtimePrerequisite.available ? 'ok' : 'missing'} prerequisite node: ${nodeVersion} (requires >=${runtimePrerequisite.minimumVersion})`);
  if (!runtimePrerequisite.available && !['setup', 'doctor'].includes(command)) {
    throw new Error(runtimePrerequisite.detail);
  }
  if (command === 'setup') {
    const before = await execute({ ...options, command: 'doctor' }, { run, log, nodeVersion });
    const prerequisites = [before.runtimePrerequisite, ...(before.deliveryPrerequisites || [])];
    if (!runtimePrerequisite.available) {
      log('Setup incomplete: install a supported Node.js version before preparing dependencies.');
      return { ...before, prerequisites, changes: [] };
    }
    let installation = null;
    if (!before.ok) {
      if (plugin) {
        assertPluginSkillsComplete(before.items);
        const result = await run('npm', ['--version']);
        prerequisites.push({ name: 'npm', available: true, version: result.stdout.trim() });
        log(`ok prerequisite npm: ${result.stdout.trim()}`);
      } else {
        for (const tool of ['npm', 'git']) {
          const result = await run(tool, ['--version']);
          prerequisites.push({ name: tool, version: result.stdout.trim() });
          log(`ok prerequisite ${tool}: ${result.stdout.trim()}`);
        }
      }
      installation = await execute({ ...options, command: 'install' }, { run, log });
    }
    const after = await execute({ ...options, command: 'doctor' }, { run, log });
    const changes = installation?.items.filter(({ action }) => action !== 'skip') || [];
    log(after.ok ? 'Setup complete: required dependencies are available.' : 'Setup incomplete: required dependencies are still missing.');
    return { ...after, prerequisites, changes };
  }
  if (command === 'init') return initProject(options, { run, log });
  const statePath = join(home, '.ai-workflow', 'state.json');
  const state = await exists(statePath) ? await readJson(statePath) : { schemaVersion: 1, skills: {} };
  if (state.schemaVersion !== 1 || !state.skills || typeof state.skills !== 'object') throw new Error(`Invalid installer state: ${statePath}`);
  const items = [];
  const add = (name, action, detail = '') => { const item = { name, action, detail }; items.push(item); log(`${action} ${name}${detail ? `: ${detail}` : ''}`); return item; };
  const source = skillRoot;
  const sourceDigest = plugin ? null : await digestTree(source);
  const mainPath = plugin ? null : await locateSkill(home, 'ai-workflow');
  const mainTarget = join(home, '.agents', 'skills', 'ai-workflow');
  const runningFromInstalledSkill = mainPath && await realpath(source) === await realpath(mainPath);
  const managedMain = Boolean(mainPath && state.main?.path === mainPath);
  let mainAction = plugin || mainPath ? 'skip' : 'install';
  if (mainPath && managedMain && !runningFromInstalledSkill && command !== 'doctor') {
    if ((await lstat(mainPath)).isSymbolicLink() || await digestTree(mainPath) !== state.main.digest) throw new Error(`Managed ai-workflow was locally modified: ${mainPath}`);
    if (sourceDigest !== state.main.digest) mainAction = 'update';
  }
  const mainDetail = plugin ? `${source} (provided by plugin)`
    : mainPath && !managedMain ? `${mainPath} (existing; unmanaged, preserved)` : mainPath || mainTarget;
  add('ai-workflow', command === 'doctor' ? (plugin || mainPath ? 'ok' : 'missing') : mainAction, mainDetail);
  if (plugin) {
    for (const base of ['.agents', '.codex']) {
      const path = join(home, base, 'skills', 'ai-workflow');
      if (await exists(path)) log(`notice standalone ai-workflow preserved: ${path}. Select the plugin's workflow entry to use this version.`);
    }
  }
  let openspecVersion;
  try {
    const result = await run('openspec', ['--version']);
    openspecVersion = result.stdout.match(/\b\d+\.\d+\.\d+\b/)?.[0];
  } catch { /* A missing CLI is an installable dependency. */ }
  let openspecAction = openspecVersion ? 'skip' : 'install';
  if (command === 'update' && state.openspec?.managed) openspecAction = 'update';
  add('openspec', command === 'doctor' ? (openspecVersion ? 'ok' : 'missing') : openspecAction, openspecVersion || manifest.openspec.version);

  const skillItems = [];
  const pluginSkillsRoot = plugin ? join(resolve(skillRoot, '../..'), 'skills') : null;
  const dependencies = plugin ? manifest.pluginSkills : manifest.skills;
  for (const dependency of dependencies) {
    const path = plugin
      ? (await exists(join(pluginSkillsRoot, dependency.name, 'SKILL.md')) ? join(pluginSkillsRoot, dependency.name) : null)
      : await locateSkill(home, dependency.name);
    const managed = plugin ? false : Boolean(state.skills[dependency.name]?.managed && state.skills[dependency.name].path === path);
    if (path && managed && command === 'update' && await digestTree(path) !== state.skills[dependency.name].digest) {
      throw new Error(`Managed skill was locally modified: ${path}. Preserve your edits before updating.`);
    }
    const action = plugin ? (path ? (command === 'doctor' ? 'ok' : 'skip') : 'missing')
      : path ? (command === 'update' && managed ? 'update' : 'skip') : 'install';
    const detail = plugin ? (path ? `${path} (bundled by plugin)` : `expected bundled skill at ${join(pluginSkillsRoot, dependency.name)}`)
      : path ? (managed ? 'managed' : 'existing; unmanaged, preserved') : dependency.repository;
    const item = add(dependency.name, command === 'doctor' && !plugin ? (path ? 'ok' : 'missing') : action, detail);
    skillItems.push({ ...dependency, ...item, path, managed, bundled: plugin });
  }
  if (command === 'doctor') {
    const delivery = await checkDeliveryPrerequisites(run, log);
    return { ok: runtimePrerequisite.available && items.every((item) => item.action === 'ok'), items, runtimePrerequisite, ...delivery };
  }
  if (plugin) {
    assertPluginSkillsComplete(skillItems);
  }
  if (dryRun) {
    if (latest) log('Upstream refs/versions would be resolved during update; dry-run does not fetch them.');
    return { ok: true, items };
  }
  if (mainAction !== 'skip') {
    await installMain(source, mainTarget);
    state.main = { path: mainTarget, digest: sourceDigest, version: manifest.workflowVersion };
    await saveState(statePath, state);
    log(`completed ${mainAction} ai-workflow: ${mainTarget}`);
  }
  if (openspecAction !== 'skip') {
    const version = latest ? (await run('npm', ['view', '@fission-ai/openspec', 'version'])).stdout.trim() : manifest.openspec.version;
    if (!/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(version)) throw new Error('Invalid OpenSpec version returned by registry');
    await run('npm', ['install', '--global', `@fission-ai/openspec@${version}`]);
    let verifiedVersion;
    try { verifiedVersion = (await run('openspec', ['--version'])).stdout.match(/\b\d+\.\d+\.\d+\b/)?.[0]; }
    catch { /* Report a missing npm executable path below instead of claiming success. */ }
    if (verifiedVersion !== version) throw new Error(`OpenSpec ${version} was requested, but its executable is not active. Add npm's global executable directory to PATH and retry.`);
    state.openspec = { version, managed: true, channel: latest ? 'upstream' : 'pinned' };
    await saveState(statePath, state);
    log(`completed ${openspecAction} openspec: ${version}`);
  }
  const revisions = new Map();
  for (const item of skillItems.filter((entry) => entry.action !== 'skip')) {
    let ref = item.ref;
    if (latest) {
      if (!revisions.has(item.repository)) {
        const result = await run('git', ['ls-remote', `https://github.com/${item.repository}.git`, 'HEAD']);
        const resolved = result.stdout.trim().split(/\s+/)[0];
        if (!/^[a-f0-9]{40}$/.test(resolved)) throw new Error(`Could not resolve upstream revision: ${item.repository}`);
        revisions.set(item.repository, resolved);
      }
      ref = revisions.get(item.repository);
    }
    const env = { ...process.env, HOME: home, USERPROFILE: home };
    if (resolve(home) !== resolve(homedir())) delete env.XDG_STATE_HOME;
    await run('npm', ['exec', '--yes', `--package=skills@${manifest.skillsCli.version}`, '--', 'skills', 'add',
      `https://github.com/${item.repository}/tree/${ref}`, '--skill', item.name, '--global', '--agent', 'codex', '--yes'],
    { env });
    const path = await locateSkill(home, item.name);
    if (!path) throw new Error(`skills add did not install ${item.name}`);
    state.skills[item.name] = { repository: item.repository, ref, path, digest: await digestTree(path), managed: true, channel: latest ? 'upstream' : 'pinned' };
    await saveState(statePath, state);
    log(`completed ${item.action} ${item.name}: ${path}`);
  }
  return { ok: true, items };
}
