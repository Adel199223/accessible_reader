# ExecPlan: Stage 663 Preview Patch Integrity And API-Base Asset Resolution Fix

## Summary
- Close the post-Stage-662 correction raised by code review: the new preview backend must be part of the tracked patch, Home preview image URLs must resolve through the configured frontend API base, and preview generation must stay local-only while expanded Home boards keep loading previews for every card the user exposes.
- Keep the backend preview wire shape unchanged so the existing Recall/Home preview contract stays stable.
- Treat this as a bounded correction pass only; no new Home parity slice, no Reader generated-content work, and no shell/layout redesign work.

## Scope
- Track the existing `backend/app/previews.py` file in Git so `backend/app/main.py` no longer depends on an untracked local file.
- Centralize frontend API URL building in `frontend/src/api.ts`, then normalize `RecallDocumentPreview.asset_url` there before `RecallWorkspace` consumes it.
- Make HTML preview candidate loading local-only in `backend/app/previews.py`.
- Keep `data:image/*` candidate support, attachment-image normalization, rendered snapshot fallback, and poster fallback behavior intact.
- Reject remote `http(s)` preview candidates and unsafe `file:` or raw-path candidates unless they resolve inside the saved document directory or workspace-owned files area.
- Remove the extra Home preview-loading `slice(0, 12)` cap in `frontend/src/components/RecallWorkspace.tsx` so expanded boards and search results fetch preview content for every visible card.
- Add focused backend/frontend regression coverage for API-base asset URLs, safe local-only preview resolution, and expanded-board preview loading beyond the first twelve cards.

## Acceptance
- A clean checkout that applies the current patch can import `app.main` without failing on a missing preview-service module.
- `fetchRecallDocumentPreview()` returns an immediately usable `asset_url` for both same-origin `/api` setups and `VITE_API_BASE_URL` deployments.
- Saved HTML preview generation never performs live `http(s)` fetches from imported metadata candidates.
- Existing Home board preview rendering behavior stays intact when no API base is configured, and cards revealed via `Show all` or search keep receiving preview content and media fetches instead of stalling after the first twelve.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k preview"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/api.test.ts src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- targeted `git diff --check -- docs/exec_plans/active/2026-03-27_stage663_preview_patch_integrity_and_api_base_asset_resolution_fix.md backend/app/previews.py backend/tests/test_api.py frontend/src/api.ts frontend/src/api.test.ts frontend/src/components/RecallWorkspace.tsx frontend/src/components/RecallWorkspace.stage37.test.tsx`
