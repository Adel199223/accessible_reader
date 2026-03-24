# ExecPlan: Stage 503 Post-Stage-502 Home Organizer Header And Control Stack Audit

## Summary
- Audit the Stage 502 `Home` organizer-header and control-stack compression reset against Recall's current organized-library direction.
- Confirm that the upper organizer rail now reads more like a compact utility stack than a helper-heavy intro block.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - organizer header and helper line
  - organizer search and control stack
  - full organizer rail above the first branch rows
  - selected branch follow-through after the tighter control stack

## Acceptance
- The audit states clearly whether Stage 502 materially reduced the remaining organizer-header mismatch between Recall's current `Home` benchmark and our organizer rail.
- The audit records whether the header/helper stack now feels tighter and less instructional.
- The audit records whether the search plus control deck now feels denser and calmer without losing usability.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 502/503 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`

## Outcome
- Stage 503 confirms that Stage 502 materially reduced the remaining organizer-header mismatch between the current Recall `Home` benchmark and our local organizer rail.
- The upper organizer rail now reads more like a compact utility stack than a helper-heavy intro block:
  - `Collections` and the status readout now share one short heading line
  - the helper copy compresses into one metadata-style line instead of a multi-line orientation block
  - search, utilities, and control pills stay visible without reopening a detached panel
- The tighter stack survives the selected-branch handoff. In the live audit, drilling from overview into `Captures` kept the organizer attached to the board without re-expanding the upper rail back into a tall intro section.
- `Graph` stayed visually stable, and original-only `Reader` stayed stable with the audit harness explicitly holding the `Original` tab selected.
- Reader lock remains unchanged:
  - no generated-content work
  - no `Reflowed`, `Simplified`, or `Summary` changes
  - no transform or mode-routing changes

## Evidence
- Live localhost GET checks returned `200` for:
  - `http://127.0.0.1:8000/recall`
  - `http://127.0.0.1:8000/recall?section=graph`
  - `http://127.0.0.1:8000/reader`
- Stage 503 audit harness:
  - `output/playwright/stage503-post-stage502-home-organizer-header-and-control-stack-audit-validation.json`
- Refreshed wide desktop captures:
  - `output/playwright/stage503-home-wide-top.png`
  - `output/playwright/stage503-home-organizer-header-and-controls-wide-top.png`
  - `output/playwright/stage503-home-organizer-control-deck-wide-top.png`
  - `output/playwright/stage503-home-selected-group-wide-top.png`
  - `output/playwright/stage503-graph-wide-top.png`
  - `output/playwright/stage503-reader-original-wide-top.png`
- The live Home audit preserved organizer continuity by drilling from overview into `Captures`, where the compressed header stayed intact and the right-side board still read as the primary work surface.
- The audit ran in real Windows Edge with `runtimeBrowser: "msedge"`.

## Next Recommendation
- Stay on `Home` for the next bounded parity slice rather than reopening `Graph` or original-only `Reader`.
- The clearest remaining mismatch has shifted lower in the organizer rail: the standalone utility buttons and the selected-branch list beneath them still read slightly more stacked and carded than Recall's leaner rail rhythm.
- Open a new Home ExecPlan from this post-Stage-503 baseline, keep `Graph` and original-only `Reader` as regression surfaces, and keep generated-content Reader work explicitly locked.
