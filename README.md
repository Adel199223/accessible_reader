# Accessible Reader

Localhost-first reading assistant for Windows 11. This repository is intended to live in WSL and target Microsoft Edge on Windows for the main browser and read-aloud experience.

## Read First

- `AGENTS.md`
- `BUILD_BRIEF.md`
- `docs/ROADMAP.md`
- `docs/ROADMAP_ANCHOR.md`

This project is optimized for:

- dyslexia-friendly reading defaults
- ADHD-considerate chunking and focus modes
- browser-native read aloud in Microsoft Edge
- local parsing, storage, and reflow
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

## Current Scope

- Paste text and upload local files
- Local library with search and reopen support
- `Original`, `Reflowed`, `Simplified`, and `Summary` views
- Sentence-highlighted browser read aloud
- Local TTS is intentionally deferred and should remain a future roadmap item

## Templates

- `docs/assistant/templates/CODEX_PROJECT_BOOTSTRAP_PROMPT.md` is included as a reusable harness/bootstrap template for future Codex documentation bootstraps.
