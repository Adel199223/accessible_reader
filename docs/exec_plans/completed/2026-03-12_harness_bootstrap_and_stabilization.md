# ExecPlan: Harness Bootstrap and V1 Stabilization

## Purpose
- Add a minimal assistant harness so future Codex chats can route to the right project docs quickly.
- Record the bounded harness detour and return immediately to the active product roadmap.
- Validate and stabilize the Edge-first reading experience without expanding scope.

## Scope
- In scope:
  - minimal assistant docs and routing manifest
  - roadmap and continuity updates for the harness detour
  - Edge-focused validation of import, library, reading, progress, and speech flows
  - targeted frontend fixes that emerge from stabilization
- Out of scope:
  - validator tooling
  - generic cross-project docs scaffolding
  - local TTS implementation
  - new AI features beyond existing `Simplify` and `Summary`
  - push, release, or deployment work

## Assumptions
- Existing product truth remains in `BUILD_BRIEF.md`, `docs/ROADMAP.md`, `docs/ROADMAP_ANCHOR.md`, and `docs/exec_plans/`.
- The harness should stay small and project-specific, reusing existing docs instead of duplicating them.
- Windows Edge remains the primary manual validation target while WSL remains the repo and toolchain home.

## Milestones
1. Correct ExecPlan state and add the bounded harness docs.
2. Update roadmap continuity so the detour is logged and stabilization is the active milestone.
3. Run Edge-focused stabilization and fix any blocking frontend issues.

## Detailed Steps
1. Move the completed initial build ExecPlan into `docs/exec_plans/completed/`.
2. Add `agent.md`, assistant bridge docs, a routing manifest, and focused workflows for roadmap continuation and Edge speech validation.
3. Update `AGENTS.md` and `README.md` only enough to route future chats into the harness.
4. Update roadmap docs to record the harness bootstrap and active stabilization milestone.
5. Validate the app from WSL and in Windows Edge, then implement the highest-priority stabilization fix.
6. Run targeted checks and capture the final validation state in the roadmap continuity docs.

## Decision Log
- 2026-03-12: Keep the assistant harness bounded and specific to the accessible reader repo.
- 2026-03-12: Reuse existing roadmap and build docs as canonical sources instead of adding duplicate assistant-side canonicals.
- 2026-03-12: If manual Edge validation does not reveal a worse defect, prioritize aligning speech voice behavior with the stated product policy.

## Validation
- Harness: parse `docs/assistant/manifest.json` and confirm referenced paths exist.
- Frontend: `npm test`, `npm run lint`, `npm run build`
- Backend: `pytest` only if backend files change during stabilization
- Manual: Windows Edge validation for import, speech, progress, and AI opt-in gating

## Progress
- [x] Milestone one
- [x] Milestone two
- [x] Milestone three

## Surprises and Adjustments
- 2026-03-12: The prior active ExecPlan was already complete, so it was moved to `completed/` before starting this pass.
- 2026-03-12: Full interactive Edge automation was not available on this machine because `msedgedriver` is absent and the shared Chrome session blocked the alternate Playwright path. Validation used live backend/frontend startup, real Edge screenshots, API-seeded state, and targeted frontend tests instead.

## Handoff
- This pass completed the bounded harness bootstrap, roadmap logging, speech voice-policy fix, and initial Edge stabilization checks.
- Next work should continue from remaining interactive Edge validation gaps, long-document polish, or the next roadmap hardening item.
