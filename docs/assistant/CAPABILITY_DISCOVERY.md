# Capability Discovery

## Product Surfaces

- primary surface: browser app served locally by the FastAPI backend
- supported companion surface: Microsoft Edge MV3 extension in `extension/`
- validation surface: Windows Edge on Windows 11

## Tooling Surfaces

- WSL-hosted Python backend in `backend/`
- WSL-hosted React/Vite frontend in `frontend/`
- WSL-hosted extension build/test workspace in `extension/`
- Windows PowerShell launcher in `scripts/open_recall_app.ps1`

## AI And Content Rules

- AI is available only for explicit `Simplify` and `Summary`
- browser-native speech is the shipped read-aloud path
- extension behavior is context-only and localhost-backed
