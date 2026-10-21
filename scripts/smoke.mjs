import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { delimiter, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runCommand } from '../skills/ai-workflow/scripts/lib/system.mjs';

// An opt-in network integration check. Never installs skills into the real user home.
const root = await mkdtemp(join(tmpdir(), 'ai-workflow-smoke-'));
const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const home = join(root, 'home');
const prefix = join(root, 'npm');
const project = join(root, 'project');
await mkdir(project, { recursive: true });
const env = { ...process.env, HOME: home, USERPROFILE: home, npm_config_prefix: prefix, OPENSPEC_TELEMETRY: '0', DISABLE_TELEMETRY: '1', SKILLS_CLONE_TIMEOUT_MS: '60000' };
delete env.XDG_STATE_HOME;
const originalPath = env.PATH || env.Path || '';
delete env.PATH;
delete env.Path;
env[process.platform === 'win32' ? 'Path' : 'PATH'] = [prefix, join(prefix, 'bin'), originalPath].join(delimiter);
const run = (file, args) => runCommand(process.execPath, [file, ...args], { env, cwd: project });

try {
  const sourceEntry = join(projectRoot, 'bin', 'ai-workflow.mjs');
  const first = await run(sourceEntry, ['install']);
  console.log(first.stdout.trim());
  const manifest = JSON.parse(await readFile(join(projectRoot, 'skills', 'ai-workflow', 'config', 'dependencies.json'), 'utf8'));
  const lock = JSON.parse(await readFile(join(home, '.agents', '.skill-lock.json'), 'utf8'));
  for (const skill of manifest.skills) {
    assert.equal(lock.skills[skill.name].ref, skill.ref, `pinned revision: ${skill.name}`);
  }
  const installedEntry = join(home, '.agents', 'skills', 'ai-workflow', 'scripts', 'cli.mjs');
  const doctor = await run(installedEntry, ['doctor']);
  console.log(doctor.stdout.trim());
  const repeat = await run(installedEntry, ['install']);
  assert.equal(/^install /m.test(repeat.stdout), false, 'repeat install should only skip existing content');
  await run(installedEntry, ['init', '--project', project]);
  await access(join(project, 'openspec', 'config.yaml'));
  await access(join(project, '.agents', 'skills', 'openspec-propose', 'SKILL.md'));
  console.log('Smoke passed: real pinned downloads, standard skills lock, installed entrypoint, repeat install, and OpenSpec project init.');
} finally {
  // root is a unique directory created by this script, never a user-provided path.
  if (resolve(root).startsWith(resolve(tmpdir()) + (process.platform === 'win32' ? '\\' : '/'))) {
    await rm(root, { recursive: true, force: true });
  }
}
