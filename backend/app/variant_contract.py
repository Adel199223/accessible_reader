from __future__ import annotations

from math import ceil
from typing import Any

from .models import ViewBlock
from .text_utils import normalize_whitespace


VARIANT_CONTRACT_VERSION = "1"


def build_variant_metadata(blocks: list[ViewBlock]) -> dict[str, Any]:
    heading_levels: list[int] = []
    list_depths: list[int] = []
    ordered_list_item_count = 0
    quote_depths: list[int] = []
    word_count = 0

    for block in blocks:
        normalized_text = normalize_whitespace(block.text)
        if normalized_text:
            word_count += len(normalized_text.split())
        if block.kind == "heading" and block.level is not None:
            heading_levels.append(block.level)
        if block.kind == "list_item":
            list_depths.append(int(block.metadata.get("list_depth", 0) or 0))
            if block.metadata.get("list_ordered"):
                ordered_list_item_count += 1
        if block.kind == "quote":
            quote_depths.append(int(block.metadata.get("quote_depth", 1) or 1))

    return {
        "variant_contract_version": VARIANT_CONTRACT_VERSION,
        "block_count": len(blocks),
        "heading_count": sum(1 for block in blocks if block.kind == "heading"),
        "heading_levels": sorted(set(heading_levels)),
        "list_item_count": sum(1 for block in blocks if block.kind == "list_item"),
        "ordered_list_item_count": ordered_list_item_count,
        "quote_count": sum(1 for block in blocks if block.kind == "quote"),
        "max_list_depth": max(list_depths, default=0),
        "max_quote_depth": max(quote_depths, default=0),
        "word_count": word_count,
        "estimated_reading_minutes": max(1, ceil(word_count / 220)) if word_count else 0,
    }


def render_blocks_as_markdown(blocks: list[ViewBlock]) -> list[str]:
    lines: list[str] = []
    for index, block in enumerate(blocks):
        lines.extend(_render_block(block))
        next_block = blocks[index + 1] if index + 1 < len(blocks) else None
        if _needs_blank_line(block, next_block):
            lines.append("")
    while lines and not lines[-1]:
        lines.pop()
    return lines


def _render_block(block: ViewBlock) -> list[str]:
    text = normalize_whitespace(block.text)
    if not text:
        return []

    metadata = block.metadata or {}
    quote_depth = max(int(metadata.get("quote_depth", 0) or 0), 0)
    quote_prefix = "> " * quote_depth

    if block.kind == "heading":
        level = min(max(block.level or 2, 1), 6)
        return [f"{quote_prefix}{'#' * level} {text}"]
    if block.kind == "list_item":
        depth = max(int(metadata.get("list_depth", 0) or 0), 0)
        indent = "  " * depth
        if metadata.get("list_ordered"):
            marker = f"{int(metadata.get('list_index', 1) or 1)}. "
        else:
            marker = "- "
        return [f"{quote_prefix}{indent}{marker}{text}"]
    if block.kind == "quote" or quote_depth > 0:
        prefix = "> " * max(quote_depth, 1)
        return [f"{prefix}{line}" for line in _split_render_lines(text)]
    return [f"{quote_prefix}{text}" if quote_prefix else text]


def _needs_blank_line(current: ViewBlock, next_block: ViewBlock | None) -> bool:
    if next_block is None:
        return True
    if current.kind == "list_item" and next_block.kind == "list_item":
        return False
    if current.kind == "quote" and next_block.kind == "quote":
        current_depth = int(current.metadata.get("quote_depth", 1) or 1)
        next_depth = int(next_block.metadata.get("quote_depth", 1) or 1)
        return current_depth != next_depth
    return True


def _split_render_lines(text: str) -> list[str]:
    return [normalize_whitespace(line) for line in text.splitlines() if normalize_whitespace(line)] or [text]
