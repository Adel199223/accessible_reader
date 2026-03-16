# Roadmap Workflow

## What This Workflow Is For
Use this workflow for roadmap-driven product work, milestone continuation, and bounded detours that must return to the roadmap afterward.

## Expected Outputs
- Active ExecPlan is current.
- Roadmap and anchor reflect any detour or milestone state change.
- Targeted validation list matches the files and behavior touched.
- When the milestone is UI-benchmark-sensitive, the benchmark matrix and screenshot artifacts are current enough to guide the next slice.
- Assistant routing docs stay aligned with the current milestone and validation strategy after the product/docs work lands.

## When To Use
- The user says `roadmap`, `master plan`, or `next milestone`.
- The task changes milestone status, continuity, or roadmap-adjacent docs.
- The work spans multiple files and needs an ExecPlan.

## What Not To Do
Don't use this workflow for isolated Edge speech debugging once the milestone is already chosen.
Instead use `docs/assistant/workflows/EDGE_SPEECH_VALIDATION_WORKFLOW.md`.

## Primary Files
- `BUILD_BRIEF.md`
- `docs/ROADMAP.md`
- `docs/ROADMAP_ANCHOR.md`
- `docs/ux/recall_benchmark_matrix.md` for Recall shell and surface work
- the latest active ExecPlan in `docs/exec_plans/active/`

## Minimal Commands
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader && git status --short --branch'`
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm run lint'`
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm run build'`
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/backend && .venv/bin/python -m pytest'`
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/backend && .venv/bin/python -c "from app.main import app; print(app.title)"'`

## Targeted Tests
- Frontend checks for frontend-only roadmap work.
- Backend `pytest` only when backend files are touched.
- Manual Windows Edge validation when the milestone includes speech or reading behavior.
- Screenshot-based browser validation when the milestone changes Recall shell or top-level surface UI.
- Prefer targeted Vitest coverage before broad `npm test -- --run` sweeps when UI slices touch Recall shell or surface work, then use the broad `frontend/src/App.test.tsx` pass when shell or route continuity changed.
- Keep the repo-owned Edge screenshot harness as the visual truth source for Recall shell and surface work even when the broad App integration pass is green.
- If the broad `frontend/src/App.test.tsx` file ever appears to stall again, inspect App-level callback identity and `ReaderWorkspace` effect dependencies before treating it as a Vitest-only failure; the last real stall was a render/effect loop in app shell handoff props.

## Failure Modes and Fallback Steps
- If the active plan is already complete, move it to `docs/exec_plans/completed/` and create a new active plan before proceeding.
- If a blocker forces a detour, log it in the active ExecPlan and `docs/ROADMAP_ANCHOR.md`, then return to the next milestone item.
- If roadmap docs conflict with source code, trust the source code and update the docs.
- If Windows-side `npm` or `node` calls behave unreliably on the UNC workspace path, rerun them through `wsl.exe bash -lc ...` or use the repo-owned Windows Playwright harness only for Edge screenshots.

## Handoff Checklist
- Active ExecPlan points at the current milestone.
- Roadmap docs reflect current state and next work.
- Validation status is recorded in the user-facing handoff.
- If the work is benchmark-driven UI work, the benchmark matrix and latest screenshot artifacts are referenced in the handoff docs.
- `docs/assistant/APP_KNOWLEDGE.md`, `docs/assistant/manifest.json`, `docs/assistant/INDEX.md`, and `agent.md` stay in sync with the current milestone and workflow constraints after assistant-doc sync.
