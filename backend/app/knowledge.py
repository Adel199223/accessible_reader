from __future__ import annotations

from collections import Counter, defaultdict
from dataclasses import dataclass
import re
from typing import Iterable

from .models import (
    ContentChunk,
    DocumentView,
    EntityMention,
    KnowledgeEdge,
    KnowledgeNode,
    RelationEvidence,
)
from .text_utils import normalize_whitespace, sha256_text, split_sentences


GRAPH_SCHEMA_VERSION = "1"
MAX_ALIASES = 6
MAX_EVIDENCE_PER_EDGE = 8
MAX_DESCRIPTION_CHARS = 180
TOKEN_RE = re.compile(r"[A-Za-z][A-Za-z0-9'-]{1,}")
CAPITALIZED_PHRASE_RE = re.compile(
    r"\b(?:[A-Z][A-Za-z0-9]+|[A-Z]{2,})(?:\s+(?:[A-Z][A-Za-z0-9]+|[A-Z]{2,}|of|for|and|to|the|in|on)){0,4}\b"
)
DATE_RE = re.compile(r"\b(?:19|20)\d{2}\b")
URL_RE = re.compile(r"https?://|www\.", re.IGNORECASE)
SMALL_WORDS = {"of", "for", "and", "to", "the", "in", "on"}
STOP_WORDS = {
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
    "has",
    "have",
    "if",
    "in",
    "into",
    "is",
    "it",
    "its",
    "of",
    "on",
    "or",
    "that",
    "the",
    "their",
    "this",
    "to",
    "was",
    "were",
    "will",
    "with",
}
GENERIC_PHRASES = {
    "background",
    "conclusion",
    "document",
    "example",
    "examples",
    "introduction",
    "overview",
    "section",
    "summary",
}
RELATION_PATTERNS: tuple[tuple[str, re.Pattern[str], float], ...] = (
    ("defines", re.compile(r"\b(?:is|are|refers to|means|describes)\b", re.IGNORECASE), 0.86),
    ("uses", re.compile(r"\b(?:uses|use|requires|require|depends on|relies on)\b", re.IGNORECASE), 0.82),
    ("includes", re.compile(r"\b(?:includes|include|contains|contain|consists of|comprises)\b", re.IGNORECASE), 0.8),
    ("supports", re.compile(r"\b(?:supports|support|helps|help|enables|enable)\b", re.IGNORECASE), 0.78),
    ("part_of", re.compile(r"\b(?:part of|belongs to)\b", re.IGNORECASE), 0.76),
    ("stores", re.compile(r"\b(?:stores|store|saves|save|captures|capture)\b", re.IGNORECASE), 0.74),
)


@dataclass(frozen=True)
class KnowledgeSourceDocument:
    source_document_id: str
    title: str
    variant_id: str
    view: DocumentView
    chunks: list[ContentChunk]


@dataclass(frozen=True)
class _CandidateMention:
    text: str
    start: int
    end: int
    confidence: float
    entity_type: str
    reason: str


@dataclass(frozen=True)
class _GraphEdgeCandidate:
    source_key: str
    target_key: str
    relation_type: str
    confidence: float
    excerpt: str
    source_document_id: str
    block_id: str | None
    chunk_id: str


