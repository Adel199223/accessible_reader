from __future__ import annotations

from datetime import UTC, datetime, timedelta
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
STUDY_CONFIDENT_STABILITY_THRESHOLD = 7.0
STUDY_MASTERED_STABILITY_THRESHOLD = 30.0
STUDY_MANUAL_UNSCHEDULE_DAYS = 7
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
GENERATED_STUDY_CARD_TYPES = (
    "short_answer",
    "flashcard",
    "multiple_choice",
    "true_false",
    "fill_in_blank",
    "matching",
    "ordering",
)
GENERATED_STUDY_DIFFICULTY_BY_TYPE = {
    "flashcard": "easy",
    "true_false": "easy",
    "multiple_choice": "medium",
    "fill_in_blank": "medium",
    "short_answer": "hard",
    "matching": "hard",
    "ordering": "hard",
}
_STRUCTURED_GENERATED_STUDY_CARD_TYPES = {
    "multiple_choice",
    "true_false",
    "fill_in_blank",
    "matching",
    "ordering",
}
_SENTENCE_SPLIT_RE = re.compile(r"(?<=[.!?])\s+")


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
    next_state.pop("manual_schedule_state", None)
    next_state.pop("unscheduled_at", None)
    next_state.pop("unscheduled_until", None)
    next_state["status"] = study_card_status(next_state, now_iso=review_log.review_datetime.isoformat())
    return next_state, int(review_log.rating.value)


def update_study_schedule_state(
    current_state: dict[str, Any],
    action: str,
    *,
    timestamp: str | None = None,
) -> dict[str, Any]:
    action_timestamp = timestamp or datetime.now(UTC).isoformat()
    action_datetime = _parse_iso_datetime(action_timestamp) or datetime.now(UTC)
    next_state = {**current_state}
    if action == "unschedule":
        next_state["manual_schedule_state"] = "unscheduled"
        next_state["unscheduled_at"] = action_datetime.isoformat()
        next_state["unscheduled_until"] = (action_datetime + timedelta(days=STUDY_MANUAL_UNSCHEDULE_DAYS)).isoformat()
        next_state["status"] = "unscheduled"
        return next_state

    next_state.pop("manual_schedule_state", None)
    next_state.pop("unscheduled_at", None)
    next_state.pop("unscheduled_until", None)
    next_state["due_at"] = action_datetime.isoformat()
    fsrs_state = next_state.get("fsrs")
    if isinstance(fsrs_state, dict):
        next_state["fsrs"] = {
            **fsrs_state,
            "due": action_datetime.isoformat(),
        }
    next_state["status"] = study_card_status(next_state, now_iso=action_datetime.isoformat())
    return next_state


def study_card_status(scheduling_state: dict[str, Any], *, now_iso: str | None = None) -> str:
    now = _parse_iso_datetime(now_iso) if now_iso else None
    if now is None:
        now = datetime.now(UTC)
    if scheduling_state.get("manual_schedule_state") == "unscheduled":
        unscheduled_until = _parse_iso_datetime(str(scheduling_state.get("unscheduled_until") or ""))
        if unscheduled_until and unscheduled_until > now:
            return "unscheduled"

    due_at = str(scheduling_state.get("due_at") or "")
    review_count = int(scheduling_state.get("review_count", 0))
    if review_count == 0:
        return "new"
    if not due_at:
        return "new"
    due_datetime = _parse_iso_datetime(due_at)
    if due_datetime is None:
        return "new"
    return "due" if due_datetime <= now else "scheduled"


def _parse_iso_datetime(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        parsed = datetime.fromisoformat(value)
    except ValueError:
        return None
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=UTC)
    return parsed


def study_knowledge_stage(scheduling_state: dict[str, Any]) -> str:
    review_count = int(scheduling_state.get("review_count", 0) or 0)
    if review_count == 0:
        return "new"
    last_rating = str(scheduling_state.get("last_rating") or "")
    if last_rating in {"forgot", "hard"}:
        return "learning"
    fsrs_state = _optional_int((scheduling_state.get("fsrs") or {}).get("state"))
    if fsrs_state in {1, 3}:
        return "learning"
    stability = _optional_float((scheduling_state.get("fsrs") or {}).get("stability"))
    if stability is not None and stability >= STUDY_MASTERED_STABILITY_THRESHOLD:
        return "mastered"
    if stability is not None and stability >= STUDY_CONFIDENT_STABILITY_THRESHOLD:
        return "confident"
    return "practiced"


