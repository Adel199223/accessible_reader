# Roadmap Anchor

Persistent continuity anchor for future chats and handoffs.

## Default Meaning Of "Roadmap"

- Unless explicitly redirected, `roadmap`, `master plan`, and `next milestone` mean the active plan for this accessible reader project.
- If a task deviates for a blocker or correction, record it and return to the roadmap afterward.

## Current State

As of 2026-03-12, the project scaffold includes:

- React + Vite frontend shell
- FastAPI backend shell
- SQLite storage with document, view, progress, settings, and FTS tables
- local import and parsing for TXT, Markdown, HTML, DOCX, and text-based PDF
- deterministic `Original` and `Reflowed` views
- Edge-first browser speech integration with sentence highlighting
- OpenAI-backed `Simplify` and `Summary` transform path with local cache hooks

## Current Limits

- local TTS is intentionally deferred and must remain a future milestone
- scanned or image-only PDFs are detected and rejected instead of OCR'd
- OpenAI transforms require a configured `OPENAI_API_KEY`
- future providers and future chat/Q&A are intentionally deferred

## Next Milestone

Stabilize and validate the v1 localhost app:

- run backend and frontend tests
- manually validate Edge read aloud and sentence highlighting
- refine long-document behavior and UI polish
- decide whether to promote this subproject into its own repository

## Resume Checklist

1. Read `docs/ROADMAP.md`.
2. Read this anchor.
3. Open the active ExecPlan for the current milestone.
4. Verify backend and frontend startup still work locally.
5. Continue from the next unchecked milestone item.