def build_knowledge_records(
    documents: list[KnowledgeSourceDocument],
) -> tuple[list[EntityMention], list[KnowledgeNode], list[KnowledgeEdge]]:
    mentions: list[EntityMention] = []
    edge_candidates: list[_GraphEdgeCandidate] = []

    for document in documents:
        heading_phrases = _collect_heading_phrases(document.view)
        candidate_phrases = _collect_candidate_phrases(document.view, heading_phrases)
        for chunk in document.chunks:
            chunk_mentions = _extract_mentions_for_chunk(
                document=document,
                chunk=chunk,
                candidate_phrases=candidate_phrases,
                heading_phrases=heading_phrases,
            )
            mentions.extend(chunk_mentions)
            edge_candidates.extend(_extract_edges_for_chunk(document, chunk, chunk_mentions))

    node_mentions: dict[str, list[EntityMention]] = defaultdict(list)
    for mention in mentions:
        canonical_key = mention.normalized_text or ""
        if canonical_key:
            node_mentions[canonical_key].append(mention)

    nodes: list[KnowledgeNode] = []
    node_ids_by_key: dict[str, str] = {}
    for canonical_key, grouped_mentions in sorted(node_mentions.items()):
        grouped_mentions.sort(
            key=lambda mention: (
                -(mention.confidence or 0.0),
                -len(mention.text),
                mention.text.lower(),
            )
        )
        label = _choose_node_label(grouped_mentions)
        aliases = _choose_aliases(grouped_mentions, label)
        node_id = build_node_id(canonical_key)
        node_ids_by_key[canonical_key] = node_id
        nodes.append(
            KnowledgeNode(
                id=node_id,
                label=label,
                node_type=_infer_node_type(label),
                description=_choose_node_description(grouped_mentions),
                confidence=_aggregate_node_confidence(grouped_mentions),
                metadata={
                    "aliases": aliases,
                    "canonical_key": canonical_key,
                    "graph_schema_version": GRAPH_SCHEMA_VERSION,
                    "mention_count": len(grouped_mentions),
                    "source_document_ids": sorted(
                        {mention.source_document_id for mention in grouped_mentions}
                    ),
                    "status": "suggested",
                },
            )
        )

    aggregated_edges: dict[tuple[str, str, str], list[_GraphEdgeCandidate]] = defaultdict(list)
    for candidate in edge_candidates:
        if candidate.source_key == candidate.target_key:
            continue
        source_key = candidate.source_key
        target_key = candidate.target_key
        if candidate.relation_type == "related_to" and target_key < source_key:
            source_key, target_key = target_key, source_key
        aggregated_edges[(source_key, candidate.relation_type, target_key)].append(candidate)

    edges: list[KnowledgeEdge] = []
    for (source_key, relation_type, target_key), grouped_edges in sorted(aggregated_edges.items()):
        if source_key not in node_ids_by_key or target_key not in node_ids_by_key:
            continue
        grouped_edges.sort(
            key=lambda edge: (
                -(edge.confidence),
                edge.source_document_id,
                edge.chunk_id,
            )
        )
        edge_id = build_edge_id(source_key, relation_type, target_key)
        evidence = [
            RelationEvidence(
                id=f"{edge_id}:evidence:{index}",
                source_document_id=edge.source_document_id,
                block_id=edge.block_id,
                excerpt=edge.excerpt,
                confidence=edge.confidence,
                metadata={
                    "chunk_id": edge.chunk_id,
                    "graph_schema_version": GRAPH_SCHEMA_VERSION,
                },
            )
            for index, edge in enumerate(grouped_edges[:MAX_EVIDENCE_PER_EDGE])
        ]
        edges.append(
            KnowledgeEdge(
                id=edge_id,
                source_id=node_ids_by_key[source_key],
                target_id=node_ids_by_key[target_key],
                relation_type=relation_type,
                provenance="inferred",
                confidence=_aggregate_edge_confidence(grouped_edges),
                evidence=evidence,
                metadata={
                    "canonical_source_key": source_key,
                    "canonical_target_key": target_key,
                    "evidence_count": len(grouped_edges),
                    "graph_schema_version": GRAPH_SCHEMA_VERSION,
                    "source_document_ids": sorted({edge.source_document_id for edge in grouped_edges}),
                    "status": "suggested",
                },
            )
        )

    return mentions, nodes, edges


def build_node_id(canonical_key: str) -> str:
    return f"node:{sha256_text(canonical_key)[:16]}"


def build_edge_id(source_key: str, relation_type: str, target_key: str) -> str:
    return f"edge:{sha256_text(f'{source_key}|{relation_type}|{target_key}')[:16]}"


def normalize_entity_label(text: str) -> str:
    normalized = normalize_whitespace(text)
    normalized = re.sub(r"[^A-Za-z0-9\s-]", " ", normalized)
    normalized = normalize_whitespace(normalized).lower()
    return normalized


def _collect_heading_phrases(view: DocumentView) -> set[str]:
    phrases: set[str] = set()
    for block in view.blocks:
        if block.kind != "heading":
            continue
        normalized = normalize_entity_label(block.text)
        if _is_valid_phrase(normalized):
            phrases.add(normalized)
    return phrases


