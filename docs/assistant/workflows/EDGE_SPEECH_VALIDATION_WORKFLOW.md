# Edge Speech Validation Workflow

## What This Workflow Is For
Use this workflow for Windows Edge validation of read-aloud behavior, sentence highlighting, auto-scroll, saved progress, and related frontend fixes.

## Expected Outputs
- Manual validation result for the current Edge reading flow.
- Any blocking speech or progress issue reduced to a concrete frontend fix.
- Targeted frontend tests updated when speech behavior changes.

## When To Use
- The task touches `speechSynthesis`, voice selection, sentence highlighting, keyboard shortcuts, or progress restore.
- The user asks to validate the app in Windows Edge.
- Stabilization work needs a real-browser reading pass before code changes are finalized.

## What Not To Do
Don't use this workflow to choose roadmap priority or document milestone status.
Instead use `docs/assistant/workflows/ROADMAP_WORKFLOW.md`.

## Primary Files
- `frontend/src/App.tsx`
- `frontend/src/hooks/useSpeech.ts`
- `frontend/src/components/ReaderSurface.tsx`
- `frontend/src/lib/segment.ts`

## Minimal Commands
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/backend && . .venv/bin/activate && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000'`
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm run dev -- --host 127.0.0.1'`
- Launch Windows Edge against `http://127.0.0.1:5173`

## Targeted Tests
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm test'`
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm run lint'`
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm run build'`

## Failure Modes and Fallback Steps
- If Edge manual validation is unavailable, state that clearly and fall back to targeted automated browser checks plus code inspection.
- If speech voices differ from the product policy, fix the selection and fallback logic before polishing copy.
- If highlight or progress behavior is inconsistent, add or update focused frontend tests before broad validation.

## Handoff Checklist
- Import, speech controls, sentence navigation, auto-scroll, and progress restore have been checked.
- AI-only modes remain opt-in and respect missing `OPENAI_API_KEY` state.
- Any remaining manual-only gaps are called out explicitly.
