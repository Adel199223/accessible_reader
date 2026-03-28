from __future__ import annotations

from dataclasses import dataclass
from io import BytesIO
import base64
import binascii
import mimetypes
import os
from pathlib import Path
import subprocess
import tempfile
from typing import Any, Iterable
import textwrap
from urllib.parse import quote, unquote_to_bytes, urljoin, urlparse

from bs4 import BeautifulSoup, Tag
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps, ImageStat, UnidentifiedImageError

from .models import DocumentView, RecallDocumentPreview, SourceDocument, ViewBlock
from .storage import Repository
from .text_utils import normalize_whitespace, now_iso, safe_query_terms, sha256_text


PREVIEW_OUTPUT_SIZE = (960, 540)
PREVIEW_MIN_WIDTH = 320
PREVIEW_MIN_HEIGHT = 180
PREVIEW_METADATA_KEY = "home_preview"
PREVIEW_METADATA_VERSION = 17
PREVIEW_FALLBACK_SOURCE = "fallback"
PREVIEW_CONTENT_RENDERED_SOURCE = "content-rendered-preview"
PREVIEW_RENDERED_SNAPSHOT_SOURCE = "html-rendered-snapshot"
PREVIEW_IMAGE_SOURCES = {
    "attachment-image",
    PREVIEW_CONTENT_RENDERED_SOURCE,
    "html-meta-image",
    "html-inline-image",
    "html-preload-image",
    PREVIEW_RENDERED_SNAPSHOT_SOURCE,
}
HTML_SOURCE_TYPES = {"web", "html", "htm"}
IMAGE_FILE_SUFFIXES = {
    ".avif",
    ".bmp",
    ".gif",
    ".jpeg",
    ".jpg",
    ".png",
    ".tif",
    ".tiff",
    ".webp",
}
INLINE_IMAGE_BLOCKLIST_TOKENS = ("avatar", "emoji", "icon", "logo", "sprite")
RENDER_SAVED_HTML_PREVIEW_SCRIPT = (
    Path(__file__).resolve().parents[2] / "scripts" / "playwright" / "render_saved_html_preview_asset.mjs"
)
RENDER_SAVED_HTML_PREVIEW_NODE_EXECUTABLE = os.getenv("RECALL_PREVIEW_NODE_EXECUTABLE", "node.exe")
RENDER_SAVED_HTML_PREVIEW_TIMEOUT_SECONDS = 30
RENDERED_PREVIEW_STDDEV_MIN = 14.0
RENDERED_PREVIEW_EDGE_MEAN_MIN = 7.0
RENDERED_PREVIEW_LIGHT_COVERAGE_MAX = 0.78
CONTENT_RENDERED_PREVIEW_MAX_LINES = 4
CONTENT_RENDERED_PREVIEW_MIN_CHARS = 16
CONTENT_RENDERED_PREVIEW_NOTE_MAX_LINES = 2
CONTENT_RENDERED_PREVIEW_LAYOUT_NOTE = "note"
CONTENT_RENDERED_PREVIEW_LAYOUT_SHEET = "sheet"
CONTENT_RENDERED_PREVIEW_NOTE_VARIANT_FOCUS = "focus-note"
CONTENT_RENDERED_PREVIEW_NOTE_VARIANT_SUMMARY = "summary-note"
CONTENT_RENDERED_PREVIEW_SHEET_VARIANT_ARTICLE = "article-sheet"
CONTENT_RENDERED_PREVIEW_SHEET_VARIANT_OUTLINE = "outline-sheet"
CONTENT_RENDERED_PREVIEW_OUTLINE_VARIANT_DOCUMENT = "document-outline"
CONTENT_RENDERED_PREVIEW_OUTLINE_VARIANT_CHECKLIST = "checklist-outline"
CONTENT_RENDERED_SUMMARY_NOTE_MAX_CUES = 2
CONTENT_RENDERED_SUMMARY_NOTE_GENERIC_TOKENS = {
    "alpha",
    "answer",
    "beta",
    "browser",
    "capture",
    "debug",
    "document",
    "file",
    "first",
    "four",
    "gamma",
    "html",
    "local",
    "one",
    "paste",
    "runtime",
    "second",
    "sentence",
    "short",
    "smoke",
    "source",
    "stage",
    "text",
    "third",
    "three",
    "two",
    "txt",
    "uploaded",
    "web",
}
CONTENT_RENDERED_PREVIEW_BACKGROUND_THEMES = {
    "file": {
        "backdrop": (34, 28, 26),
        "halo": (84, 52, 22),
        "halo_secondary": (62, 42, 18),
        "shell": (28, 24, 24),
        "shell_border": (96, 76, 48),
        "sheet": (244, 236, 224),
        "sheet_header": (226, 208, 184),
        "sheet_border": (176, 146, 114),
        "accent": (140, 92, 44),
        "accent_text": (255, 245, 230),
        "detail": (116, 92, 72),
        "title": (74, 54, 34),
        "body": (102, 80, 58),
        "rule": (165, 122, 70),
    },
    "paste": {
        "backdrop": (18, 32, 36),
        "halo": (34, 86, 92),
        "halo_secondary": (26, 64, 74),
        "shell": (14, 24, 28),
        "shell_border": (42, 102, 110),
        "sheet": (226, 242, 238),
        "sheet_header": (184, 224, 214),
        "sheet_border": (106, 166, 156),
        "accent": (42, 112, 118),
        "accent_text": (238, 252, 249),
        "detail": (90, 118, 116),
        "title": (28, 68, 72),
        "body": (40, 88, 92),
        "rule": (70, 140, 144),
    },
    "web": {
        "backdrop": (20, 28, 42),
        "halo": (56, 84, 152),
        "halo_secondary": (44, 64, 126),
        "shell": (16, 22, 36),
        "shell_border": (70, 96, 162),
        "sheet": (230, 236, 248),
        "sheet_header": (196, 210, 238),
        "sheet_border": (118, 142, 196),
        "accent": (70, 98, 176),
        "accent_text": (244, 248, 255),
        "detail": (96, 112, 146),
        "title": (42, 58, 102),
        "body": (58, 74, 114),
        "rule": (86, 114, 188),
    },
}
PREVIEW_FONT_CANDIDATES = {
    False: ("DejaVuSans.ttf", "Arial.ttf", "arial.ttf"),
    True: ("DejaVuSans-Bold.ttf", "Arial Bold.ttf", "arialbd.ttf"),
}


@dataclass(frozen=True)
class PreviewCandidate:
    source: str
    url: str


@dataclass(frozen=True)
class PreviewResolution:
    kind: str
    source: str
    updated_at: str
    relative_path: str | None = None


