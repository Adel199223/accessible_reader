# ExecPlan: Stage 110 Post-Stage-109 Benchmark Audit

## Summary
- Audit the fresh post-Stage-109 Home, Graph, Study, and focused-Study captures against the benchmark matrix.
- Confirm whether Stage 109 removed Home as the clearest remaining blocker or whether Home still leads the mismatch list.
- Select the next bounded surface pass from fresh screenshot evidence instead of assumption.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
  - Add Content
  - Knowledge Graph
  - Spaced repetition / review
- Official supporting Recall sources, as tracked in `docs/ux/recall_benchmark_matrix.md`

## Problem Statement
- Stage 109 materially tightened the Home opening by reducing the spotlight footprint and softening the inline utility row.
- The remaining roadmap priority should now be chosen from fresh evidence rather than assuming that Home still leads.
- The audit should verify whether Home still remains the clearest blocker or whether Study has become the stronger remaining mismatch again.

## Goals
- Compare fresh Stage 109 localhost captures for Home, Study, Graph, and focused Study against the benchmark matrix.
- Record which top-level surface now leads the remaining mismatch list.
- Open one bounded next-stage implementation plan based on that evidence.

## Non-Goals
- Do not implement new UI changes during this audit.
- Do not reopen backend or storage work.
- Do not reopen the deferred responsive shell/top-grid issue unless the fresh artifacts show it is now the clearest blocker.

## Implementation Targets
- `scripts/playwright/stage110_post_stage109_benchmark_audit_edge.mjs`
  - capture fresh Stage 110 Home, Graph, Study, and focused-Study audit artifacts
- `docs/ux/recall_benchmark_matrix.md`
  - update the localhost artifact references and record the Stage 110 outcome snapshot
- `docs/ROADMAP.md`
  - log the audit decision and set the next bounded implementation stage
- `docs/ROADMAP_ANCHOR.md`
  - refresh the resume snapshot and next-step guidance
- `docs/assistant/APP_KNOWLEDGE.md`
  - sync the new top-priority task for future Codex turns
- `docs/assistant/manifest.json`
  - point the active canonical workflow path at the next active ExecPlan

## Validation
- `node scripts/playwright/stage110_post_stage109_benchmark_audit_edge.mjs`
- screenshot-led manual review against `docs/ux/recall_benchmark_matrix.md` and the user-provided Recall benchmark screenshots
- manifest JSON parse check

## Exit Criteria
- One clearest remaining blocker is identified from fresh Stage 110 artifacts.
- The next bounded implementation stage is opened with a specific surface target.
- Roadmap and assistant handoff docs all point to the new active stage.

## Execution Note
- On this machine, the repo-owned Edge screenshot harness should continue to run through Windows `node` rather than WSL `node`, because WSL Playwright attempts to launch Linux `msedge`, which is not installed.
