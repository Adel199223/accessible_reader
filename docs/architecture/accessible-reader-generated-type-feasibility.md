# Accessible Reader Generated Type Feasibility

Date: May 6, 2026

Branch: `accessible-reader-generated-type-feasibility`

Immediate base: `352578b27a5d68c89cb9ef252c5ec587a8fe9d37`

Main base: `ab8d00a78aadcf954fa56a0445d8f7c80db64e06`

## Summary

Generated TypeScript types are feasible for Accessible Reader, but not as an immediate wholesale replacement for the hand-authored frontend contract modules.

The current API/types contract is already unusually close:

- OpenAPI paths: 58
- OpenAPI route operations: 66
- OpenAPI schemas counted by the contract script, excluding FastAPI validation schemas: 108
- Backend Pydantic classes: 115
- Backend Literal aliases: 19
- Frontend API exports: 56
- Frontend type exports: 100
- Exact frontend/backend contract-name matches: 95
- Frontend API wrappers without matched backend route: 0
- Accepted backend-only routes without an `api.ts` wrapper or URL builder: 10

The strongest finding is that 84 OpenAPI component schemas and frontend interfaces share the same name and the same top-level property names. That makes generated types strategically attractive. The limiting factor is not broad contract mismatch; it is the set of intentional frontend aliases, inline request bodies, multipart/download routes, browser-extension routes, and refined frontend convenience unions that would be obscured by direct generation.

Recommendation: keep the generated TypeScript file private and reference-only. The normalized OpenAPI snapshot and generated-reference checks now make drift visible, but `frontend/src/types.ts` and `frontend/src/api.ts` should remain compatibility barrels until a separate adoption slice proves selective aliases are safe.

## Current Contract Shape

The current contract lane is `scripts/contracts/audit_api_types_contract.py`. It imports the FastAPI app, reads `app.openapi()`, parses backend models, parses the frontend API barrel plus `frontend/src/api/*.ts`, parses the frontend type barrel plus `frontend/src/types/*.ts`, and emits Markdown or JSON inventory.

The check command remains:

```bash
backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check
```

The command is fixture-backed by `scripts/contracts/expected_api_types_contract.json`. It guards summary counts, zero unmatched frontend API wrappers, and the accepted backend-only route list. It does not yet snapshot OpenAPI component shapes or enforce generated type output.

The frontend type split completed the right prerequisite for feasibility work:

- `frontend/src/types.ts` is a public type-only compatibility barrel.
- `frontend/src/types/*.ts` holds domain modules for base aliases, documents, reader/settings, recall/search, graph, study, import, library, and workspace portability.
- Existing callers can keep importing from `frontend/src/types.ts`.

## OpenAPI Snapshot Check Lane

The follow-up snapshot lane now exists as a developer-only guard before generated TypeScript adoption.

Commands:

```bash
backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --openapi-snapshot
backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check-openapi-snapshot
```

Behavior:

- `--openapi-snapshot` prints normalized JSON to stdout.
- `--check-openapi-snapshot` compares the normalized snapshot against `scripts/contracts/expected_openapi_snapshot.json`.
- The fixture records OpenAPI version, 108 schema names excluding FastAPI validation schemas, 66 route operation keys, 11 multipart/download route exceptions, 23 OpenAPI schema names without frontend type names, 15 frontend type names without OpenAPI schema names, 19 backend Literal aliases not emitted as OpenAPI schemas, and the intentional compatibility alias map.
- The check is wired into `backend/tests/test_contract_inventory.py`, so `cd backend && .venv/bin/python -m pytest tests/test_contract_inventory.py -q` now runs both the API/types drift fixture and the OpenAPI snapshot fixture.
- This is still not generated TypeScript, not a backend schema change, and not a runtime API client change.

## Generated OpenAPI Reference Lane

The follow-up reference lane now proves generated TypeScript can be deterministic without replacing hand-authored frontend types or API wrappers.

Commands:

```bash
backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --write-generated-openapi-reference
backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check-generated-openapi-reference
```

Behavior:

- `--write-generated-openapi-reference` writes `frontend/src/generated/openapi.ts` from the local FastAPI `app.openapi()` output.
- `--check-generated-openapi-reference` regenerates the file in a temporary directory, compares it byte-for-byte with the committed reference, and fails if the generated reference is stale or expected anchors disappear.
- Generation uses the frontend dev dependency `openapi-typescript` with `--root-types`, `--root-types-no-schema-prefix`, and `--alphabetize`.
- The generated file is private and reference-only. It is not exported from `frontend/src/types.ts`, not imported by product code, and not used by the runtime API client.
- The check is wired into `backend/tests/test_contract_inventory.py`, so the focused pytest now covers the API/types fixture, normalized OpenAPI snapshot fixture, and generated OpenAPI reference currentness.

