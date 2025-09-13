import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from './server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Requested port (default 5173) but we will gracefully fall back if it's in use.
const requestedPort = process.env.PORT ? Number(process.env.PORT) : 5173;
const STATIC_DIR = process.env.STATIC_DIR || path.resolve(__dirname, '../client');

const server = createServer({ staticDir: STATIC_DIR });

function getBoundPort() {
  const addr = server.address();
  if (!addr) return null;
  return typeof addr === 'string' ? addr : addr.port;
}

function onReadyLog() {
  const port = getBoundPort();
  if (port != null) {
    console.log(`[server] listening on http://localhost:${port}`);
    console.log(`[server] serving static from: ${STATIC_DIR}`);
  } else {
    console.log('[server] listening (address unknown)');
    console.log(`[server] serving static from: ${STATIC_DIR}`);
  }
}

function listenOnce(port) {
  return new Promise((resolve, reject) => {
    // Attach single-use listeners so we can cleanup deterministically.
    function onError(err) {
      cleanup();
      reject(err);
    }
    function onListening() {
      cleanup();
      resolve();
    }
    function cleanup() {
      server.removeListener('error', onError);
      server.removeListener('listening', onListening);
    }

    server.once('error', onError);
    server.once('listening', onListening);
    // Start listening; if this fails synchronously it will still emit 'error'.
    server.listen(port);
  });
}

async function start(port) {
  try {
    await listenOnce(port);
    onReadyLog();
  } catch (err) {
    if (err && err.code === 'EADDRINUSE') {
      console.warn(`[server] port ${port} is already in use — falling back to an ephemeral port`);
      try {
        await listenOnce(0); // ephemeral port
        onReadyLog();
      } catch (err2) {
        console.error(
          '[server] failed to bind to an ephemeral port:',
          err2 && err2.stack ? err2.stack : err2
        );
        process.exit(1);
      }
    } else {
      // Unexpected error while attempting to listen.
      console.error('[server] error while trying to listen:', err && err.stack ? err.stack : err);
      process.exit(1);
    }
  }
}

// Graceful shutdown helpers
function setupGracefulShutdown() {
  const signals = ['SIGINT', 'SIGTERM'];
  signals.forEach((sig) => {
    process.on(sig, () => {
      console.log(`[server] received ${sig}, shutting down...`);
      try {
        server.close(() => {
          console.log('[server] closed');
          process.exit(0);
        });
        // Force exit after a timeout in case connections hang.
        setTimeout(() => {
          console.warn('[server] shutdown timed out, forcing exit');
          process.exit(1);
        }, 5000).unref();
      } catch (e) {
        console.error('[server] error during shutdown', e);
        process.exit(1);
      }
    });
  });
}

// Start the server with requested port, falling back to ephemeral if necessary.
setupGracefulShutdown();
start(requestedPort);
