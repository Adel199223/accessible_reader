from __future__ import annotations

from datetime import UTC, datetime
import hashlib
import re


SENTENCE_BREAK_RE = re.compile(r"(?<=[.!?])\s+(?=[A-Z0-9\"“‘'])")
WHITESPACE_RE = re.compile(r"\s+")


def now_iso() -> str:
    return datetime.now(UTC).isoformat()


def normalize_whitespace(text: str) -> str:
    cleaned = WHITESPACE_RE.sub(" ", text.replace("\u00a0", " ")).strip()
    return cleaned


def split_sentences(text: str) -> list[str]:
    normalized = normalize_whitespace(text)
    if not normalized:
        return []
    segments = SENTENCE_BREAK_RE.split(normalized)
    return [segment.strip() for segment in segments if segment.strip()]


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def safe_query_terms(text: str) -> list[str]:
    return re.findall(r"[A-Za-z0-9]{2,}", text.lower())
