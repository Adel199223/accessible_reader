# ExecPlan: Stage 17 Post-Stage-16 Recall UX Refresh

## Summary
- Stages 13 through 16 delivered the right structural correction:
  - global add/search flow
  - focused Reader split view
  - denser shared shell
  - denser Library/Notes surfaces
  - denser Graph/Study review surfaces
- The Stage 17 audit confirms the biggest remaining UX gap is no longer density or shell identity.
- The highest-friction remaining break is workspace continuity: section filters, selected items, and detail context remain too ephemeral across search, Reader handoff, and route changes, so the product still feels less like one continuous Recall workspace than it should.

## Audit Findings
- `RecallWorkspace` still owns most section state locally:
  - Library filter plus selected document
  - Notes selected document, note search, and selected note
  - Graph selected node
  - Study filter plus targeted card selection
- Because Recall and Reader still switch at the route level, Recall section detail state gets recreated after Reader handoff instead of behaving like a persistent working set.
- Search landings are directionally correct, but they currently prioritize "open the right destination" over "land inside the right saved context and keep nearby next actions obvious."
- The current UI is dense enough to move on. Another generic density pass would add less value than making the workspace remember where the user was and why they went there.

## Evidence
- Existing live artifacts from Stages 13 through 16:
  - focused Reader split-view smoke
  - Notes density and anchored reopen smoke
  - Graph and Study evidence-handoff smoke
- Current frontend architecture inspection:
  - `frontend/src/App.tsx`
  - `frontend/src/components/RecallWorkspace.tsx`
  - `frontend/src/components/WorkspaceSearchDialog.tsx`
  - `frontend/src/lib/appRoute.ts`
- User-provided product brief:
  - emphasizes low-friction recall, contextual resurfacing, study continuity, and low admin burden
- Official Recall benchmark signals used directionally:
  - command-style search and clear entry points
  - browse/review flows that feel like one connected workspace rather than isolated tools

## Decision
- Open Stage 18 as a bounded frontend-first continuity slice.
- Stage 18 will focus on workspace continuity and navigation memory instead of widening into new backend systems, new AI scope, or another density-only pass.

## Constraints Carried Forward
- Preserve local-first parsing, storage, search, settings, progress, deterministic reflow, speech behavior, routes, note anchors, and browser-companion handoff.
- Do not reopen deferred scope by default:
  - local TTS
  - OCR for scanned PDFs
  - cloud sync/collaboration
  - chat/Q&A
  - new AI surfaces beyond existing `Simplify` and `Summary`
- Keep the UX-first rule active: preserve behavior and continuity, not mediocre layout decisions.

## Closeout
- Continuity docs now point to Stage 18 as the active milestone.
- No new live localhost pass was required for this audit because the existing Stage 13 through 16 harness artifacts plus the current shell/state architecture were sufficient to isolate the next highest-leverage gap.
