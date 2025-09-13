import assert from 'node:assert/strict';
import http from 'node:http';
import { createServer } from '../../src/server/server.js';

console.log('[itest] Starting integration test...');

// Ensure we use mock upstream so tests don't rely on network or keys.
process.env.MOCK_AVSTACK = '1';

const staticDir = new URL('../../src/client', import.meta.url).pathname;
const server = createServer({ staticDir });

function listenOnEphemeral(srv) {
  return new Promise((resolve, reject) => {
    srv.once('error', reject);
    srv.listen(0, () => {
      srv.removeListener('error', reject);
      resolve();
    });
  });
}

function closeServer(srv) {
  return new Promise((resolve) => {
    try {
      srv.close(() => resolve());
    } catch (e) {
      // best-effort
      resolve();
    }
  });
}

function httpFetch(url, opts = {}) {
  // Use global fetch when available (Node 18+). Fallback to http.request otherwise.
  if (typeof fetch === 'function') {
    return fetch(url, opts);
  }
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const options = {
      method: opts.method || 'GET',
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      headers: opts.headers || {}
    };
    const req = http.request(options, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');
        // shape a minimal fetch-like response
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          headers: res.headers,
          text: async () => body,
          json: async () => {
            try {
              return JSON.parse(body);
            } catch {
              throw new Error('Invalid JSON');
            }
          }
        });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

try {
  await listenOnEphemeral(server);
  const addr = server.address();
  const port = typeof addr === 'string' ? addr : addr.port;
  const base = `http://127.0.0.1:${port}`;

  console.log(`[itest] server listening on ${base}`);

  // 1) API route
  {
    const res = await httpFetch(`${base}/api/flight?flight_iata=AA100`, { headers: { accept: 'application/json' } });
    const bodyText = await res.text();
    assert.equal(res.status, 200, `expected 200 from /api/flight, got ${res.status} body=${bodyText}`);
    let json;
    try {
      json = JSON.parse(bodyText);
    } catch (e) {
      throw new Error(`Invalid JSON from /api/flight: ${e.message}`);
    }
    assert.ok(json.mock === true, 'expected mock response when MOCK_AVSTACK=1');
    assert.ok(Array.isArray(json.data), 'expected data array in response');
    console.log('[itest] /api/flight OK');
  }

  // 2) Static root file
  {
    const res = await httpFetch(`${base}/`, { headers: { accept: 'text/html' } });
    const body = await res.text();
    assert.equal(res.status, 200, `expected 200 from /, got ${res.status}`);
    // Check for a few expected tokens from index.html
    assert.ok(body.includes('Aviation Game'), 'index.html should contain "Aviation Game"');
    assert.ok(body.includes('<script type="module" src="/main.js"></script>') || body.includes('main.js'), 'index should reference main.js');
    console.log('[itest] static root / OK');
  }

  // 3) 404 for missing file
  {
    const res = await httpFetch(`${base}/nonexistent-xyz`, {});
    assert.equal(res.status, 404, `expected 404 for missing file, got ${res.status}`);
    console.log('[itest] 404 for missing path OK');
  }

  console.log('[itest] All integration checks passed');
} finally {
  await closeServer(server);
  console.log('[itest] server closed');
}
