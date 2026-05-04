# Accessible Reader Modernization Health Check

Date: May 4, 2026
Branch: `accessible-reader-modernization-health-check`
Base SHA: `85b991520e76af95e69af9b24303edfb26459840`

## Summary

Accessible Reader does not need stack modernization. The repository already has the modern baseline the current product needs: React, Vite, TypeScript, ESLint, Vitest, React Testing Library, FastAPI, Pydantic, SQLite with FTS5, and a large Playwright evidence harness.

The modernization need is maintainability and contract safety. The highest leverage next slice is a behavior-preserving API/types contract alignment pass that compares the FastAPI/Pydantic/OpenAPI surface with `frontend/src/types.ts` and `frontend/src/api.ts`, then produces drift checks or type-generation guidance before splitting implementation files.

Do not start with a backend `storage.py` split. It is valuable, but it touches the densest local-first persistence, import/export, graph, study, notes, FTS, and repair logic in the repo and should follow stronger contract coverage.

## Stack Assessment

The stack is already modern enough for the current product direction.

| Area | Current state | Assessment |
| --- | --- | --- |
| Frontend runtime | React `^19.2.0`, React DOM `^19.2.0` | Current modern React baseline. |
| Frontend build | Vite `^7.3.1`, `@vitejs/plugin-react` `^5.1.1` | No Vite migration needed. Existing build warning is chunk-size, not a stack blocker. |
| Frontend language | TypeScript `~5.9.3` | Current TS baseline. |
| Frontend lint | ESLint `^9.39.1`, `typescript-eslint`, React hooks, React refresh | Modern flat-config linting exists. |
| Frontend tests | Vitest `^4.0.5`, jsdom, React Testing Library, jest-dom | Unit/component coverage exists and is broad. |
| Backend runtime | FastAPI `>=0.116`, Python `>=3.11` | Modern local API baseline. |
| Backend contracts | Pydantic `>=2.11` | Current contract/model baseline. |
| Backend storage | SQLite, FTS5, local file attachments | Fits local-first product requirements. |
| Browser validation | 956 Playwright `.mjs` scripts under `scripts/playwright/` | Extensive evidence harness exists, though many scripts are stage-specific. |

No stack-level modernization is recommended now. The useful work is to reduce drift and change risk inside the existing stack.

## Architecture Inventory

### File Size And Symbol Inventory

| File | Lines | Bytes | Exports or defs | Main responsibilities |
| --- | ---: | ---: | ---: | --- |
| `frontend/src/App.tsx` | 973 | 33,444 | 1 export | App route parsing/sync, shell orchestration, global Add/Search dialogs, reader/recall handoff state. |
| `frontend/src/components/RecallWorkspace.tsx` | 25,517 | 1,163,383 | 1 export | Home, Library, Notebook, Graph, Study, source overview, source memory, review, and cross-surface continuity. |
| `frontend/src/components/ReaderWorkspace.tsx` | 2,842 | 108,942 | 1 export | Reader loading, modes, read aloud, notes, source strip, Reader-to-Recall handoffs. |
| `frontend/src/components/SourceWorkspaceFrame.tsx` | 346 | 11,972 | 3 exports | Shared source workspace frame, compact tabs, source preview/count labels. |
| `frontend/src/index.css` | 34,305 | 885,773 | 29,012 class-selector lines | Global tokens, shell, Home, Reader, Notebook, Graph, Study, import, dialogs, responsive rules. |
| `frontend/src/api.ts` | 583 | 17,891 | 58 exports | Shared request wrapper plus all frontend API calls and export URL builders. |
| `frontend/src/types.ts` | 875 | 21,798 | 100 exports | Hand-maintained frontend mirrors of backend reader, recall, graph, study, library, import/export contracts. |
| `backend/app/main.py` | 1,177 | 47,479 | 79 top-level defs/classes, 68 routes | FastAPI app setup, all API routes, workspace import preview/apply helpers, import/transform routes. |
| `backend/app/models.py` | 1,280 | 41,659 | 115 top-level defs/classes | Pydantic contracts for source, reader, graph, notes, study, library, import/export, settings. |
| `backend/app/storage.py` | 9,032 | 385,161 | 19 top-level defs/classes; one large `Repository` | SQLite schema, migrations, repository methods, FTS repair, graph/study/notes/search/import/export/restore. |
| `backend/app/recall.py` | 255 | 9,133 | 11 top-level defs/classes | Reflow chunks, sentence metadata, note/chunk excerpts, Markdown export. |
| `backend/app/study.py` | 991 | 37,816 | 38 top-level defs/classes | FSRS scheduling, study status/stages, lexical vectors, generated study card candidates and typed payloads. |
| `backend/app/knowledge.py` | 625 | 21,398 | 26 top-level defs/classes | Local knowledge graph extraction, mention/entity/edge generation, confidence/labels. |
| `backend/app/portability.py` | 56 | 1,715 | 5 top-level defs/classes | Canonical JSON digests, merge decisions, workspace export filename. |

