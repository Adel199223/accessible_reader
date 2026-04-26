# Stage 882 - Study Review Task-Workbench Fusion After Stage 881

## Summary

- Reopen `Study`, scoped to organizer-wide default `Review`.
- Stage 881 left Add Content stable; the clearest remaining Recall-parity gap is now the wide Study Review workspace, which still reads as a separated dashboard band, large task card, and standing support rail rather than one compact review workbench.
- Direction: make Review feel task-owned and continuous. The command row, prompt card, reveal action, queue seam, and grounding handoff should read as one connected review work surface while preserving the Stage 855 Questions canvas and Stage 879 Reader baselines.

## Scope

- In organizer-wide `Study > Review`, fuse the compact command row and active review surface into a single review-owned workbench stack.
- Keep the Review/Questions toggle, metric pills, inline status, and one `Refresh` action.
- Tighten the gap between the command seam and active review card, reduce the active card’s panel weight, and keep the prompt/action/rating flow card-owned.
- Deflate the right support rail further so queue context and grounding feel attached to the review task rather than like a competing card column.
- Keep at most one upcoming preview at rest and preserve Evidence / Reader handoff actions.

## Non-Goals

- No backend, route, schema, storage, API, Reader output, Graph data, Home, Notebook, or Study scheduling changes.
- Do not redesign `Questions`; keep the Stage 855 fused Questions canvas as a regression surface.
- Do not add Recall 2.0 chat, shared quizzes, timers, notifications, Listen Mode, new question types, or cloud sync.

## Validation

- Targeted Study/App Vitest covering Review default, prompt/reveal/rating, support rail, and Questions regression.
- Extend the shared Study Playwright harness with task-workbench metrics.
- Live Stage 882/883 browser evidence plus existing Home, Add Content, Graph, embedded Notebook, Reader, and Study Questions regressions.
