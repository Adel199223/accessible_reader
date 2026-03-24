# Recall Workspace

Local-first Recall workspace for Windows 11. This repository lives in WSL and targets Microsoft Edge on Windows for the main browser companion and read-aloud experience. Reader is an integrated Recall section, not a separate sibling app.

## Read First

- `AGENTS.md`
- `BUILD_BRIEF.md`
- `docs/ROADMAP.md`
- `docs/ROADMAP_ANCHOR.md`
- the latest active ExecPlan in `docs/exec_plans/active/`

## Harness

- `agent.md` is the short Codex runbook for this repo.
- `docs/assistant/INDEX.md` is the lightweight assistant routing map.
- `docs/assistant/templates/CODEX_PROJECT_BOOTSTRAP_PROMPT.md` stays on-demand only for explicit harness/bootstrap prompt work.

This project is optimized for:

- Recall-first document search, graph review, and study flows
- dyslexia-friendly reading defaults inside the integrated Reader
- ADHD-considerate chunking and focus modes
- browser-native read aloud in Microsoft Edge
- local parsing, storage, and reflow
- snapshot-based public article webpage import
- AI only for explicit `Simplify` and `Summary` actions

## Stack

- Frontend: React + Vite + TypeScript
- Backend: FastAPI + Python 3.11
- Storage: SQLite + FTS5

## Project Layout

- `frontend/` - React app
- `backend/` - FastAPI API, parsers, storage, AI transforms
- `docs/` - roadmap, anchor, and milestone plans

## Local Development

### Backend (WSL)

```bash
cd backend
~/.local/bin/python3.11 -m venv .venv
source .venv/bin/activate
pip install -e .[dev]
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Frontend (WSL)

```bash
cd frontend
npm install
npm run dev
```

Frontend defaults to `http://127.0.0.1:5173` and proxies API requests to `http://127.0.0.1:8000`.

### Open The App From Windows

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\open_recall_app.ps1
```

The launcher is the default repo workflow for opening the app on this machine:

- it reuses the backend only when both `/api/health` and `/recall` are healthy
- it builds `frontend/dist` first when the backend-served Recall shell is missing
- it opens the backend-served app in Microsoft Edge through the repo-owned Playwright path instead of shell browser commands

Optional smoke overrides:

- `RECALL_OPEN_APP_URL`
- `RECALL_OPEN_APP_HEADLESS=1`
- `RECALL_OPEN_APP_EXIT_AFTER_LOAD=1`
- `RECALL_OPEN_APP_PLAYWRIGHT_HARNESS`

## Current Scope

- Recall library with local search, graph review, study cards, and notes
- Reader route for paste text, local files, and public article imports
- `Original`, `Reflowed`, `Simplified`, and `Summary` views inside Reader
- Sentence-highlighted browser read aloud and source-linked notes
- Local TTS is intentionally deferred and should remain a future roadmap item

## Templates

- `docs/assistant/templates/CODEX_PROJECT_BOOTSTRAP_PROMPT.md` is included as a reusable harness/bootstrap template for future Codex documentation bootstraps when explicitly requested.
