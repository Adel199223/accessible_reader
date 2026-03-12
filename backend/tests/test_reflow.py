from __future__ import annotations

from app.models import ViewBlock
from app.reflow import reflow_blocks


def test_reflow_splits_long_paragraphs_into_smaller_blocks() -> None:
    blocks = [
        ViewBlock(
            id="block-1",
            kind="paragraph",
            text=(
                "Sentence one is intentionally long enough to count as a full sentence. "
                "Sentence two keeps the paragraph growing. "
                "Sentence three ensures the reflow logic must split the content."
            ),
        )
    ]

    reflowed = reflow_blocks(blocks)

    assert len(reflowed) >= 2
    assert all(block.kind == "paragraph" for block in reflowed)
