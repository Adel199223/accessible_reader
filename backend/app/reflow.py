from __future__ import annotations

from .models import ViewBlock
from .text_utils import split_sentences


def reflow_blocks(blocks: list[ViewBlock]) -> list[ViewBlock]:
    reflowed: list[ViewBlock] = []
    index = 0
    for block in blocks:
        if block.kind != "paragraph":
            reflowed.append(
                ViewBlock(
                    id=f"reflow-{index}",
                    kind=block.kind,
                    text=block.text,
                    level=block.level,
                    metadata=dict(block.metadata),
                )
            )
            index += 1
            continue
        sentences = split_sentences(block.text)
        if len(sentences) <= 2 and len(block.text) <= 240:
            reflowed.append(
                ViewBlock(
                    id=f"reflow-{index}",
                    kind="paragraph",
                    text=block.text,
                    metadata={
                        **block.metadata,
                        "reflow_segment_count": 1,
                        "reflow_segment_index": 0,
                        "reflow_source_block_id": block.id,
                    },
                )
            )
            index += 1
            continue
        grouped_sentences: list[list[str]] = []
        current_group: list[str] = []
        current_length = 0
        for sentence in sentences or [block.text]:
            should_flush = current_group and (len(current_group) >= 2 or current_length + len(sentence) > 220)
            if should_flush:
                grouped_sentences.append(current_group)
                current_group = []
                current_length = 0
            current_group.append(sentence)
            current_length += len(sentence)
        if current_group:
            grouped_sentences.append(current_group)

        for segment_index, sentence_group in enumerate(grouped_sentences):
            reflowed.append(
                ViewBlock(
                    id=f"reflow-{index}",
                    kind="paragraph",
                    text=" ".join(sentence_group),
                    metadata={
                        **block.metadata,
                        "reflow_segment_count": len(grouped_sentences),
                        "reflow_segment_index": segment_index,
                        "reflow_source_block_id": block.id,
                    },
                )
            )
            index += 1
    return reflowed
