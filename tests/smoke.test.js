import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

function exists(p) {
  return fs.existsSync(path.resolve(p));
}

test('smoke: repo docs present', () => {
  assert.ok(exists('AGENTS.md'), 'AGENTS.md should exist');
  assert.ok(exists('prd.md'), 'prd.md should exist');
});

test('smoke: basic source layout present', () => {
  assert.ok(exists('src/server/index.js'), 'src/server/index.js should exist');
  assert.ok(exists('src/client/index.html'), 'src/client/index.html should exist');
});
