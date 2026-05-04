# Accessible Reader Modernization Health Check ExecPlan

## Status

Docs-only health-check branch in progress on May 4, 2026.

## Intent

Assess whether Accessible Reader needs modernization after the Neuro Map Studio modernization wave, without integrating Neuro Map Studio and without changing product code.

## Scope

- Inspect Accessible Reader stack, frontend architecture, backend architecture, contracts, integration readiness, and test coverage.
- Use Neuro Map Studio only as read-only compatibility context.
- Produce architecture and review artifacts.
- Recommend the next highest-leverage modernization slice.
- Do not edit product code, tests, backend schema, API routes, UI, roadmap anchor, or Neuro Map Studio.

## Findings

- Stack modernization is not needed. Accessible Reader already runs React, Vite, TypeScript, ESLint, Vitest, React Testing Library, FastAPI, Pydantic, SQLite/FTS5, and Playwright scripts.
- Maintainability modernization is warranted because the largest files are aggregation points:
  - `frontend/src/components/RecallWorkspace.tsx`: 25,517 lines.
  - `frontend/src/index.css`: 34,305 lines.
  - `backend/app/storage.py`: 9,032 lines.
  - `backend/app/main.py`: 68 route decorators.
  - `backend/app/models.py`: 115 top-level classes/defs.
- The safest next slice is API/types contract alignment before any large split.

## Deliverables

- `docs/architecture/accessible-reader-modernization-health.md`
- `docs/exec_plans/active/accessible-reader-modernization-health-check.md`
- `/home/fa507/Downloads/accessible-reader-modernization-health-check/`
- `/home/fa507/Downloads/accessible-reader-modernization-health-check-share.zip`

## Validation Plan

- `cd backend && .venv/bin/python -m pytest tests/test_api.py -q`
- `cd frontend && npm exec tsc -- -b --pretty false`
- `cd frontend && npm test -- --run --reporter=dot`
- `cd frontend && npm run build`
- `git diff --check`

## Recommendation

Primary next slice: behavior-preserving API/types contract alignment using FastAPI OpenAPI/Pydantic models, `frontend/src/types.ts`, and `frontend/src/api.ts`.

Fallback: CSS token/base/feature split if the contract slice is blocked or too risky.

Defer backend `storage.py` split, backend `models.py` split, route splitting, and `RecallWorkspace.tsx` decomposition until contract drift checks and targeted fixtures exist.
