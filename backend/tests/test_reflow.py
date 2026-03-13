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


def test_reflow_preserves_block_metadata_when_splitting_paragraphs() -> None:
    blocks = [
        ViewBlock(
            id="block-1",
            kind="paragraph",
            text=(
                "Sentence one is intentionally long enough to count as a full sentence. "
                "Sentence two keeps the paragraph growing. "
                "Sentence three ensures the reflow logic must split the content."
            ),
            metadata={"quote_depth": 1, "source_tag": "p"},
        ),
        ViewBlock(
            id="block-2",
            kind="list_item",
            text="Nested list item.",
            metadata={"list_depth": 1, "list_ordered": False},
        ),
    ]

    reflowed = reflow_blocks(blocks)

    reflowed_paragraphs = [block for block in reflowed if block.kind == "paragraph"]
    assert len(reflowed_paragraphs) >= 2
    assert all(block.metadata["source_tag"] == "p" for block in reflowed_paragraphs)
    assert all(block.metadata["quote_depth"] == 1 for block in reflowed_paragraphs)
    assert all(block.metadata["reflow_source_block_id"] == "block-1" for block in reflowed_paragraphs)
    assert all(block.metadata["reflow_segment_count"] == len(reflowed_paragraphs) for block in reflowed_paragraphs)

    list_item = next(block for block in reflowed if block.kind == "list_item")
    assert list_item.metadata["list_depth"] == 1
    assert list_item.metadata["list_ordered"] is False
