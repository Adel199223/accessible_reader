# ExecPlan: Stage 6 Portability and Accessibility Integration

## Summary
- Improve Markdown round-trip quality so imports and exports preserve more document structure without destabilizing the current reader flow.
- Unify shared reader and future converter document-variant contracts around a richer deterministic block model and variant metadata contract.
- Carry common reading-session and accessibility metadata in shared storage so Reader can restore more state from the workspace instead of relying only on browser-local state.

## Public Interfaces
- Extend shared view contracts without renaming existing routes:
  - `ViewBlock.metadata`
  - `DocumentView.variant_metadata`
- Extend reader document/session contracts in-place:
  - `DocumentRecord.last_reader_session`
  - `ProgressUpdate.summary_detail`
  - `ProgressUpdate.accessibility_snapshot`
- Keep `/api/documents*`, `/api/settings`, `/api/recall/*`, and the current reader shell routes stable.

## Implementation Changes
- Planning/docs:
  - Replace this Stage 6 placeholder with a concrete contract before implementation starts.
  - Move this plan to completed only after backend, frontend, and portability validation is green.
  - Advance roadmap state to Stage 7 only after Stage 6 validation is complete.

- Backend shared-core:
  - Extend `ViewBlock` with metadata so block-level structure can survive import, reflow, export, and future converter use.
  - Extend `DocumentView` with deterministic `variant_metadata` such as structure counts, word counts, reading-time estimates, and a variant contract version.
  - Improve Markdown and HTML parsing to preserve:
    - ordered versus unordered lists
    - list nesting depth
    - quote depth
    - heading levels
  - Improve Markdown export so it re-emits ordered lists, nested lists, headings, and quotes from block metadata rather than flattening everything to paragraphs and unordered bullets.
  - Carry the shared variant metadata through local `Original`, `Reflowed`, and opt-in AI views.

- Reading-session and accessibility metadata:
  - Extend `reading_sessions` with session metadata storage through migration-safe schema handling.
  - Save optional `summary_detail` and an accessibility snapshot alongside progress updates.
  - Surface the latest reader session metadata on `DocumentRecord` so Reader can restore from shared storage when browser-local session state is absent.
  - Keep current reader settings routes and speech policy unchanged.

- Frontend Reader integration:
  - Update Reader types to consume the richer block and session contracts.
  - Use backend `last_reader_session` as a fallback when local reader session storage is empty or missing a document.
  - Persist current `summaryDetail` and a reader accessibility snapshot when saving progress.
  - Render ordered and nested lists semantically in Reader from block metadata instead of flattening every list into one unordered group.

## Test Plan
- Backend:
  - Markdown import preserves ordered list, nested list, quote, and heading metadata
  - reflow preserves block metadata while splitting long paragraphs
  - Markdown export re-emits structured lists and quotes with provenance
  - progress updates persist `summary_detail` and accessibility metadata in reading sessions
  - `DocumentRecord.last_reader_session` surfaces the latest shared reader session
- Frontend:
  - Reader restores from backend last-session metadata when local storage is empty
  - Reader progress saves include `summary_detail` and accessibility snapshot fields
  - Reader renders ordered and nested lists semantically from block metadata
  - existing Recall shell and Reader tests continue to pass
- Validation:
  - frontend `npm test -- --run`
  - frontend `npm run lint`
  - frontend `npm run build`
  - backend `.venv/bin/python -m pytest`
  - backend `.venv/bin/python -c "from app.main import app; print(app.title)"`
  - one manual Edge smoke pass for structured Markdown rendering and reader-session restore

## Assumptions
- Stage 5 browsing support is stable and should remain unchanged while portability work lands.
- The backend remains the single local service host for Recall, Reader, and future converter surfaces.
- Browser-native speech remains the shipped read-aloud path for v1.
- Local TTS, tab import, sync, and converter-specific UI are still out of scope in this slice.