The generated reference intentionally includes awkward but important OpenAPI shapes: FastAPI multipart body aliases, validation schemas, operations, and inline request models such as graph decisions, study review/schedule requests, progress updates, and transforms. Those anchors make drift visible while preserving the current frontend ergonomics.

Generated output caveats remain:

- FastAPI/Pydantic OpenAPI 3.1 nullable fields become `T | null`; optional-versus-null semantics still need human review before adoption.
- Defaulted response/settings fields may appear required in generated types.
- Multipart upload bodies are reference artifacts, not replacements for the app's `FormData` wrappers.
- Download and stream routes should stay behind URL builders or browser download helpers.
- `StudyCardQuestionPayload` remains a better hand-authored frontend discriminated-union candidate than the broad generated shape.

## Generated Type Mapping Check Lane

The follow-up mapping lane adds a fixture-backed assertion before any selective generated-type adoption.

Commands:

```bash
backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --generated-type-mapping
backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check-generated-type-mapping
```

Behavior:

- `--generated-type-mapping` prints reviewable JSON for the selected mapping set.
- `--check-generated-type-mapping` reads `scripts/contracts/expected_generated_type_mapping.json` and fails if selected generated aliases, OpenAPI top-level fields, or public frontend interface fields drift.
- The first mapping set is intentionally tiny: `DocumentRecord`, `DocumentView`, `RecallDocumentRecord`, `KnowledgeGraphSnapshot`, `StudyCardRecord`, `LibraryReadingQueueRow`, and `WorkspaceExportManifest`.
- The fixture also records intentional alias decisions for `DocumentMode -> ViewMode`, `DetailLevel -> SummaryDetail`, and `StudyReviewRatingLabel -> StudyReviewRating`, plus deferred public type decisions for `StudyCardQuestionPayload`, `RetrievalHitType`, and `StudyGeneratedCardType`.
- The check is wired into `backend/tests/test_contract_inventory.py` beside the contract drift, OpenAPI snapshot, and generated-reference checks.

This is a mapping assertion, not type adoption. It proves that a few selected generated schema aliases still line up with existing public frontend interface names and top-level fields. It does not replace hand-authored types, assert deep assignability, import generated files from product code, or change runtime behavior.

## Generated DocumentView Alias Trial

The first selective adoption slice now uses the private generated OpenAPI reference for one public frontend type:

```bash
backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --generated-type-adoptions
backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check-generated-type-adoptions
```

Behavior:

- `frontend/src/types/reader.ts` preserves the public `DocumentView` export name as a type-only alias to the generated `DocumentView` schema.
- `frontend/src/types.ts` remains the public type barrel, so existing callers keep importing `DocumentView` from the same place.
- `scripts/contracts/expected_generated_type_adoptions.json` allows exactly this adoption and records deferred types that should not be adopted in the same slice.
- `--check-generated-type-adoptions` fails if the alias import disappears, if `DocumentView` becomes a hand-authored interface again, or if an unreviewed generated alias adoption appears.
- The generated type mapping check treats fixture-approved generated aliases as generated-shape-backed, keeping the earlier mapping lane useful after the first adoption.
- The check is wired into `backend/tests/test_contract_inventory.py` beside the contract drift, OpenAPI snapshot, generated-reference, and generated-mapping checks.

This remains a type-only frontend contract change. It does not import generated OpenAPI types from runtime API code, generate a client, change backend schema, alter route behavior, or update UI.

`DocumentRecord` stays deferred even though it is a small record. The generated OpenAPI schema marks default-backed fields such as `available_modes` and `progress_by_mode` optional, while frontend Reader paths treat them as present. That makes it a poor first adoption unless a later slice adds a stricter compatibility overlay.

## Generation-Ready Surface

These areas are good candidates for generated-reference checks because their frontend names already align with OpenAPI component schema names:

