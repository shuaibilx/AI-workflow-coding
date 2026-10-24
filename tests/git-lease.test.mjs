import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('expected-SHA leases preserve an advanced remote task branch and delete an unchanged one', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'workflow-git-lease-'));
  t.after(() => rm(root, { recursive: true, force: true }));

  const origin = join(root, 'origin.git');
  const checkout = join(root, 'checkout');
  await mkdir(checkout);
  const gitEnv = {
    ...process.env,
    GIT_AUTHOR_NAME: 'AI Workflow Test',
    GIT_AUTHOR_EMAIL: 'ai-workflow-test@example.invalid',
    GIT_COMMITTER_NAME: 'AI Workflow Test',
    GIT_COMMITTER_EMAIL: 'ai-workflow-test@example.invalid',
  };
  const runGit = (cwd, args, { allowFailure = false } = {}) => {
    const result = spawnSync('git', ['-C', cwd, ...args], { encoding: 'utf8', env: gitEnv });
    if (result.error) throw result.error;
    if (!allowFailure && result.status !== 0) {
      throw new Error(`git ${args.join(' ')} failed:\n${result.stderr}`);
    }
    return { status: result.status, stdout: result.stdout.trim(), stderr: result.stderr.trim() };
  };

  runGit(root, ['init', '--bare', origin]);
  runGit(checkout, ['init']);
  runGit(checkout, ['config', 'user.name', gitEnv.GIT_AUTHOR_NAME]);
  runGit(checkout, ['config', 'user.email', gitEnv.GIT_AUTHOR_EMAIL]);
  runGit(checkout, ['checkout', '-b', 'main']);
  runGit(checkout, ['remote', 'add', 'origin', origin]);
  await writeFile(join(checkout, 'state.txt'), 'base\n');
  runGit(checkout, ['add', 'state.txt']);
  runGit(checkout, ['commit', '-m', 'base']);
  runGit(checkout, ['push', '-u', 'origin', 'main']);

  runGit(checkout, ['checkout', '-b', 'moved-task']);
  await writeFile(join(checkout, 'state.txt'), 'PR head\n');
  runGit(checkout, ['commit', '-am', 'task']);
  runGit(checkout, ['push', '-u', 'origin', 'moved-task']);
  const expectedHead = runGit(checkout, ['rev-parse', 'HEAD']).stdout;
  await writeFile(join(checkout, 'state.txt'), 'advanced after PR\n');
  runGit(checkout, ['commit', '-am', 'advance branch']);
  runGit(checkout, ['push', 'origin', 'moved-task']);
  const movedHead = runGit(checkout, ['rev-parse', 'HEAD']).stdout;

  const staleDelete = runGit(checkout, [
    `push`, `--force-with-lease=refs/heads/moved-task:${expectedHead}`, 'origin', ':refs/heads/moved-task',
  ], { allowFailure: true });
  assert.notEqual(staleDelete.status, 0, 'deletion with the old PR SHA must be rejected');
  assert.match(runGit(checkout, ['ls-remote', 'origin', 'refs/heads/moved-task']).stdout, new RegExp(`^${movedHead}\\s`));

  runGit(checkout, ['checkout', 'main']);
  runGit(checkout, ['checkout', '-b', 'unchanged-task']);
  await writeFile(join(checkout, 'state.txt'), 'unchanged PR head\n');
  runGit(checkout, ['commit', '-am', 'unchanged task']);
  runGit(checkout, ['push', '-u', 'origin', 'unchanged-task']);
  const unchangedHead = runGit(checkout, ['rev-parse', 'HEAD']).stdout;
  runGit(checkout, [
    'push', `--force-with-lease=refs/heads/unchanged-task:${unchangedHead}`, 'origin', ':refs/heads/unchanged-task',
  ]);
  assert.equal(runGit(checkout, ['ls-remote', 'origin', 'refs/heads/unchanged-task']).stdout, '');
});