def stable_fsrs_card_id(review_card_id: str) -> int:
    return int(sha256(review_card_id.encode("utf-8")).hexdigest()[:15], 16)


def _optional_float(value: Any) -> float | None:
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _optional_int(value: Any) -> int | None:
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def build_review_card_candidates(
    *,
    chunks: list[ContentChunk],
    nodes: list[KnowledgeNode],
    edges: list[KnowledgeEdge],
    document_titles: dict[str, str],
    question_types: list[str] | tuple[str, ...] | None = None,
    source_document_id: str | None = None,
    max_per_source: int = 8,
    difficulty: str = "all",
) -> list[dict[str, Any]]:
    node_by_id = {node.id: node for node in nodes}
    requested_types = _normalize_generated_question_types(question_types)
    requested_difficulty = _normalize_generated_difficulty(difficulty)
    capped_max_per_source = min(max(int(max_per_source or 8), 1), 20)
    chunks_sorted = [
        chunk
        for chunk in sorted(chunks, key=lambda chunk: (chunk.source_document_id, chunk.ordinal, chunk.id))
        if not source_document_id or chunk.source_document_id == source_document_id
    ]
    chunks_by_document: dict[str, list[ContentChunk]] = {}
    for chunk in chunks_sorted:
        chunks_by_document.setdefault(chunk.source_document_id, []).append(chunk)

    source_labels = _source_labels_by_document(
        chunks=chunks_sorted,
        nodes=nodes,
        node_by_id=node_by_id,
        document_titles=document_titles,
    )
    relation_facts = _relation_facts_by_document(
        edges=edges,
        node_by_id=node_by_id,
        source_document_id=source_document_id,
    )
    cards_by_document_and_type: dict[str, dict[str, list[dict[str, Any]]]] = {}

    def add_candidate(candidate: dict[str, Any]) -> None:
        if candidate["card_type"] not in requested_types:
            return
        candidate_difficulty = GENERATED_STUDY_DIFFICULTY_BY_TYPE.get(candidate["card_type"], "medium")
        if requested_difficulty != "all" and candidate_difficulty != requested_difficulty:
            return
        candidate["question_difficulty"] = candidate_difficulty
        prompt = normalize_whitespace(str(candidate.get("prompt") or ""))
        answer = normalize_whitespace(str(candidate.get("answer") or ""))
        if not prompt or not answer:
            return
        source_id = str(candidate.get("source_document_id") or "")
        if source_document_id and source_id != source_document_id:
            return
        candidate["prompt"] = prompt
        candidate["answer"] = answer
        candidate["document_title"] = document_titles.get(source_id, "Untitled")
        support_payload = candidate.get("question_support_payload")
        if not isinstance(support_payload, dict):
            support_payload = _question_support_payload_for_candidate(candidate)
        if support_payload:
            candidate["question_support_payload"] = support_payload
        type_bucket = cards_by_document_and_type.setdefault(source_id, {}).setdefault(candidate["card_type"], [])
        duplicate_key = (candidate["id"], prompt.casefold())
        if any((existing["id"], existing["prompt"].casefold()) == duplicate_key for existing in type_bucket):
            return
        type_bucket.append(candidate)

    for source_id, facts in relation_facts.items():
        labels = source_labels.get(source_id, [])
        for fact in facts:
            add_candidate(
                {
                    "id": build_review_card_id("short_answer", source_id, f"edge:{fact['edge_id']}"),
                    "source_document_id": source_id,
                    "prompt": fact["prompt"],
                    "answer": fact["answer"],
                    "card_type": "short_answer",
                    "source_spans": [fact["source_span"]],
                }
            )
            add_candidate(
                {
                    "id": build_review_card_id("flashcard", source_id, f"edge:{fact['edge_id']}"),
                    "source_document_id": source_id,
                    "prompt": f"Review {fact['source_label']}.",
                    "answer": f"{fact['source_label']} {fact['relation_label']} {fact['answer']}.",
                    "card_type": "flashcard",
                    "source_spans": [fact["source_span"]],
                }
            )
            multiple_choice_payload = _choice_payload(
                correct_answer=fact["answer"],
                candidates=labels,
                stable_key=f"multiple_choice:{fact['edge_id']}",
            )
            if multiple_choice_payload:
                add_candidate(
                    {
                        "id": build_review_card_id("multiple_choice", source_id, f"edge:{fact['edge_id']}"),
                        "source_document_id": source_id,
                        "prompt": fact["prompt"],
                        "answer": fact["answer"],
                        "card_type": "multiple_choice",
                        "question_payload": multiple_choice_payload,
                        "source_spans": [fact["source_span"]],
                    }
                )
            add_candidate(
                {
                    "id": build_review_card_id("true_false", source_id, f"edge:{fact['edge_id']}:true"),
                    "source_document_id": source_id,
                    "prompt": f"True or false: {fact['source_label']} {fact['relation_label']} {fact['answer']}.",
                    "answer": "True",
                    "card_type": "true_false",
                    "question_payload": _true_false_payload(True),
                    "source_spans": [fact["source_span"]],
                }
            )
            false_answer = _first_distinct_label(labels, {fact["source_label"], fact["answer"]})
            if false_answer:
                add_candidate(
                    {
                        "id": build_review_card_id("true_false", source_id, f"edge:{fact['edge_id']}:false"),
                        "source_document_id": source_id,
                        "prompt": f"True or false: {fact['source_label']} {fact['relation_label']} {false_answer}.",
                        "answer": "False",
                        "card_type": "true_false",
                        "question_payload": _true_false_payload(False),
                        "source_spans": [fact["source_span"]],
                    }
                )

    for chunk in chunks_sorted:
        best_label = _best_chunk_label(chunk, node_by_id)
        if not best_label:
            continue
        excerpt = _truncate_generated_text(chunk.text, 220)
        source_span = _chunk_source_span(chunk, generated_card_type="chunk")
        cloze_prompt = _build_cloze_prompt(chunk.text, best_label)
        labels = source_labels.get(chunk.source_document_id, [])
        add_candidate(
            {
                "id": build_review_card_id("short_answer", chunk.source_document_id, f"chunk:{chunk.id}"),
                "source_document_id": chunk.source_document_id,
                "prompt": (
                    f"Which source concept completes this passage? {cloze_prompt}"
                    if cloze_prompt != normalize_whitespace(chunk.text)
                    else f"Which concept is central to this source passage? {excerpt}"
                ),
                "answer": best_label,
                "card_type": "short_answer",
                "source_spans": [source_span],
            }
        )
        add_candidate(
            {
                "id": build_review_card_id("flashcard", chunk.source_document_id, f"chunk:{chunk.id}"),
                "source_document_id": chunk.source_document_id,
                "prompt": f"What should you remember about {best_label}?",
                "answer": excerpt,
                "card_type": "flashcard",
                "source_spans": [source_span],
            }
        )
        multiple_choice_payload = _choice_payload(
            correct_answer=best_label,
            candidates=labels,
            stable_key=f"chunk-multiple-choice:{chunk.id}",
        )
        if multiple_choice_payload:
            add_candidate(
                {
                    "id": build_review_card_id("multiple_choice", chunk.source_document_id, f"chunk:{chunk.id}"),
                    "source_document_id": chunk.source_document_id,
                    "prompt": f"Which source concept appears in this passage? {excerpt}",
                    "answer": best_label,
                    "card_type": "multiple_choice",
                    "question_payload": multiple_choice_payload,
                    "source_spans": [source_span],
                }
            )
        fill_blank_payload = _fill_blank_payload(
            template=cloze_prompt.replace("____", "{{blank}}"),
            correct_answer=best_label,
            candidates=labels,
            stable_key=f"fill-in-blank:{chunk.id}",
        )
        if cloze_prompt != normalize_whitespace(chunk.text) and fill_blank_payload:
            add_candidate(
                {
                    "id": build_review_card_id("fill_in_blank", chunk.source_document_id, f"chunk:{chunk.id}"),
                    "source_document_id": chunk.source_document_id,
                    "prompt": "Choose the source phrase that completes the blank.",
                    "answer": best_label,
                    "card_type": "fill_in_blank",
                    "question_payload": fill_blank_payload,
                    "source_spans": [source_span],
                }
            )

    for source_id, source_chunks in chunks_by_document.items():
        matching_pairs = _matching_pairs_for_source(
            relation_facts=relation_facts.get(source_id, []),
            chunks=source_chunks,
            node_by_id=node_by_id,
        )
        if matching_pairs:
            add_candidate(
                {
                    "id": build_review_card_id("matching", source_id, _stable_payload_key("matching", matching_pairs)),
                    "source_document_id": source_id,
                    "prompt": "Match each source concept to its grounded meaning.",
                    "answer": "; ".join(f"{pair['left']} -> {pair['right']}" for pair in matching_pairs),
                    "card_type": "matching",
                    "question_payload": {
                        "kind": "matching",
                        "pairs": matching_pairs,
                    },
                    "source_spans": [
                        _chunk_source_span(chunk, generated_card_type="matching")
                        for chunk in source_chunks[: len(matching_pairs)]
                    ],
                }
            )
        ordering_items = _ordering_items_for_source(source_chunks)
        if ordering_items:
            add_candidate(
                {
                    "id": build_review_card_id("ordering", source_id, _stable_payload_key("ordering", ordering_items)),
                    "source_document_id": source_id,
                    "prompt": "Put these source ideas in reading order.",
                    "answer": "; ".join(item["text"] for item in ordering_items),
                    "card_type": "ordering",
                    "question_payload": {
                        "kind": "ordering",
                        "items": ordering_items,
                    },
                    "source_spans": [
                        _chunk_source_span(chunk, generated_card_type="ordering")
                        for chunk in source_chunks[: len(ordering_items)]
                    ],
                }
            )

    limited_cards: list[dict[str, Any]] = []
    for source_id in sorted(cards_by_document_and_type):
        per_type = cards_by_document_and_type[source_id]
        for type_cards in per_type.values():
            type_cards.sort(
                key=lambda card: (
                    card["prompt"].lower(),
                    card["answer"].lower(),
                    card["id"],
                )
            )
        while len(limited_cards_for_source := [
            card for card in limited_cards if card["source_document_id"] == source_id
        ]) < capped_max_per_source:
            added_this_round = False
            for question_type in requested_types:
                type_cards = per_type.get(question_type, [])
                if not type_cards:
                    continue
                next_card = type_cards.pop(0)
                limited_cards.append(next_card)
                added_this_round = True
                if len(limited_cards_for_source) + 1 >= capped_max_per_source:
                    break
                limited_cards_for_source.append(next_card)
            if not added_this_round:
                break
    limited_cards.sort(
        key=lambda card: (
            card["source_document_id"],
            requested_types.index(card["card_type"]) if card["card_type"] in requested_types else 99,
            card["prompt"].lower(),
        )
    )
    return limited_cards


