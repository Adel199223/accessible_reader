from __future__ import annotations

from datetime import UTC, datetime
from hashlib import sha256
import math
import re
from typing import Any, Iterable

from fsrs import Card as FsrsCard
from fsrs import Rating, Scheduler

from .models import ContentChunk, KnowledgeEdge, KnowledgeNode
from .text_utils import normalize_whitespace, safe_query_terms


LEXICAL_EMBEDDING_MODEL = "recall-lexical-v1"
STUDY_SCHEMA_VERSION = "1"
_TOKEN_RE = re.compile(r"[A-Za-z][A-Za-z0-9'-]{1,}")
_STOP_WORDS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "in",
    "into",
    "is",
    "it",
    "of",
    "on",
    "or",
    "that",
    "the",
    "to",
    "with",
}
_RATING_BY_LABEL = {
    "forgot": Rating.Again,
    "hard": Rating.Hard,
    "good": Rating.Good,
    "easy": Rating.Easy,
}


def build_sparse_vector(text: str, *, extra_terms: Iterable[str] = ()) -> dict[str, float]:
    weights: dict[str, float] = {}
    for token in safe_query_terms(text):
        if token in _STOP_WORDS or len(token) < 3:
            continue
        weights[token] = weights.get(token, 0.0) + 1.0

    for term in extra_terms:
        normalized = normalize_whitespace(term).lower()
        for token in _TOKEN_RE.findall(normalized):
            lowered = token.lower()
            if lowered in _STOP_WORDS or len(lowered) < 3:
                continue
            weights[lowered] = weights.get(lowered, 0.0) + 1.35

    norm = math.sqrt(sum(value * value for value in weights.values()))
    if norm == 0:
        return {}
    return {
        token: round(value / norm, 6)
        for token, value in sorted(weights.items())
    }


def cosine_similarity(left: dict[str, float], right: dict[str, float]) -> float:
    if not left or not right:
        return 0.0
    if len(left) > len(right):
        left, right = right, left
    score = sum(value * right.get(token, 0.0) for token, value in left.items())
    return max(0.0, min(1.0, score))


def build_embedding_id(item_type: str, item_id: str) -> str:
    return f"embedding:{item_type}:{sha256(item_id.encode('utf-8')).hexdigest()[:16]}"


def build_initial_scheduling_state(review_card_id: str, *, created_at: str | None = None) -> dict[str, Any]:
    fsrs_card = FsrsCard(card_id=stable_fsrs_card_id(review_card_id))
    fsrs_payload = fsrs_card.to_dict()
    due_at = str(fsrs_payload["due"])
    return {
        "due_at": due_at,
        "fsrs": fsrs_payload,
        "last_rating": None,
        "last_reviewed_at": None,
        "review_count": 0,
        "schema_version": STUDY_SCHEMA_VERSION,
        "status": "new",
        "created_at": created_at or due_at,
    }


def review_scheduling_state(
    review_card_id: str,
    current_state: dict[str, Any],
    rating_label: str,
    *,
    reviewed_at: str | None = None,
) -> tuple[dict[str, Any], int]:
    scheduler = Scheduler(enable_fuzzing=False)
    fsrs_card = _card_from_state(review_card_id, current_state)
    rating = _RATING_BY_LABEL[rating_label]
    review_datetime = (
        datetime.fromisoformat(reviewed_at)
        if reviewed_at
        else datetime.now(UTC)
    )
    updated_card, review_log = scheduler.review_card(fsrs_card, rating, review_datetime=review_datetime)
    next_state = {
        **current_state,
        "due_at": updated_card.due.isoformat(),
        "fsrs": updated_card.to_dict(),
        "last_rating": rating_label,
        "last_reviewed_at": review_log.review_datetime.isoformat(),
        "review_count": int(current_state.get("review_count", 0)) + 1,
        "schema_version": STUDY_SCHEMA_VERSION,
    }
    next_state["status"] = study_card_status(next_state, now_iso=review_log.review_datetime.isoformat())
    return next_state, int(review_log.rating.value)


def study_card_status(scheduling_state: dict[str, Any], *, now_iso: str | None = None) -> str:
    due_at = str(scheduling_state.get("due_at") or "")
    review_count = int(scheduling_state.get("review_count", 0))
    if review_count == 0:
        return "new"
    if not due_at:
        return "new"
    due_datetime = datetime.fromisoformat(due_at)
    now = datetime.fromisoformat(now_iso) if now_iso else datetime.now(UTC)
    return "due" if due_datetime <= now else "scheduled"


def stable_fsrs_card_id(review_card_id: str) -> int:
    return int(sha256(review_card_id.encode("utf-8")).hexdigest()[:15], 16)


