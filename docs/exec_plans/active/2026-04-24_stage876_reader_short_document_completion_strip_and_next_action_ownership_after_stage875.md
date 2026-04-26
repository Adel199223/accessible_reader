# Stage 876 - Reader Short-Document Completion Strip And Next-Action Ownership After Stage 875

## Summary

- Reopen `Reader` after the Stage 875 embedded Notebook checkpoint.
- Keep the Stage 864/866 short-document content-fit article field intact, but remove the unfinished feeling caused by the large blank first viewport below tiny short documents.
- Add one compact article-owned completion strip for at-rest short `Original` and `Reflowed` documents using existing Source and Notebook handoffs only.

## Scope

- Update `ReaderWorkspace` so short `Original` and short `Reflowed` documents at rest render a thin next-action strip directly below the article field.
- Keep the compact Reader source/header ribbon unchanged, including `Source`, title/meta, `Original / Reflowed`, `Read aloud`, overflow, and note-count ownership.
- Do not render the strip for long/preview-backed documents, generated modes, loading/error states, or when Source/Notebook support is expanded.
- Preserve support-open short-document continuity from Stage 866/867.

## Implementation Notes

- The strip should open existing Source and Notebook support paths; it must not create note data directly or add new routing/backend contracts.
- Use distinct accessible labels for strip buttons so the existing top source-strip note trigger remains unambiguous.
- Generated `Simplified` and `Summary` outputs, transform logic, cache semantics, placeholders, and mode routing remain frozen.

## Validation

- Targeted Reader/App Vitest for short original/reflowed strip visibility, strip handoffs, long-document absence, support-open continuity, and generated-mode invariants.
- `node --check` on the shared Reader harness plus Stage 876/877 scripts.
- Live Stage 876/877 browser evidence when the local app is available.
- Standard build, backend graph test, and `git diff --check`.
