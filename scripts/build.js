import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC = path.resolve(__dirname, '../src/client');
const DIST = path.resolve(__dirname, '../dist');

async function rimraf(dir) {
  if (fs.existsSync(dir)) {
    await fsp.rm(dir, { recursive: true, force: true });
  }
}

async function copyDir(src, dest) {
  await fsp.mkdir(dest, { recursive: true });
  const entries = await fsp.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) await copyDir(s, d);
    else await fsp.copyFile(s, d);
  }
}

async function main() {
  console.log(`[build] cleaning ${DIST}`);
  await rimraf(DIST);
  console.log(`[build] copying ${SRC} -> ${DIST}`);
  await copyDir(SRC, DIST);
  console.log('[build] done');
}

main().catch((err) => {
  console.error('[build] error', err);
  process.exit(1);
});

