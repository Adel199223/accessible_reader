# ExecPlan: Stage 51 Recall Study Sidebar And Queue Compression Second Pass

## Summary
- Return to browse-mode Study with a bounded second pass now that Home is no longer the clearest benchmark blocker after Stage 50.
- Reduce left-rail queue/support weight and simplify supporting review chrome without reopening backend, routing, or focused Study behavior.
- Preserve the centered review task, local FSRS state, evidence grounding, and explicit Reader reopen flows.

## Goals
- Make Study browse mode feel less like a dashboard and more like one streamlined review surface.
- Compress or demote the queue/status/filter support so the main review task stays visually dominant.
- Keep focused reader-led Study work stable unless a direct regression is uncovered.

## Scope
- `frontend/src/components/RecallWorkspace.tsx`
- supporting Study-focused styles, helpers, and targeted tests
- `docs/ROADMAP.md`
- `docs/ROADMAP_ANCHOR.md`
- `docs/assistant/APP_KNOWLEDGE.md`
- `docs/assistant/manifest.json`
- `docs/ux/recall_benchmark_matrix.md`
- one repo-owned Edge screenshot harness plus fresh Study/spot-check artifacts

## Out Of Scope
- backend or storage changes
- Home or Graph rewrites beyond regression checks
- Add Content modal redesign
- Reader route, note-anchor, or browser-companion contract changes

## Implementation Questions
- Can the browse-mode Study queue/support rail compress into a lighter summary block without losing filter access?
- Can the active review card and step journey carry more of the page hierarchy while metadata and supporting counts recede?
- Can source evidence remain nearby without recreating the older multi-panel dashboard feel?

## Validation
- Capture fresh localhost screenshots for Study browse plus spot-check Home, Graph, and focused Study regressions.
- Run targeted frontend coverage for the touched Study behavior.
- Run `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- Run `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- Run the repo-owned Windows Edge screenshot harness for Stage 51.

## Assumptions
- Study is now the highest-value benchmark mismatch after Stage 50, so the next pass should stay tightly bounded to sidebar/queue compression and supporting chrome cleanup.
- Stage 49 Home framing and Stage 45 Graph framing are close enough to preserve unless Stage 51 exposes a regression.