### Frontend Architecture

`App.tsx` is not oversized by itself, but it is a high-value orchestration boundary. It owns URL normalization, Recall/Reader route state, continuity snapshots, shell context, global Add/Search dialogs, and cross-surface handoffs. It should not absorb more domain logic. A later split could extract route/shell orchestration hooks, but that should follow contract alignment because most route handoffs depend on shared domain types.

`RecallWorkspace.tsx` is the largest maintainability pressure point. It mixes pure helpers, local state machines, and rendered surfaces for Home, Library, Notebook, Graph, Study, source overview, source memory, review queues, study creation/edit/review, collection subsets, and Reader handoffs. It already has some extracted graph components and shared lib helpers, which means decomposition is feasible. However, the blast radius is high because broad `App.test.tsx` and many Playwright audits encode behavior around this file.

`ReaderWorkspace.tsx` is a clearer boundary than `RecallWorkspace.tsx`, but still carries Reader mode loading, read-aloud controls, source strip state, note capture/edit/promotion, source workspace handoffs, collection context, and saved progress. It is a candidate for smaller Reader hooks/helpers after contracts are stable.

`SourceWorkspaceFrame.tsx` is already a bounded component and does not need urgent modernization.

`frontend/src/api.ts` is modest in size, but it exposes 58 functions across health/settings, source import, notes, search/retrieval, graph, study, library, workspace export/import, document view/transform/progress, and delete. Its risk is not size; its risk is contract drift and the lack of domain grouping.

`frontend/src/types.ts` is hand-maintained and broad. It mirrors Pydantic models across reader, recall, graph, notes, study, library, import/export, and settings. This is the best next modernization target because it can reduce future breakage without changing behavior.

`frontend/src/index.css` is extremely large and globally scoped. It carries accumulated stage-specific selectors and broad responsive sections. A token/base/feature split would improve maintainability and reviewability, but it is mostly visual-regression risk and should be a fallback after contract work unless UI work is reopened.

### Backend Architecture

`backend/app/main.py` centralizes all API routes in one file. It has clear route clustering by path, but no FastAPI router/domain split. A router split would improve navigation, but it should come after contract drift checks so route/model changes can be verified mechanically.

`backend/app/models.py` is coherent but broad. It contains the public contract for nearly every domain: source documents, reader views, workspace export/import, recall notes, graph, browser context, study cards/progress/sessions/attempts/settings, library collections, reading queue, batch import, and settings. Splitting it by domain is desirable later, but premature without type alignment risks accidental wire-shape changes.

`backend/app/storage.py` is the main backend maintainability hotspot. One `Repository` owns schema creation, legacy migration, document storage, variants, chunks, notes, graph extraction and review decisions, hybrid retrieval, browser context, study review/generation/attempts/sessions/settings, library settings/collections/reading queue, workspace export/import/merge/repair, FTS repair, row mappers, and portable entity digests. This should be decomposed eventually, but only after a contract gate exists and targeted storage fixtures cover export/import, study, graph, notes, and source documents.

`backend/app/recall.py`, `study.py`, `knowledge.py`, and `portability.py` already provide useful pure-domain boundaries. Future backend modernization should lean into these patterns before creating more service classes.

Schema/migration handling is local and incremental: `CREATE TABLE IF NOT EXISTS`, FTS virtual tables, indexes, `_ensure_column_with_connection`, schema version metadata, legacy reader DB migration, and startup repair. No schema change is recommended for this health-check wave.

## Contract And Integration Readiness

Accessible Reader and Neuro Map Studio should remain separate for now. The compatibility question is best handled through explicit portable contracts, not direct integration.

Accessible Reader already has durable host concepts:

