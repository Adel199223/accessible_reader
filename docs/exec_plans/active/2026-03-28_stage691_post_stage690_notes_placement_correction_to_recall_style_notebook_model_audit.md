# ExecPlan: Stage 691 Post-Stage-690 Notes Placement Correction To Recall-Style Notebook Model Audit

## Summary
- Audit the Stage 690 note-placement correction in real Windows Edge against the current Recall notebook model and the user-provided Recall `/items` screenshot.
- Confirm that `Notes` is no longer exposed as a primary section, while note-taking remains fully reachable through `Library` / `Home`, the embedded `Notebook` tab, and Reader/search handoffs.

## Audit Focus
- No visible `Notes` primary sidebar destination remains in the shell.
- `Library` / `Home` shows the pen-style note entry affordance beside `Add`.
- The embedded notebook workspace opens inside `Library` / `Home` for:
  - the pen entry affordance
  - search-result note opens
  - Reader notebook handoffs
  - source-focused note handoffs
- The source workspace tab and relevant Reader-facing language now use `Notebook`.
- `/recall?section=notes` still reopens the correct notebook workspace instead of surfacing a separate top-level `Notes` section.
- `Graph`, `Home`, and original-only `Reader` remain stable.

## Evidence
- Capture:
  - default `Library` / `Home` with no `Notes` rail entry
  - `Library` / `Home` toolbar with the pen entry affordance beside `Add`
  - embedded notebook workspace at rest
  - search-result note handoff
  - Reader notebook handoff
  - source-focused notebook handoff
  - `/recall?section=notes` compatibility reopen
  - `Graph`
  - original-only `Reader`
- Record metrics for:
  - sidebar section list without `Notes`
  - pen-affordance visibility beside `Add`
  - `Notebook` tab label visibility
  - notebook-workspace activation from search and Reader
  - compatibility alias reopen behavior

## Validation
- rerun the targeted frontend suites from Stage 690
- rerun `backend/tests/test_api.py -k graph -q`
- rerun `npm run build`
- run the new Stage 690/691 Playwright pair with real Windows Edge against `http://127.0.0.1:8000`
- finish with targeted `git diff --check -- ...` on the touched notebook-placement/docs/harness files

## Exit Criteria
- The app is structurally closer to Recall’s current notebook model because notes are embedded into `Library` / `Home` instead of exposed as a standalone primary section.
- Note CRUD, note search, Reader anchoring, and source-adjacent notebook flows remain intact.
- Only reopen another note-placement pass if a broad remaining mismatch still appears after this bounded structural correction.
