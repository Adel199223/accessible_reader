# ExecPlan: Stage 380 Recall Parity Audit After Stage 379 With Original-Only Reader Rule

## Summary
- The user explicitly redirected the post-Stage-379 hold state back toward closer Recall parity.
- The new active scope is `Home`, `Graph`, and `Reader`, with a strict rule that `Reader` work must stay on original-reading UI/UX and the surrounding shell/dock behavior only.
- Do not change generated-content behavior or generated-content workflows in `Reader`: no work on `Reflowed`, `Simplified`, or `Summary`, no transform logic, and no generated-view UX work.

## Why This Plan Exists
- The user does not believe the current `Home` and `Graph` surfaces are yet close enough to the Recall app’s UX direction.
- The user also wants `Reader` parity work to stay strictly around the original reading flow and surrounding interface, not around AI/generated modes.
- The repo needs one explicit checkpoint that records those constraints so future turns do not drift back into generated-content or micro-stage churn.

## Scope
- Research the Recall benchmark more thoroughly using the available screenshots, official Recall docs/blog/changelog sources, and any additional current public references the user explicitly asked us to inspect.
- Re-audit the live localhost `Home`, `Graph`, and `Reader` surfaces against that benchmark in Windows Edge.
- Judge whether the current gap is primarily:
  - `Home`
  - `Graph`
  - original-only `Reader`
  - or one broader shared-shell/workspace hierarchy issue across those surfaces
- If one bounded, high-leverage mismatch is clearly dominant, open the next implementation plan around that slice instead of drifting into small redundant tweaks.

## Hard Restrictions
- Do not change anything related to what `Reader` generates.
- Do not change `Reflowed`, `Simplified`, or `Summary` generation, content, workflow, prompts, backend transform logic, or generated-view UX.
- For `Reader`, stay on original-reading presentation, source context, dock behavior, controls chrome, and surrounding workspace UX only.
- Do not reopen `Study` as an active design target.
- Do not resume one-detail-at-a-time micro-stage churn; prefer one broader, visible correction once the dominant mismatch is clear.

## Audit Inputs
- `BUILD_BRIEF.md`
- `docs/ROADMAP.md`
- `docs/ROADMAP_ANCHOR.md`
- `docs/ux/recall_benchmark_matrix.md`
- current live localhost captures for `Home`, `Graph`, and `Reader`
- Recall benchmark references from the matrix plus the user-requested extra research pass

## Deliverables
1. A plain-language parity readout for `Home`, `Graph`, and original-only `Reader`.
2. One explicit note, repeated in continuity docs, that generated-content work is out of scope for this track.
3. The next bounded implementation target, chosen from fresh evidence instead of momentum.

## Validation
- real Windows Edge capture refresh for `Home`, `Graph`, and `Reader`
- supporting benchmark notes with direct source references
- `git diff --check`

## Exit Criteria
- The repo has an explicit active checkpoint recording the original-only `Reader` restriction.
- The audit states clearly whether `Home`, `Graph`, or original-only `Reader` still materially lag the Recall benchmark.
- The next implementation slice is chosen as one broader, visible correction rather than another long run of redundant seam tweaks.