| Accessible Reader concept | Current contract strength | Integration note |
| --- | --- | --- |
| `SourceDocument` / document refs | Strong backend model; frontend has `DocumentRecord`, `RecallDocumentRecord`, preview and reading queue types | Future adapters should link by explicit source IDs and preserve content ownership in Accessible Reader. |
| `KnowledgeNode` / `KnowledgeEdge` / `KnowledgeGraphSnapshot` | Strong graph contracts with review status, confidence, provenance, mentions, source document IDs | NeuroMap manual layout is not the same as graph semantics; layout/ports/routes must stay adapter metadata. |
| `StudyCardRecord` / review events / sessions | Rich local FSRS-like state, attempts, sessions, progress, goals, typed question payloads | NeuroMap `got-it/almost/missed` must not be automatically treated as FSRS mastery. |
| Collections | Library settings and collection overview/reading queue contracts exist | NeuroMap projects/pages only partially map to collections; avoid forced equivalence. |
| Workspace export/import | Additive ZIP/manifest preview/apply with digests and attachments | NeuroMap JSON backup has different conflict semantics; bridge via tests first. |
| Source notes and evidence | Sentence/source anchors plus graph/study promotion semantics exist | Future adapters need explicit evidence provenance and note/source distinction. |
| Graph review status | `suggested` / `confirmed` / `rejected` | Preserve separate from NeuroMap manual user-authored relationships. |
| Study rating vocabulary | `forgot` / `hard` / `good` / `easy` | Only map NeuroMap ratings in preview tests, not scheduling state. |

If future NeuroMap integration remains likely, the first Accessible Reader modernization slice should be contract alignment, followed by adapter contract tests. This lets future work compare source, graph, study, note/evidence, collection, and export/import shapes without touching storage or UI.

## Test And Flake Assessment

Backend coverage is broad but concentrated:

- `backend/tests/test_api.py`: 6,056 lines covering import, URL snapshots, previews, export/import/restore, workspace integrity/repair, graph/retrieval/study, typed study cards, notes, browser context, delete, and legacy migration.
- `backend/tests/test_parsers.py`: parser behavior for text, Markdown, DOCX, PDF.
- `backend/tests/test_reflow.py`: reflow splitting and metadata preservation.
- `backend/tests/test_benchmarks.py`: benchmark harness shape.

Frontend coverage is broad but also concentrated:

- `frontend/src/App.test.tsx`: 11,733 lines covering shell routes, Home/Library, collection tree/workspaces, reading queue/highlights, Graph, Study, Notebook, Reader, Add Content, Search, and continuity.
- Focused tests exist for `api.ts`, `ImportPanel`, `LibraryPane`, `ReaderSurface`, `RecallShellFrame`, `SourceWorkspaceFrame`, `useSpeech`, `appRoute`, `graphViewFilters`, `readerSession`, and `segment`.

Playwright coverage is extensive but stage-heavy:

- 956 `.mjs` scripts under `scripts/playwright/`.
- Current latest audit is Stage 975, with broad regression coverage and cleanup dry-run at `matchedCount: 0`.
- Cleanup harness is intentionally guarded: dry-run by default, explicit apply required for historical Stage-marker source-note deletion.
- Windows launcher preflight is documented and should remain the path for Edge validation and WSL readiness.

Known gaps:

- No generated or mechanically checked frontend/backend API contract.
- `api.ts` and `types.ts` can drift from Pydantic/OpenAPI without an early failure.
- Broad workflow tests are large and expensive to reason about.
- Import/export, graph/study/notes integration tests exist, but targeted fixture layers would help before backend repository splits.
- Accessibility and performance checks are not first-class automated gates.
- Vite build still reports the existing chunk-size warning.

## Risk/Value Matrix

| Slice | Value | Risk | Behavior impact | Test requirements | NeuroMap relation | Timing |
| --- | --- | --- | --- | --- | --- | --- |
| A. Frontend API/types contract audit | High | Low | None if docs/test-only | Typecheck, API/type focused tests, OpenAPI snapshot/drift check | Directly identifies host contract boundaries | Do now |
| B. Split frontend `api.ts` by domain | Medium | Medium | Should be none, import churn risk | `api.test.ts`, `App.test.tsx`, typecheck | Helps adapters call stable domains | Later, after A |
| C. Split frontend `types.ts` by domain | Medium | Medium | Should be none, import/type churn risk | Typecheck, contract drift check, focused imports | Clarifies source/graph/study/notes contracts | Later, after A |
| D. Split `RecallWorkspace` into hooks/components | High | High | Should be none, high UI/continuity risk | Broad `App.test.tsx`, focused stage tests, Playwright smoke | Helpful after contracts; not first | Later with strong gates |
| E. Split `index.css` by tokens/features | Medium | Medium-high | Visual-only risk | Build, targeted visual/audit scripts, screenshots if UI touched | Low direct relation | Fallback later |
| F. Split backend `storage.py` by domain service/repository | High | High | Should be none, high persistence/export risk | Backend API suite plus targeted storage fixtures | Important eventually for adapters | Defer |
| G. Split backend `models.py` by domain | Medium | Medium-high | Should be none, public import churn risk | OpenAPI diff, backend tests, frontend contract check | Clarifies contracts | Later after A |
| H. Split backend API routes by router/domain | Medium | Medium | Should be none, route registration risk | OpenAPI diff, backend API suite | Clarifies host domains | Later after A |
| I. Add OpenAPI/type-generation or drift checks | High | Low-medium | None if check-only | New drift check plus existing typecheck/tests | Best bridge toward adapters | Do now with A |
| J. Prepare future NeuroMap adapter contract tests | Medium-high | Low-medium | None if test-only | Pure fixture tests, no integration | Directly supports future compatibility | Later after A/I |
| K. Do no modernization | Low | Low short-term, high long-term | None | Normal product checks | Leaves future compatibility risky | Not recommended |

