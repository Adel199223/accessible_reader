# ExecPlan: Stage 696 Home Organizer Ergonomics And Clipping Correction After Stage 695

## Summary
- Continue the queued roadmap immediately after the shared shell reset with one `Home`-only ergonomics pass.
- Fix the known live Home issues recorded in Stage 695 without reopening the settled Home preview-generation ladder:
  - visible organizer resize chrome
  - organizer collapse/reopen ergonomics that still feel less Recall-like than the new shell model
  - organizer row copy that does not fit cleanly enough at common widths
  - card title/source/detail clipping cases caught in the live baseline audit
- Keep `Graph`, embedded `Notebook`, original-only `Reader`, and `Study` as regression surfaces only.

## Scope
- Make the Home organizer resize handle subtle at rest and more deliberate on hover/focus/drag.
- Keep organizer resize support and width persistence intact.
- Keep the organizer collapsible, but make the launcher/close affordances feel like section-owned controls instead of exposed layout scaffolding.
- Adjust Home organizer row typography and wrap behavior so summaries and source lines fit more reliably at the audited desktop widths.
- Adjust Home board card typography and metadata spacing so the five known live clipping cases clear without reopening the content-rendered preview art track.
- Preserve current routes, filters, collections, day-group structure, and Home preview-source semantics.

## Acceptance
- The Home organizer resize seam is no longer a permanent bright vertical bar in the middle of the workspace.
- The Home organizer remains collapsible and resizable, and its width still restores correctly after collapse/reopen.
- Organizer top-level summary/source text fits more cleanly in the open panel at the benchmark desktop width.
- The Stage 695 live clipping cases no longer reproduce in the audited Home view.
- `Graph`, embedded `Notebook`, original-only `Reader`, and `Study` remain stable.

## Validation
- targeted Home Vitest coverage
- `backend/tests/test_api.py -k graph -q`
- `frontend/npm run build`
- Stage 697 live Edge audit