class RecallPreviewService:
    def __init__(self, repository: Repository, files_dir: Path):
        self.repository = repository
        self.previews_dir = files_dir / "previews"
        self.previews_dir.mkdir(parents=True, exist_ok=True)

    def resolve_document_preview(self, document_id: str) -> tuple[RecallDocumentPreview, Path | None] | None:
        document = self.repository.get_source_document(document_id)
        if not document:
            return None
        return self._resolve_preview_for_document(document)

    def delete_cached_preview_for_document(self, document: SourceDocument | None) -> None:
        if not document:
            return
        cached_metadata = self._preview_metadata_from_document(document)
        cached_path = self._asset_path_from_metadata(cached_metadata)
        if cached_path:
            cached_path.unlink(missing_ok=True)

    def _resolve_preview_for_document(
        self,
        document: SourceDocument,
    ) -> tuple[RecallDocumentPreview, Path | None]:
        cached_metadata = self._preview_metadata_from_document(document)
        cached_asset_path = self._asset_path_from_metadata(cached_metadata)
        if self._is_cached_preview_valid(document, cached_metadata, cached_asset_path):
            preview = self._build_preview_response(
                document_id=document.id,
                kind=str(cached_metadata["kind"]),
                source=str(cached_metadata["source"]),
                updated_at=str(cached_metadata["updated_at"]),
                relative_path=str(cached_metadata.get("relative_path") or "") or None,
            )
            return preview, cached_asset_path

        previous_asset_path = cached_asset_path
        resolution = self._generate_preview_resolution(document)
        metadata = dict(document.metadata)
        metadata[PREVIEW_METADATA_KEY] = {
            "content_hash": document.content_hash,
            "kind": resolution.kind,
            "relative_path": resolution.relative_path,
            "source": resolution.source,
            "updated_at": resolution.updated_at,
            "version": PREVIEW_METADATA_VERSION,
        }
        self.repository.save_source_document_metadata(document.id, metadata, touch_updated_at=False)

        resolved_asset_path = self._asset_path_from_relative_path(resolution.relative_path)
        if previous_asset_path and previous_asset_path != resolved_asset_path:
            previous_asset_path.unlink(missing_ok=True)
        if resolution.kind == "fallback" and previous_asset_path:
            previous_asset_path.unlink(missing_ok=True)

        preview = self._build_preview_response(
            document_id=document.id,
            kind=resolution.kind,
            source=resolution.source,
            updated_at=resolution.updated_at,
            relative_path=resolution.relative_path,
        )
        return preview, resolved_asset_path

    def _generate_preview_resolution(self, document: SourceDocument) -> PreviewResolution:
        stored_path = self._stored_path(document)
        updated_at = now_iso()

        if stored_path and self._is_image_attachment(document, stored_path):
            relative_path = self._write_normalized_preview(
                document,
                source_path=stored_path,
            )
            if relative_path:
                return PreviewResolution(
                    kind="image",
                    source="attachment-image",
                    updated_at=updated_at,
                    relative_path=relative_path,
                )

        if stored_path and self._is_html_backed_document(document, stored_path):
            html_text = self._read_html_text(stored_path)
            if html_text:
                for candidate in self._extract_html_preview_candidates(
                    html_text,
                    source_locator=document.source_locator,
                    stored_path=stored_path,
                ):
                    relative_path = self._write_candidate_preview(document, candidate.url, stored_path=stored_path)
                    if relative_path:
                        return PreviewResolution(
                            kind="image",
                            source=candidate.source,
                            updated_at=updated_at,
                            relative_path=relative_path,
                        )
            rendered_snapshot = self._load_rendered_html_snapshot_bytes(stored_path)
            if rendered_snapshot and self._is_rendered_snapshot_high_signal(rendered_snapshot):
                relative_path = self._write_normalized_preview(document, image_bytes=rendered_snapshot)
                if relative_path:
                    return PreviewResolution(
                        kind="image",
                        source=PREVIEW_RENDERED_SNAPSHOT_SOURCE,
                        updated_at=updated_at,
                        relative_path=relative_path,
                    )

        relative_path = self._write_content_rendered_preview(document)
        if relative_path:
            return PreviewResolution(
                kind="image",
                source=PREVIEW_CONTENT_RENDERED_SOURCE,
                updated_at=updated_at,
                relative_path=relative_path,
            )

        return PreviewResolution(kind="fallback", source=PREVIEW_FALLBACK_SOURCE, updated_at=updated_at)

    def _preview_metadata_from_document(self, document: SourceDocument) -> dict[str, Any]:
        metadata = document.metadata.get(PREVIEW_METADATA_KEY)
        return metadata if isinstance(metadata, dict) else {}

    def _is_cached_preview_valid(
        self,
        document: SourceDocument,
        cached_metadata: dict[str, Any],
        cached_asset_path: Path | None,
    ) -> bool:
        if not cached_metadata:
            return False
        if cached_metadata.get("version") != PREVIEW_METADATA_VERSION:
            return False
        if cached_metadata.get("content_hash") != document.content_hash:
            return False
        kind = cached_metadata.get("kind")
        source = cached_metadata.get("source")
        updated_at = cached_metadata.get("updated_at")
        if kind not in {"image", "fallback"} or not isinstance(updated_at, str) or not updated_at:
            return False
        if kind == "image":
            if source not in PREVIEW_IMAGE_SOURCES:
                return False
            return cached_asset_path is not None and cached_asset_path.exists()
        return source == PREVIEW_FALLBACK_SOURCE

    def _build_preview_response(
        self,
        *,
        document_id: str,
        kind: str,
        source: str,
        updated_at: str,
        relative_path: str | None,
    ) -> RecallDocumentPreview:
        asset_url = None
        if kind == "image" and relative_path:
            asset_url = f"/api/recall/documents/{document_id}/preview/asset?updated_at={quote(updated_at, safe='')}"
        return RecallDocumentPreview(
            document_id=document_id,
            kind=kind,
            source=source,
            asset_url=asset_url,
            updated_at=updated_at,
        )

    def _stored_path(self, document: SourceDocument) -> Path | None:
        if not document.stored_path:
            return None
        stored_path = Path(document.stored_path)
        if stored_path.is_absolute():
            return stored_path
        return self.repository.database_path.parent / stored_path

    def _asset_path_from_metadata(self, metadata: dict[str, Any]) -> Path | None:
        relative_path = metadata.get("relative_path")
        if not isinstance(relative_path, str) or not relative_path:
            return None
        return self._asset_path_from_relative_path(relative_path)

    def _asset_path_from_relative_path(self, relative_path: str | None) -> Path | None:
        if not relative_path:
            return None
        return self.repository.database_path.parent / relative_path

    def _is_image_attachment(self, document: SourceDocument, stored_path: Path) -> bool:
        source_type = document.source_type.strip().lower()
        if source_type.startswith("image/"):
            return True
        if stored_path.suffix.lower() in IMAGE_FILE_SUFFIXES:
            return True
        media_type, _ = mimetypes.guess_type(stored_path.name)
        return bool(media_type and media_type.startswith("image/"))

    def _is_html_backed_document(self, document: SourceDocument, stored_path: Path) -> bool:
        normalized_source_type = document.source_type.strip().lower()
        if normalized_source_type in HTML_SOURCE_TYPES:
            return True
        return stored_path.suffix.lower() in {".htm", ".html"}

    def _read_html_text(self, stored_path: Path) -> str | None:
        try:
            return stored_path.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            return None

    def _extract_html_preview_candidates(
        self,
        html_text: str,
        *,
        source_locator: str | None,
        stored_path: Path,
    ) -> list[PreviewCandidate]:
        soup = BeautifulSoup(html_text, "html.parser")
        base_reference = source_locator.strip() if source_locator else stored_path.resolve().as_uri()
        base_tag = soup.find("base", href=True)
        if isinstance(base_tag, Tag):
            base_reference = urljoin(base_reference, str(base_tag.get("href", "")).strip())

        candidates: list[PreviewCandidate] = []
        seen_urls: set[str] = set()

        def add_candidate(raw_value: str | None, source: str) -> None:
            resolved = self._resolve_candidate_url(raw_value, base_reference=base_reference, stored_path=stored_path)
            if not resolved or resolved in seen_urls:
                return
            seen_urls.add(resolved)
            candidates.append(PreviewCandidate(source=source, url=resolved))

        for meta in soup.select('meta[property="og:image"], meta[name="twitter:image"], meta[property="twitter:image"]'):
            add_candidate(meta.get("content"), "html-meta-image")
        for link in soup.select('link[rel~="image_src"][href]'):
            add_candidate(link.get("href"), "html-meta-image")
        for link in soup.select('link[rel~="preload"][as="image"][href]'):
            add_candidate(link.get("href"), "html-preload-image")

        search_roots = [soup.find("main"), soup.find("article"), soup.body, soup]
        for root in search_roots:
            if not root:
                continue
            for image in root.find_all("img", src=True):
                if not self._is_meaningful_inline_image(image):
                    continue
                add_candidate(image.get("src"), "html-inline-image")

        return candidates

    def _resolve_candidate_url(self, raw_value: str | None, *, base_reference: str, stored_path: Path) -> str | None:
        if not raw_value:
            return None
        candidate = raw_value.strip()
        if not candidate:
            return None
        if candidate.startswith(("about:", "blob:", "javascript:")):
            return None
        if candidate.startswith("data:image/"):
            return candidate

        parsed = urlparse(candidate)
        if parsed.scheme in {"http", "https", "file"}:
            return candidate
        if parsed.scheme:
            return None

        if candidate.startswith("//"):
            parsed_base = urlparse(base_reference)
            scheme = parsed_base.scheme or "https"
            return f"{scheme}:{candidate}"

        if candidate.startswith("/"):
            return urljoin(base_reference, candidate)

        if base_reference:
            return urljoin(base_reference, candidate)

        return (stored_path.parent / candidate).resolve().as_uri()

    def _is_meaningful_inline_image(self, image: Tag) -> bool:
        class_id_tokens = self._tag_text_tokens(image).lower()
        if any(token in class_id_tokens for token in INLINE_IMAGE_BLOCKLIST_TOKENS):
            return False

        width = self._dimension_from_tag(image.get("width"))
        height = self._dimension_from_tag(image.get("height"))
        if width and height and (width < PREVIEW_MIN_WIDTH or height < PREVIEW_MIN_HEIGHT):
            return False
        return True

    def _tag_text_tokens(self, image: Tag) -> str:
        values: list[str] = []
        for value in (
            image.get("class"),
            image.get("id"),
            image.get("role"),
            image.get("alt"),
        ):
            if isinstance(value, str):
                values.append(value)
            elif isinstance(value, list):
                values.extend(str(item) for item in value if item)
        return " ".join(values)

    def _dimension_from_tag(self, value: Any) -> int | None:
        if value is None:
            return None
        if isinstance(value, int):
            return value
        if isinstance(value, str):
            digits = "".join(character for character in value if character.isdigit())
            if digits:
                try:
                    return int(digits)
                except ValueError:
                    return None
        return None

    def _write_candidate_preview(self, document: SourceDocument, candidate_url: str, *, stored_path: Path) -> str | None:
        image_bytes = self._load_candidate_image_bytes(candidate_url, stored_path=stored_path)
        if not image_bytes:
            return None
        return self._write_normalized_preview(document, image_bytes=image_bytes)

    def _load_candidate_image_bytes(self, candidate_url: str, *, stored_path: Path) -> bytes | None:
        if candidate_url.startswith("data:image/"):
            return self._decode_data_url(candidate_url)

        candidate_path = self._local_candidate_path_from_url(candidate_url, stored_path=stored_path)
        if candidate_path is None:
            return None
        try:
            return candidate_path.read_bytes()
        except OSError:
            return None

    def _local_candidate_path_from_url(self, candidate_url: str, *, stored_path: Path) -> Path | None:
        parsed = urlparse(candidate_url)
        if parsed.scheme in {"http", "https"}:
            return None

        if parsed.scheme == "file":
            if parsed.netloc not in {"", "localhost"}:
                return None
            try:
                candidate_path = Path(unquote_to_bytes(parsed.path).decode("utf-8"))
            except UnicodeDecodeError:
                return None
        elif parsed.scheme:
            return None
        else:
            candidate_path = Path(candidate_url)
            if not candidate_path.is_absolute():
                candidate_path = stored_path.parent / candidate_path

        candidate_path = candidate_path.resolve(strict=False)
        if not self._is_path_within_allowed_roots(candidate_path, stored_path=stored_path):
            return None
        return candidate_path

    def _is_path_within_allowed_roots(self, candidate_path: Path, *, stored_path: Path) -> bool:
        allowed_roots = {
            self.repository.database_path.parent.resolve(strict=False),
            stored_path.parent.resolve(strict=False),
        }
        for allowed_root in allowed_roots:
            try:
                candidate_path.relative_to(allowed_root)
                return True
            except ValueError:
                continue
        return False

    def _decode_data_url(self, candidate_url: str) -> bytes | None:
        try:
            header, payload = candidate_url.split(",", 1)
        except ValueError:
            return None
        try:
            if ";base64" in header:
                return base64.b64decode(payload, validate=True)
            return unquote_to_bytes(payload)
        except (ValueError, binascii.Error):
            return None

    def _write_content_rendered_preview(self, document: SourceDocument) -> str | None:
        preview_view = self._load_content_rendered_preview_view(document.id)
        if preview_view is None:
            return None

        preview_bytes = self._build_content_rendered_preview_bytes(document, preview_view)
        if not preview_bytes:
            return None

        return self._write_normalized_preview(document, image_bytes=preview_bytes)

    def _load_content_rendered_preview_view(self, document_id: str) -> DocumentView | None:
        for mode in ("reflowed", "original"):
            preview_view = self.repository.get_view(document_id, mode=mode, detail_level="default")
            if preview_view and preview_view.blocks:
                return preview_view
        return None

    def _build_content_rendered_preview_bytes(self, document: SourceDocument, view: DocumentView) -> bytes | None:
        title_text = normalize_whitespace(view.title or document.title)
        source_detail = self._content_rendered_preview_detail(document)
        blocked_texts = self._build_blocked_preview_texts(document, title_text, source_detail)
        heading_text = self._select_content_rendered_heading(view, blocked_texts)
        used_sparse_selector = False
        body_lines = self._select_content_rendered_body_lines(
            view,
            (*blocked_texts, self._normalize_preview_compare_text(heading_text or title_text)),
        )
        if not body_lines:
            used_sparse_selector = True
            body_lines = self._select_sparse_content_rendered_body_lines(
                view,
                (*blocked_texts, self._normalize_preview_compare_text(heading_text or title_text)),
            )
        if not body_lines:
            return None

        preview_title = heading_text or title_text
        source_kind = self._content_rendered_source_kind(document)
        layout_variant = self._select_content_rendered_layout_variant(
            document,
            view,
            body_lines,
            used_sparse_selector=used_sparse_selector,
        )
        colors = CONTENT_RENDERED_PREVIEW_BACKGROUND_THEMES[source_kind]
        source_label = self._content_rendered_source_label(document)

        if layout_variant == CONTENT_RENDERED_PREVIEW_LAYOUT_NOTE:
            note_variant = self._select_content_rendered_note_variant(
                body_lines,
                used_sparse_selector=used_sparse_selector,
            )
            image = self._render_content_rendered_note_preview(
                colors=colors,
                note_variant=note_variant,
                preview_title=preview_title,
                body_lines=body_lines[:CONTENT_RENDERED_PREVIEW_NOTE_MAX_LINES],
                source_label=source_label,
                source_detail=source_detail,
            )
        else:
            sheet_variant = self._select_content_rendered_sheet_variant(document, body_lines)
            outline_variant = (
                self._select_content_rendered_outline_sheet_variant(document, body_lines)
                if sheet_variant == CONTENT_RENDERED_PREVIEW_SHEET_VARIANT_OUTLINE
                else None
            )
            image = self._render_content_rendered_sheet_preview(
                colors=colors,
                preview_title=preview_title,
                body_lines=body_lines[:CONTENT_RENDERED_PREVIEW_MAX_LINES],
                outline_variant=outline_variant,
                sheet_variant=sheet_variant,
                source_label=source_label,
                source_detail=source_detail,
            )

        buffer = BytesIO()
        image.save(buffer, format="PNG")
        return buffer.getvalue()

    def _select_content_rendered_layout_variant(
        self,
        document: SourceDocument,
        view: DocumentView,
        body_lines: Iterable[str],
        *,
        used_sparse_selector: bool,
    ) -> str:
        if used_sparse_selector:
            return CONTENT_RENDERED_PREVIEW_LAYOUT_NOTE

        source_kind = self._content_rendered_source_kind(document)
        if source_kind != "paste":
            return CONTENT_RENDERED_PREVIEW_LAYOUT_SHEET

        non_heading_blocks = [
            block for block in view.blocks if block.kind != "heading" and normalize_whitespace(block.text)
        ]
        normalized_lines = [self._normalize_preview_compare_text(line) for line in body_lines]
        meaningful_lines = [line for line in normalized_lines if line]
        total_chars = sum(len(line) for line in meaningful_lines)

        if len(non_heading_blocks) <= 1 and len(meaningful_lines) <= 2 and total_chars <= 140:
            return CONTENT_RENDERED_PREVIEW_LAYOUT_NOTE
        return CONTENT_RENDERED_PREVIEW_LAYOUT_SHEET

    def _select_content_rendered_note_variant(
        self,
        body_lines: Iterable[str],
        *,
        used_sparse_selector: bool,
    ) -> str:
        if used_sparse_selector:
            return CONTENT_RENDERED_PREVIEW_NOTE_VARIANT_FOCUS

        normalized_lines = [self._normalize_preview_compare_text(line) for line in body_lines]
        meaningful_lines = [line for line in normalized_lines if line]
        total_chars = sum(len(line) for line in meaningful_lines)
        if len(meaningful_lines) >= 2:
            return CONTENT_RENDERED_PREVIEW_NOTE_VARIANT_SUMMARY
        if len(meaningful_lines) <= 1 and total_chars <= 80:
            return CONTENT_RENDERED_PREVIEW_NOTE_VARIANT_FOCUS
        return CONTENT_RENDERED_PREVIEW_NOTE_VARIANT_SUMMARY

    def _select_content_rendered_sheet_variant(
        self,
        document: SourceDocument,
        body_lines: Iterable[str],
    ) -> str:
        source_kind = self._content_rendered_source_kind(document)
        normalized_lines = [self._normalize_preview_compare_text(line) for line in body_lines]
        meaningful_lines = [line for line in normalized_lines if line]
        list_line_count = sum(1 for line in body_lines if line.startswith("• "))
        total_chars = sum(len(line) for line in meaningful_lines)
        average_chars = total_chars / max(len(meaningful_lines), 1)

        if source_kind == "web" and len(meaningful_lines) >= 3 and average_chars >= 24 and list_line_count <= 1:
            return CONTENT_RENDERED_PREVIEW_SHEET_VARIANT_ARTICLE
        return CONTENT_RENDERED_PREVIEW_SHEET_VARIANT_OUTLINE

    def _select_content_rendered_outline_sheet_variant(
        self,
        document: SourceDocument,
        body_lines: Iterable[str],
    ) -> str:
        source_kind = self._content_rendered_source_kind(document)
        normalized_lines = [self._normalize_preview_compare_text(line) for line in body_lines]
        meaningful_lines = [line for line in normalized_lines if line]
        list_line_count = sum(1 for line in body_lines if line.startswith("• "))
        total_chars = sum(len(line) for line in meaningful_lines)
        average_chars = total_chars / max(len(meaningful_lines), 1)

        if source_kind == "paste" and (
            list_line_count >= 1 or (len(meaningful_lines) >= 3 and average_chars <= 44)
        ):
            return CONTENT_RENDERED_PREVIEW_OUTLINE_VARIANT_CHECKLIST
        return CONTENT_RENDERED_PREVIEW_OUTLINE_VARIANT_DOCUMENT

    def _select_content_rendered_summary_note_cues(
        self,
        preview_title: str,
        body_lines: Iterable[str],
    ) -> list[str]:
        token_stats: dict[str, dict[str, int | bool]] = {}
        first_seen_index = 0
        title_tokens = set(safe_query_terms(preview_title))

        for preview_line in body_lines:
            seen_in_line: set[str] = set()
            for token in safe_query_terms(preview_line.removeprefix("• ").strip()):
                if (
                    len(token) < 4
                    or any(character.isdigit() for character in token)
                    or token in CONTENT_RENDERED_SUMMARY_NOTE_GENERIC_TOKENS
                ):
                    continue
                stats = token_stats.setdefault(
                    token,
                    {
                        "count": 0,
                        "first_seen": first_seen_index,
                        "from_body": False,
                        "line_presence": 0,
                        "in_title": token in title_tokens,
                    },
                )
                stats["count"] = int(stats["count"]) + 1
                stats["from_body"] = True
                if token not in seen_in_line:
                    stats["line_presence"] = int(stats["line_presence"]) + 1
                    seen_in_line.add(token)
                if int(stats["first_seen"]) == first_seen_index:
                    first_seen_index += 1

        if len(token_stats) < CONTENT_RENDERED_SUMMARY_NOTE_MAX_CUES:
            for token in safe_query_terms(preview_title):
                if (
                    len(token) < 4
                    or any(character.isdigit() for character in token)
                    or token in CONTENT_RENDERED_SUMMARY_NOTE_GENERIC_TOKENS
                    or token in token_stats
                ):
                    continue
                token_stats[token] = {
                    "count": 1,
                    "first_seen": first_seen_index,
                    "from_body": False,
                    "line_presence": 1,
                    "in_title": True,
                }
                first_seen_index += 1

        ranked_tokens = sorted(
            token_stats.items(),
            key=lambda item: (
                -int(item[1]["from_body"]),
                -int(item[1]["line_presence"]),
                -int(item[1]["count"]),
                int(item[1]["in_title"]),
                int(item[1]["first_seen"]),
                -len(item[0]),
            ),
        )
        return [token.upper() for token, _ in ranked_tokens[:CONTENT_RENDERED_SUMMARY_NOTE_MAX_CUES]]

    def _select_content_rendered_summary_note_accent_seed(
        self,
        preview_title: str,
        body_lines: Iterable[str],
    ) -> int:
        digest = sha256_text(
            f"{normalize_whitespace(preview_title)}|{'|'.join(normalize_whitespace(line) for line in body_lines)}"
        )
        return int(digest[:2], 16) % 3

    def _render_content_rendered_sheet_preview(
        self,
        *,
        colors: dict[str, tuple[int, int, int]],
        outline_variant: str | None,
        preview_title: str,
        body_lines: list[str],
        sheet_variant: str,
        source_label: str,
        source_detail: str,
    ) -> Image.Image:
        if sheet_variant == CONTENT_RENDERED_PREVIEW_SHEET_VARIANT_ARTICLE:
            return self._render_content_rendered_article_sheet_preview(
                colors=colors,
                preview_title=preview_title,
                body_lines=body_lines,
                source_label=source_label,
                source_detail=source_detail,
            )
        return self._render_content_rendered_outline_sheet_preview(
            colors=colors,
            outline_variant=outline_variant,
            preview_title=preview_title,
            body_lines=body_lines,
            source_label=source_label,
            source_detail=source_detail,
        )

    def _render_content_rendered_outline_sheet_preview(
        self,
        *,
        colors: dict[str, tuple[int, int, int]],
        outline_variant: str | None,
        preview_title: str,
        body_lines: list[str],
        source_label: str,
        source_detail: str,
    ) -> Image.Image:
        if outline_variant == CONTENT_RENDERED_PREVIEW_OUTLINE_VARIANT_CHECKLIST:
            return self._render_content_rendered_checklist_outline_sheet_preview(
                colors=colors,
                preview_title=preview_title,
                body_lines=body_lines,
                source_label=source_label,
                source_detail=source_detail,
            )
        return self._render_content_rendered_document_outline_sheet_preview(
            colors=colors,
            preview_title=preview_title,
            body_lines=body_lines,
            source_label=source_label,
            source_detail=source_detail,
        )

    def _render_content_rendered_document_outline_sheet_preview(
        self,
        *,
        colors: dict[str, tuple[int, int, int]],
        preview_title: str,
        body_lines: list[str],
        source_label: str,
        source_detail: str,
    ) -> Image.Image:
        image = Image.new("RGB", PREVIEW_OUTPUT_SIZE, colors["backdrop"])
        draw = ImageDraw.Draw(image)
        width, height = PREVIEW_OUTPUT_SIZE

        draw.ellipse((-120, -76, 432, 418), fill=colors["halo"])
        draw.ellipse((width - 380, 74, width + 120, height + 170), fill=colors["halo_secondary"])
        draw.rounded_rectangle((46, 34, width - 46, height - 34), radius=34, fill=colors["shell"], outline=colors["shell_border"], width=2)
        draw.rounded_rectangle((92, 72, width - 92, height - 66), radius=26, fill=colors["sheet"], outline=colors["sheet_border"], width=2)
        draw.rounded_rectangle((92, 72, width - 92, 132), radius=26, fill=colors["sheet_header"])
        draw.rounded_rectangle((118, 88, 224, 116), radius=14, fill=colors["accent"])

        badge_font = self._load_preview_font(15, bold=True)
        detail_font = self._load_preview_font(16)
        title_font = self._load_preview_font(30, bold=True)
        body_font = self._load_preview_font(20)

        draw.text((140, 94), source_label, font=badge_font, fill=colors["accent_text"])

        detail_width = self._measure_text_width(draw, source_detail, detail_font)
        draw.text((width - 118 - detail_width, 94), source_detail, font=detail_font, fill=colors["detail"])

        wrapped_title = self._wrap_preview_text(draw, preview_title, title_font, max_width=width - 304, max_lines=2)
        title_y = 154
        for line in wrapped_title:
            draw.text((140, title_y), line, font=title_font, fill=colors["title"])
            title_y += 34

        rule_y = max(title_y + 4, 222)
        draw.rounded_rectangle((140, rule_y, 244, rule_y + 5), radius=3, fill=colors["rule"])

        line_y = rule_y + 18
        line_height = 32
        for preview_line in body_lines:
            is_list_line = preview_line.startswith("• ")
            visible_text = preview_line.removeprefix("• ").strip() if is_list_line else preview_line
            rendered_text = self._truncate_preview_text_to_width(
                draw,
                visible_text,
                body_font,
                max_width=width - 336 - (20 if is_list_line else 0),
            )
            if is_list_line:
                draw.rounded_rectangle((142, line_y + 7, 154, line_y + 19), radius=4, fill=colors["rule"])
                text_x = 172
            else:
                draw.rounded_rectangle((142, line_y + 10, 150, line_y + 16), radius=3, fill=colors["rule"])
                text_x = 166
            draw.text((text_x, line_y), rendered_text, font=body_font, fill=colors["body"])
            line_y += line_height

        return image

    def _render_content_rendered_checklist_outline_sheet_preview(
        self,
        *,
        colors: dict[str, tuple[int, int, int]],
        preview_title: str,
        body_lines: list[str],
        source_label: str,
        source_detail: str,
    ) -> Image.Image:
        image = Image.new("RGB", PREVIEW_OUTPUT_SIZE, colors["backdrop"])
        draw = ImageDraw.Draw(image)
        width, height = PREVIEW_OUTPUT_SIZE

        def mix(
            first: tuple[int, int, int],
            second: tuple[int, int, int],
            first_weight: float,
        ) -> tuple[int, int, int]:
            second_weight = 1.0 - first_weight
            return tuple(
                int(first[channel] * first_weight + second[channel] * second_weight) for channel in range(3)
            )

        frame_fill = mix(colors["sheet_header"], colors["shell"], 0.55)
        panel_fill = mix(colors["sheet"], colors["sheet_header"], 0.66)
        panel_header_fill = mix(panel_fill, colors["sheet_header"], 0.56)
        body_lane_fill = mix(panel_fill, colors["shell"], 0.46)
        rail_fill = mix(colors["accent"], frame_fill, 0.62)
        rail_card_fill = mix(panel_fill, frame_fill, 0.44)
        row_fill = mix(colors["sheet"], panel_fill, 0.82)
        row_alt_fill = mix(panel_fill, colors["sheet_header"], 0.68)

        draw.ellipse((-120, -76, 432, 418), fill=colors["halo"])
        draw.ellipse((width - 380, 74, width + 120, height + 170), fill=colors["halo_secondary"])
        draw.rounded_rectangle(
            (46, 34, width - 46, height - 34),
            radius=34,
            fill=colors["shell"],
            outline=colors["shell_border"],
            width=2,
        )
        draw.rounded_rectangle(
            (92, 72, width - 92, height - 66),
            radius=26,
            fill=frame_fill,
            outline=colors["sheet_border"],
            width=2,
        )
        panel_left = 112
        panel_top = 74
        panel_right = width - 126
        panel_bottom = height - 62
        draw.rounded_rectangle(
            (panel_left, panel_top, panel_right, panel_bottom),
            radius=28,
            fill=panel_fill,
            outline=colors["sheet_border"],
            width=2,
        )
        draw.rounded_rectangle(
            (panel_left, panel_top, panel_right, panel_top + 58),
            radius=28,
            fill=panel_header_fill,
        )
        draw.rounded_rectangle(
            (panel_left, panel_top + 28, panel_right, panel_top + 58),
            fill=panel_header_fill,
        )
        draw.rounded_rectangle(
            (250, 140, panel_right - 18, panel_bottom - 20),
            radius=24,
            fill=body_lane_fill,
        )
        draw.rounded_rectangle((126, 144, 236, height - 88), radius=24, fill=rail_fill)
        draw.rounded_rectangle((136, 156, 224, 218), radius=20, fill=rail_card_fill)
        draw.rounded_rectangle((146, 170, 210, 196), radius=13, fill=colors["accent"])

        badge_font = self._load_preview_font(15, bold=True)
        rail_label_font = self._load_preview_font(12, bold=True)
        detail_font = self._load_preview_font(16)
        title_font = self._load_preview_font(28, bold=True)
        body_font = self._load_preview_font(19)

        draw.rounded_rectangle((118, 88, 224, 116), radius=14, fill=colors["accent"])
        draw.text((140, 94), source_label, font=badge_font, fill=colors["accent_text"])

        detail_width = self._measure_text_width(draw, source_detail, detail_font)
        draw.text((panel_right - 18 - detail_width, 94), source_detail, font=detail_font, fill=colors["detail"])

        draw.text((147, 176), "CHECKLIST", font=rail_label_font, fill=colors["accent_text"])
        rail_y = 230
        for row_index in range(3):
            top = rail_y + row_index * 74
            draw.rounded_rectangle((134, top, 220, top + 46), radius=16, fill=rail_card_fill)
            draw.rounded_rectangle((148, top + 14, 204, top + 18), radius=3, fill=colors["rule"])
            draw.rounded_rectangle((148, top + 28, 192, top + 32), radius=3, fill=colors["rule"])

        title_left = 260
        wrapped_title = self._wrap_preview_text(
            draw,
            preview_title,
            title_font,
            max_width=panel_right - title_left - 40,
            max_lines=2,
        )
        title_y = 150
        for line in wrapped_title:
            draw.text((title_left, title_y), line, font=title_font, fill=colors["title"])
            title_y += 34

        rule_y = max(title_y + 6, 214)
        draw.rounded_rectangle((title_left, rule_y, title_left + 118, rule_y + 5), radius=3, fill=colors["rule"])

        line_y = rule_y + 14
        row_rights = [panel_right - 30, panel_right - 52, panel_right - 18]
        for row_index, preview_line in enumerate(body_lines):
            visible_text = preview_line.removeprefix("• ").strip()
            wrapped_line = self._wrap_preview_text(
                draw,
                visible_text,
                body_font,
                max_width=row_rights[min(row_index, len(row_rights) - 1)] - title_left - 92,
                max_lines=2,
            )
            row_bottom = line_y + (72 if len(wrapped_line) > 1 else 58)
            row_right = row_rights[min(row_index, len(row_rights) - 1)]
            draw.rounded_rectangle(
                (title_left, line_y - 4, row_right, row_bottom),
                radius=18,
                fill=row_fill if row_index % 2 == 0 else row_alt_fill,
            )
            checkbox_left = title_left + 16
            checkbox_top = line_y + 9
            draw.rounded_rectangle(
                (checkbox_left, checkbox_top, checkbox_left + 22, checkbox_top + 22),
                radius=7,
                outline=colors["rule"],
                width=3,
            )
            draw.rounded_rectangle(
                (checkbox_left + 34, checkbox_top + 8, checkbox_left + 114, checkbox_top + 12),
                radius=3,
                fill=colors["rule"],
            )
            text_y = line_y + 8
            for wrapped in wrapped_line:
                draw.text((checkbox_left + 34, text_y + 16), wrapped, font=body_font, fill=colors["body"])
                text_y += 22
            line_y = row_bottom + 10

        return image

    def _render_content_rendered_article_sheet_preview(
        self,
        *,
        colors: dict[str, tuple[int, int, int]],
        preview_title: str,
        body_lines: list[str],
        source_label: str,
        source_detail: str,
    ) -> Image.Image:
        image = Image.new("RGB", PREVIEW_OUTPUT_SIZE, colors["backdrop"])
        draw = ImageDraw.Draw(image)
        width, height = PREVIEW_OUTPUT_SIZE

        draw.ellipse((-128, -82, 416, 404), fill=colors["halo"])
        draw.ellipse((width - 356, 72, width + 132, height + 164), fill=colors["halo_secondary"])
        draw.rounded_rectangle(
            (46, 34, width - 46, height - 34),
            radius=34,
            fill=colors["shell"],
            outline=colors["shell_border"],
            width=2,
        )

        main_left = 92
        main_top = 72
        main_right = 596
        main_bottom = height - 94
        aside_left = 632
        aside_top = 156
        aside_right = width - 104
        aside_bottom = height - 110
        gutter_left = 616
        gutter_top = 120
        gutter_bottom = height - 92

        draw.rounded_rectangle(
            (main_left, main_top, main_right, main_bottom),
            radius=26,
            fill=colors["sheet"],
            outline=colors["sheet_border"],
            width=2,
        )
        draw.rounded_rectangle(
            (main_left, main_top, main_right, main_top + 58),
            radius=26,
            fill=colors["sheet_header"],
        )
        draw.rounded_rectangle(
            (main_left, main_top + 30, main_right, main_top + 58),
            fill=colors["sheet_header"],
        )
        draw.rounded_rectangle(
            (aside_left, aside_top, aside_right, aside_bottom),
            radius=22,
            fill=colors["sheet"],
            outline=colors["sheet_border"],
            width=2,
        )
        draw.rounded_rectangle(
            (aside_left, aside_top, aside_right, aside_top + 52),
            radius=22,
            fill=colors["sheet_header"],
        )
        draw.rounded_rectangle(
            (aside_left, aside_top + 28, aside_right, aside_top + 52),
            fill=colors["sheet_header"],
        )
        draw.rounded_rectangle(
            (gutter_left, gutter_top, gutter_left + 10, gutter_bottom),
            radius=5,
            fill=colors["accent"],
        )

        badge_font = self._load_preview_font(15, bold=True)
        kicker_font = self._load_preview_font(13, bold=True)
        detail_font = self._load_preview_font(16)
        title_font = self._load_preview_font(30, bold=True)
        body_font = self._load_preview_font(19)
        aside_title_font = self._load_preview_font(13, bold=True)
        aside_body_font = self._load_preview_font(17)

        badge_left = main_left + 28
        badge_top = main_top + 16
        badge_right = badge_left + 118
        badge_bottom = badge_top + 30
        draw.rounded_rectangle((badge_left, badge_top, badge_right, badge_bottom), radius=15, fill=colors["accent"])
        draw.text((badge_left + 16, badge_top + 6), source_label, font=badge_font, fill=colors["accent_text"])

        detail_width = self._measure_text_width(draw, source_detail, detail_font)
        draw.text((main_right - 28 - detail_width, badge_top + 6), source_detail, font=detail_font, fill=colors["detail"])

        kicker_text = "READING PATH"
        draw.text((main_left + 30, main_top + 88), kicker_text, font=kicker_font, fill=colors["rule"])
        draw.rounded_rectangle((main_left + 30, main_top + 112, main_left + 136, main_top + 116), radius=2, fill=colors["rule"])

        wrapped_title = self._wrap_preview_text(draw, preview_title, title_font, max_width=main_right - main_left - 60, max_lines=2)
        title_y = main_top + 132
        for line in wrapped_title:
            draw.text((main_left + 30, title_y), line, font=title_font, fill=colors["title"])
            title_y += 35

        rule_y = max(title_y + 8, main_top + 214)
        draw.rounded_rectangle((main_left + 30, rule_y, main_left + 156, rule_y + 5), radius=3, fill=colors["rule"])

        main_lines = body_lines[:2]
        aside_lines = body_lines[2:4]
        if not aside_lines and len(body_lines) > 1:
            aside_lines = body_lines[-1:]

        body_y = rule_y + 20
        for preview_line in main_lines:
            visible_text = preview_line.removeprefix("• ").strip()
            wrapped_line = self._wrap_preview_text(
                draw,
                visible_text,
                body_font,
                max_width=main_right - main_left - 76,
                max_lines=2,
            )
            if not wrapped_line:
                continue
            draw.rounded_rectangle(
                (main_left + 30, body_y - 6, main_right - 30, body_y + 58),
                radius=18,
                fill=colors["sheet_header"],
            )
            draw.rounded_rectangle((main_left + 44, body_y + 10, main_left + 86, body_y + 14), radius=3, fill=colors["rule"])
            line_text_y = body_y + 6
            for wrapped in wrapped_line:
                draw.text((main_left + 44, line_text_y), wrapped, font=body_font, fill=colors["body"])
                line_text_y += 22
            body_y += 72

        aside_badge_left = aside_left + 24
        aside_badge_top = aside_top + 14
        aside_badge_right = aside_badge_left + 104
        aside_badge_bottom = aside_badge_top + 28
        draw.rounded_rectangle(
            (aside_badge_left, aside_badge_top, aside_badge_right, aside_badge_bottom),
            radius=14,
            fill=colors["accent"],
        )
        draw.text((aside_badge_left + 14, aside_badge_top + 6), "GLANCE", font=aside_title_font, fill=colors["accent_text"])

        aside_row_top = aside_top + 74
        for preview_line in aside_lines[:2]:
            visible_text = preview_line.removeprefix("• ").strip()
            wrapped_line = self._wrap_preview_text(
                draw,
                visible_text,
                aside_body_font,
                max_width=aside_right - aside_left - 48,
                max_lines=3,
            )
            row_height = 60 if len(wrapped_line) <= 2 else 78
            draw.rounded_rectangle(
                (aside_left + 18, aside_row_top, aside_right - 18, aside_row_top + row_height),
                radius=16,
                fill=colors["sheet_header"],
            )
            draw.rounded_rectangle(
                (aside_left + 32, aside_row_top + 14, aside_left + 74, aside_row_top + 18),
                radius=3,
                fill=colors["rule"],
            )
            line_text_y = aside_row_top + 22
            for wrapped in wrapped_line:
                draw.text((aside_left + 32, line_text_y), wrapped, font=aside_body_font, fill=colors["body"])
                line_text_y += 20
            aside_row_top += row_height + 14

        return image

    def _render_content_rendered_note_preview(
        self,
        *,
        colors: dict[str, tuple[int, int, int]],
        note_variant: str,
        preview_title: str,
        body_lines: list[str],
        source_label: str,
        source_detail: str,
    ) -> Image.Image:
        if note_variant == CONTENT_RENDERED_PREVIEW_NOTE_VARIANT_SUMMARY:
            return self._render_content_rendered_summary_note_preview(
                colors=colors,
                preview_title=preview_title,
                body_lines=body_lines,
                source_label=source_label,
                source_detail=source_detail,
            )
        return self._render_content_rendered_focus_note_preview(
            colors=colors,
            preview_title=preview_title,
            body_lines=body_lines,
            source_label=source_label,
            source_detail=source_detail,
        )

    def _render_content_rendered_focus_note_preview(
        self,
        *,
        colors: dict[str, tuple[int, int, int]],
        preview_title: str,
        body_lines: list[str],
        source_label: str,
        source_detail: str,
    ) -> Image.Image:
        image = Image.new("RGB", PREVIEW_OUTPUT_SIZE, colors["backdrop"])
        draw = ImageDraw.Draw(image)
        width, height = PREVIEW_OUTPUT_SIZE

        draw.ellipse((-140, -96, 396, 402), fill=colors["halo"])
        draw.ellipse((width - 352, 64, width + 132, height + 148), fill=colors["halo_secondary"])
        draw.rounded_rectangle((48, 34, width - 48, height - 34), radius=34, fill=colors["shell"], outline=colors["shell_border"], width=2)

        stage_left = 94
        stage_top = 88
        stage_right = width - 94
        stage_bottom = height - 86
        draw.rounded_rectangle(
            (stage_left, stage_top, stage_right, stage_bottom),
            radius=30,
            fill=colors["backdrop"],
            outline=colors["shell_border"],
            width=2,
        )
        draw.rounded_rectangle(
            (stage_left + 28, stage_top + 28, stage_left + 140, stage_top + 168),
            radius=28,
            fill=colors["accent"],
        )
        draw.rounded_rectangle(
            (stage_left + 52, stage_top + 56, stage_left + 116, stage_top + 120),
            radius=18,
            outline=colors["accent_text"],
            width=3,
        )
        draw.rounded_rectangle(
            (stage_left + 62, stage_top + 132, stage_left + 106, stage_top + 142),
            radius=5,
            fill=colors["accent_text"],
        )

        note_left = 176
        note_top = 112
        note_right = width - 172
        note_bottom = height - 148
        shadow_color = tuple(max(channel - 12, 0) for channel in colors["shell"])
        draw.rounded_rectangle(
            (note_left + 16, note_top + 18, note_right + 16, note_bottom + 18),
            radius=28,
            fill=shadow_color,
        )
        draw.rounded_rectangle(
            (note_left, note_top, note_right, note_bottom),
            radius=28,
            fill=colors["sheet"],
            outline=colors["sheet_border"],
            width=2,
        )
        draw.rounded_rectangle((note_left, note_top, note_right, note_top + 54), radius=28, fill=colors["sheet_header"])
        draw.rounded_rectangle((note_left, note_top + 30, note_right, note_top + 54), fill=colors["sheet_header"])
        draw.polygon(
            [(note_right - 54, note_top), (note_right, note_top), (note_right, note_top + 54)],
            fill=colors["accent_text"],
        )
        draw.line(
            [(note_right - 54, note_top), (note_right, note_top + 54)],
            fill=colors["sheet_border"],
            width=2,
        )

        badge_font = self._load_preview_font(15, bold=True)
        detail_font = self._load_preview_font(16)
        title_font = self._load_preview_font(36, bold=True)
        body_font = self._load_preview_font(24)

        badge_left = note_left + 32
        badge_top = note_top - 18
        badge_right = badge_left + 112
        badge_bottom = badge_top + 32
        draw.rounded_rectangle((badge_left, badge_top, badge_right, badge_bottom), radius=16, fill=colors["accent"])
        draw.text((badge_left + 15, badge_top + 6), source_label, font=badge_font, fill=colors["accent_text"])

        detail_width = self._measure_text_width(draw, source_detail, detail_font)
        draw.text((note_right - 28 - detail_width, note_top + 18), source_detail, font=detail_font, fill=colors["detail"])

        text_left = note_left + 38
        title_top = note_top + 78
        wrapped_title = self._wrap_preview_text(draw, preview_title, title_font, max_width=note_right - text_left - 34, max_lines=2)
        title_y = title_top
        for line in wrapped_title:
            draw.text((text_left, title_y), line, font=title_font, fill=colors["title"])
            title_y += 42

        rule_y = max(title_y + 2, note_top + 162)
        draw.rounded_rectangle((text_left, rule_y, text_left + 112, rule_y + 5), radius=3, fill=colors["rule"])

        line_y = rule_y + 22
        line_height = 44
        for preview_line in body_lines:
            is_list_line = preview_line.startswith("• ")
            visible_text = preview_line.removeprefix("• ").strip() if is_list_line else preview_line
            rendered_text = self._truncate_preview_text_to_width(
                draw,
                visible_text,
                body_font,
                max_width=note_right - text_left - 46 - (18 if is_list_line else 0),
            )
            if is_list_line:
                draw.rounded_rectangle((text_left, line_y + 10, text_left + 12, line_y + 22), radius=5, fill=colors["rule"])
                text_x = text_left + 26
            else:
                draw.rounded_rectangle((text_left, line_y + 15, text_left + 54, line_y + 19), radius=3, fill=colors["rule"])
                text_x = text_left
            draw.text((text_x, line_y), rendered_text, font=body_font, fill=colors["body"])
            line_y += line_height

        return image

    def _render_content_rendered_summary_note_preview(
        self,
        *,
        colors: dict[str, tuple[int, int, int]],
        preview_title: str,
        body_lines: list[str],
        source_label: str,
        source_detail: str,
    ) -> Image.Image:
        image = Image.new("RGB", PREVIEW_OUTPUT_SIZE, colors["backdrop"])
        draw = ImageDraw.Draw(image)
        width, height = PREVIEW_OUTPUT_SIZE
        summary_note_cues = self._select_content_rendered_summary_note_cues(preview_title, body_lines)
        accent_seed = self._select_content_rendered_summary_note_accent_seed(preview_title, body_lines)

        draw.ellipse((-120, -86, 430, 412), fill=colors["halo"])
        draw.ellipse((width - 384, 44, width + 140, height + 156), fill=colors["halo_secondary"])
        draw.rounded_rectangle((48, 34, width - 48, height - 34), radius=34, fill=colors["shell"], outline=colors["shell_border"], width=2)

        panel_left = 112
        panel_top = 96
        panel_right = width - 110
        panel_bottom = height - 114
        accent_strip_width = 34 + accent_seed * 8
        header_height = 58 + accent_seed * 4
        draw.rounded_rectangle(
            (panel_left, panel_top, panel_right, panel_bottom),
            radius=28,
            fill=colors["sheet"],
            outline=colors["sheet_border"],
            width=2,
        )
        draw.rounded_rectangle(
            (panel_left, panel_top, panel_left + accent_strip_width, panel_bottom),
            radius=28,
            fill=colors["accent"],
        )
        draw.rounded_rectangle(
            (panel_left + accent_strip_width, panel_top, panel_right, panel_top + header_height),
            radius=28,
            fill=colors["sheet_header"],
        )
        draw.rounded_rectangle(
            (panel_left + accent_strip_width, panel_top + 30, panel_right, panel_top + header_height),
            fill=colors["sheet_header"],
        )

        badge_font = self._load_preview_font(15, bold=True)
        cue_font = self._load_preview_font(14, bold=True)
        detail_font = self._load_preview_font(16)
        title_font = self._load_preview_font(32, bold=True)
        body_font = self._load_preview_font(22)

        badge_left = panel_left + accent_strip_width + 28
        badge_top = panel_top + 16
        badge_right = badge_left + 118
        badge_bottom = badge_top + 30
        draw.rounded_rectangle((badge_left, badge_top, badge_right, badge_bottom), radius=15, fill=colors["accent"])
        draw.text((badge_left + 16, badge_top + 6), source_label, font=badge_font, fill=colors["accent_text"])

        detail_width = self._measure_text_width(draw, source_detail, detail_font)
        draw.text((panel_right - 26 - detail_width, badge_top + 6), source_detail, font=detail_font, fill=colors["detail"])

        rail_mark_left = panel_left + 10
        rail_mark_right = panel_left + accent_strip_width - 10
        rail_mark_top = panel_top + 84 + accent_seed * 12
        rail_mark_bottom = min(rail_mark_top + 72 + accent_seed * 8, panel_bottom - 42)
        if rail_mark_right - rail_mark_left >= 14:
            draw.rounded_rectangle(
                (rail_mark_left, rail_mark_top, rail_mark_right, rail_mark_bottom),
                radius=12,
                outline=colors["accent_text"],
                width=2,
            )
            bar_left = rail_mark_left + 4
            bar_right = rail_mark_right - 4
            if bar_right - bar_left >= 10:
                draw.rounded_rectangle(
                    (bar_left, rail_mark_top + 18, bar_right, rail_mark_top + 24),
                    radius=3,
                    fill=colors["accent_text"],
                )
            lower_bar_right = rail_mark_right - 8
            if lower_bar_right - bar_left >= 8:
                draw.rounded_rectangle(
                    (bar_left, rail_mark_top + 36, lower_bar_right, rail_mark_top + 42),
                    radius=3,
                    fill=colors["accent_text"],
                )

        text_left = panel_left + accent_strip_width + 30
        title_top = panel_top + 86 + accent_seed * 2
        wrapped_title = self._wrap_preview_text(draw, preview_title, title_font, max_width=panel_right - text_left - 38, max_lines=2)
        title_y = title_top
        for line in wrapped_title:
            draw.text((text_left, title_y), line, font=title_font, fill=colors["title"])
            title_y += 38

        cue_y = title_y + 8
        cue_x = text_left
        if summary_note_cues:
            for cue in summary_note_cues:
                cue_width = self._measure_text_width(draw, cue, cue_font) + 28
                if cue_x + cue_width > panel_right - 42:
                    cue_x = text_left
                    cue_y += 34
                draw.rounded_rectangle(
                    (cue_x, cue_y, cue_x + cue_width, cue_y + 28),
                    radius=14,
                    fill=colors["accent"],
                )
                draw.text((cue_x + 14, cue_y + 6), cue, font=cue_font, fill=colors["accent_text"])
                cue_x += cue_width + 10
            cue_y += 40

        rule_y = max(cue_y if summary_note_cues else title_y + 2, panel_top + 164)
        draw.rounded_rectangle((text_left, rule_y, text_left + 102 + accent_seed * 18, rule_y + 5), radius=3, fill=colors["rule"])

        row_top = rule_y + 20
        row_height = 48
        for preview_line in body_lines:
            is_list_line = preview_line.startswith("• ")
            visible_text = preview_line.removeprefix("• ").strip() if is_list_line else preview_line
            rendered_text = self._truncate_preview_text_to_width(
                draw,
                visible_text,
                body_font,
                max_width=panel_right - text_left - 74,
            )
            row_bottom = row_top + 34
            draw.rounded_rectangle(
                (text_left, row_top, panel_right - 34, row_bottom),
                radius=16,
                fill=colors["sheet_header"],
            )
            marker_left = text_left + 18
            marker_top = row_top + 11
            if is_list_line:
                draw.rounded_rectangle((marker_left, marker_top, marker_left + 12, marker_top + 12), radius=5, fill=colors["rule"])
                text_x = marker_left + 26
            else:
                draw.rounded_rectangle((marker_left, marker_top + 4, marker_left + 34, marker_top + 8), radius=3, fill=colors["rule"])
                text_x = marker_left + 18
            draw.text((text_x, row_top + 4), rendered_text, font=body_font, fill=colors["body"])
            row_top += row_height

        return image

    def _content_rendered_source_kind(self, document: SourceDocument) -> str:
        normalized_source_type = document.source_type.strip().lower()
        if normalized_source_type == "web":
            return "web"
        if normalized_source_type == "paste":
            return "paste"
        return "file"

    def _content_rendered_source_label(self, document: SourceDocument) -> str:
        normalized_source_type = document.source_type.strip().lower()
        if normalized_source_type == "paste":
            return "PASTE"
        if normalized_source_type == "web":
            return "WEB"
        if normalized_source_type in {"markdown", "md"}:
            return "MD"
        if normalized_source_type in {"html", "htm"}:
            return "HTML"
        if normalized_source_type:
            return normalized_source_type.upper()
        return "FILE"

    def _content_rendered_preview_detail(self, document: SourceDocument) -> str:
        if document.source_locator:
            parsed = urlparse(document.source_locator)
            hostname = parsed.hostname or ""
            if hostname:
                return hostname.removeprefix("www.")
            normalized_locator = normalize_whitespace(document.source_locator)
            return normalized_locator or "Browser source"
        if document.file_name:
            return normalize_whitespace(document.file_name)
        if document.source_type.strip().lower() == "paste":
            return "Local capture"
        return "Local document"

    def _build_blocked_preview_texts(
        self,
        document: SourceDocument,
        title_text: str,
        source_detail: str,
    ) -> tuple[str, ...]:
        blocked_values = [
            document.title,
            title_text,
            source_detail,
            document.file_name or "",
            document.source_locator or "",
            "Local capture",
            "Local document",
            "Local source",
            "Browser source",
            "Saved locally",
        ]
        if document.source_locator:
            parsed = urlparse(document.source_locator)
            if parsed.hostname:
                blocked_values.append(parsed.hostname.removeprefix("www."))

        blocked_texts = [self._normalize_preview_compare_text(value) for value in blocked_values]
        return tuple(value for value in blocked_texts if value)

    def _select_content_rendered_heading(self, view: DocumentView, blocked_texts: Iterable[str]) -> str | None:
        for block in view.blocks:
            if block.kind != "heading":
                continue
            candidate = normalize_whitespace(block.text)
            if self._is_distinct_preview_text(candidate, blocked_texts):
                return candidate
        return None

    def _select_content_rendered_body_lines(
        self,
        view: DocumentView,
        blocked_texts: Iterable[str],
    ) -> list[str]:
        collected_lines: list[str] = []
        seen_lines: set[str] = set()
        for block in view.blocks:
            for candidate in self._content_rendered_candidates_for_block(block):
                normalized_compare = self._normalize_preview_compare_text(candidate)
                if (
                    normalized_compare in seen_lines
                    or len(normalized_compare) < CONTENT_RENDERED_PREVIEW_MIN_CHARS
                    or not self._is_distinct_preview_text(candidate, blocked_texts)
                ):
                    continue
                seen_lines.add(normalized_compare)
                collected_lines.append(candidate)
                if len(collected_lines) >= CONTENT_RENDERED_PREVIEW_MAX_LINES:
                    return collected_lines
        return collected_lines

    def _select_sparse_content_rendered_body_lines(
        self,
        view: DocumentView,
        blocked_texts: Iterable[str],
    ) -> list[str]:
        collected_lines: list[str] = []
        seen_lines: set[str] = set()
        for block in view.blocks:
            block_text = normalize_whitespace(block.text)
            if not block_text or block.kind == "heading":
                continue
            candidate = f"• {block_text}" if block.kind == "list_item" else block_text
            normalized_compare = self._normalize_preview_compare_text(candidate)
            if (
                normalized_compare in seen_lines
                or len(normalized_compare) < CONTENT_RENDERED_PREVIEW_MIN_CHARS
                or not self._is_distinct_preview_text(candidate, blocked_texts)
            ):
                continue
            seen_lines.add(normalized_compare)
            collected_lines.append(candidate)
            if len(collected_lines) >= CONTENT_RENDERED_PREVIEW_MAX_LINES:
                return collected_lines
        return collected_lines

    def _content_rendered_candidates_for_block(self, block: ViewBlock) -> list[str]:
        block_text = normalize_whitespace(block.text)
        if not block_text:
            return []
        if block.kind == "heading":
            return []
        if block.kind == "list_item":
            return [f"• {block_text}"]

        metadata = block.metadata if isinstance(block.metadata, dict) else {}
        sentence_texts = metadata.get("sentence_texts")
        if isinstance(sentence_texts, list):
            candidates = [normalize_whitespace(str(value)) for value in sentence_texts]
            return [candidate for candidate in candidates if candidate]
        return [block_text]

    def _is_distinct_preview_text(self, candidate: str, blocked_texts: Iterable[str]) -> bool:
        normalized_candidate = self._normalize_preview_compare_text(candidate)
        if len(normalized_candidate) < CONTENT_RENDERED_PREVIEW_MIN_CHARS:
            return False
        for blocked in blocked_texts:
            if not blocked:
                continue
            if normalized_candidate == blocked:
                return False
        return True

    def _normalize_preview_compare_text(self, value: str | None) -> str:
        if not value:
            return ""
        normalized = normalize_whitespace(value).removeprefix("• ").strip().lower()
        return normalized

    def _load_preview_font(self, size: int, *, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
        for font_name in PREVIEW_FONT_CANDIDATES[bold]:
            try:
                return ImageFont.truetype(font_name, size=size)
            except OSError:
                continue
        return ImageFont.load_default()

    def _wrap_preview_text(
        self,
        draw: ImageDraw.ImageDraw,
        text: str,
        font: ImageFont.FreeTypeFont | ImageFont.ImageFont,
        *,
        max_width: int,
        max_lines: int,
    ) -> list[str]:
        wrapped_lines: list[str] = []
        for paragraph in textwrap.wrap(normalize_whitespace(text), width=max(12, max_width // max(size := getattr(font, "size", 16), 8))):
            if not paragraph:
                continue
            wrapped_lines.append(paragraph)
            if len(wrapped_lines) >= max_lines:
                break

        if not wrapped_lines:
            return [self._truncate_preview_text_to_width(draw, text, font, max_width=max_width)]

        wrapped_lines = [self._truncate_preview_text_to_width(draw, line, font, max_width=max_width) for line in wrapped_lines]
        return wrapped_lines[:max_lines]

    def _truncate_preview_text_to_width(
        self,
        draw: ImageDraw.ImageDraw,
        text: str,
        font: ImageFont.FreeTypeFont | ImageFont.ImageFont,
        *,
        max_width: int,
    ) -> str:
        normalized = normalize_whitespace(text)
        if not normalized:
            return ""
        if self._measure_text_width(draw, normalized, font) <= max_width:
            return normalized

        ellipsis = "..."
        current = normalized
        while current:
            current = current[:-1].rstrip()
            candidate = f"{current}{ellipsis}"
            if self._measure_text_width(draw, candidate, font) <= max_width:
                return candidate
        return ellipsis

    def _measure_text_width(
        self,
        draw: ImageDraw.ImageDraw,
        text: str,
        font: ImageFont.FreeTypeFont | ImageFont.ImageFont,
    ) -> int:
        left, _, right, _ = draw.textbbox((0, 0), text, font=font)
        return max(right - left, 0)

    def _load_rendered_html_snapshot_bytes(self, stored_path: Path) -> bytes | None:
        if not stored_path.exists() or not RENDER_SAVED_HTML_PREVIEW_SCRIPT.exists():
            return None

        windows_script_path = self._to_windows_path(RENDER_SAVED_HTML_PREVIEW_SCRIPT)
        windows_input_path = self._to_windows_path(stored_path)
        if not windows_script_path or not windows_input_path:
            return None

        try:
            with tempfile.TemporaryDirectory(
                prefix="accessible-reader-html-preview-",
                dir=self.previews_dir,
            ) as temporary_directory:
                output_path = Path(temporary_directory) / f"{stored_path.stem}.png"
                windows_output_path = self._to_windows_path(output_path)
                if not windows_output_path:
                    return None
                subprocess.run(
                    [
                        RENDER_SAVED_HTML_PREVIEW_NODE_EXECUTABLE,
                        windows_script_path,
                        "--input",
                        windows_input_path,
                        "--output",
                        windows_output_path,
                    ],
                    check=True,
                    env=os.environ.copy(),
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                    timeout=RENDER_SAVED_HTML_PREVIEW_TIMEOUT_SECONDS,
                )
                return output_path.read_bytes() if output_path.exists() else None
        except (OSError, subprocess.CalledProcessError, subprocess.TimeoutExpired):
            return None

    def _is_rendered_snapshot_high_signal(self, image_bytes: bytes) -> bool:
        try:
            with Image.open(BytesIO(image_bytes)) as image:
                working = ImageOps.exif_transpose(image).convert("RGB")
                if working.width < PREVIEW_MIN_WIDTH or working.height < PREVIEW_MIN_HEIGHT:
                    return False

                sample = ImageOps.fit(
                    working,
                    PREVIEW_OUTPUT_SIZE,
                    method=Image.Resampling.BILINEAR,
                    centering=(0.5, 0.5),
                ).convert("L")
                grayscale_stats = ImageStat.Stat(sample)
                variance = float(grayscale_stats.stddev[0])
                histogram = sample.histogram()
                pixel_count = max(sample.width * sample.height, 1)
                light_coverage = sum(histogram[220:]) / pixel_count
                dark_coverage = sum(histogram[:80]) / pixel_count
                edge_sample = sample.filter(ImageFilter.FIND_EDGES)
                edge_mean = float(ImageStat.Stat(edge_sample).mean[0])
        except (OSError, ValueError, UnidentifiedImageError):
            return False

        if variance >= 18.0 and edge_mean >= 8.0:
            return True
        if variance >= 24.0:
            return True
        if edge_mean >= 12.0 and dark_coverage >= 0.015:
            return True
        if light_coverage >= 0.94 and variance < 20.0:
            return False
        if light_coverage >= RENDERED_PREVIEW_LIGHT_COVERAGE_MAX and edge_mean < 10.0:
            return False
        if variance < RENDERED_PREVIEW_STDDEV_MIN:
            return False
        if edge_mean < RENDERED_PREVIEW_EDGE_MEAN_MIN:
            return False
        if dark_coverage < 0.01 and light_coverage > 0.72:
            return False
        return True

    def _to_windows_path(self, file_path: Path) -> str | None:
        if os.name == "nt":
            return str(file_path)

        try:
            completed = subprocess.run(
                ["wslpath", "-w", str(file_path)],
                check=True,
                capture_output=True,
                text=True,
                timeout=5,
            )
        except (OSError, subprocess.CalledProcessError, subprocess.TimeoutExpired):
            return None

        resolved_path = completed.stdout.strip()
        return resolved_path or None

    def _write_normalized_preview(
        self,
        document: SourceDocument,
        *,
        image_bytes: bytes | None = None,
        source_path: Path | None = None,
    ) -> str | None:
        try:
            if image_bytes is not None:
                image = Image.open(BytesIO(image_bytes))
            elif source_path is not None:
                image = Image.open(source_path)
            else:
                return None
        except (FileNotFoundError, OSError, UnidentifiedImageError):
            return None

        with image:
            try:
                working = ImageOps.exif_transpose(image)
                if working.width < PREVIEW_MIN_WIDTH or working.height < PREVIEW_MIN_HEIGHT:
                    return None
                normalized = ImageOps.fit(
                    working.convert("RGB"),
                    PREVIEW_OUTPUT_SIZE,
                    method=Image.Resampling.LANCZOS,
                    centering=(0.5, 0.5),
                )
                target_path = self.previews_dir / f"{document.id}-{document.content_hash[:16]}.jpg"
                target_path.parent.mkdir(parents=True, exist_ok=True)
                normalized.save(target_path, format="JPEG", quality=84, optimize=True)
            except (OSError, ValueError):
                return None

        return f"files/previews/{target_path.name}"
