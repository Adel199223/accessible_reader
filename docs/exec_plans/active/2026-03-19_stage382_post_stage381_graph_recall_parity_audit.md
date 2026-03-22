# ExecPlan: Stage 382 Post-Stage-381 Graph Recall-Parity Audit

## Summary
- Audit the Stage 381 Graph reset against the current Recall benchmark direction.
- Judge `Graph` first on wide desktop, then verify `Home` and original-only `Reader` as regression surfaces.
- Use original-mode `Reader` captures only; generated-content views remain out of scope for this track.

## Audit Scope
- Wide desktop captures first:
  - `Graph`
  - `Home`
  - original-only `Reader`
- Supporting Graph crops:
  - control seam plus selector strip
  - canvas plus attached inspect tray in peek state
  - canvas plus attached inspect tray in expanded state
- Focused regressions second:
  - focused overview
  - focused `Graph`

## Acceptance
- The audit states clearly whether Stage 381 moved `Graph` closer to Recall’s canvas-first, control-light direction.
- The audit records whether `Home` remained stable and whether original-only `Reader` stayed visually stable with no generated-content detour.
- The handoff uses explicit artifact references and repeats the original-only Reader restriction.

## Validation
- `node --check` for the Stage 381/382 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