def _normalize_generated_question_types(question_types: list[str] | tuple[str, ...] | None) -> list[str]:
    if not question_types:
        return list(GENERATED_STUDY_CARD_TYPES)
    normalized: list[str] = []
    for question_type in question_types:
        if question_type in GENERATED_STUDY_CARD_TYPES and question_type not in normalized:
            normalized.append(question_type)
    return normalized or list(GENERATED_STUDY_CARD_TYPES)


def _normalize_generated_difficulty(difficulty: str | None) -> str:
    normalized = normalize_whitespace(str(difficulty or "all")).casefold()
    return normalized if normalized in {"all", "easy", "medium", "hard"} else "all"


def _source_labels_by_document(
    *,
    chunks: list[ContentChunk],
    nodes: list[KnowledgeNode],
    node_by_id: dict[str, KnowledgeNode],
    document_titles: dict[str, str],
) -> dict[str, list[str]]:
    labels_by_document: dict[str, list[str]] = {
        source_document_id: [title]
        for source_document_id, title in document_titles.items()
        if normalize_whitespace(title)
    }
    chunk_text_by_document: dict[str, str] = {}
    for chunk in chunks:
        chunk_text_by_document[chunk.source_document_id] = " ".join(
            [
                chunk_text_by_document.get(chunk.source_document_id, ""),
                normalize_whitespace(chunk.text),
            ]
        )
        best_label = _best_chunk_label(chunk, node_by_id)
        if best_label:
            _append_unique_label(labels_by_document.setdefault(chunk.source_document_id, []), best_label)
        for phrase in _source_phrases_from_text(chunk.text):
            _append_unique_label(labels_by_document.setdefault(chunk.source_document_id, []), phrase)

    for node in nodes:
        status = str(node.metadata.get("status", "suggested"))
        if status == "rejected":
            continue
        label = normalize_whitespace(node.label)
        if len(label) < 3:
            continue
        source_ids = [
            str(source_id)
            for source_id in node.metadata.get("source_document_ids", [])
            if str(source_id) in document_titles
        ]
        if not source_ids:
            lowered_label = label.casefold()
            source_ids = [
                source_id
                for source_id, text in chunk_text_by_document.items()
                if lowered_label in text.casefold()
            ]
        for source_id in source_ids:
            _append_unique_label(labels_by_document.setdefault(source_id, []), label)

    for source_id, labels in labels_by_document.items():
        labels.sort(key=lambda item: (len(item.split()) == 1, len(item), item.casefold()))
        labels_by_document[source_id] = labels[:18]
    return labels_by_document


