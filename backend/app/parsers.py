from __future__ import annotations

from dataclasses import dataclass
from io import BytesIO
from pathlib import Path
from typing import Iterable

from bs4 import BeautifulSoup
from docx import Document as DocxDocument
from markdown import markdown
from pypdf import PdfReader

from .models import ViewBlock
from .text_utils import normalize_whitespace


class UnsupportedDocumentError(ValueError):
    """Raised when a document cannot be meaningfully parsed."""


@dataclass(slots=True)
class ParsedDocument:
    title: str
    source_type: str
    file_name: str | None
    blocks: list[ViewBlock]
    plain_text: str


def parse_text_input(text: str, title: str | None = None) -> ParsedDocument:
    blocks = _parse_plain_text_blocks(text)
    if not blocks:
        raise UnsupportedDocumentError("The pasted text did not contain readable content.")
    chosen_title = title or _pick_title_from_blocks(blocks) or "Pasted document"
    return ParsedDocument(
        title=chosen_title,
        source_type="paste",
        file_name=None,
        blocks=blocks,
        plain_text=_blocks_to_text(blocks),
    )


def parse_uploaded_file(file_name: str, content: bytes) -> ParsedDocument:
    suffix = Path(file_name).suffix.lower()
    if suffix == ".txt":
        blocks = _parse_plain_text_blocks(content.decode("utf-8", errors="ignore"))
    elif suffix == ".md":
        blocks = _parse_markdown_blocks(content.decode("utf-8", errors="ignore"))
    elif suffix in {".html", ".htm"}:
        blocks = _parse_html_blocks(content.decode("utf-8", errors="ignore"))
    elif suffix == ".docx":
        blocks = _parse_docx_blocks(content)
    elif suffix == ".pdf":
        blocks = _parse_pdf_blocks(content)
    else:
        raise UnsupportedDocumentError(f"`{suffix}` is not supported yet.")

    if not blocks:
        raise UnsupportedDocumentError("The file did not contain readable text.")

    return ParsedDocument(
        title=_pick_title_from_blocks(blocks) or Path(file_name).stem.replace("_", " ").strip() or "Imported document",
        source_type=suffix.removeprefix("."),
        file_name=file_name,
        blocks=blocks,
        plain_text=_blocks_to_text(blocks),
    )


def _parse_plain_text_blocks(text: str) -> list[ViewBlock]:
    lines = [line.rstrip() for line in text.replace("\r\n", "\n").split("\n")]
    blocks: list[ViewBlock] = []
    paragraph_lines: list[str] = []
    index = 0

    def flush_paragraph() -> None:
        nonlocal index
        if not paragraph_lines:
            return
        paragraph = normalize_whitespace(" ".join(paragraph_lines))
        if paragraph:
            blocks.append(ViewBlock(id=f"block-{index}", kind="paragraph", text=paragraph))
            index += 1
        paragraph_lines.clear()

    for raw_line in lines:
        line = raw_line.strip()
        if not line:
            flush_paragraph()
            continue
        if line.startswith(("- ", "* ", "• ")):
            flush_paragraph()
            blocks.append(ViewBlock(id=f"block-{index}", kind="list_item", text=normalize_whitespace(line[2:])))
            index += 1
            continue
        if _looks_like_heading(line):
            flush_paragraph()
            blocks.append(ViewBlock(id=f"block-{index}", kind="heading", text=line, level=2))
            index += 1
            continue
        paragraph_lines.append(line)

    flush_paragraph()
    return blocks


