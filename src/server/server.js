import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { loadEnv } from './env.js';

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function json(res, status, data, headers = {}) {
  const body = JSON.stringify(data);
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', ...headers });
  res.end(body);
}

function text(res, status, body, headers = {}) {
  res.writeHead(status, { 'content-type': 'text/plain; charset=utf-8', ...headers });
  res.end(body);
}

async function handleFlightProxy(req, res, url) {
  const { AVIATIONSTACK_API_KEY, AVIATIONSTACK_BASE_URL } = loadEnv();
  const search = new URLSearchParams(url.searchParams);
  const flight_iata = search.get('flight_iata') || '';
  const mock = process.env.MOCK_AVSTACK === '1' || !AVIATIONSTACK_API_KEY;

  if (!flight_iata) {
    return json(res, 400, { error: 'missing query param: flight_iata' });
  }

  if (mock) {
    return json(res, 200, {
      mock: true,
      data: [{ flight: { iata: flight_iata, number: flight_iata.replace(/\D/g, '') || '100' }, airline: { name: 'Demo Air' }, departure: { airport: 'SFO' }, arrival: { airport: 'LAX' } }]
    });
  }

  try {
    const endpoint = `${AVIATIONSTACK_BASE_URL}/flights?access_key=${encodeURIComponent(AVIATIONSTACK_API_KEY)}&flight_iata=${encodeURIComponent(flight_iata)}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const resp = await fetch(endpoint, { signal: controller.signal });
    clearTimeout(timer);
    if (!resp.ok) {
      return json(res, resp.status, { error: `upstream ${resp.status}` });
    }
    const data = await resp.json();
    return json(res, 200, data);
  } catch (err) {
    return json(res, 502, { error: 'upstream error', detail: String(err && err.message || err) });
  }
}

export function createServer({ staticDir }) {
  const STATIC_DIR = staticDir;
  const server = http.createServer((req, res) => {
    const rawUrl = req.url || '/';
    const url = new URL(rawUrl, 'http://localhost');
    const urlPath = decodeURIComponent(url.pathname);

    // API routes
    if (urlPath.startsWith('/api/')) {
      if (urlPath === '/api/flight' && req.method === 'GET') {
        return void handleFlightProxy(req, res, url);
      }
      return json(res, 404, { error: 'API route not found' });
    }

    // Static files
    let filePath = path.join(STATIC_DIR, urlPath);
    if (urlPath.endsWith('/')) filePath = path.join(filePath, 'index.html');
    if (!path.extname(filePath)) filePath += '/index.html';

    fs.stat(filePath, (err, stat) => {
      if (err || !stat.isFile()) {
        return text(res, 404, 'Not Found');
      }
      const ext = path.extname(filePath).toLowerCase();
      const type = mime[ext] || 'application/octet-stream';
      res.writeHead(200, { 'content-type': type });
      fs.createReadStream(filePath).pipe(res);
    });
  });
  return server;
}