## Recommendation

Primary recommendation: perform a behavior-preserving API/types contract alignment slice next.

The slice should generate or inspect FastAPI OpenAPI output, compare public response/request models with `frontend/src/types.ts`, inventory every `frontend/src/api.ts` endpoint wrapper against the backend route table, and produce a drift report plus a minimal check script or test if feasible. It should not split files in the first pass unless the drift report proves the boundaries are stable.

Fallback recommendation: if the contract slice is blocked, do a CSS structure split starting with tokens/base and one low-risk feature area. This is lower strategic value than contract alignment but can reduce review burden without touching storage or APIs.

Do not start with `storage.py`, `models.py`, backend routers, or `RecallWorkspace.tsx`. Those are real modernization candidates, but they should follow a contract safety net and targeted fixtures.

## Next Codex Prompt

```text
We are starting the next Accessible Reader modernization slice: API/types contract alignment.

Repo: /home/fa507/dev/accessible_reader
Base from the modernization health check branch/report.

Goal:
Create a behavior-preserving contract drift audit between FastAPI/Pydantic/OpenAPI and the frontend API/types layer.

Important:
- Do not change backend schema.
- Do not change API routes.
- Do not change UI.
- Do not split api.ts or types.ts yet unless the audit proves a tiny docs/test-only helper is needed.
- Do not edit Neuro Map Studio.
- Do not push.

Read first:
- AGENTS.md
- BUILD_BRIEF.md
- docs/ROADMAP.md
- docs/ROADMAP_ANCHOR.md
- docs/architecture/accessible-reader-modernization-health.md
- docs/exec_plans/active/accessible-reader-modernization-health-check.md
- frontend/src/api.ts
- frontend/src/types.ts
- backend/app/main.py
- backend/app/models.py
- backend/tests/test_api.py
- frontend/src/api.test.ts
- frontend/src/App.test.tsx

Tasks:
1. Create or update a focused ExecPlan under docs/exec_plans/active/.
2. Inventory backend routes, request models, response models, and query/form parameters from FastAPI/OpenAPI.
3. Inventory frontend api.ts wrappers and frontend/src/types.ts public contracts.
4. Produce a drift matrix:
   - exact matches
   - likely matches with naming differences
   - backend models missing frontend types
   - frontend types with no backend model
   - api.ts wrappers with no route
   - routes with no api.ts wrapper
5. Recommend whether to add:
   - a check-only OpenAPI snapshot/drift script
   - generated TypeScript types
   - domain-split api/type files later
6. Keep implementation behavior-preserving. Prefer docs/test artifacts first.

Deliverables:
- docs/architecture/accessible-reader-api-types-contract-audit.md
- docs/exec_plans/active/accessible-reader-api-types-contract-audit.md
- optional scripts/check_api_contract_drift.* only if it is check-only and low-risk
- artifact folder under /home/fa507/Downloads/accessible-reader-api-types-contract-audit/

Checks:
- backend pytest if cheap: cd backend && .venv/bin/python -m pytest tests/test_api.py -q
- frontend typecheck: cd frontend && npm exec tsc -- -b --pretty false
- frontend tests: cd frontend && npm test -- --run src/api.test.ts --reporter=dot
- git diff --check

Commit locally if checks pass. Do not push.
```

## Assumptions

- This health check intentionally does not update `docs/ROADMAP.md` or `docs/ROADMAP_ANCHOR.md` because no product slice is being opened.
- Neuro Map Studio remains read-only context; its portable contract vocabulary informs risk assessment but not implementation.
- Screenshots are unnecessary because there is no UI change.
