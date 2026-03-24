# Recall Workspace

Browser-first local-first Recall workspace for Windows 11. This repository lives in WSL, serves the main Recall experience through the local browser app, and supports a real Microsoft Edge browser companion for context handoff and note-aware flows. Reader is an integrated Recall section, not a separate sibling app.

## Read First

- `AGENTS.md`
- `BUILD_BRIEF.md`
- `docs/ROADMAP.md`
- `docs/ROADMAP_ANCHOR.md`
- the latest active ExecPlan in `docs/exec_plans/active/`

## Harness

- `agent.md` is the short Codex runbook for this repo.
- `docs/assistant/INDEX.md` is the lightweight assistant routing map.
- `docs/assistant/HARNESS_PROFILE.json` is the repo-local profile input for the profile-driven harness.
- `docs/assistant/runtime/BOOTSTRAP_STATE.json` is the current resolved harness state preview.
- `docs/assistant/templates/` is the vendored reusable source of truth for harness maintenance.

This project is optimized for:

- Recall-first document search, graph review, and study flows
- dyslexia-friendly reading defaults inside the integrated Reader
- ADHD-considerate chunking and focus modes
- browser-native read aloud in Microsoft Edge
- a real Edge browser companion for local context lookup and handoff
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
- `extension/` - Edge browser companion
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

### Extension (WSL)

```bash
cd extension
npm install
npm test -- --run
npm run build
```

The extension is a supported browser companion surface. Keep it context-only unless the user explicitly reopens current-tab import or wider capture scope.

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
- Edge browser companion for localhost-backed browser context and handoff
- `Original`, `Reflowed`, `Simplified`, and `Summary` views inside Reader
- Sentence-highlighted browser read aloud and source-linked notes
- Local TTS is intentionally deferred and should remain a future roadmap item

## Templates

- `docs/assistant/templates/CODEX_PROJECT_BOOTSTRAP_PROMPT.md` remains an on-demand reusable bootstrap template.