| Domain | Generation-ready contracts |
| --- | --- |
| Reader/settings | `ViewBlock`, `DocumentView`, `ReaderSettings`, `AccessibilitySnapshot`, `ReaderSessionState`, `HealthResponse`, `ReadingCompleteResult` |
| Documents | `DocumentRecord`, `RecallDocumentRecord`, `RecallDocumentPreview` |
| Recall notes/search | `RecallNoteAnchor`, `RecallNoteRecord`, `RecallNoteCreateRequest`, `RecallNoteUpdateRequest`, note promotion requests, `RecallNoteSearchHit`, `RecallSearchHit`, `RecallRetrievalHit` |
| Graph | `KnowledgeNodeRecord`, `KnowledgeEdgeRecord`, `KnowledgeMentionRecord`, `KnowledgeNodeDetail`, `KnowledgeGraphSnapshot` |
| Study | Most card, settings, progress, session, attempt, generation, and management response/request models |
| Import/library/workspace | Most batch import, collection, reading queue, manifest, merge preview, import preview/apply, and workspace integrity models |

Local field-name comparison found 84 shared OpenAPI schema/interface names with identical top-level property names. This supports a staged generated-reference file, especially for response records and stable request models.

## Alias And Name Drift

These differences are intentional and must be preserved before any generated type adoption:

| Backend/OpenAPI name | Frontend representation | Decision |
| --- | --- | --- |
| `DocumentMode` | `ViewMode` | Keep `ViewMode` as the public frontend name; map to generated schema if introduced. |
| `DetailLevel` | `SummaryDetail`; `DocumentView.detail_level` includes `'default'` | Keep the frontend distinction because summary detail and view detail are not the same UX concept. |
| `StudyReviewRatingLabel` | `StudyReviewRating` | Keep the shorter frontend vocabulary name. |
| `RetrievalHitType` | Frontend alias for `RecallRetrievalHit.hit_type` | Keep hand-authored unless OpenAPI exposes a stable component alias. |
| `StudyGeneratedCardType` | Frontend alias over manual/generated Study payload presentation | Keep hand-authored. |
| `LibraryReadingQueueRow.state` | `Exclude<LibraryReadingQueueState, 'all'>` | Keep the stronger frontend expression. |
| `StudyCardQuestionPayload` | Frontend discriminated union | Keep hand-authored unless the backend emits a true discriminated union. |

Some exact backend Literal aliases are not emitted as OpenAPI component schemas, including `GraphReviewStatus`, `StudyCardStatus`, `StudyKnowledgeStage`, `StudyManualCardType`, `StudyQuestionDifficulty`, `StudyQuestionDifficultyFilter`, `BatchResolvedImportFormat`, `BatchImportFormat`, `LibraryReadingQueueScope`, and `LibraryReadingQueueState`. A generator may preserve their enum values but not their current root type names unless configured or wrapped.

## Backend-Only Or Context-Only Shapes

These backend models should not be pulled into the public frontend barrel just because they exist in Python:

- Storage/domain internals: `SourceDocument`, `DocumentVariant`, `ContentChunk`, `EntityMention`, `KnowledgeNode`, `KnowledgeEdge`, `RelationEvidence`, `ReviewCard`, `ReviewEvent`, `ReadingSession`, `WorkspaceDataPayload`.
- Browser extension/context contracts: `BrowserContextRequest`, `BrowserContextResponse`, `BrowserRecallNoteCreateRequest`, `BrowserSavedPageMatch`.
- Operational workspace shapes not currently exposed through frontend wrappers: `WorkspaceChangeLogPage`, `ChangeEvent`, `WorkspaceRepairResult`, and `WorkspaceIntegrityIssue`.

Generated types can include these inside a private reference namespace, but they should not become public frontend exports without an explicit product or extension need.

## Inline And Browser Behavior Cases

Generation will be awkward around the places where `api.ts` intentionally offers a friendlier function surface than the backend request schema:

- Multipart `FormData` routes generate FastAPI `Body_*` schema names for document file import, batch import preview/apply, and workspace import preview/apply.
- File/download routes return preview assets, Markdown, attachments, or ZIPs rather than JSON models.
- Query parameters are represented as function arguments today, not exported frontend request types.
- `saveProgress` returns inline `{ ok: boolean }`.
- Small request bodies are intentionally inline in API wrappers: graph decisions, study review rating, schedule/unschedule actions, reading completion, transform requests, progress updates, text import, URL import, and bulk delete.
- `fetchRecallDocumentPreview` normalizes backend `asset_url` values before returning them to the app.

These are not bugs. They are the reason generated TypeScript should start as a reference and drift check, not as the runtime API client or public type barrel.

