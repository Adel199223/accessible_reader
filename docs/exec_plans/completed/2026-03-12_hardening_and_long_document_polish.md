# ExecPlan: Hardening and Long-Document Polish

## Purpose
- Continue the roadmap after the interactive Edge stabilization pass is complete.
- Validate longer reading sessions and capture the next highest-impact polish or hardening issue without expanding v1 scope.

## Scope
- In scope:
  - long-document validation in the WSL-hosted app with Windows Edge as the browser target
  - responsiveness, reading-surface polish, and accessibility follow-ups that surface during that validation
  - roadmap/docs updates that record confirmed behavior or deferred work
- Out of scope:
  - backend schema changes unless a frontend-only fix proves insufficient
  - local TTS implementation
  - new AI capabilities or local Q&A expansion

## Assumptions
- Import, reopen, search, settings persistence, progress restore, and interactive Edge speech controls are already validated.
- Browser-native speech remains the shipped read-aloud path for v1.
- The next highest-priority work is hardening behavior with longer documents and polishing any remaining rough edges.

## Milestones
1. Validate longer documents and sustained reading flows in Edge.
2. Fix the highest-priority confirmed hardening or polish issue.
3. Update continuity docs and decide whether the next step is more hardening or repository-promotion planning.

## Detailed Steps
1. Seed or import longer documents that exercise scrolling, restore, and sentence navigation over time.
2. Check for responsiveness, highlight sync, control usability, and any accessibility regressions.
3. Implement only the smallest fix that resolves the confirmed issue.
4. Re-run targeted validation plus frontend lint/test/build.

## Decision Log
- 2026-03-12: Search validation is complete and the interactive Edge control pass is complete.
- 2026-03-12: The next roadmap slice is hardening rather than new feature construction.
- 2026-03-12: Long-document hardening is being validated with a seeded local document and the temporary Windows-side Playwright harness so scroll tracking and progress restore can be checked in real Edge without changing the shipped app.
- 2026-03-12: Long-document Edge validation passed with a fresh seeded document; no additional product defect was confirmed in this pass, so the next step is release-readiness documentation rather than more hardening code changes.

## Validation
- Frontend: `npm test`, `npm run lint`, `npm run build`
- Live app: Windows Edge checks using the existing temporary Playwright harness when real interaction coverage is needed

## Progress
- [x] Milestone one
- [x] Milestone two
- [x] Milestone three

## Surprises and Adjustments
- 2026-03-12: The temporary long-document harness had to seed a fresh unique document each run because saved progress on reused fixtures can hide whether deep-jump scroll behavior is being tested from a clean state.

## Handoff
- Long-document validation is complete with live Edge artifacts showing deep jumps, active-sentence scrolling, progress restore, and keyboard continuation.
- Continue from `docs/exec_plans/active/2026-03-12_release_readiness_and_boundary.md`.
