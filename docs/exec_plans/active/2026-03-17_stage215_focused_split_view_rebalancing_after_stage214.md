# ExecPlan: Stage 215 Focused Split View Rebalancing After Stage 214

## Summary
- Use the March 17, 2026 Stage 214 cross-surface audit as the handoff point for the next localized benchmark slice.
- Keep the Stage 213 top-level shell/Home/Graph/Study/Notes/Reader gains intact while rebalancing source-focused split states so the embedded Reader stays clearly primary.

## Problem Statement
- Stage 213 materially improved the top-level surfaces and Stage 214 confirmed those gains in fresh Windows Edge captures.
- The remaining benchmark mismatch is now concentrated in focused source-workspace states.
- Focused `Graph`, `Notes`, and `Study` still carry more stacked support chrome, repeated framing, and secondary-pane weight than the benchmark direction wants, which makes the live Reader compete with the supporting panel instead of clearly leading the split layout.

## Goals
- Keep the live Reader visually dominant across focused `Overview`, `Graph`, `Notes`, and `Study`.
- Demote redundant source-strip framing, repeated support headers, and secondary metadata in source-focused mode.
- Tighten support-pane spacing, width balance, and panel hierarchy so secondary tasks stay obviously secondary.
- Preserve all current navigation, handoffs, Reader anchors, notes/study/graph actions, and generated-view behavior.

## Non-Goals
- Do not change backend APIs, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not change `Original`, `Reflowed`, `Simplified`, or `Summary` generation rules.
- Do not widen into a new cross-surface pass; keep this localized to focused split-view balance.

## Implementation Targets
- `frontend/src/components/SourceWorkspaceFrame.tsx`
  - reduce top strip weight and repeated source framing in focused mode
- `frontend/src/components/FocusedSourceReaderPane.tsx`
  - tighten Reader header chrome and keep the reading pane visually primary
- `frontend/src/components/RecallWorkspace.tsx`
  - rebalance focused `Graph`, `Notes`, and `Study` support columns without changing behavior
- `frontend/src/index.css`
  - focused split-view spacing, panel weight, and width tuning
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - focused split-state structural assertions
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - update only if shared browse/focused structure changes spill over
- `frontend/src/App.test.tsx`
  - focused route and shell continuity checks

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- create/check the Stage 215 Windows Edge harness if implementation adds or changes focused-layout audit targets

## Exit Criteria
- Focused `Graph`, `Notes`, and `Study` keep the Reader as the visually dominant pane.
- The source-focused top strip reads as a compact context rail, not a second header block.
- Secondary panes feel lighter and calmer without losing current actions or evidence visibility.
- The next benchmark audit can judge the remaining mismatch primarily on split-view balance instead of broad top-level coherence.
