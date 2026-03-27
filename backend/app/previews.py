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
from typing import Any
from urllib.parse import quote, unquote_to_bytes, urljoin, urlparse

from bs4 import BeautifulSoup, Tag
from PIL import Image, ImageFilter, ImageOps, ImageStat, UnidentifiedImageError

from .models import RecallDocumentPreview, SourceDocument
from .storage import Repository
from .text_utils import now_iso


PREVIEW_OUTPUT_SIZE = (960, 540)
PREVIEW_MIN_WIDTH = 320
PREVIEW_MIN_HEIGHT = 180
PREVIEW_METADATA_KEY = "home_preview"
PREVIEW_METADATA_VERSION = 5
PREVIEW_FALLBACK_SOURCE = "fallback"
PREVIEW_RENDERED_SNAPSHOT_SOURCE = "html-rendered-snapshot"
PREVIEW_IMAGE_SOURCES = {
    "attachment-image",
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
