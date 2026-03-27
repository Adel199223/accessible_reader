# ExecPlan: Stage 656 Post-Stage-655 Home Content-Derived Poster Preview Fidelity Audit

## Summary
- Audit the Stage 655 content-derived poster-preview fidelity pass against the March 25, 2026 Recall homepage screenshot.
- Confirm that wide-desktop `Home` still keeps the Stage 563 structure and the settled Stage 654 poster/layout baseline, but paste, web, and file/document cards now expose richer preview text from stored document content instead of metadata-only hero seams.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - representative paste card
  - representative web card
  - representative file/document card
  - full Home wide-desktop view

## Acceptance
- The audit states clearly whether Stage 655 materially improves source-preview fidelity without reopening shell, rail, toolbar, board-width, add-tile, or lower-card structural work.
- The audit records content-derived hero text for representative paste, web, and file/document cards.
- The audit records preserved Stage 615 width cadence and Stage 617 earlier first-row start while the Stage 655 poster-content pass holds.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 655/656 harness pair
- real Windows Edge audit run against the repo-owned launcher path `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 655/656 files

## Outcome
- Complete locally after the Stage 656 audit and validation ladder.
- The audit confirmed that Stage 655 succeeded overall: wide desktop `Home` keeps the Stage 563 selected-collection rail and day-grouped canvas, keeps the settled poster/layout baseline intact, and now exposes content-derived hero text for representative paste, web, and file/document posters from stored document views instead of relying only on metadata fallback copy.
- Live Edge evidence recorded content-derived hero sources for paste, web, and file/document cards, representative hero text nodes (`Debug import sentence one.`, `Debug harness sentence alpha.`, and `There are classical Sunni scholars who explicitly…`), the file-detail seam `at_tariq_86_pronoun_research_v3.html`, preserved `352px` representative card width, preserved `203.52px` representative card height, preserved the Stage 617 `90.98px` heading top offset and `115.36px` first-row grid top offset, `4` visible toolbar controls, and `0` visible day-group count nodes while stable `Graph` plus original-only `Reader` regression captures stayed green in real Windows Edge.
- The next honest `Home` move shifts away from chrome and metadata-only poster polish toward actual thumbnail/media acquisition if product work reopens again.
