import test from 'node:test';
import assert from 'node:assert/strict';
import { runCommand } from '../skills/ai-workflow/scripts/lib/system.mjs';

test('subprocess arguments are passed literally including shell metacharacters and unicode paths', async () => {
  const value = 'a space 中文 & echo $HOME `nothing` $(nothing)';
  const result = await runCommand(process.execPath, ['-e', 'process.stdout.write(process.argv[1])', value]);
  assert.equal(result.stdout, value);
});

test('npm can run without shell shims on the current platform', async () => {
  const result = await runCommand('npm', ['--version']);
  assert.match(result.stdout.trim(), /^\d+\.\d+\.\d+$/);
});

test('command failures propagate the exit code and diagnostic output', async () => {
  await assert.rejects(runCommand(process.execPath, ['-e', 'process.stderr.write("deliberate failure"); process.exit(7)']), /failed \(7\): deliberate failure/);
  const result = await runCommand(process.execPath, ['-e', 'process.stdout.write("context"); process.exit(3)'], { allowFailure: true });
  assert.equal(result.code, 3);
  assert.equal(result.stdout, 'context');
});
