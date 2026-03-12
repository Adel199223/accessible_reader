from __future__ import annotations

from .models import ViewBlock
from .text_utils import split_sentences


def reflow_blocks(blocks: list[ViewBlock]) -> list[ViewBlock]:
    reflowed: list[ViewBlock] = []
    index = 0
    for block in blocks:
        if block.kind != "paragraph":
            reflowed.append(ViewBlock(id=f"reflow-{index}", kind=block.kind, text=block.text, level=block.level))
            index += 1
            continue
        sentences = split_sentences(block.text)
        if len(sentences) <= 2 and len(block.text) <= 240:
            reflowed.append(ViewBlock(id=f"reflow-{index}", kind="paragraph", text=block.text))
            index += 1
            continue
        current_group: list[str] = []
        current_length = 0
        for sentence in sentences or [block.text]:
            should_flush = current_group and (len(current_group) >= 2 or current_length + len(sentence) > 220)
            if should_flush:
                reflowed.append(ViewBlock(id=f"reflow-{index}", kind="paragraph", text=" ".join(current_group)))
                index += 1
                current_group = []
                current_length = 0
            current_group.append(sentence)
            current_length += len(sentence)
        if current_group:
            reflowed.append(ViewBlock(id=f"reflow-{index}", kind="paragraph", text=" ".join(current_group)))
            index += 1
    return reflowed
