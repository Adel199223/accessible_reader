# ExecPlan: Stage 5 Augmented Browsing

## Summary
- Extend Recall with a bounded MV3 browser companion that surfaces relevant local context while the user browses ordinary webpages.
- Keep all retrieval local-first by routing extension lookups through the existing localhost backend instead of any cloud service.
- Preserve the current Recall shell, Reader, graph, study, and export behavior while adding extension-only browsing support.
- Do not implement current-tab import or live webpage capture in this slice; the extension is for contextual resurfacing only.

## Public Interfaces
- Add one new backend route for the extension:
  - `POST /api/recall/browser/context`
- Add extension-specific request and response contracts:
  - `BrowserContextRequest`
    - `page_url`
    - `page_title`
    - `selection_text`
    - `page_excerpt`
    - `meta_description`
    - `manual`
    - `limit`
  - `BrowserContextResponse`
    - `query`
    - `trigger_mode`
    - `should_prompt`
    - `summary`
    - `suppression_reasons`
    - `page_fingerprint`
    - `hits`
- Keep `hits` grounded in the existing retrieval model rather than inventing a second parallel search stack.

## Implementation Changes
- Planning/docs:
  - Replace the current Stage 5 placeholder with this concrete ExecPlan before implementation starts.
  - Move this plan to completed only after backend checks, frontend checks, extension checks, and an Edge smoke pass are green.
  - Advance roadmap state to Stage 6 only after Stage 5 validation is complete.

- Backend:
  - Add browser-context request/response models in the shared FastAPI model layer.
  - Add a repository method that derives a conservative retrieval query from:
    - selected text first when meaningful
    - otherwise page title plus optional page metadata and excerpt
  - Reuse hybrid retrieval, then rerank hits with bounded browser-specific boosts:
    - exact saved webpage URL match
    - same host
    - related path prefix
    - page-title overlap
  - Return prompt suppression when:
    - the page is internal or unsupported
    - the query is too generic
    - no grounded hit clears the confidence threshold
  - Keep thresholds stricter for automatic prompting than for manual popup refresh.
  - Allow extension origins in backend CORS without weakening the existing localhost reader shell behavior.

- Extension:
  - Add a new `extension/` workspace with its own package and build output.
  - Ship an MV3 extension with:
    - service worker
    - content script
    - popup
    - options page
  - Content script:
    - capture current page URL, title, selection, meta description, and a bounded visible-text excerpt
    - send browser context to the service worker
    - render a subtle in-page Recall chip only when the backend marks the context as prompt-worthy
    - open a bounded in-page panel with grounded hits and `Open Recall` / `Open in Reader` actions
  - Service worker:
    - manage settings, tab-scoped context cache, manual refresh, prompt dismissal, and badge state
    - fetch the localhost backend using the configured backend base URL
  - Popup:
    - manually refresh retrieval for the current tab
    - show the same grounded hit list even when the in-page chip stays suppressed
    - expose backend connectivity status and quick open actions
  - Options:
    - backend base URL
    - auto-prompt toggle
    - result limit
  - Keep the browsing companion low-noise:
    - no prompt on every page
    - no import/capture flow
    - no chat surface
    - no AI calls

## Test Plan
- Backend:
  - browser-context route returns grounded hits for matching page selections
  - exact and same-host webpage matches receive visible reranking boosts
  - automatic prompting is suppressed for generic or internal pages
  - manual browser queries can still return hits when auto-prompt stays quiet
- Extension:
  - unit tests for settings normalization and low-noise context heuristics
  - build output contains manifest, service worker, popup, options page, and content script
- Validation:
  - frontend `npm test -- --run`
  - frontend `npm run lint`
  - frontend `npm run build`
  - backend `.venv/bin/python -m pytest`
  - backend `.venv/bin/python -c "from app.main import app; print(app.title)"`
  - extension `npm test -- --run`
  - extension `npm run build`
  - one manual Edge-channel smoke pass with the unpacked extension loaded against the local backend

## Assumptions
- The combined Stage 3/4 graph and study pass is complete and stable enough to build browser resurfacing on top of it.
- The backend remains the single local service host for Recall, Reader, and extension retrieval.
- The extension targets Microsoft Edge on Windows 11 first, but should stay Chromium-MV3 compatible.
- Context resurfacing must stay conservative so the companion adds signal instead of distraction.
