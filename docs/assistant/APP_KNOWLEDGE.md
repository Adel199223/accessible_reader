# Assistant App Knowledge

Bridge summary only. Canonical project status and policy live in `BUILD_BRIEF.md`, `docs/ROADMAP.md`, `docs/ROADMAP_ANCHOR.md`, and the active ExecPlan.

## Snapshot
- Local-first Recall workspace for Windows 11, with the repo and toolchain living in WSL.
- Frontend: React + Vite + TypeScript.
- Backend: FastAPI + Python 3.11.
- Storage: SQLite with FTS5.

## Current Product Shape
- Imports pasted text, public article webpage URLs, and local TXT, Markdown, HTML, DOCX, and text-based PDF files.
- Stores a small local library with search, reopen support, settings, and reading-progress memory.
- Stores webpage imports as local HTML snapshots and reopens them from the saved snapshot rather than refetching live.
- Uses `Recall` as the product shell with `Reader` presented as a shared workspace section rather than a sibling app.
- Uses one unified workspace section row: `Library`, `Graph`, `Study`, `Notes`, and `Reader`.
- Reopens the last document and reading mode from browser-local storage, with backend last-session fallback when local state is missing.
- Supports `Original`, `Reflowed`, `Simplified`, and `Summary` document modes.
- Keeps `Original` and `Reflowed` local and deterministic.
- Uses browser-native speech with sentence highlighting as the shipped read-aloud path.
- Uses the shared `workspace.db` backend storage with reader-compatible routes kept stable.
- Includes Recall keyword search, hybrid retrieval, graph review, study cards, Markdown export, source-linked notes, MV3 browser-context resurfacing, browser note capture, portability/export groundwork, and integrity/benchmark tooling.

## Active Constraints
- Windows Edge is the primary browser validation target.
- Local TTS is deferred and should remain `coming soon`.
- AI is opt-in only and limited to `Simplify` and `Summary`.
- Stage 14 is the active milestone: Recall density and contextual Reader polish.
- Future work should preserve local-first behavior, routes, note anchors, browser-companion handoff, and reading continuity, but should not preserve the current UI arrangement when a better Recall-quality workflow is available.
- Treat the original Recall app as a directional benchmark for workflow and information hierarchy, not as a pixel-perfect copy target.
- The current highest-priority UX gaps are reducing persistent shell chrome, making Reader context more useful at a glance, and tightening narrower-screen fallbacks without losing Stage 13's workflow gains.

## Main Entry Points
- Frontend shell: `frontend/src/App.tsx`
- Speech behavior: `frontend/src/hooks/useSpeech.ts`
- Reader rendering: `frontend/src/components/ReaderSurface.tsx`
- API entrypoint: `backend/app/main.py`
