# Browser Bridge

The main Recall experience is the local browser app. The Edge browser companion is a supported secondary surface that hands context into that app.

## Canonical Local URLs

- backend health: `http://127.0.0.1:8000/api/health`
- live Recall route: `http://127.0.0.1:8000/recall`
- frontend dev route: `http://127.0.0.1:5173`
- browser companion backend target: `http://127.0.0.1:8000`

## Ownership Expectations

- the browser app is the primary daily-use interface
- the Edge extension is a supported browser companion, not an optional afterthought
- the extension stays context-only and should not turn into current-tab import unless the user explicitly reopens that scope
- extension lookups and handoff should go through the localhost backend route `/api/recall/browser/context`

## Validation Scope

- use Windows Edge for live browser-companion validation
- use WSL for repo commands and builds
- a WSL-only browser check is not enough for the live Edge companion
