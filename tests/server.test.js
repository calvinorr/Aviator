import assert from 'node:assert/strict';
import { createServer } from '../src/server/server.js';

console.log('[test] Starting server API (no listen) test...');

process.env.MOCK_AVSTACK = '1';

const server = createServer({ staticDir: new URL('../src/client', import.meta.url).pathname });

// Grab the handler and invoke directly with mock req/res
const handler = server.listeners('request')[0];

const req = { url: '/api/flight?flight_iata=AA100', method: 'GET' };

let statusCode = 0;
let headers = {};
let body = '';
const res = {
  writeHead: (code, h) => {
    statusCode = code;
    headers = h || {};
  },
  end: (chunk) => {
    if (chunk) body += Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk);
  }
};

await handler(req, res);

assert.equal(statusCode, 200, `expected 200, got ${statusCode} with body ${body}`);
const json = JSON.parse(body || '{}');
assert.ok(json.mock === true, 'should be mock response when MOCK_AVSTACK=1');
assert.ok(Array.isArray(json.data), 'response should have data array');
console.log('[test] Server API response shape OK');