def _relation_facts_by_document(
    *,
    edges: list[KnowledgeEdge],
    node_by_id: dict[str, KnowledgeNode],
    source_document_id: str | None,
) -> dict[str, list[dict[str, Any]]]:
    facts_by_document: dict[str, list[dict[str, Any]]] = {}
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
        prompt = _build_relation_prompt(edge.relation_type, source_node.label)
        answer = normalize_whitespace(target_node.label)
        if not prompt or not answer:
            continue
        for evidence in edge.evidence:
            if source_document_id and evidence.source_document_id != source_document_id:
                continue
            source_span = {
                "edge_id": edge.id,
                "chunk_id": evidence.metadata.get("chunk_id"),
                "block_id": evidence.block_id,
                "excerpt": normalize_whitespace(evidence.excerpt or ""),
                "generated_card_type": "relation",
                "node_ids": [edge.source_id, edge.target_id],
            }
            facts_by_document.setdefault(evidence.source_document_id, []).append(
                {
                    "answer": answer,
                    "edge_id": edge.id,
                    "prompt": prompt,
                    "relation_label": _relation_label(edge.relation_type),
                    "source_label": normalize_whitespace(source_node.label),
                    "source_span": source_span,
                }
            )
    for facts in facts_by_document.values():
        facts.sort(key=lambda fact: (fact["prompt"].casefold(), fact["answer"].casefold(), fact["edge_id"]))
    return facts_by_document


