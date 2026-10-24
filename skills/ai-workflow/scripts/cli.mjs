#!/usr/bin/env node
import { execute } from './lib/installer.mjs';

const help = `ai-workflow — install and maintain AI Workflow Plugin dependencies

Usage:
  ai-workflow setup [--plugin] [--json]
  ai-workflow install [--plugin] [--dry-run]
  ai-workflow doctor [--plugin]
  ai-workflow update [--plugin] [--latest] [--dry-run]
  ai-workflow init --project <directory> [--dry-run]

setup      Check readiness; in Plugin mode install only a missing OpenSpec CLI.
install    Install missing global dependencies for a standalone workflow.
doctor     Read-only check of bundled Plugin skills, OpenSpec, and GitHub readiness.
update     Update standalone managed skills, or Plugin-managed OpenSpec CLI.
--latest   Resolve upstream HEAD/registry versions explicitly; compatibility is unverified.
--plugin   Use bundled Plugin skills; never download them or copy/update standalone skills.
--json     Return structured results (or an error) and diagnostic messages for any command.
init       Initialize OpenSpec in the named project and add adaptive artifact-language context when absent.

Plugin installs include all fixed workflow skills. OpenSpec CLI remains a global executable.
Setup checks GitHub delivery readiness separately; the installer never initializes Git or publishes changes.
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
    const result = await execute(options, json ? { log: (line) => messages.push(line) } : undefined);
    if (json) console.log(JSON.stringify({ ...result, messages }));
    if (!result.ok) process.exitCode = 1;
  }
} catch (error) {
  if (json) console.log(JSON.stringify({ ok: false, error: { message: error.message }, messages }));
  else console.error(`ai-workflow: ${error.message}`);
  process.exitCode = 1;
}
