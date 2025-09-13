import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../src/server/server.js';

test('server API handler returns mock flight data when MOCK_AVSTACK=1', async () => {
  process.env.MOCK_AVSTACK = '1';

  const server = createServer({ staticDir: new URL('../src/client', import.meta.url).pathname });
  const listeners = server.listeners('request');
  assert.ok(listeners.length > 0, 'server should have a request listener');
  const handler = listeners[0];

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

  // Handler may be sync or async; ensure we await either case.
  await Promise.resolve(handler(req, res));

  assert.equal(statusCode, 200, `expected 200, got ${statusCode} with body ${body}`);
  const json = JSON.parse(body || '{}');
  assert.ok(json.mock === true, 'should be mock response when MOCK_AVSTACK=1');
  assert.ok(Array.isArray(json.data), 'response should have data array');
});

test('server API handler returns 400 when flight_iata missing', async () => {
  process.env.MOCK_AVSTACK = '1';

  const server = createServer({ staticDir: new URL('../src/client', import.meta.url).pathname });
  const handler = server.listeners('request')[0];

  const req = { url: '/api/flight', method: 'GET' };

  let statusCode = 0;
  let body = '';
  const res = {
    writeHead: (code) => {
      statusCode = code;
    },
    end: (chunk) => {
      if (chunk) body += Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk);
    }
  };

  await Promise.resolve(handler(req, res));

  assert.equal(
    statusCode,
    400,
    `expected 400 when missing flight_iata, got ${statusCode} body=${body}`
  );
  const json = JSON.parse(body || '{}');
  assert.equal(json.error, 'missing query param: flight_iata');
});
