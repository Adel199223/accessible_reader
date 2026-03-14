from __future__ import annotations

from typing import Any
import re

from .models import ContentChunk, DocumentView, RecallDocumentRecord, ViewBlock
from .text_utils import normalize_whitespace, split_sentences
from .variant_contract import build_variant_metadata, render_blocks_as_markdown


CHUNK_SCHEMA_VERSION = "1"
SENTENCE_METADATA_VERSION = "1"
MAX_CHUNK_CHARS = 280
MAX_CHUNK_SENTENCES = 3
EXCERPT_RADIUS = 72
NON_ALNUM_RE = re.compile(r"[^a-z0-9]+")


def build_reflow_chunks(
    *,
    document_id: str,
    variant_id: str,
    view: DocumentView,
) -> list[ContentChunk]:
    chunks: list[ContentChunk] = []
    ordinal = 0
    for block in view.blocks:
        block_text = normalize_whitespace(block.text)
        if not block_text:
            continue

        segments = _chunk_block_text(block_text, sentence_texts_for_block(block))
        for chunk_index, segment in enumerate(segments):
            metadata = {
                "block_kind": block.kind,
                "block_level": block.level,
                "chunk_count_within_block": len(segments),
                "chunk_index_within_block": chunk_index,
                "chunk_schema_version": CHUNK_SCHEMA_VERSION,
                "sentence_end_in_block": segment["sentence_end_in_block"],
                "sentence_start_in_block": segment["sentence_start_in_block"],
                "source_hash": view.source_hash,
            }
            chunks.append(
                ContentChunk(
                    id=f"{document_id}:chunk:{ordinal}",
                    source_document_id=document_id,
                    variant_id=variant_id,
                    block_id=block.id,
                    ordinal=ordinal,
                    text=segment["text"],
                    metadata=metadata,
                )
            )
            ordinal += 1
    return chunks


def sentence_texts_for_block(block: ViewBlock) -> list[str]:
    metadata = block.metadata or {}
    sentence_texts = metadata.get("sentence_texts")
    if isinstance(sentence_texts, list):
        normalized = [normalize_whitespace(str(item)) for item in sentence_texts if normalize_whitespace(str(item))]
        if normalized:
            return normalized

    normalized_text = normalize_whitespace(block.text)
    if not normalized_text:
        return []
    if block.kind == "heading":
        return [normalized_text]
    sentences = split_sentences(normalized_text)
    return sentences or [normalized_text]


def enrich_view_with_sentence_metadata(view: DocumentView, *, variant_id: str | None = None) -> DocumentView:
    blocks: list[ViewBlock] = []
    for block in view.blocks:
        sentence_texts = sentence_texts_for_block(block)
        metadata = dict(block.metadata or {})
        metadata["sentence_count"] = len(sentence_texts)
        metadata["sentence_metadata_version"] = SENTENCE_METADATA_VERSION
        metadata["sentence_texts"] = sentence_texts
        blocks.append(block.model_copy(update={"metadata": metadata}))

    variant_metadata = dict(view.variant_metadata or {})
    variant_metadata["sentence_metadata_version"] = SENTENCE_METADATA_VERSION
    if variant_id is not None:
        variant_metadata["variant_id"] = variant_id
    return view.model_copy(update={"blocks": blocks, "variant_metadata": variant_metadata})


def build_note_excerpt(sentence_texts: list[str], sentence_start: int, sentence_end: int) -> str:
    if not sentence_texts:
        return ""

    excerpt_start = max(sentence_start - 1, 0)
    excerpt_end = min(sentence_end + 1, len(sentence_texts) - 1)
    excerpt = " ".join(sentence_texts[excerpt_start : excerpt_end + 1]).strip()
    if excerpt_start > 0:
        excerpt = f"...{excerpt}"
    if excerpt_end < len(sentence_texts) - 1:
        excerpt = f"{excerpt}..."
    return excerpt


def build_chunk_excerpt(text: str, query_terms: list[str]) -> str:
    normalized = normalize_whitespace(text)
    if not normalized:
        return ""
    lowered = normalized.lower()
    hit_index = -1
    for term in query_terms:
        candidate = lowered.find(term.lower())
        if candidate != -1 and (hit_index == -1 or candidate < hit_index):
            hit_index = candidate

    if hit_index == -1:
        return _truncate(normalized, EXCERPT_RADIUS * 2)

    start = max(0, hit_index - EXCERPT_RADIUS)
    end = min(len(normalized), hit_index + EXCERPT_RADIUS)
    excerpt = normalized[start:end].strip()
    if start > 0:
        excerpt = f"...{excerpt}"
    if end < len(normalized):
        excerpt = f"{excerpt}..."
    return excerpt


