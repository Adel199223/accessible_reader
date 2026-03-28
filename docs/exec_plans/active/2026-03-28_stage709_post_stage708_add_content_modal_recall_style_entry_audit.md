# ExecPlan: Stage 709 Post-Stage-708 Add Content Modal Recall-Style Entry Audit

## Summary

- Audit the Stage 708 Add Content reset against the Recall benchmark direction and the current stable-baseline regression set.

## Audit Targets

- Add Content dialog:
  - stronger title and launch hierarchy
  - clearer mode chooser
  - more deliberate primary import region
  - calmer support framing
  - file mode remains a strong drop-zone style target
- Launcher continuity:
  - top-right add launcher still opens the dialog
  - Home `Add Content` tile still opens the dialog
  - Reader still uses the same global add dialog
- Regression surfaces:
  - no visible top-level `Notes` section
  - embedded `Notebook` still opens correctly
  - `Graph`, `Reader`, and `Study` remain stable

## Validation Ladder

- targeted Vitest for `ImportPanel`, `App`, and any touched shell/home tests
- `npm run build`
- `node --check` for Stage 708/709 Playwright files
- live Windows Edge Stage 709 audit against `http://127.0.0.1:8000`
- `git diff --check`

## Acceptance Bar

- The refreshed add dialog is materially closer to Recall’s smoother global add flow.
- The dialog still supports text, URL, and file imports without functional regression.
- The add entry surface is now clearly separated from Notebook/note creation.