def _append_unique_label(labels: list[str], label: str) -> None:
    normalized = normalize_whitespace(label)
    if len(normalized) < 3:
        return
    if normalized.casefold() in {existing.casefold() for existing in labels}:
        return
    labels.append(normalized)


def _source_phrases_from_text(text: str) -> list[str]:
    normalized = normalize_whitespace(text)
    phrases: list[str] = []
    capitalized = re.findall(r"\b[A-Z][A-Za-z0-9'-]*(?:\s+[A-Z][A-Za-z0-9'-]*){0,3}\b", normalized)
    for phrase in capitalized:
        cleaned = normalize_whitespace(phrase)
        if cleaned.casefold() not in _STOP_WORDS and len(cleaned) >= 4:
            phrases.append(cleaned)
    if len(phrases) >= 4:
        return phrases[:6]
    tokens = [
        token
        for token in _TOKEN_RE.findall(normalized)
        if token.casefold() not in _STOP_WORDS and len(token) >= 4
    ]
    for index in range(max(0, len(tokens) - 1)):
        phrases.append(f"{tokens[index]} {tokens[index + 1]}")
        if len(phrases) >= 6:
            break
    return phrases[:6]


def _chunk_source_span(chunk: ContentChunk, *, generated_card_type: str) -> dict[str, Any]:
    return {
        "block_id": chunk.block_id,
        "chunk_id": chunk.id,
        "excerpt": _truncate_generated_text(chunk.text, 320),
        "generated_card_type": generated_card_type,
        "source_document_id": chunk.source_document_id,
    }


