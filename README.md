# Aviation Game

A small starter skeleton for an Aviation-themed web app that can query the AviationStack API and serve a tiny frontend. This repo is intended as a lightweight foundation for building data-driven games and experiments.

Key files and folders
- `src/server/` — minimal Node HTTP server and env loader.
- `src/client/` — static demo UI.
- `tests/` — unit and integration checks.
- `.env.example` — example environment variables.
- `.github/workflows/ci.yml` — CI workflow that runs lint + tests.

Requirements
- Node.js 18+ (we use Node 18 features such as global `fetch` and the built-in test runner).
- npm (or use your package manager of choice).

Quick start

1. Clone and install dependencies
```/dev/null/commands.md#L1-10
git clone https://github.com/calvinorr/Aviator.git
cd Aviator
npm ci
```

2. Configure environment
- Copy the example env file and set values you need:
```/dev/null/commands.md#L11-20
cp .env.example .env.local
# Edit .env.local and set AVIATIONSTACK_API_KEY if you want real upstream data.
# For local development or CI, you can set MOCK_AVSTACK=1 to use canned responses.
```

3. Run in development
- Start the dev server:
```/dev/null/commands.md#L21-30
npm run dev
```
The server will attempt to bind to `PORT` (default `5173`). If that port is already in use, the server will automatically fall back to an ephemeral port and log the actual bound port. This avoids port collisions during local dev and CI.

4. Build & start for static production
```/dev/null/commands.md#L31-40
npm run build
STATIC_DIR=dist npm run start
```
Note: `build` is a placeholder command in this starter; update `scripts/build.js` or replace with your preferred bundler if you add client code.

Testing

This project uses the Node built-in test runner (Node 18+). The `test` script is configured to run tests via `node --test`.

- Run all tests:
```/dev/null/commands.md#L41-50
npm test
```

- Run a single test file (unit/integration) directly:
```/dev/null/commands.md#L51-60
# Unit-style handler tests
node tests/server.test.js

# Integration test that binds to an ephemeral port and exercises API + static files
node tests/integration/server.integration.test.js
```

Notes about tests
- Unit tests are written so they don't call `.listen()` — they invoke the server's request handler directly where appropriate.
- Integration tests bind to an ephemeral port (`listen(0)`) to avoid port collisions; this ensures CI and local runs are stable.

Linting & formatting
- Lint (fail on warnings):
```/dev/null/commands.md#L61-70
npm run lint
```
- Auto-fix lints:
```/dev/null/commands.md#L71-80
npm run lint:fix
```
- Format with Prettier:
```/dev/null/commands.md#L81-90
npm run format
npm run format:check
```

Continuous Integration
- There is a GitHub Actions workflow at `.github/workflows/ci.yml` that:
  - Checks out the repo
  - Uses Node 18
  - Runs `npm ci`
  - Checks formatting, lints, and runs tests
- Recommended repository settings:
  - Enable branch protection for `main` and require the CI checks to pass before merging.
  - Require PR reviews (1–2) depending on team size.

Environment variables
- `AVIATIONSTACK_API_KEY` — (optional) your AviationStack API key. If omitted, the server will fall back to mock responses.
- `AVIATIONSTACK_BASE_URL` — (optional) override the upstream base URL (default is `https://api.aviationstack.com/v1` in `.env.example`).
- `MOCK_AVSTACK=1` — forces mock responses (useful for offline dev and CI).
- `PORT` — port to attempt to bind to (default `5173`). When the port is occupied the server falls back to an ephemeral port.
- `STATIC_DIR` — directory to serve static files from when starting in production mode.

Best practices & recommendations
- Do not commit secrets. Use `.env.local` and keep `.env*` ignored (already configured).
- For production deployments, set `STATIC_DIR` to your production-built client (for example `dist`).
- If you add integration tests that actually bind ports, always bind to port `0` (ephemeral) during tests and read `server.address().port` for the real port.
- Consider adding a test runner like `vitest` or `jest` if you want richer assertion/reporting features. The built-in Node test runner is a zero-dependency, stable option for simple suites.

Contributing
- Follow Conventional Commits for commit messages (e.g., `feat(...)`, `fix(...)`, `chore(...)`).
- Keep PRs small (< 500 LOC) and include:
  - What changed
  - How to test locally
  - Any relevant screenshots or logs
- See `AGENTS.md` for repository guidelines and testing conventions.

Troubleshooting
- Server fails with `EADDRINUSE` (address in use):
  - The server now handles this by falling back to an ephemeral port. Check logs to find the actual bound port.
  - To explicitly choose a different port:
```/dev/null/commands.md#L91-100
PORT=3000 npm run dev
```
- Tests fail due to Node version:
  - Ensure you are running Node >= 18. Use `node -v` to verify.
- Need to test API behavior without an API key:
  - Set `MOCK_AVSTACK=1` to enable canned responses.

Next steps you might want me to help with
- Add a `README` badge for CI status.
- Add a deploy workflow (GitHub Pages / Netlify) if you'd like to publish the static site.
- Migrate tests to a different runner or add richer test coverage and codecov integration.

License
- Add a `LICENSE` file if you have specific licensing intentions. This starter repo doesn't include a license by default.

Thanks — if you want, I can:
- add a project README badge and expand the `prd.md` into a user-facing roadmap,
- create a simple CONTRIBUTING.md with PR checklists,
- set up a deploy workflow for static hosting.
