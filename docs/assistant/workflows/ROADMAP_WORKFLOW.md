# Roadmap Workflow

## What This Workflow Is For
Use this workflow for roadmap-driven product work, milestone continuation, and bounded detours that must return to the roadmap afterward.

## Expected Outputs
- Active ExecPlan is current.
- Roadmap and anchor reflect any detour or milestone state change.
- Targeted validation list matches the files and behavior touched.

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
- the latest active ExecPlan in `docs/exec_plans/active/`

## Minimal Commands
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader && git status --short --branch'`
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm test'`
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm run lint'`
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm run build'`
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/backend && . .venv/bin/activate && pytest'`

## Targeted Tests
- Frontend checks for frontend-only roadmap work.
- Backend `pytest` only when backend files are touched.
- Manual Windows Edge validation when the milestone includes speech or reading behavior.

## Failure Modes and Fallback Steps
- If the active plan is already complete, move it to `docs/exec_plans/completed/` and create a new active plan before proceeding.
- If a blocker forces a detour, log it in the active ExecPlan and `docs/ROADMAP_ANCHOR.md`, then return to the next milestone item.
- If roadmap docs conflict with source code, trust the source code and update the docs.

## Handoff Checklist
- Active ExecPlan points at the current milestone.
- Roadmap docs reflect current state and next work.
- Validation status is recorded in the user-facing handoff.