def _choice_payload(
    *,
    correct_answer: str,
    candidates: list[str],
    stable_key: str,
) -> dict[str, Any] | None:
    distractors = _distinct_distractors(correct_answer, candidates, limit=5)
    if not distractors:
        return None
    option_texts = [correct_answer, *distractors[: min(5, max(1, len(distractors)))]]
    if len(option_texts) < 2:
        return None
    correct_index = int(sha256(stable_key.encode("utf-8")).hexdigest()[:4], 16) % len(option_texts)
    ordered_texts = [text for text in option_texts[1:]]
    ordered_texts.insert(correct_index, correct_answer)
    choices = [
        {
            "id": f"choice-{chr(97 + index)}",
            "text": text,
        }
        for index, text in enumerate(ordered_texts[:6])
    ]
    correct_choice = next((choice for choice in choices if choice["text"].casefold() == correct_answer.casefold()), None)
    if not correct_choice:
        return None
    return {
        "kind": "multiple_choice",
        "choices": choices,
        "correct_choice_id": correct_choice["id"],
    }


def _fill_blank_payload(
    *,
    template: str,
    correct_answer: str,
    candidates: list[str],
    stable_key: str,
) -> dict[str, Any] | None:
    normalized_template = normalize_whitespace(template)
    if normalized_template.count("{{blank}}") != 1:
        return None
    payload = _choice_payload(
        correct_answer=correct_answer,
        candidates=candidates,
        stable_key=stable_key,
    )
    if not payload:
        return None
    return {
        **payload,
        "kind": "fill_in_blank",
        "template": normalized_template,
    }


def _true_false_payload(correct: bool) -> dict[str, Any]:
    return {
        "kind": "true_false",
        "choices": [
            {"id": "true", "text": "True"},
            {"id": "false", "text": "False"},
        ],
        "correct_choice_id": "true" if correct else "false",
    }


def _distinct_distractors(correct_answer: str, candidates: list[str], *, limit: int) -> list[str]:
    correct_key = normalize_whitespace(correct_answer).casefold()
    distractors: list[str] = []
    for candidate in candidates:
        normalized = normalize_whitespace(candidate)
        if not normalized or normalized.casefold() == correct_key:
            continue
        if normalized.casefold() in {existing.casefold() for existing in distractors}:
            continue
        distractors.append(normalized)
        if len(distractors) >= limit:
            break
    return distractors


def _first_distinct_label(labels: list[str], excluded: set[str]) -> str | None:
    excluded_keys = {label.casefold() for label in excluded}
    for label in labels:
        normalized = normalize_whitespace(label)
        if normalized and normalized.casefold() not in excluded_keys:
            return normalized
    return None


def _matching_pairs_for_source(
    *,
    relation_facts: list[dict[str, Any]],
    chunks: list[ContentChunk],
    node_by_id: dict[str, KnowledgeNode],
) -> list[dict[str, str]] | None:
    pairs: list[tuple[str, str]] = []
    for fact in relation_facts:
        pairs.append((fact["source_label"], fact["answer"]))
    if len(pairs) < 2:
        for chunk in chunks:
            label = _best_chunk_label(chunk, node_by_id)
            if not label:
                continue
            pairs.append((label, _truncate_generated_text(chunk.text, 120)))
            if len(pairs) >= 8:
                break
    normalized_pairs: list[dict[str, str]] = []
    seen_left: set[str] = set()
    seen_right: set[str] = set()
    for left, right in pairs:
        normalized_left = normalize_whitespace(left)
        normalized_right = normalize_whitespace(right)
        if not normalized_left or not normalized_right:
            continue
        if normalized_left.casefold() in seen_left or normalized_right.casefold() in seen_right:
            continue
        seen_left.add(normalized_left.casefold())
        seen_right.add(normalized_right.casefold())
        normalized_pairs.append(
            {
                "id": f"pair-{chr(97 + len(normalized_pairs))}",
                "left": normalized_left,
                "right": normalized_right,
            }
        )
        if len(normalized_pairs) >= 8:
            break
    return normalized_pairs if len(normalized_pairs) >= 2 else None