def _parse_markdown_blocks(text: str) -> list[ViewBlock]:
    blocks: list[ViewBlock] = []
    index = 0
    paragraph_lines: list[str] = []

    def flush_paragraph() -> None:
        nonlocal index
        if not paragraph_lines:
            return
        paragraph = normalize_whitespace(" ".join(paragraph_lines))
        if paragraph:
            blocks.append(ViewBlock(id=f"block-{index}", kind="paragraph", text=paragraph))
            index += 1
        paragraph_lines.clear()

    for raw_line in text.replace("\r\n", "\n").split("\n"):
        line = raw_line.strip()
        if not line:
            flush_paragraph()
            continue
        if line.startswith("#"):
            flush_paragraph()
            hashes, heading_text = line.split(" ", 1) if " " in line else (line, line.lstrip("#"))
            blocks.append(
                ViewBlock(
                    id=f"block-{index}",
                    kind="heading",
                    text=normalize_whitespace(heading_text),
                    level=min(max(len(hashes), 1), 4),
                )
            )
            index += 1
            continue
        if line.startswith(("- ", "* ")):
            flush_paragraph()
            blocks.append(ViewBlock(id=f"block-{index}", kind="list_item", text=normalize_whitespace(line[2:])))
            index += 1
            continue
        paragraph_lines.append(line)

    flush_paragraph()
    if blocks:
        return blocks
    return _parse_html_blocks(markdown(text))


def _parse_html_blocks(text: str) -> list[ViewBlock]:
    soup = BeautifulSoup(text, "html.parser")
    for tag_name in ["script", "style", "nav", "header", "footer", "aside"]:
        for tag in soup.find_all(tag_name):
            tag.decompose()

    container = soup.body or soup
    blocks: list[ViewBlock] = []
    index = 0
    for node in container.find_all(["h1", "h2", "h3", "h4", "p", "li", "blockquote"]):
        if node.find_parent(["blockquote", "li"]) and node.name == "p":
            continue
        text_value = normalize_whitespace(node.get_text(" ", strip=True))
        if not text_value:
            continue
        if node.name.startswith("h"):
            blocks.append(
                ViewBlock(
                    id=f"block-{index}",
                    kind="heading",
                    text=text_value,
                    level=min(max(int(node.name[1]), 1), 4),
                )
            )
        elif node.name == "li":
            blocks.append(ViewBlock(id=f"block-{index}", kind="list_item", text=text_value))
        elif node.name == "blockquote":
            blocks.append(ViewBlock(id=f"block-{index}", kind="quote", text=text_value))
        else:
            blocks.append(ViewBlock(id=f"block-{index}", kind="paragraph", text=text_value))
        index += 1
    return blocks


def _parse_docx_blocks(content: bytes) -> list[ViewBlock]:
    document = DocxDocument(BytesIO(content))
    blocks: list[ViewBlock] = []
    index = 0
    for paragraph in document.paragraphs:
        text = normalize_whitespace(paragraph.text)
        if not text:
            continue
        style_name = (paragraph.style.name if paragraph.style else "").lower()
        if style_name.startswith("heading"):
            level = 2
            for value in range(1, 5):
                if str(value) in style_name:
                    level = value
                    break
            blocks.append(ViewBlock(id=f"block-{index}", kind="heading", text=text, level=level))
        elif "list" in style_name or text.startswith(("- ", "* ", "• ")):
            blocks.append(ViewBlock(id=f"block-{index}", kind="list_item", text=text.lstrip("-*• ").strip()))
        else:
            blocks.append(ViewBlock(id=f"block-{index}", kind="paragraph", text=text))
        index += 1
    return blocks


def _parse_pdf_blocks(content: bytes) -> list[ViewBlock]:
    reader = PdfReader(BytesIO(content))
    page_text: list[str] = []
    for page in reader.pages:
        extracted = normalize_whitespace(page.extract_text() or "")
        if extracted:
            page_text.append(extracted)
    if not page_text:
        raise UnsupportedDocumentError("This PDF looks image-based or scanned, which is not supported yet.")
    combined = "\n\n".join(page_text)
    return _parse_plain_text_blocks(combined)


def _pick_title_from_blocks(blocks: Iterable[ViewBlock]) -> str | None:
    for block in blocks:
        if block.kind == "heading":
            return block.text
    for block in blocks:
        if len(block.text) <= 80:
            return block.text
    return None


def _blocks_to_text(blocks: Iterable[ViewBlock]) -> str:
    return "\n".join(block.text for block in blocks)


def _looks_like_heading(line: str) -> bool:
    if len(line) > 80 or line.endswith((".", "!", "?")):
        return False
    words = line.split()
    if len(words) > 8:
        return False
    capitals = sum(1 for word in words if word[:1].isupper())
    return capitals >= max(1, len(words) // 2)
