# Build Brief: Local-First Accessible Reading Assistant

## Summary

Build a standalone localhost-first web app for Windows 11 that turns pasted text and uploaded documents into a dyslexia-friendly, ADHD-considerate reading experience. Keep as much of the pipeline local as possible, use browser-native read aloud first, highlight the current sentence while reading, and reserve AI for high-value transforms such as `Simplify` and `Summary`.

## Product Goal

- This is a new standalone project.
- The app helps a user read difficult content more easily, not act as a general-purpose assistant.
- Optimize first for Microsoft Edge on Windows 11.
- Keep the app useful without AI for import, parsing, reflow, reading controls, storage, search, and reopen support.
- Defaults should favor low friction, calm structure, strong scan order, and readability for dyslexic and ADHD-prone users.

## Architecture

- Frontend: React + Vite + TypeScript
- Backend: FastAPI + Python 3.11
- Storage: SQLite with FTS5
- Repo/toolchain home: WSL
- Primary browser validation target: Windows Edge

## Core Experience

- Accept pasted text and local file uploads.
- Support TXT, Markdown, HTML, DOCX, and text-based PDF.
- Include a small local library with search, reopen support, and reading-progress memory.
- Provide four modes:
  - `Original`
  - `Reflowed`
  - `Simplified`
  - `Summary`
- Keep `Original` and `Reflowed` local and deterministic.
- Make read aloud sentence-based, with visible sentence highlighting and auto-scroll.
- Include readable defaults for font preset, size, spacing, width, contrast, and focus mode.

## Speech And TTS Policy

- Use browser `speechSynthesis` first.
- Curate voice selection to `Ava Multilingual Natural`, `Andrew Multilingual Natural`, then `Default voice`.
- Sentence highlighting is required in v1.
- Local TTS is intentionally deferred and should be described as `coming soon`, not partially shipped.

## AI Policy

- AI runs only when the user explicitly chooses `Simplify` or `Summary`.
- Do not auto-call AI on document open.
- Strip boilerplate and irrelevant markup before AI transforms.
- Cache transform outputs by document hash, section hash, transform type, settings, and model.
- Keep the provider abstraction ready for cheaper or local models later, but do not optimize for them before the OpenAI path is solid.

## Out Of Scope For V1

- authentication
- cloud sync
- collaboration
- live URL import
- OCR for scanned PDFs
- general assistant chat
- document Q&A
- local TTS
- Whisper-based transcription features
- GPU dependency

## Roadmap Discipline

- Keep `docs/ROADMAP.md` as the active project plan.
- Keep `docs/ROADMAP_ANCHOR.md` as the continuity file for future chats.
- Use ExecPlans for major work under `docs/exec_plans/active/`.
- If you detour for a blocker or correction, record it and then return to the roadmap.

## Baseline Validation

- Frontend:
  - `npm run lint`
  - `npm run build`
  - `npm test`
- Backend:
  - `pytest`
  - `python -c "from app.main import app; print(app.title)"`
