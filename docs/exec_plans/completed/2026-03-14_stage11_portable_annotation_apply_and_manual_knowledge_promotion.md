# ExecPlan: Stage 11 Portable Annotation Apply and Manual Knowledge Promotion

## Summary
- Carry Stage 9 and Stage 10 note entities through portable export, merge-preview, and future apply surfaces without breaking current local-first workflows.
- Add bounded manual promotion paths so saved notes can become graph evidence or study-card seeds only when the user explicitly chooses that action.
- Keep Reader, Recall retrieval, browser note capture, and anchored jump-back stable while extending the shared-core portability layer.

## Public Interfaces
- Extend workspace export and merge-preview contracts so note entities participate in manifests and previews.
- Add explicit user-triggered actions in Recall for promoting a note into graph evidence or a study-card seed.
- Keep existing Reader route semantics and Stage 10 browser note-capture contracts unchanged.

## Implementation Changes
- Shared storage/export:
  - include notes and note anchors in export manifests and portable bundles
  - surface note changes in merge-preview/apply planning without enabling automatic sync resolution yet
- Recall:
  - add bounded manual actions from note detail to:
    - create graph evidence from a note anchor
    - seed a study-card generation flow from a note
  - keep promotions explicit and reviewable rather than automatic
- Validation:
  - preserve deterministic note anchors and current Reader reopen behavior throughout export/apply flows
  - avoid widening scope into tags, notebooks, generic clipping, or cloud sync

## Test Plan
- Backend:
  - export manifest coverage for note entities
  - merge-preview coverage for note additions/updates/deletes
  - manual promotion API coverage for graph/study seeds
- Frontend:
  - Recall note-detail promotion actions
  - note export/apply status visibility where surfaced
  - existing Reader, Recall, and note-jump flows stay green
- Validation:
  - backend `pytest`
  - backend app import check
  - frontend `npm test -- --run`
  - frontend `npm run lint`
  - frontend `npm run build`
  - extension `npm test -- --run`
  - extension `npm run build`
  - targeted localhost smoke for note export/apply preview and manual promotion

## Assumptions
- Recall remains the single product shell and Reader remains an integrated section.
- Stage 10 browser note capture, the Reader shell convergence correction, and the Reader-as-section parity pass are complete before Stage 11 starts.
- Note promotion stays manual, bounded, and source-linked in this milestone.

## Completion
- Stage 11 is complete.
- Shared storage/export now carries `recall_note` entities through workspace export manifests and merge-preview decisions without adding a mutating sync/apply API yet.
- Notes can now be promoted explicitly into:
  - confirmed manual graph nodes backed by note evidence
  - manual study cards that preserve their own scheduling state and survive deterministic study-card regeneration
- Graph rebuilds now preserve note-promoted manual nodes and note-backed mentions across future derived-graph refreshes.
- Recall Notes detail now surfaces:
  - portability status copy for export/merge visibility
  - `Promote to Graph`
  - `Create Study Card`
  - automatic handoff into the Graph and Study sections after successful promotion
- Validation completed with:
  - backend `pytest`
  - backend app import/title check
  - frontend `npm test -- --run`
  - frontend `npm run lint`
  - frontend `npm run build`
  - extension `npm test -- --run`
  - extension `npm run build`
  - targeted real-browser localhost smoke for `note -> promote to graph` and `note -> create study card`
- The real-browser smoke exposed one live issue during implementation:
  - promoted study cards could fall outside the visible-card window and fail to become the active card
  - the frontend now force-injects the freshly promoted manual card into the visible Study queue when needed so the user always lands on the card they just created
