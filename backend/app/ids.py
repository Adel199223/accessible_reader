from __future__ import annotations

from datetime import UTC, datetime
import os
import uuid


def new_uuid7() -> uuid.UUID:
    """Return a UUIDv7-compatible identifier without adding a new dependency."""

    timestamp_ms = int(datetime.now(UTC).timestamp() * 1000)
    random_bytes = os.urandom(10)

    value = timestamp_ms << 80
    value |= 0x7 << 76
    value |= (int.from_bytes(random_bytes[:2], "big") & 0x0FFF) << 64
    value |= 0b10 << 62
    value |= int.from_bytes(random_bytes[2:], "big") & ((1 << 62) - 1)

    return uuid.UUID(int=value)


def new_uuid7_str() -> str:
    return str(new_uuid7())
