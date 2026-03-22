# ExecPlan: Stage 393 Reader Reading-Space Reset After Stage 392

## Summary
- The post-Stage-392 checkpoint leaves original-only `Reader` as the likeliest next Recall-parity slice inside the refreshed `Graph` / `Home` / original-only `Reader` trio.
- Current Recall references for reading now point most strongly toward expanded reading space, calmer reading-side chrome, reading-position continuity, and a flexible attached split view rather than a visibly boxed article deck plus a comparatively assertive dock.
- This stage reopens original-only `Reader` for one broader reading-space and sidecar reset instead of another micro-density trim.

## Scope
- Rework original-only `Reader` in `frontend/src/components/ReaderWorkspace.tsx` and `frontend/src/index.css`.
- Keep the article lane more dominant above the fold:
  - reduce top chrome height
  - tighten the view/control seam
  - let the article begin sooner
- Rebalance the original-only desktop split so the dock feels more like an attached reading companion and less like a co-equal side card:
  - calmer dock shell
  - denser top glance
  - clearer note/source tabs without widening the dock
- Preserve current reading behaviors:
  - `/reader` route compatibility
  - current source continuity
  - anchored reopen
  - read-aloud transport and highlighting
  - saved notes and note promotion
  - source workspace handoffs
- Keep `Graph` and `Home` as regression checkpoints only.

## Guardrails
- Do not touch generated-content workflows anywhere in `Reader`.
- Keep `Reader` original-only and cosmetic-only in this track:
  - no `Reflowed`
  - no `Simplified`
  - no `Summary`
  - no generated-view UX
  - no transform logic
  - no generated placeholders
  - no generated-view controls
  - no mode-routing changes
- Do not widen into `Graph`, `Home`, `Notes`, or backend implementation work in this stage unless a tiny shared-shell adjustment is required for the Reader reset to read correctly.
- Avoid one-delta churn: make one broad original-only Reader hierarchy correction that specifically addresses reading-space priority, chrome compression, and attached dock behavior.

## Validation
- targeted Vitest for Reader coverage plus `App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 393/394 harness pair
- real Windows Edge Stage 393 implementation run against `http://127.0.0.1:8000`

## Exit Criteria
- Wide-desktop original-only `Reader` reads more like a reading-first workspace with expanded article space and calmer surrounding chrome.
- The dock feels more attached and secondary, while note/source work stays obviously close and usable.
- `Graph` and `Home` remain visually stable behind the Reader pass.