def _collect_candidate_phrases(view: DocumentView, heading_phrases: set[str]) -> dict[str, int]:
    counts: Counter[str] = Counter()
    for block in view.blocks:
        for sentence in split_sentences(block.text):
            tokens = [token.lower() for token in TOKEN_RE.findall(sentence)]
            if not tokens:
                continue
            for size in (1, 2, 3):
                if len(tokens) < size:
                    continue
                for index in range(len(tokens) - size + 1):
                    candidate = tokens[index : index + size]
                    phrase = " ".join(candidate)
                    if not _is_valid_phrase(phrase):
                        continue
                    counts[phrase] += 1

    candidates: dict[str, int] = {}
    for phrase, count in counts.items():
        if phrase in heading_phrases or count >= (2 if len(phrase.split()) > 1 else 3):
            candidates[phrase] = count
    for phrase in heading_phrases:
        candidates.setdefault(phrase, 1)
    return candidates


def _extract_mentions_for_chunk(
    *,
    document: KnowledgeSourceDocument,
    chunk: ContentChunk,
    candidate_phrases: dict[str, int],
    heading_phrases: set[str],
) -> list[EntityMention]:
    text = normalize_whitespace(chunk.text)
    if not text:
        return []

    candidates: list[_CandidateMention] = []
    candidates.extend(_extract_capitalized_phrases(text))
    candidates.extend(_extract_phrase_occurrences(text, candidate_phrases, base_confidence=0.62))
    if heading_phrases:
        candidates.extend(_extract_phrase_occurrences(text, {phrase: 1 for phrase in heading_phrases}, base_confidence=0.9))

    candidates = _dedupe_candidates(candidates)
    mentions: list[EntityMention] = []
    for candidate in candidates:
        canonical_key = normalize_entity_label(candidate.text)
        if not _is_valid_phrase(canonical_key):
            continue
        excerpt = _build_excerpt(text, candidate.start, candidate.end)
        mentions.append(
            EntityMention(
                id=f"mention:{sha256_text(f'{chunk.id}|{canonical_key}|{candidate.start}|{candidate.end}|{candidate.entity_type}')[:16]}",
                source_document_id=document.source_document_id,
                variant_id=document.variant_id,
                block_id=chunk.block_id,
                text=candidate.text,
                normalized_text=canonical_key,
                entity_type=candidate.entity_type,
                start_offset=candidate.start,
                end_offset=candidate.end,
                confidence=min(candidate.confidence, 0.99),
                metadata={
                    "chunk_id": chunk.id,
                    "chunk_ordinal": chunk.ordinal,
                    "document_title": document.title,
                    "excerpt": excerpt,
                    "graph_schema_version": GRAPH_SCHEMA_VERSION,
                    "source_reason": candidate.reason,
                },
            )
        )
    return mentions


def _extract_edges_for_chunk(
    document: KnowledgeSourceDocument,
    chunk: ContentChunk,
    mentions: list[EntityMention],
) -> list[_GraphEdgeCandidate]:
    if len(mentions) < 2:
        return []

    sentence_edges: list[_GraphEdgeCandidate] = []
    sentence_spans = _iter_sentence_spans(chunk.text)
    for sentence_text, sentence_start, sentence_end in sentence_spans:
        sentence_mentions = [
            mention
            for mention in mentions
            if (mention.start_offset or 0) >= sentence_start and (mention.end_offset or 0) <= sentence_end
        ]
        if len(sentence_mentions) < 2:
            continue

        sentence_mentions.sort(key=lambda mention: mention.start_offset or 0)
        explicit_edge = _extract_explicit_sentence_edge(
            sentence_text,
            sentence_start,
            sentence_mentions,
            chunk,
        )
        if explicit_edge is not None:
            sentence_edges.append(
                _GraphEdgeCandidate(
                    source_key=explicit_edge[0],
                    target_key=explicit_edge[1],
                    relation_type=explicit_edge[2],
                    confidence=explicit_edge[3],
                    excerpt=normalize_whitespace(sentence_text),
                    source_document_id=document.source_document_id,
                    block_id=chunk.block_id,
                    chunk_id=chunk.id,
                )
            )
            continue

        if len(sentence_mentions) == 2 and min(
            sentence_mentions[0].confidence or 0.0,
            sentence_mentions[1].confidence or 0.0,
        ) >= 0.74:
            sentence_edges.append(
                _GraphEdgeCandidate(
                    source_key=sentence_mentions[0].normalized_text or "",
                    target_key=sentence_mentions[1].normalized_text or "",
                    relation_type="related_to",
                    confidence=0.48,
                    excerpt=normalize_whitespace(sentence_text),
                    source_document_id=document.source_document_id,
                    block_id=chunk.block_id,
                    chunk_id=chunk.id,
                )
            )
    return sentence_edges


