# ExecPlan: Stage 21 Post-Stage-20 Recall UX Refresh

## Summary
- Stages 13 through 20 corrected the biggest structural UX gaps:
  - shared add/search entry points
  - Reader-as-section shell alignment
  - denser Library, Notes, Graph, and Study surfaces
  - workspace continuity and recent-work visibility
  - lighter shell and detail context after the Stage 20 compression pass
- The next step should not guess past those changes.
- The right bounded follow-up is to reassess the live workspace after the compression correction, compare it against the product brief and Recall benchmark, and choose the next high-leverage slice from current evidence.

## Audit Focus
- Compare current `Library`, `Graph`, `Study`, `Notes`, and `Reader` workflows after Stage 20:
  - entry into work
  - orientation once inside work
  - nearby actions
  - handoff quality between sections
  - search and reopen continuity
- Use these inputs together:
  - live artifacts from Stages 13 through 20
  - the current frontend architecture and continuity model
  - the user-provided product brief
  - the original Recall app as a directional workflow benchmark

## Questions To Answer
- After the compression pass, what is now the highest-friction remaining workflow break?
- Is the next highest-value slice:
  - another shell/workflow correction
  - a section-specific UX correction
  - or a return to feature expansion on top of the corrected shell?
- Which next slice is the smallest change that materially improves Recall-quality UX without reopening deferred systems?

## Constraints
- Preserve local-first parsing, storage, search, settings, progress, deterministic reflow, speech behavior, note anchors, and browser-companion handoff.
- Keep `/recall` and `/reader?document=...&sentenceStart=...&sentenceEnd=...` stable.
- Do not reopen deferred scope by default:
  - local TTS
  - OCR for scanned PDFs
  - cloud sync/collaboration
  - chat/Q&A
  - new AI surfaces beyond existing `Simplify` and `Summary`

## Expected Output
- A short UX audit that identifies the next highest-leverage bottleneck from the current live product state.
- A concrete recommendation for the next bounded milestone, with reasons grounded in current artifacts rather than stale assumptions.
- Continuity docs updated so the chosen next slice becomes the active roadmap milestone.

## Audit Findings
- The highest-friction remaining break is search continuity, not another generic shell-density issue.
- The current product still splits discovery across two overlapping surfaces:
  - the shell-level `Search` dialog in `frontend/src/components/WorkspaceSearchDialog.tsx`
  - the Library-only `Hybrid retrieval` card inside `frontend/src/components/RecallWorkspace.tsx`
- Those two surfaces overlap in purpose but not in behavior:
  - the shell dialog searches sources, notes, and retrieval hits from anywhere, but it is explicitly sessionless and closes on every handoff
  - the Library retrieval card searches grounded Recall hits, but only inside the Library section and without becoming the shared search surface for the rest of the workspace
- Because search state is still local and terminal, the user can find the right destination but cannot easily keep the query, compare nearby hits, reopen the same result set, or continue refining after landing in Notes or Reader.
- That friction now matters more than the remaining shell chrome because the rest of the product already preserves continuity better than search itself does.

## Evidence
- Current architecture:
  - `frontend/src/App.tsx` keeps `searchOpen` and the dialog session token locally, reopening search as a fresh shell action instead of a remembered working set
  - `frontend/src/components/WorkspaceSearchDialog.tsx` closes on every open action and does not preserve a shared result/detail state
  - `frontend/src/components/RecallWorkspace.tsx` still hosts a separate Library-only `Hybrid retrieval` search surface
- Live artifacts after Stage 20:
  - Reader and Notes are now lighter and more continuous, which makes the remaining search discontinuity stand out more clearly
  - the shell still routes users through a jump-oriented search flow rather than a reusable search work surface
- Product-direction inputs:
  - the user brief explicitly emphasizes better search continuity
  - the Recall benchmark remains directionally consistent with a single knowledge base flow rather than multiple disconnected search entry points

## Decision
- Open Stage 22 as a bounded search-first UX correction.
- Stage 22 should unify workspace search behavior before another density pass or another feature tier.
- The next slice should preserve current routes and local-first behavior while turning search into a remembered working set rather than a disposable jump dialog.

## Closeout
- Completed on 2026-03-14.
- Outcome:
  - identified search continuity and duplicated search surfaces as the highest-leverage remaining workflow gap after the Stage 20 compression pass
  - selected Stage 22 to unify workspace search and preserve result/detail continuity across section and Reader handoffs
  - updated roadmap continuity so the next implementation slice is chosen from current product evidence instead of stale pre-Stage-20 assumptions
