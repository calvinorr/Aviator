# Repository Guidelines

## Project Structure & Module Organization
- `prd.md`: Product Requirements Document (current source of truth for scope).
- `.superdesign/`: Design artifacts and iterations.
- `src/`: Application code (proposed). Consider `src/client/` (UI) and `src/server/` (API/game logic).
- `tests/`: Unit/integration tests mirroring `src/` layout.
- `assets/`: Static media (images, sounds, fonts).
- `scripts/`: Dev/build utilities (e.g., data seeding, lint hooks).
- `docs/`: Additional documentation (architecture, runbooks).

## Build, Test, and Development Commands
Use whichever toolchain the implementation adopts; prefer adding Make or npm/yarn scripts to standardize.
- Dev server: `make dev` or `npm run dev` — runs the local app with hot reload.
- Build: `make build` or `npm run build` — produces production artifacts.
- Tests: `make test`, `pytest -q`, or `npm test` — executes test suite.
- Lint/format: `make lint`, `ruff . && black .`, or `eslint . && prettier -w .`.
If a command is missing, add a script or Make target with a brief description.

## Coding Style & Naming Conventions
- Indentation: 2 spaces (JS/TS, JSON, YAML); 4 spaces (Python).
- Filenames: `kebab-case` for web assets/components; `snake_case` for Python modules; `PascalCase` for React/Vue components.
- JS/TS: ESLint + Prettier; favor explicit types in TS.
- Python: Ruff + Black; type hints (PEP 484) for public APIs.
- Keep modules focused; avoid files >300 lines where possible.

## Testing Guidelines
- Frameworks: Jest/Vitest (JS/TS) or Pytest (Python).
- Naming: `tests/*.spec.ts` or `tests/test_*.py` matching `src/` paths.
- Coverage: target 80% lines/branches for changed code.
- Fast tests run by default; mark slow/integration tests and gate via CI.

## Commit & Pull Request Guidelines
- Commits: Conventional Commits (e.g., `feat:`, `fix:`, `docs:`). Example: `feat(game): add flight guessing round scoring`.
- PRs: clear description, link issues, include screenshots/CLI output, and “How to test” steps. Keep PRs <500 LOC when feasible.

## Security & Configuration Tips
- Never commit secrets. Copy `.env.example` to `.env.local` and set `AVIATIONSTACK_API_KEY`.
- Keep `.env*` ignored (already configured).
- For offline/dev, set `MOCK_AVSTACK=1` to use stubbed API responses.
- Parametrize API hosts/keys; validate at startup with helpful errors.
