from __future__ import annotations

from typing import Literal

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
