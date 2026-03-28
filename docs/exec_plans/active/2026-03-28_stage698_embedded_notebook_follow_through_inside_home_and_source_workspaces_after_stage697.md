# ExecPlan: Stage 698 Embedded Notebook Follow-Through Inside Home And Source Workspaces After Stage 697

## Summary
- Continue the queued roadmap immediately after the completed Stage 696/697 Home ergonomics pass with one `Notebook`-only follow-through.
- Keep the Stage 690 placement correction intact, but make the embedded notebook feel native inside `Home` / Library and saved-source workspaces instead of reading like a transplanted standalone `Notes` page.
- Preserve note behavior, local-first CRUD, search handoffs, Reader handoffs, source tabs, Graph/Study promotion, and the hidden `/recall?section=notes` compatibility alias.

## Scope
- Tighten the desktop embedded Notebook workspace inside `Home` / Library:
  - retire the oversized stage-hero feel
  - flatten the browse/detail hierarchy so it reads like a Library-native workbench
  - make note rows feel more like first-class Library items instead of generic compact cards
  - keep `New note` beside `Add` and keep the current search/source selection behavior
- Tighten the source-focused Notebook tab:
  - keep the `Notebook` tab wording and Reader-led split behavior
  - make the notebook browse rail and note detail feel more attached to the source workspace instead of a mini standalone dashboard
  - reduce duplicated chrome and oversized helper framing where it steals attention from the source/Reader context
- Keep `Home`, `Graph`, original-only `Reader`, and `Study` as regression surfaces only.

## Acceptance
- Opening Notebook from `Home` still lands inside the Library workspace, but the resulting surface reads as a native Library workbench rather than a separate full-page Notes product.
- The desktop Notebook browse area, note list, and note detail shell are flatter, calmer, and more integrated than the Stage 697 baseline.
- The source-focused Notebook tab still preserves note editing, Reader reopen, source reopen, and promotion flows, but the view feels more attached to the source workspace and less like a transplanted standalone note page.
- `New note` beside `Add`, the `Notebook` tab wording, global search note handoff, Reader/source note handoff, and the hidden `section=notes` alias all remain intact.
- `Home`, `Graph`, original-only `Reader`, and `Study` remain stable.

## Validation
- targeted Notebook / shell Vitest coverage
- `backend/tests/test_api.py -k graph -q`
- `frontend/npm run build`
- Stage 699 live Edge audit
