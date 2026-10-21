import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { delimiter, dirname, join } from 'node:path';

// Calling npm's JS entry avoids cmd.exe quoting and works with paths containing spaces.
export function commandFor(tool, args, env = process.env, platform = process.platform) {
  const npmCandidates = [
    env.npm_execpath,
    join(dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js'),
    ...(env.PATH || env.Path || '').split(delimiter).flatMap((directory) => [
      join(directory, 'node_modules', 'npm', 'bin', 'npm-cli.js'),
      join(directory, '..', 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js'),
    ]),
  ];
  if (tool === 'npm') {
    const npmCli = npmCandidates.find((candidate) => candidate?.endsWith('npm-cli.js') && existsSync(candidate));
    if (npmCli) return [process.execPath, [npmCli, ...args]];
    if (platform === 'win32') throw new Error('Cannot locate npm-cli.js. Install Node.js with npm, then retry.');
  }
  if (tool === 'openspec') {
    const directories = (env.PATH || env.Path || '').split(delimiter).filter(Boolean);
    for (const directory of directories) {
      const entry = join(directory, 'node_modules', '@fission-ai', 'openspec', 'bin', 'openspec.js');
      if (existsSync(entry)) return [process.execPath, [entry, ...args]];
    }
    if (platform === 'win32') {
      // npm's Windows shims are .cmd/.ps1 and cannot be spawned without a shell.
      throw new Error('OpenSpec CLI not found on PATH. Run ai-workflow install.');
    }
  }
  return [tool, args];
}

export function runCommand(tool, args, { cwd, env = process.env, allowFailure = false } = {}) {
  const [command, commandArgs] = commandFor(tool, args, env);
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, { cwd, env, shell: false, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8').on('data', (chunk) => { stdout += chunk; });
    child.stderr.setEncoding('utf8').on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0 || allowFailure) resolve({ code, stdout, stderr });
      else reject(new Error(`${tool} ${args[0] || ''} failed (${code}): ${stderr || stdout}`));
    });
  });
}
