# Repo Fit Log

## What The Repo Already Solves Well
- local ingestion for TXT, Markdown, HTML, DOCX, and text-based PDF
- deterministic reflow and sentence segmentation
- local library/search/progress/settings behavior
- Edge-first browser speech controls
- opt-in AI transforms for `Simplify` and `Summary`

## What Should Be Preserved
- current frontend and backend split
- reader-facing API shapes
- deterministic local reading pipeline
- current parsing and transform modules as the base of the shared document core

## What Should Be Refactored
- storage should move from reader-only tables toward shared workspace tables
- backend domain models should separate shared document-core concepts from reader-facing response models
- roadmap docs should reflect the broader sibling-app direction instead of UI-only polish as the active milestone
- the shared source model should carry a generic locator so future URL import does not require another storage redesign

## What Should Wait
- frontend reconciliation until the parallel accessible-reader UI/web-link pass settles
- a separate Recall frontend
- graph extraction and study features
- browser extension work
- tablet sync implementation
