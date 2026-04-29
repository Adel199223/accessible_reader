# Stage 968 - Library Collection Tree After Stage 967

## Status

Completed on April 29, 2026.

## Intent

Turn persisted flat import collections into a lightweight local collection/tag tree so bookmark folder structure stays navigable across Home, Study, Graph, source learning exports, and workspace backup/restore.

## Scope

- Extend Library settings additively with `parent_id` and `sort_index` for custom collections.
- Keep legacy flat collections as root collections and validate no missing parents, self-parenting, cycles, or nesting deeper than five levels.
- Make bookmark-folder bulk import suggestions hierarchical while keeping Pocket and URL-list tags as root collections.
- Create parent/leaf import collections deterministically; attach imported/reused sources to leaf collections only and compute parent membership from descendants.
- Update Home collection management with compact tree rows, create-child, reparent, delete-with-child-promotion, aggregate parent boards, and persistent bulk assignment.
- Preserve Study custom subset filters, Graph `tag:` filtering, learning-pack provenance, workspace export/restore portability, Add Content single imports, Reader outputs, Study FSRS semantics, and cleanup hygiene.

## Validation Plan

- Backend tests for settings normalization/validation, hierarchical bookmark preview/apply, root tag compatibility, learning-pack provenance, and workspace-data preservation.
- Frontend tests for Add Content hierarchy display, Home tree create/reparent/delete/assignment persistence, parent aggregate boards, Study subset filtering, and Graph tag ancestry.
- Focused Stage 968 Playwright evidence for bookmark hierarchy import, Home tree persistence, parent aggregate board behavior, Study/Graph hierarchy use, and cleanup dry-run `matchedCount: 0`.
- Broad backend/frontend validation, Stage 969 audit evidence, build/typecheck, and `git diff --check`.

## Completion Notes

- Library settings now store optional `parent_id` and `sort_index`, validate strict saves, preserve legacy root collections, and compute ancestor membership for source learning exports.
- Bulk bookmark imports now create parent/leaf collection suggestions and apply parent collections without duplicating document ids into ancestors.
- Home renders custom collections as an indented tree, supports child creation, reparenting, delete-with-child-promotion, persistent assignment, and parent aggregate boards.
- Study custom subset rows and Graph `tag:` filtering now understand ancestor/direct collection names.
- Stage 968 and Stage 969 Playwright evidence passed with cleanup dry-run `matchedCount: 0`.