def _ordering_items_for_source(chunks: list[ContentChunk]) -> list[dict[str, str]] | None:
    item_texts = [_truncate_generated_text(chunk.text, 110) for chunk in chunks[:8]]
    if len(item_texts) < 2 and chunks:
        sentences = [
            _truncate_generated_text(sentence, 110)
            for sentence in _SENTENCE_SPLIT_RE.split(normalize_whitespace(chunks[0].text))
            if normalize_whitespace(sentence)
        ]
        item_texts = sentences[:8]
    normalized_items: list[dict[str, str]] = []
    seen: set[str] = set()
    for text in item_texts:
        normalized = normalize_whitespace(text)
        if not normalized or normalized.casefold() in seen:
            continue
        seen.add(normalized.casefold())
        normalized_items.append(
            {
                "id": f"item-{chr(97 + len(normalized_items))}",
                "text": normalized,
            }
        )
        if len(normalized_items) >= 8:
            break
    return normalized_items if len(normalized_items) >= 2 else None


def _stable_payload_key(prefix: str, payload: list[dict[str, str]]) -> str:
    joined = "|".join(
        ":".join(str(value) for key, value in sorted(item.items()) if key != "id")
        for item in payload
    )
    return f"{prefix}:{sha256(joined.encode('utf-8')).hexdigest()[:16]}"


def _relation_label(relation_type: str) -> str:
    labels = {
        "defines": "defines",
        "uses": "uses",
        "includes": "includes",
        "supports": "supports",
        "part_of": "is part of",
        "stores": "stores or captures",
        "related_to": "is closely related to",
    }
    return labels.get(relation_type, relation_type.replace("_", " "))


def _truncate_generated_text(text: str, limit: int) -> str:
    normalized = normalize_whitespace(text)
    if len(normalized) <= limit:
        return normalized
    return f"{normalized[: max(0, limit - 3)].rstrip()}..."


def _question_support_payload_for_candidate(candidate: dict[str, Any]) -> dict[str, str] | None:
    answer = normalize_whitespace(str(candidate.get("answer") or ""))
    source_excerpt = _candidate_source_excerpt(candidate)
    if not answer and not source_excerpt:
        return None
    masked_excerpt = _mask_answer_in_text(source_excerpt, answer)
    hint_source = masked_excerpt or source_excerpt
    hint = (
        f"Check the nearby source context: {hint_source}"
        if hint_source
        else f"Use the source evidence tied to this {str(candidate.get('card_type') or 'question').replace('_', ' ')}."
    )
    explanation_parts = []
    if answer:
        explanation_parts.append(f"The grounded answer is {answer}.")
    if source_excerpt:
        explanation_parts.append(f"Source context: {source_excerpt}")
    payload = {
        "hint": _truncate_generated_text(hint, 220),
        "explanation": _truncate_generated_text(" ".join(explanation_parts), 360),
    }
    if source_excerpt:
        payload["source_excerpt"] = _truncate_generated_text(source_excerpt, 320)
    return {key: value for key, value in payload.items() if value}


def _candidate_source_excerpt(candidate: dict[str, Any]) -> str:
    source_spans = candidate.get("source_spans")
    if not isinstance(source_spans, list):
        return ""
    excerpts: list[str] = []
    for source_span in source_spans[:2]:
        if not isinstance(source_span, dict):
            continue
        excerpt = normalize_whitespace(str(source_span.get("excerpt") or ""))
        if excerpt:
            excerpts.append(excerpt)
    return _truncate_generated_text(" ".join(excerpts), 320) if excerpts else ""


def _mask_answer_in_text(text: str, answer: str) -> str:
    normalized_text = normalize_whitespace(text)
    normalized_answer = normalize_whitespace(answer)
    if not normalized_text or not normalized_answer or len(normalized_answer) < 3:
        return normalized_text
    return re.sub(re.escape(normalized_answer), "____", normalized_text, flags=re.IGNORECASE)


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
