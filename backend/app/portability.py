from __future__ import annotations

from datetime import datetime
from hashlib import sha256
import json
from typing import Any


WORKSPACE_EXPORT_FORMAT_VERSION = "1"
WORKSPACE_DATA_ARCHIVE_PATH = "workspace-data.json"


def canonical_json(payload: dict[str, Any]) -> str:
    return json.dumps(payload, ensure_ascii=True, separators=(",", ":"), sort_keys=True)


def build_payload_digest(payload: dict[str, Any]) -> str:
    return sha256(canonical_json(payload).encode("utf-8")).hexdigest()


def decide_merge_outcome(
    *,
    local_digest: str | None,
    local_updated_at: str | None,
    remote_digest: str,
    remote_updated_at: str | None,
) -> tuple[str, str]:
    if local_digest is None:
        return "import_remote", "missing_local_record"
    if local_digest == remote_digest:
        return "skip_equal", "payload_digest_match"

    local_key = _coerce_timestamp_key(local_updated_at)
    remote_key = _coerce_timestamp_key(remote_updated_at)
    if remote_key > local_key:
        return "prefer_remote", "newer_remote_timestamp"
    if remote_key < local_key:
        return "keep_local", "newer_local_timestamp"
    if remote_digest > local_digest:
        return "prefer_remote", "equal_timestamp_digest_tiebreak"
    return "keep_local", "equal_timestamp_digest_tiebreak"


def build_workspace_export_filename(exported_at: str) -> str:
    safe_stamp = exported_at.replace(":", "-")
    return f"recall-workspace-export-{safe_stamp}.zip"


def _coerce_timestamp_key(value: str | None) -> tuple[int, str]:
    if not value:
        return (0, "")
    try:
        parsed = datetime.fromisoformat(value)
        return (1, parsed.isoformat())
    except ValueError:
        return (1, value)
