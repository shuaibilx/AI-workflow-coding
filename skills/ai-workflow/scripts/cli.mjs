#!/usr/bin/env node
import { execute } from './lib/installer.mjs';

const help = `ai-workflow — install and maintain AI Workflow Plugin dependencies

Usage:
  ai-workflow setup [--plugin] [--json]
  ai-workflow install [--plugin] [--dry-run]
  ai-workflow doctor [--plugin]
  ai-workflow update [--plugin] [--latest] [--dry-run]
  ai-workflow init --project <directory> [--dry-run]

setup      Check Node/npm/Git, install missing dependencies, and verify readiness.
install    Install bundled workflow and missing global dependencies; preserve existing skills.
doctor     Read-only dependency check (exit 1 if anything is missing).
update     Refresh managed skills to this package's pinned dependencies.
--latest   Resolve upstream HEAD/registry versions explicitly; compatibility is unverified.
--plugin   Use the workflow bundled in this plugin; never copy/update a standalone workflow.
--json     Return structured results (or an error) and diagnostic messages for any command.
init       Initialize OpenSpec only in the explicitly named project.

The installer does not publish packages, initialize Git, or upgrade unmanaged dependencies.
`;

const json = process.argv.slice(2).includes('--json');
const messages = [];
try {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(help);
  } else {
    const options = { command: args.shift() };
    for (let index = 0; index < args.length; index++) {
      const arg = args[index];
      if (arg === '--dry-run') options.dryRun = true;
      else if (arg === '--plugin') options.plugin = true;
      else if (arg === '--json') continue;
      else if (arg === '--latest') options.latest = true;
      else if (arg === '--project' && args[index + 1] && !args[index + 1].startsWith('--')) options.project = args[++index];
      else throw new Error(`Unknown or incomplete option: ${arg}`);
    }
    if (options.project && options.command !== 'init') throw new Error('--project is supported only by init');
    const [major, minor] = process.versions.node.split('.').map(Number);
    if (major < 22 || (major === 22 && minor < 20)) throw new Error('Node.js >=22.20.0 is required.');
    const result = await execute(options, json ? { log: (line) => messages.push(line) } : undefined);
    if (json) console.log(JSON.stringify({ ...result, messages }));
    if (!result.ok) process.exitCode = 1;
  }
} catch (error) {
  if (json) console.log(JSON.stringify({ ok: false, error: { message: error.message }, messages }));
  else console.error(`ai-workflow: ${error.message}`);
  process.exitCode = 1;
}
