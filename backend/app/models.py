from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


DocumentMode = Literal["original", "reflowed", "simplified", "summary"]
DetailLevel = Literal["default", "short", "balanced", "detailed"]
BlockKind = Literal["heading", "paragraph", "list_item", "quote"]


class ViewBlock(BaseModel):
    id: str
    kind: BlockKind
    text: str = Field(min_length=1)
    level: int | None = Field(default=None, ge=1, le=6)


class DocumentView(BaseModel):
    mode: DocumentMode
    detail_level: DetailLevel = "default"
    title: str
    blocks: list[ViewBlock]
    generated_by: Literal["local", "openai"]
    cached: bool = False
    source_hash: str
    model: str | None = None
    updated_at: str


class SourceDocument(BaseModel):
    id: str
    title: str
    source_type: str
    file_name: str | None = None
    source_locator: str | None = None
    stored_path: str | None = None
    content_hash: str
    created_at: str
    updated_at: str
    metadata: dict[str, Any] = Field(default_factory=dict)


class DocumentVariant(BaseModel):
    id: str
    source_document_id: str
    mode: DocumentMode
    detail_level: DetailLevel = "default"
    generated_by: Literal["local", "openai"]
    source_hash: str
    title: str
    blocks: list[ViewBlock]
    created_at: str
    updated_at: str
    model: str | None = None


class ContentChunk(BaseModel):
    id: str
    source_document_id: str
    variant_id: str | None = None
    block_id: str | None = None
    ordinal: int = Field(default=0, ge=0)
    text: str = Field(min_length=1)
    metadata: dict[str, Any] = Field(default_factory=dict)


class EntityMention(BaseModel):
    id: str
    source_document_id: str
    variant_id: str | None = None
    block_id: str | None = None
    text: str = Field(min_length=1)
    normalized_text: str | None = None
    entity_type: str = Field(min_length=1)
    start_offset: int | None = Field(default=None, ge=0)
    end_offset: int | None = Field(default=None, ge=0)
    confidence: float | None = Field(default=None, ge=0, le=1)
    metadata: dict[str, Any] = Field(default_factory=dict)


class KnowledgeNode(BaseModel):
    id: str
    label: str = Field(min_length=1)
    node_type: str = Field(min_length=1)
    description: str | None = None
    confidence: float | None = Field(default=None, ge=0, le=1)
    metadata: dict[str, Any] = Field(default_factory=dict)


class RelationEvidence(BaseModel):
    id: str
    source_document_id: str
    variant_id: str | None = None
    block_id: str | None = None
    excerpt: str | None = None
    confidence: float | None = Field(default=None, ge=0, le=1)
    metadata: dict[str, Any] = Field(default_factory=dict)


class KnowledgeEdge(BaseModel):
    id: str
    source_id: str
    target_id: str
    relation_type: str = Field(min_length=1)
    provenance: Literal["manual", "inferred"] = "inferred"
    confidence: float | None = Field(default=None, ge=0, le=1)
    evidence: list[RelationEvidence] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)


class ReviewCard(BaseModel):
    id: str
    source_document_id: str
    prompt: str = Field(min_length=1)
    answer: str = Field(min_length=1)
    card_type: str = "short_answer"
    source_spans: list[dict[str, Any]] = Field(default_factory=list)
    scheduling_state: dict[str, Any] = Field(default_factory=dict)
    created_at: str
    updated_at: str


class ReviewEvent(BaseModel):
    id: str
    review_card_id: str
    rating: int = Field(ge=0, le=4)
    reviewed_at: str
    scheduling_state: dict[str, Any] = Field(default_factory=dict)


class RetrievalHit(BaseModel):
    id: str
    source_document_id: str
    score: float
    reason: str | None = None
    excerpt: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class AttachmentRef(BaseModel):
    id: str
    source_document_id: str
    file_name: str
    media_type: str | None = None
    relative_path: str
    metadata: dict[str, Any] = Field(default_factory=dict)


class ChangeEvent(BaseModel):
    id: str
    entity_type: str
    entity_id: str
    event_type: str
    payload: dict[str, Any] = Field(default_factory=dict)
    device_id: str = "desktop-local"
    created_at: str


class ReadingSession(BaseModel):
    id: str
    source_document_id: str
    mode: DocumentMode
    sentence_index: int = Field(default=0, ge=0)
    session_kind: str = "reader"
    device_id: str = "desktop-local"
    created_at: str
    updated_at: str


class DocumentRecord(BaseModel):
    id: str
    title: str
    source_type: str
    file_name: str | None = None
    created_at: str
    updated_at: str
    available_modes: list[DocumentMode] = Field(default_factory=list)
    progress_by_mode: dict[str, int] = Field(default_factory=dict)


class ImportTextRequest(BaseModel):
    title: str | None = None
    text: str = Field(min_length=1)


class ImportUrlRequest(BaseModel):
    url: str = Field(min_length=1)


class TransformRequest(BaseModel):
    mode: Literal["simplified", "summary"]
    detail_level: Literal["short", "balanced", "detailed"] = "balanced"


class ProgressUpdate(BaseModel):
    mode: DocumentMode
    sentence_index: int = Field(default=0, ge=0)


class ReaderSettings(BaseModel):
    font_preset: Literal["system", "atkinson", "comic"] = "system"
    text_size: int = Field(default=22, ge=16, le=36)
    line_spacing: float = Field(default=1.7, ge=1.2, le=2.6)
    line_width: int = Field(default=72, ge=50, le=100)
    contrast_theme: Literal["soft", "high"] = "soft"
    focus_mode: bool = False
    preferred_voice: str = "default"
    speech_rate: float = Field(default=1.0, ge=0.7, le=1.4)


class HealthResponse(BaseModel):
    ok: bool = True
    openai_configured: bool
