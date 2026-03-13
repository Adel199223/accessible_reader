# Future Integration Log - Accessibility and Converter Path

- Preserve deterministic `Original`, `Reflowed`, `Simplified`, and `Summary` document variants as shared backend concepts.
- Keep accessibility metadata attached to shared document variants rather than only in reader UI state.
- Keep browser-native speech as the shipped read-aloud path for the reader/converter sibling app.
- Future converter work should reuse shared parsing, normalization, source hashing, and Markdown export/import contracts.
- Keep source provenance generic enough for pasted text, local files, and future web-link imports without splitting the document model.
