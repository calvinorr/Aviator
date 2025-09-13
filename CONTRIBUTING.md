# Contributing

Thank you for contributing to Aviation Game — your work helps this project improve and grow. This document explains how to contribute code, tests, and docs, and describes the workflow and expectations for pull requests (PRs) and commit messages.

Please read and follow these guidelines to make reviews faster and maintain project quality.

---

## Table of contents

- PR checklist
- How to write a good PR
- Commit message guidelines (Conventional Commits)
- Running tests, linting, formatting
- Adding tests
- Branching & PR process
- Style and repository conventions
- Security & secrets
- Contact / questions

---

## PR checklist

Before you open a PR, make sure:

- [ ] Your branch is up to date with `main`.
- [ ] All tests pass locally.
- [ ] Linting passes (no warnings if configured to fail on warnings).
- [ ] Code is formatted according to the repo rules.
- [ ] You added or updated tests for new behaviour or bug fixes.
- [ ] You added or updated documentation (README, PRD, or docs).
- [ ] You did not commit secrets or credentials (see Security section).
- [ ] The PR description explains why the change is needed and how to test it.

When you create the PR, include:

- A short, descriptive title.
- A summary of what changed and why.
- How to test (steps and commands).
- Any relevant screenshots, logs, or example output.
- Link to any related issue(s) if applicable.

---

## How to write a good PR

- Keep PRs focused and small. Try to limit changes to one logical change per PR.
- Include tests for bug fixes and new features.
- If your PR is large, add a clear "How to review" section that points reviewers to important files and the high-level flow.
- Use draft PRs if the work is in progress.

Example PR template checklist you should satisfy (informal):

- What changed — brief bullet list.
- How I tested — commands and observed results.
- Risk / how to rollback.
- Notes for reviewers — specific files or tricky areas.

---

## Commit message guidelines (Conventional Commits)

We follow Conventional Commits. This makes it easier to read change history and automate releases.

Format:
``/dev/null/commands.md#L1-8
<type>(<scope>): <short summary>

<body>           # optional - more details, motivation, links
<footer>         # optional - references to issues, breaking changes
``

Common types:
- `feat:` — a new feature
- `fix:` — a bug fix
- `chore:` — build system or tooling changes
- `docs:` — documentation only changes
- `test:` — adding or updating tests
- `refactor:` — code change that neither fixes a bug nor adds a feature
- `perf:` — performance improvements

Examples:
``/dev/null/commands.md#L9-20
feat(game): add flight-guess scoring
fix(api): handle empty flight_iata query param (400)
test(server): add integration test for static assets
chore(ci): add GitHub Actions workflow for lint + test
``

Notes:
- Keep the subject line <= 72 characters.
- Use the imperative mood (“add”, “fix”) — this aligns with the default commit messages produced by many tools.
- Put additional context in the body if necessary.

---

## Running tests, linting, formatting

Use the project scripts in `package.json`:

- Run all tests:
``/dev/null/commands.md#L21-23
npm test
``

- Lint:
``/dev/null/commands.md#L24-26
npm run lint
``

- Auto-fix linting issues:
``/dev/null/commands.md#L27-29
npm run lint:fix
``

- Format with Prettier:
``/dev/null/commands.md#L30-34
npm run format
npm run format:check
``

If tests or lints fail locally, please fix them before opening the PR. If you need help reproducing CI failures, include logs in your PR and I (or a maintainer) will assist.

---

## Adding tests

- Prefer unit tests that exercise the smallest unit possible.
- For server logic, prefer invoking handlers directly where possible instead of binding to a real network port.
- For integration tests that need to start the server, always bind to an ephemeral port (listen(0)) to avoid port collisions; read the actual `server.address().port` to build requests.
- Put tests under `tests/` mirroring the `src/` structure where helpful.
- Use the existing style: tests use the Node built-in test runner (`node:test`) and `assert`.

Example: start server on ephemeral port in a test (conceptual)
``/dev/null/commands.md#L40-62
const server = createServer({ staticDir: '...' });
await new Promise((resolve, reject) => {
  server.listen(0, resolve);
  server.once('error', reject);
});
const port = server.address().port;
// run fetch requests against http://127.0.0.1:${port}
server.close();
``

Make tests deterministic and fast. Mark anything that is inherently slow or flaky and gate it if necessary.

---

## Branching & PR process

- Branch from `main` for feature work:
``/dev/null/commands.md#L70-76
git checkout -b feat/my-feature
# work...
git add .
git commit -m "feat(...): short description"
git push origin feat/my-feature
``

- Open a PR targeting `main`.
- Ensure CI is green and at least one maintainer reviews the PR before merging.
- Squash or rebase commits as your team prefers. Use meaningful commit messages described above.

Recommended GitHub settings (maintainers):
- Protect `main` branch and require CI checks (lint + test) to pass.
- Require at least 1 reviewer for PRs.
- Optionally enforce signed commits if your team requires it.

---

## Style and repository conventions

- JavaScript / TypeScript:
  - Indentation: 2 spaces (JS/TS).
  - Prefer explicit types in TypeScript.
  - Follow ESLint + Prettier rules in repo.
- Python:
  - Indentation: 4 spaces.
  - Use Ruff + Black style.
- Filenames:
  - `kebab-case` for web assets/components
  - `snake_case` for Python modules
  - `PascalCase` for React/Vue components
- Keep files focused; avoid files > 300 lines where reasonable.

Refer to `AGENTS.md` for more repository-wide conventions.

---

## Security & secrets

- Never commit secrets. Use `.env.local` for local environment variables and ensure `.env*` are in `.gitignore`.
- Add new sensitive keys to `.env.example` only as placeholder names (do not add real values).
- If you accidentally commit a secret:
  - Revoke the secret immediately (rotate credentials).
  - Avoid attempting to "remove" it with a regular commit — use history rewrite only if you understand the consequences, or contact a maintainer to help.
- In code, prefer environment variable configuration and inject secrets at runtime (CI secrets, cloud provider secrets, etc.).

---

## PR Review checklist for reviewers

When reviewing a PR, check:

- [ ] Does the PR do one thing and do it well?
- [ ] Are tests added/updated that cover the change?
- [ ] Do tests pass locally and in CI?
- [ ] Is the code readable and maintainable?
- [ ] Are edge cases and error paths handled?
- [ ] Is any sensitive info exposed?
- [ ] Is documentation updated (README, PRD, examples)?

Leave focused, constructive comments and point to specific lines when possible.

---

## Contact / questions

If you need help:
- Open an issue describing the problem and how to reproduce it.
- Mention maintainers in the issue or PR if urgent.
- For design discussions, a short RFC or design doc in `.superdesign/` or `docs/` helps get aligned early.

---

Thanks for contributing — we appreciate well-tested, well-documented, and well-scoped changes. If you'd like, I can add a PR template and a CODEOWNERS file to streamline reviews.