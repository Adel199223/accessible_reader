# ExecPlan: Stage 27 Post-Stage-26 Recall UX Refresh

## Summary
- Stage 26 made one source much easier to follow across Recall and Reader.
- The audit is now complete.
- The next highest-friction UX break is no longer source identity or handoff loss; it is that the source workspace tabs still land inside section-first layouts with duplicated detail scaffolding and always-visible collection rails.

## Audit Findings
- The source-workspace frame improved continuity, but it is still mostly a handoff layer, not yet the primary content canvas.
- `Overview` is still too thin:
  - it mostly repeats source metadata that already appears elsewhere
  - it does not yet feel like the source home for notes, graph context, and study state
- `Library`, `Notes`, `Graph`, and `Study` still keep their collection rails fully present while the user is already deep inside one source-focused task.
- That means the app still splits attention between:
  - workspace-level browsing
  - source-level work
  - repeated detail panels
- The result is better than pre-Stage-26, but still less focused than the Recall benchmark.

## Benchmark Read
- The current Recall direction still reinforces source-centered work:
  - the docs frame notes as living next to original content in the Notebook tab
  - the March 18, 2025 release emphasized side-by-side Reader and Notebook work plus a Reader that stays read-only while notes live beside it
  - the June 13, 2025 release emphasized search as a dedicated exploration surface rather than a small embedded utility
- Our current workspace already matches the search-direction improvement and much of the note-adjacency direction.
- The next gap is deeper source-focus: a source should feel like one tabbed working surface, not a repeated set of section-local cards.

## Conclusion
- The next bounded slice should not add more features.
- The next slice should make the source workspace a true shared detail surface with tab-controlled content panes, while demoting collection browsing to a lighter supporting role during source-focused work.

## Follow-Up
- Open Stage 28 for:
  - shared source-pane consolidation
  - stronger `Overview`
  - clearer separation between source-focused work and workspace-level browsing
