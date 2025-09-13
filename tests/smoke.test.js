import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

function exists(p) {
  return fs.existsSync(path.resolve(p));
}

console.log('[test] Running smoke checks...');

// Repo docs present
assert.ok(exists('AGENTS.md'), 'AGENTS.md should exist');
assert.ok(exists('prd.md'), 'prd.md should exist');

// Basic source layout present
assert.ok(exists('src/server/index.js'), 'src/server/index.js should exist');
assert.ok(exists('src/client/index.html'), 'src/client/index.html should exist');

console.log('[test] OK');