def _extract_capitalized_phrases(text: str) -> list[_CandidateMention]:
    candidates: list[_CandidateMention] = []
    for match in CAPITALIZED_PHRASE_RE.finditer(text):
        value = normalize_whitespace(match.group(0))
        canonical = normalize_entity_label(value)
        if not _is_valid_phrase(canonical):
            continue
        confidence = 0.88 if len(value.split()) > 1 else 0.76
        candidates.append(
            _CandidateMention(
                text=value,
                start=match.start(),
                end=match.end(),
                confidence=confidence,
                entity_type=_infer_node_type(value),
                reason="capitalized_phrase",
            )
        )
    return candidates


def _extract_phrase_occurrences(
    text: str,
    candidate_phrases: dict[str, int],
    *,
    base_confidence: float,
) -> list[_CandidateMention]:
    lowered = text.lower()
    candidates: list[_CandidateMention] = []
    for phrase, count in candidate_phrases.items():
        if not _is_valid_phrase(phrase):
            continue
        pattern = re.compile(rf"(?<![A-Za-z0-9]){re.escape(phrase)}(?![A-Za-z0-9])", re.IGNORECASE)
        for match in pattern.finditer(lowered):
            value = normalize_whitespace(text[match.start() : match.end()])
            if not value:
                continue
            confidence = min(base_confidence + max(0, count - 1) * 0.06, 0.94)
            candidates.append(
                _CandidateMention(
                    text=value,
                    start=match.start(),
                    end=match.end(),
                    confidence=confidence,
                    entity_type=_infer_node_type(value),
                    reason="repeated_phrase",
                )
            )
    return candidates


def _dedupe_candidates(candidates: list[_CandidateMention]) -> list[_CandidateMention]:
    candidates = sorted(
        candidates,
        key=lambda candidate: (
            -candidate.confidence,
            -(candidate.end - candidate.start),
            candidate.start,
        ),
    )
    accepted: list[_CandidateMention] = []
    occupied: list[tuple[int, int]] = []
    for candidate in candidates:
        if any(candidate.start < end and candidate.end > start for start, end in occupied):
            continue
        accepted.append(candidate)
        occupied.append((candidate.start, candidate.end))
    return sorted(accepted, key=lambda candidate: candidate.start)


def _extract_explicit_sentence_edge(
    sentence_text: str,
    sentence_start: int,
    sentence_mentions: list[EntityMention],
    chunk: ContentChunk,
) -> tuple[str, str, str, float] | None:
    del chunk
    lowered = sentence_text.lower()
    best_match: tuple[str, str, str, float] | None = None
    for relation_type, pattern, confidence in RELATION_PATTERNS:
        match = pattern.search(lowered)
        if not match:
            continue
        source_mention = _nearest_mention_before(sentence_mentions, sentence_start + match.start())
        target_mention = _nearest_mention_after(sentence_mentions, sentence_start + match.end())
        if not source_mention or not target_mention:
            continue
        if not source_mention.normalized_text or not target_mention.normalized_text:
            continue
        best_match = (
            source_mention.normalized_text,
            target_mention.normalized_text,
            relation_type,
            confidence,
        )
        break
    return best_match


def _nearest_mention_before(mentions: list[EntityMention], offset: int) -> EntityMention | None:
    candidates = [mention for mention in mentions if (mention.end_offset or 0) <= offset]
    if not candidates:
        return None
    return max(candidates, key=lambda mention: mention.end_offset or 0)


