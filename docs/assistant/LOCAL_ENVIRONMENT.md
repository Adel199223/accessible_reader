# Local Environment

## Paths And Ports

- repo root: `/home/fa507/dev/accessible_reader`
- backend health: `http://127.0.0.1:8000/api/health`
- live Recall route: `http://127.0.0.1:8000/recall`
- frontend dev server: `http://127.0.0.1:5173`
- extension default backend: `http://127.0.0.1:8000`

## Default Launch Flow

- use `scripts/open_recall_app.ps1` from Windows PowerShell
- the launcher reuses a healthy backend when possible
- the launcher builds the frontend shell when needed
- the launcher opens the app through the repo-owned Edge path

## Environment Notes

- keep backend/frontend/extension commands in WSL
- keep live browser validation in Windows Edge
- set `OPENAI_API_KEY` only when testing `Simplify` or `Summary`
