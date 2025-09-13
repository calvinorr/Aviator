import fs from 'node:fs';
import path from 'node:path';

function parseDotEnv(content) {
  const out = {};
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eq = trimmed.indexOf('=');
    if (eq === -1) return;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  });
  return out;
}

export function loadEnv(cwd = process.cwd()) {
  const files = [path.join(cwd, '.env'), path.join(cwd, '.env.local')];
  for (const file of files) {
    if (fs.existsSync(file)) {
      const parsed = parseDotEnv(fs.readFileSync(file, 'utf8'));
      for (const [k, v] of Object.entries(parsed)) {
        if (!(k in process.env)) process.env[k] = v;
      }
    }
  }
  return {
    AVIATIONSTACK_API_KEY: process.env.AVIATIONSTACK_API_KEY || '',
    AVIATIONSTACK_BASE_URL: process.env.AVIATIONSTACK_BASE_URL || 'http://api.aviationstack.com/v1'
  };
}