def build_review_card_candidates(
    *,
    chunks: list[ContentChunk],
    nodes: list[KnowledgeNode],
    edges: list[KnowledgeEdge],
    document_titles: dict[str, str],
) -> list[dict[str, Any]]:
    node_by_id = {node.id: node for node in nodes}
    used_chunk_ids: set[str] = set()
    cards: list[dict[str, Any]] = []

    edges_sorted = sorted(
        edges,
        key=lambda edge: (
            -float(edge.confidence or 0.0),
            edge.relation_type,
            edge.id,
        ),
    )
    for edge in edges_sorted:
        status = str(edge.metadata.get("status", "suggested"))
        if status == "rejected" or (edge.confidence or 0.0) < 0.6:
            continue
        source_node = node_by_id.get(edge.source_id)
        target_node = node_by_id.get(edge.target_id)
        if not source_node or not target_node:
            continue
        primary_evidence = edge.evidence[0] if edge.evidence else None
        if not primary_evidence:
            continue
        source_document_id = primary_evidence.source_document_id
        prompt = _build_relation_prompt(edge.relation_type, source_node.label)
        answer = target_node.label
        if not prompt or not answer:
            continue
        used_chunk_id = str(primary_evidence.metadata.get("chunk_id", ""))
        if used_chunk_id:
            used_chunk_ids.add(used_chunk_id)
        cards.append(
            {
                "id": build_review_card_id("relation", source_document_id, edge.id),
                "source_document_id": source_document_id,
                "prompt": prompt,
                "answer": answer,
                "card_type": "relation",
                "source_spans": [
                    {
                        "edge_id": edge.id,
                        "chunk_id": primary_evidence.metadata.get("chunk_id"),
                        "block_id": primary_evidence.block_id,
                        "excerpt": primary_evidence.excerpt,
                        "node_ids": [edge.source_id, edge.target_id],
                    }
                ],
            }
        )

    chunks_sorted = sorted(chunks, key=lambda chunk: (chunk.source_document_id, chunk.ordinal, chunk.id))
    for chunk in chunks_sorted:
        if chunk.id in used_chunk_ids:
            continue
        best_label = _best_chunk_label(chunk, node_by_id)
        if not best_label:
            continue
        prompt = _build_cloze_prompt(chunk.text, best_label)
        if prompt == chunk.text:
            continue
        cards.append(
            {
                "id": build_review_card_id("cloze", chunk.source_document_id, chunk.id),
                "source_document_id": chunk.source_document_id,
                "prompt": prompt,
                "answer": best_label,
                "card_type": "cloze",
                "source_spans": [
                    {
                        "chunk_id": chunk.id,
                        "block_id": chunk.block_id,
                        "excerpt": normalize_whitespace(chunk.text),
                    }
                ],
            }
        )

    cards.sort(
        key=lambda card: (
            card["source_document_id"],
            card["card_type"],
            card["prompt"].lower(),
        )
    )

    limited_cards: list[dict[str, Any]] = []
    per_document_count: dict[str, int] = {}
    for card in cards:
        source_document_id = card["source_document_id"]
        next_count = per_document_count.get(source_document_id, 0)
        if next_count >= 6:
            continue
        per_document_count[source_document_id] = next_count + 1
        card["document_title"] = document_titles.get(source_document_id, "Untitled")
        limited_cards.append(card)
    return limited_cards


def _build_relation_prompt(relation_type: str, source_label: str) -> str:
    if relation_type == "defines":
        return f"What is {source_label}?"
    if relation_type == "uses":
        return f"What does {source_label} use?"
    if relation_type == "includes":
        return f"What does {source_label} include?"
    if relation_type == "supports":
        return f"What does {source_label} support?"
    if relation_type == "part_of":
        return f"{source_label} is part of what?"
    if relation_type == "stores":
        return f"What does {source_label} store or capture?"
    if relation_type == "related_to":
        return f"Which concept is closely related to {source_label} in the source?"
    return ""


def _best_chunk_label(chunk: ContentChunk, node_by_id: dict[str, KnowledgeNode]) -> str | None:
    text = normalize_whitespace(chunk.text)
    lowered = text.lower()
    candidates: list[tuple[float, str]] = []
    for node in node_by_id.values():
        status = str(node.metadata.get("status", "suggested"))
        if status == "rejected":
            continue
        label = normalize_whitespace(node.label)
        if len(label) < 4:
            continue
        if label.lower() not in lowered:
            continue
        candidates.append((float(node.confidence or 0.0), label))
    if not candidates:
        return None
    candidates.sort(key=lambda item: (-item[0], -len(item[1]), item[1].lower()))
    return candidates[0][1]


def _build_cloze_prompt(text: str, answer: str) -> str:
    pattern = re.compile(re.escape(answer), re.IGNORECASE)
    return pattern.sub("____", normalize_whitespace(text), count=1)


def build_review_card_id(card_type: str, source_document_id: str, source_key: str) -> str:
    return f"card:{sha256(f'{card_type}|{source_document_id}|{source_key}'.encode('utf-8')).hexdigest()[:16]}"


def _card_from_state(review_card_id: str, current_state: dict[str, Any]) -> FsrsCard:
    fsrs_payload = current_state.get("fsrs")
    if isinstance(fsrs_payload, dict):
        return FsrsCard.from_dict(fsrs_payload)
    return FsrsCard(card_id=stable_fsrs_card_id(review_card_id))
