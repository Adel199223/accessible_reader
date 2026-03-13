# Risk Log

- Open: active uncommitted frontend work may overlap with stabilization fixes.
- Open: the in-flight accessible-reader UI and web-link pass can invalidate the last known frontend baseline before Stage 1A reconciliation resumes.
- Open: moving from reader-only tables to shared workspace tables could regress reopen, progress, or settings if migration coverage is weak.
- Open: future Recall work could bloat the reader app if shared and reader-specific concerns are not separated early.
- Deferred: browser-extension latency and MV3 lifecycle behavior are important, but not part of the current slice.