def build_match_context(chunk: ContentChunk) -> str:
    block_kind = str(chunk.metadata.get("block_kind", "block")).replace("_", " ")
    chunk_index = int(chunk.metadata.get("chunk_index_within_block", 0)) + 1
    chunk_count = int(chunk.metadata.get("chunk_count_within_block", 1))
    return f"{block_kind.title()} chunk {chunk_index} of {chunk_count}"


def render_markdown_export(
    *,
    document: RecallDocumentRecord,
    view: DocumentView,
    chunks: list[ContentChunk],
    exported_at: str,
) -> str:
    variant_metadata = view.variant_metadata or build_variant_metadata(view.blocks)
    lines = render_blocks_as_markdown(view.blocks)
    if not lines or lines[0] != f"# {document.title}":
        lines = [f"# {document.title}", "", *lines]
    else:
        lines = [*lines]
    if lines and lines[-1]:
        lines.append("")

    lines.extend(
        [
            "## Provenance",
            "",
            f"- Exported at: {exported_at}",
            f"- Source type: {document.source_type}",
            f"- Variant contract version: {variant_metadata.get('variant_contract_version', '1')}",
            f"- Block count: {variant_metadata.get('block_count', len(view.blocks))}",
            f"- Word count: {variant_metadata.get('word_count', 0)}",
            f"- Estimated reading minutes: {variant_metadata.get('estimated_reading_minutes', 0)}",
        ]
    )
    if document.source_locator:
        lines.append(f"- Source locator: {document.source_locator}")
    if document.file_name:
        lines.append(f"- File name: {document.file_name}")
    lines.append(f"- Available modes: {', '.join(document.available_modes) if document.available_modes else 'reflowed'}")
    lines.append(f"- Chunk count: {len(chunks)}")
    lines.extend(
        [
            "",
            "### Chunk Mapping",
            "",
            "| Chunk ID | Ordinal | Block ID | Kind | Text |",
            "| --- | --- | --- | --- | --- |",
        ]
    )
    for chunk in chunks:
        lines.append(
            "| "
            + " | ".join(
                [
                    _escape_markdown_table(chunk.id),
                    str(chunk.ordinal),
                    _escape_markdown_table(chunk.block_id or ""),
                    _escape_markdown_table(str(chunk.metadata.get("block_kind", ""))),
                    _escape_markdown_table(_truncate(normalize_whitespace(chunk.text), 96)),
                ]
            )
            + " |"
    )

    return "\n".join(lines).strip() + "\n"


def build_export_filename(title: str) -> str:
    lowered = title.lower().strip()
    slug = NON_ALNUM_RE.sub("-", lowered).strip("-")
    return f"{slug or 'recall-document'}.md"


def _chunk_block_text(text: str, sentence_texts: list[str] | None = None) -> list[dict[str, Any]]:
    sentences = sentence_texts or split_sentences(text)
    if not sentences or len(text) <= MAX_CHUNK_CHARS:
        return [
            {
                "sentence_end_in_block": max(len(sentences) - 1, 0),
                "sentence_start_in_block": 0,
                "text": text,
            }
        ]

    chunks: list[dict[str, Any]] = []
    current_sentences: list[str] = []
    chunk_start_index = 0
    for sentence_index, sentence in enumerate(sentences):
        candidate_sentences = [*current_sentences, sentence]
        candidate_text = " ".join(candidate_sentences)
        should_flush = (
            bool(current_sentences)
            and (len(candidate_text) > MAX_CHUNK_CHARS or len(candidate_sentences) > MAX_CHUNK_SENTENCES)
        )
        if should_flush:
            chunks.append(
                {
                    "sentence_end_in_block": sentence_index - 1,
                    "sentence_start_in_block": chunk_start_index,
                    "text": " ".join(current_sentences),
                }
            )
            current_sentences = [sentence]
            chunk_start_index = sentence_index
            continue
        current_sentences = candidate_sentences

    if current_sentences:
        chunks.append(
            {
                "sentence_end_in_block": len(sentences) - 1,
                "sentence_start_in_block": chunk_start_index,
                "text": " ".join(current_sentences),
            }
        )
    return chunks
def _escape_markdown_table(text: str) -> str:
    return text.replace("|", "\\|").replace("\n", " ")


def _truncate(text: str, max_length: int) -> str:
    if len(text) <= max_length:
        return text
    return text[: max_length - 3].rstrip() + "..."
