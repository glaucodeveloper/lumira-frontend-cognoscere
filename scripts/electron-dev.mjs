import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const electron = process.platform === 'win32' ? 'node_modules/.bin/electron.cmd' : 'node_modules/.bin/electron';
const rendererUrl = 'http://127.0.0.1:5173';
const vite = spawn(npm, ['run', 'dev', '--', '--port', '5173', '--strictPort'], { stdio: 'inherit' });
let desktop;

async function waitForRenderer() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (vite.exitCode !== null) throw new Error('O servidor Vite encerrou antes de iniciar.');
    try {
      const response = await fetch(rendererUrl, { signal: AbortSignal.timeout(700) });
      if (response.ok) return;
    } catch { /* O servidor ainda está inicializando. */ }
    await delay(250);
  }
  throw new Error('O servidor Vite não respondeu em 20 segundos.');
}

try {
  await waitForRenderer();
  desktop = spawn(electron, ['.'], {
    stdio: 'inherit',
    env: { ...process.env, LUMIRA_RENDERER_URL: rendererUrl },
  });
  desktop.on('exit', code => { process.exitCode = code ?? 0; vite.kill('SIGTERM'); });
  await new Promise((resolve, reject) => {
    desktop.once('error', reject);
    desktop.once('exit', resolve);
  });
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  if (desktop && desktop.exitCode === null) desktop.kill('SIGTERM');
  if (vite.exitCode === null) vite.kill('SIGTERM');
}