## Tooling Options

| Option | Value | Risk | Dependency impact | Recommendation |
| --- | --- | --- | --- | --- |
| Normalized OpenAPI snapshot/check lane | Makes schema drift reviewable before type generation | Low | None | Keep as a prerequisite guard |
| `openapi-typescript` private generated reference | Generates runtime-free `paths` and `components` types from OpenAPI 3.x; can be checked without replacing wrappers | Medium | One frontend dev dependency | Keep private and reference-only |
| Narrow in-repo generator | No npm dependency and can preserve names exactly | Medium-high because edge cases accumulate quickly | None | Defer unless third-party output proves unsuitable |
| Orval | Generates models plus clients and can target Fetch/React Query/SWR | Medium-high because current wrappers already encode important behavior | New generator dependency and config | Do not lead with it |
| OpenAPI Generator `typescript-fetch` | Broad client generator with many options | High for this repo because it generates a client/runtime surface and has documented union/`anyOf` support limits | Heavier toolchain/runtime surface | Not recommended now |
| No generated-type work | Lowest risk | Leaves schema drift less visible than it could be | None | Acceptable fallback, weaker than snapshot |

`openapi-typescript` is the best fit if generated types are introduced because its docs describe runtime-free type generation from OpenAPI 3.0/3.1 schemas, local JSON/YAML input, and `paths` / `components` imports. It also has a CLI `--check` mode and root-type options. That makes it better aligned with the existing `request<T>()` wrappers than a generated client.

Orval is more powerful than this slice needs: its docs emphasize type-safe clients, models, Fetch API output, and data-fetching integrations. That is useful in a client-generation project but too much for a repo where `frontend/src/api.ts` must remain the stable wrapper layer.

OpenAPI Generator's `typescript-fetch` generator is broad and stable, but it generates a Fetch client library and its feature table marks OpenAPI union/`anyOf`/`oneOf` schema support as unsupported. Accessible Reader's FastAPI/Pydantic OpenAPI output uses nullable and union-style schemas, so this is a poor first move.

## Proposed Staging

### Stage 1: OpenAPI Snapshot Lane

Add a developer-only command that emits a normalized contract snapshot from `app.openapi()`, not generated TypeScript. The snapshot should include:

- OpenAPI version and schema count.
- Schema names excluding FastAPI validation schemas.
- Route operation keys by method/path.
- Multipart and download exceptions.
- Compatibility alias map: `DocumentMode -> ViewMode`, `DetailLevel -> SummaryDetail`, `StudyReviewRatingLabel -> StudyReviewRating`, and other intentional frontend aliases.
- Backend-only/context-only schemas accepted for now.

This should extend the current contract script or add a tiny companion script using the same stdlib-only style. It should be wired into the existing backend pytest wrapper or a new focused pytest.

### Stage 2: Generated Reference Experiment

This stage now exists as `frontend/src/generated/openapi.ts` plus the `--check-generated-openapi-reference` command. Keep it private until it has been reviewed across a few contract-changing slices.

### Stage 3: Selective Alias Adoption

This stage has started with a single `DocumentView` alias trial. Treat that as a review gate before adopting additional generated aliases. Later candidates should still be low-risk response records where names and fields already align, such as reader/settings records, graph snapshots, library reading queue, and batch import responses.

Keep these hand-authored until explicit follow-up work:

- `StudyCardQuestionPayload`
- `StudyGeneratedCardType`
- `RetrievalHitType`
- API wrapper request ergonomics
- Multipart body types
- Download/asset URL helpers
- Browser-extension-only contracts

## Recommendation

Primary recommendation: review the single `DocumentView` generated-alias trial before expanding generated type adoption. The next slice should be a review/merge decision for this trial, not a second alias in the same branch.

Fallback recommendation: keep `DocumentView` hand-authored, retain the contract drift, OpenAPI snapshot, generated-reference, generated-mapping, and generated-adoption checks as review-only guards, and return to product work if selective alias adoption looks noisy.

Do not replace `frontend/src/types.ts` or `frontend/src/api.ts`. Treat generated types as a private reference until the alias map and inline request-body decisions are fully explicit.

## Sources

- `openapi-typescript` docs: https://openapi-ts.dev/introduction and https://openapi-ts.dev/cli
- Orval docs: https://orval.dev/docs/
- OpenAPI Generator `typescript-fetch` docs: https://openapi-generator.tech/docs/generators/typescript-fetch/
