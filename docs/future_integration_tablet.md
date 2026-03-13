# Future Integration Log - Tablet Companion Path

- Every shared object needs a stable ID, timestamps, and portable metadata.
- Attachments should use portable file references and manifest-backed metadata.
- Add an append-only change log now so future tablet work has a stable event source.
- Defer CRDTs and live sync until there is a concrete companion-client slice and real merge requirements.
- Prefer shared source documents plus document variants over reader-only records so tablet-originated notes or captures can attach to the same identities later.
