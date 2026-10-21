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
      || manifest.openspec?.package !== '@fission-ai/openspec' || !semver.test(manifest.openspec.version)
      || !Array.isArray(manifest.skills)) throw new Error('Invalid dependency manifest');
  const names = new Set(['ai-workflow']);
  for (const skill of manifest.skills) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(skill.name) || names.has(skill.name)
        || !/^[\w.-]+\/[\w.-]+$/.test(skill.repository) || !/^[a-f0-9]{40}$/.test(skill.ref)) throw new Error('Invalid skill dependency');
    names.add(skill.name);
  }
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

export async function execute(options = {}, { run = runCommand, log = console.log } = {}) {
  const { command = 'install', home = homedir(), skillRoot = bundledSkillRoot, dryRun = false, latest = false } = options;
  if (!['install', 'update', 'doctor', 'init'].includes(command)) throw new Error(`Unknown command: ${command}`);
  if (latest && command !== 'update') throw new Error('--latest is supported only by update');
  if (command === 'init') return initProject(options, { run, log });
  const manifest = await readJson(join(skillRoot, 'config', 'dependencies.json'));
  validateManifest(manifest);
  const statePath = join(home, '.ai-workflow', 'state.json');
  const state = await exists(statePath) ? await readJson(statePath) : { schemaVersion: 1, skills: {} };
  if (state.schemaVersion !== 1 || !state.skills || typeof state.skills !== 'object') throw new Error(`Invalid installer state: ${statePath}`);
  const items = [];
  const add = (name, action, detail = '') => { const item = { name, action, detail }; items.push(item); log(`${action} ${name}${detail ? `: ${detail}` : ''}`); return item; };
  const source = skillRoot;
  const sourceDigest = await digestTree(source);
  const mainPath = await locateSkill(home, 'ai-workflow');
  const mainTarget = join(home, '.agents', 'skills', 'ai-workflow');
  const runningFromInstalledSkill = mainPath && await realpath(source) === await realpath(mainPath);
  let mainAction = mainPath ? 'skip' : 'install';
  if (mainPath && !runningFromInstalledSkill && command !== 'doctor') {
    if (!state.main || state.main.path !== mainPath) throw new Error(`Unmanaged ai-workflow exists at ${mainPath}; it will not be overwritten.`);
    if ((await lstat(mainPath)).isSymbolicLink() || await digestTree(mainPath) !== state.main.digest) throw new Error(`Managed ai-workflow was locally modified: ${mainPath}`);
    if (sourceDigest !== state.main.digest) mainAction = 'update';
  }
  add('ai-workflow', command === 'doctor' ? (mainPath ? 'ok' : 'missing') : mainAction, mainPath || mainTarget);
  let openspecVersion;
  try {
    const result = await run('openspec', ['--version']);
    openspecVersion = result.stdout.match(/\b\d+\.\d+\.\d+\b/)?.[0];
  } catch { /* A missing CLI is an installable dependency. */ }
  let openspecAction = openspecVersion ? 'skip' : 'install';
  if (command === 'update' && state.openspec?.managed) openspecAction = 'update';
  add('openspec', command === 'doctor' ? (openspecVersion ? 'ok' : 'missing') : openspecAction, openspecVersion || manifest.openspec.version);

  const skillItems = [];
  for (const dependency of manifest.skills) {
    const path = await locateSkill(home, dependency.name);
    const managed = Boolean(state.skills[dependency.name]?.managed && state.skills[dependency.name].path === path);
    if (path && managed && command === 'update' && await digestTree(path) !== state.skills[dependency.name].digest) {
      throw new Error(`Managed skill was locally modified: ${path}. Preserve your edits before updating.`);
    }
    const action = path ? (command === 'update' && managed ? 'update' : 'skip') : 'install';
    const item = add(dependency.name, command === 'doctor' ? (path ? 'ok' : 'missing') : action, path ? (managed ? 'managed' : 'existing; unmanaged, preserved') : dependency.repository);
    skillItems.push({ ...dependency, ...item, path, managed });
  }
  if (command === 'doctor') return { ok: items.every((item) => item.action === 'ok'), items };
  if (dryRun) {
    if (latest) log('Upstream refs/versions would be resolved during update; dry-run does not fetch them.');
    return { ok: true, items };
  }
  if (mainAction !== 'skip') {
    await installMain(source, mainTarget);
    state.main = { path: mainTarget, digest: sourceDigest, version: manifest.workflowVersion };
    await saveState(statePath, state);
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
  }
  return { ok: true, items };
}