def _nearest_mention_after(mentions: list[EntityMention], offset: int) -> EntityMention | None:
    candidates = [mention for mention in mentions if (mention.start_offset or 0) >= offset]
    if not candidates:
        return None
    return min(candidates, key=lambda mention: mention.start_offset or 0)


def _iter_sentence_spans(text: str) -> list[tuple[str, int, int]]:
    normalized = normalize_whitespace(text)
    if not normalized:
        return []
    sentences = split_sentences(normalized)
    spans: list[tuple[str, int, int]] = []
    cursor = 0
    lowered = normalized.lower()
    for sentence in sentences:
        sentence_lower = sentence.lower()
        start = lowered.find(sentence_lower, cursor)
        if start == -1:
            start = cursor
        end = start + len(sentence)
        spans.append((sentence, start, end))
        cursor = end
    return spans


def _choose_node_label(mentions: list[EntityMention]) -> str:
    counts = Counter(mention.text for mention in mentions)
    return max(
        counts,
        key=lambda label: (
            counts[label],
            len(label),
            label.lower(),
        ),
    )


def _choose_aliases(mentions: list[EntityMention], label: str) -> list[str]:
    counts = Counter(mention.text for mention in mentions if mention.text != label)
    aliases = sorted(
        counts,
        key=lambda alias: (
            -counts[alias],
            -len(alias),
            alias.lower(),
        ),
    )
    return aliases[:MAX_ALIASES]


def _choose_node_description(mentions: list[EntityMention]) -> str | None:
    top_mention = max(
        mentions,
        key=lambda mention: (
            mention.confidence or 0.0,
            len(str(mention.metadata.get("excerpt", ""))),
        ),
    )
    excerpt = str(top_mention.metadata.get("excerpt", "")).strip()
    if not excerpt:
        return None
    if len(excerpt) <= MAX_DESCRIPTION_CHARS:
        return excerpt
    return excerpt[: MAX_DESCRIPTION_CHARS - 3].rstrip() + "..."


def _aggregate_node_confidence(mentions: list[EntityMention]) -> float:
    top_scores = sorted(
        ((mention.confidence or 0.0) for mention in mentions),
        reverse=True,
    )[:4]
    if not top_scores:
        return 0.0
    average = sum(top_scores) / len(top_scores)
    return min(0.99, average + 0.03 * max(0, len(mentions) - 1))


def _aggregate_edge_confidence(edges: Iterable[_GraphEdgeCandidate]) -> float:
    candidates = list(edges)
    if not candidates:
        return 0.0
    average = sum(candidate.confidence for candidate in candidates) / len(candidates)
    return min(0.99, average + 0.04 * max(0, len(candidates) - 1))


def _infer_node_type(text: str) -> str:
    normalized = normalize_whitespace(text)
    if URL_RE.search(normalized):
        return "resource"
    if DATE_RE.search(normalized):
        return "date"
    if normalized.isupper() and len(normalized) <= 12:
        return "acronym"
    tokens = normalized.split()
    if len(tokens) > 1 and all(
        token[:1].isupper() or token.lower() in SMALL_WORDS for token in tokens
    ):
        return "named_entity"
    return "concept"


def _is_valid_phrase(phrase: str) -> bool:
    phrase = normalize_whitespace(phrase)
    if not phrase:
        return False
    tokens = phrase.split()
    if phrase in GENERIC_PHRASES:
        return False
    if all(token in STOP_WORDS for token in tokens):
        return False
    if len(tokens) == 1 and (tokens[0] in STOP_WORDS or len(tokens[0]) < 4):
        return False
    if len(tokens) > 3 and len(phrase) > 42:
        return False
    return True


def _build_excerpt(text: str, start: int, end: int, radius: int = 72) -> str:
    excerpt_start = max(0, start - radius)
    excerpt_end = min(len(text), end + radius)
    excerpt = text[excerpt_start:excerpt_end].strip()
    if excerpt_start > 0:
        excerpt = f"...{excerpt}"
    if excerpt_end < len(text):
        excerpt = f"{excerpt}..."
    return excerpt
