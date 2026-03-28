# ExecPlan: Stage 705 Post-Stage-704 Study Review Dashboard And Questions Hierarchy Reset Audit

## Audit Scope
- Audit the completed Stage 704 Study parity reset against the March 18, 2026 Recall Study benchmark direction.
- Judge `Study` first on wide desktop, then rerun focused reader-led `Study`, `Home`, `Graph`, embedded `Notebook`, and original-only `Reader` as regression baselines.

## Required Evidence
- Wide desktop `Study` idle/review-ready state
- Wide desktop `Study` answer-shown state
- Wide desktop `Study` review workbench crop
- Wide desktop `Study` questions/support crop
- Wide desktop `Study` evidence/support crop
- Focused reader-led `Study` pre-answer state
- Focused reader-led `Study` answer-shown state
- Regression captures for `Home`, `Graph`, embedded `Notebook`, and original-only `Reader`

## Audit Questions
- Does the upper Study surface now read like a lighter review dashboard rather than a large shell banner?
- Is the active review card clearly the primary task at first glance?
- Does the queue/support lane read more like `Questions` management than a co-equal dock?
- Does the evidence/support lane feel attached and quieter while still keeping grounding obvious?
- Do focused Study, `Home`, `Graph`, embedded `Notebook`, and original-only `Reader` remain stable?

## Validation Ladder
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/components/RecallWorkspace.stage37.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k graph -q"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node --check` for Stage 704/705 Playwright files
- real Windows Edge Stage 705 audit against `http://127.0.0.1:8000`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`

## Exit Criteria
- Stage 704 is accepted only if the audit shows a materially clearer review-first Study workspace with lighter dashboard/support framing than the Stage 703 baseline.
- The queued roadmap advances to Stage 706/707 only after wide desktop Study and focused Study regressions are green alongside stable `Home`, `Graph`, embedded `Notebook`, and original-only `Reader`.
