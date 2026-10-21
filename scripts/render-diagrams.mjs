import { mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { runCommand } from '../skills/ai-workflow/scripts/lib/system.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const directory = join(root, 'docs', 'diagrams');
const temporary = await mkdtemp(join(tmpdir(), 'ai-workflow-diagrams-'));
const browser = process.env.PUPPETEER_EXECUTABLE_PATH;
try {
  await mkdir(join(root, 'assets'), { recursive: true });
  const config = join(temporary, 'puppeteer.json');
  await writeFile(config, JSON.stringify(browser ? { executablePath: browser } : {}));
  for (const file of (await readdir(directory)).filter((name) => name.endsWith('.mmd'))) {
    const result = await runCommand('npm', ['exec', '--yes', '--package=@mermaid-js/mermaid-cli@12.0.0', '--',
      'mmdc', '-i', join(directory, file), '-o', join(root, 'assets', file.replace(/\.mmd$/, '.svg')),
      '-c', join(directory, 'theme.json'), '-p', config, '-b', 'white'],
    { env: { ...process.env, ...(browser ? { PUPPETEER_SKIP_DOWNLOAD: 'true' } : {}) } });
    console.log(file, result.stdout.trim());
  }
} finally {
  if (resolve(temporary).startsWith(resolve(tmpdir()))) await rm(temporary, { recursive: true, force: true });
}
