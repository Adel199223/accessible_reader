from __future__ import annotations

from dataclasses import dataclass, field
from typing import Literal, Protocol

from openai import OpenAI
from pydantic import BaseModel, Field

from .models import DocumentMode, DocumentView, ViewBlock
from .text_utils import now_iso
from .variant_contract import build_variant_metadata


class TransformProvider(Protocol):
    def create_view(
        self,
        *,
        mode: DocumentMode,
        detail_level: str,
        title: str,
        source_blocks: list[ViewBlock],
        source_hash: str,
    ) -> DocumentView:
        ...


class TransformUnavailableError(RuntimeError):
    """Raised when AI transforms cannot run."""


class StructuredBlock(BaseModel):
    kind: Literal["heading", "paragraph", "list_item"]
    text: str
    level: int | None = None
    metadata: dict[str, str | int | bool] = Field(default_factory=dict)


class StructuredView(BaseModel):
    title: str | None = None
    blocks: list[StructuredBlock]


@dataclass(slots=True)
class OpenAITransformProvider:
    api_key: str
    model: str
    _client: OpenAI = field(init=False, repr=False)

    def __post_init__(self) -> None:
        self._client = OpenAI(api_key=self.api_key)

    def create_view(
        self,
        *,
        mode: DocumentMode,
        detail_level: str,
        title: str,
        source_blocks: list[ViewBlock],
        source_hash: str,
    ) -> DocumentView:
        if mode == "simplified":
            view = self._simplify(title=title, source_blocks=source_blocks)
        elif mode == "summary":
            view = self._summarize(title=title, source_blocks=source_blocks, detail_level=detail_level)
        else:
            raise TransformUnavailableError(f"`{mode}` is not an AI transform mode.")

        blocks = [
            ViewBlock(
                id=f"{mode}-{index}",
                kind=block.kind,
                text=block.text.strip(),
                level=block.level,
                metadata=dict(block.metadata),
            )
            for index, block in enumerate(view.blocks)
            if block.text.strip()
        ]
        return DocumentView(
            mode=mode,
            detail_level=detail_level if mode == "summary" else "default",
            title=view.title or title,
            blocks=blocks,
            variant_metadata=build_variant_metadata(blocks),
            generated_by="openai",
            cached=False,
            source_hash=source_hash,
            model=self.model,
            updated_at=now_iso(),
        )

    def _simplify(self, *, title: str, source_blocks: list[ViewBlock]) -> StructuredView:
        chunk_outputs = [
            self._parse_structured_view(
                system_prompt=(
                    "You rewrite documents into plain language for a dyslexic and ADHD-prone reader. "
                    "Preserve meaning, caveats, and essential nuance. Use shorter sentences, clearer headings, "
                    "and simple list structure where helpful. Do not invent facts."
                ),
                user_prompt=(
                    f"Document title: {title}\n"
                    "Rewrite this section into plainer language with a calm, readable structure.\n\n"
                    f"{chunk}"
                ),
            )
            for chunk in _chunk_markdown(_blocks_to_markdown(source_blocks))
        ]
        combined_blocks: list[StructuredBlock] = []
        for output in chunk_outputs:
            combined_blocks.extend(output.blocks)
        return StructuredView(title=title, blocks=combined_blocks)

    def _summarize(self, *, title: str, source_blocks: list[ViewBlock], detail_level: str) -> StructuredView:
        chunks = _chunk_markdown(_blocks_to_markdown(source_blocks))
        if len(chunks) == 1:
            return self._parse_structured_view(
                system_prompt=(
                    "You summarize documents for a dyslexic and ADHD-prone reader. "
                    "Use clear headings, compact bullet points, and plain language."
                ),
                user_prompt=(
                    f"Document title: {title}\n"
                    f"Create a {detail_level} summary of this document.\n\n"
                    f"{chunks[0]}"
                ),
            )

        partial_summaries = [
            self._parse_structured_view(
                system_prompt=(
                    "You summarize document sections into concise notes. "
                    "Use plain language and preserve the most important facts."
                ),
                user_prompt=(
                    f"Document title: {title}\n"
                    f"Create a balanced partial summary for this section.\n\n{chunk}"
                ),
            )
            for chunk in chunks
        ]
        reduced_source = "\n\n".join(_blocks_to_markdown(summary.blocks) for summary in partial_summaries)
        return self._parse_structured_view(
            system_prompt=(
                "You combine section summaries into one clean document summary. "
                "Use plain language, a stable structure, and avoid repeating the same point."
            ),
            user_prompt=(
                f"Document title: {title}\n"
                f"Create a {detail_level} final summary from these section summaries.\n\n"
                f"{reduced_source}"
            ),
        )

    def _parse_structured_view(self, *, system_prompt: str, user_prompt: str) -> StructuredView:
        response = self._client.responses.parse(
            model=self.model,
            input=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            text_format=StructuredView,
        )
        parsed = response.output_parsed
        if parsed is None:
            raise TransformUnavailableError("The AI transform did not return structured content.")
        return parsed


class UnconfiguredTransformProvider:
    def create_view(
        self,
        *,
        mode: DocumentMode,
        detail_level: str,
        title: str,
        source_blocks: list[ViewBlock],
        source_hash: str,
    ) -> DocumentView:
        raise TransformUnavailableError("OpenAI is not configured. Set OPENAI_API_KEY to use AI transforms.")


def provider_for_key(api_key: str | None, model: str) -> TransformProvider:
    if api_key:
        return OpenAITransformProvider(api_key=api_key, model=model)
    return UnconfiguredTransformProvider()


def _blocks_to_markdown(blocks: list[ViewBlock] | list[StructuredBlock]) -> str:
    lines: list[str] = []
    for block in blocks:
        if block.kind == "heading":
            level = block.level or 2
            lines.append(f"{'#' * min(level, 4)} {block.text}")
        elif block.kind == "list_item":
            lines.append(f"- {block.text}")
        else:
            lines.append(block.text)
    return "\n\n".join(lines)


def _chunk_markdown(source: str, max_chars: int = 5000) -> list[str]:
    chunks: list[str] = []
    current: list[str] = []
    current_length = 0
    for block in source.split("\n\n"):
        if current and current_length + len(block) > max_chars:
            chunks.append("\n\n".join(current))
            current = []
            current_length = 0
        current.append(block)
        current_length += len(block)
    if current:
        chunks.append("\n\n".join(current))
    return chunks or [source]
