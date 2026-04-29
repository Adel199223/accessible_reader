from __future__ import annotations

from collections import Counter
import csv
from dataclasses import dataclass
from hashlib import sha256
from html.parser import HTMLParser
from io import BytesIO, StringIO
import posixpath
import re
from typing import Callable
from urllib.parse import urlsplit
from zipfile import BadZipFile, ZipFile

from .models import (
    BatchImportCollectionSuggestion,
    BatchImportFormat,
    BatchImportPreview,
    BatchImportPreviewRow,
    BatchImportPreviewSummary,
    BatchResolvedImportFormat,
)
from .web_import import WebImportError, normalize_web_url


URL_RE = re.compile(r"https?://[^\s<>\]\"')]+", re.IGNORECASE)


@dataclass(slots=True)
class ParsedBatchItem:
    raw_url: str
    title: str | None = None
    folder: str | None = None
    tags: list[str] | None = None


class BookmarkHtmlParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.items: list[ParsedBatchItem] = []
        self._folder_stack: list[str] = []
        self._pending_folder: str | None = None
        self._active_tag: str | None = None
        self._active_href: str | None = None
        self._active_tags: list[str] = []
        self._active_text: list[str] = []
        self._folder_text: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        normalized_tag = tag.lower()
        attr_map = {key.lower(): value or "" for key, value in attrs}
        if normalized_tag == "dl" and self._pending_folder:
            self._folder_stack.append(self._pending_folder)
            self._pending_folder = None
            return
        if normalized_tag == "h3":
            self._active_tag = "h3"
            self._folder_text = []
            return
        if normalized_tag == "a":
            self._active_tag = "a"
            self._active_href = attr_map.get("href")
            self._active_tags = split_tags(attr_map.get("tags") or attr_map.get("data-tags") or "")
            self._active_text = []

    def handle_endtag(self, tag: str) -> None:
        normalized_tag = tag.lower()
        if normalized_tag == "h3" and self._active_tag == "h3":
            folder = clean_text(" ".join(self._folder_text))
            self._pending_folder = folder or None
            self._active_tag = None
            self._folder_text = []
            return
        if normalized_tag == "a" and self._active_tag == "a":
            title = clean_text(" ".join(self._active_text))
            if self._active_href:
                self.items.append(
                    ParsedBatchItem(
                        raw_url=self._active_href,
                        title=title or None,
                        folder=" / ".join(self._folder_stack) or None,
                        tags=self._active_tags,
                    )
                )
            self._active_tag = None
            self._active_href = None
            self._active_tags = []
            self._active_text = []
            return
        if normalized_tag == "dl":
            if self._folder_stack:
                self._folder_stack.pop()
            self._pending_folder = None

    def handle_data(self, data: str) -> None:
        if self._active_tag == "h3":
            self._folder_text.append(data)
        elif self._active_tag == "a":
            self._active_text.append(data)


def clean_text(value: str) -> str:
    return " ".join(value.split()).strip()


def split_tags(value: str) -> list[str]:
    tags: list[str] = []
    for part in re.split(r"[|,;]", value):
        tag = clean_text(part)
        if tag and tag not in tags:
            tags.append(tag)
    return tags


def decode_upload(raw_bytes: bytes) -> str:
    for encoding in ("utf-8-sig", "utf-8", "cp1252", "latin-1"):
        try:
            return raw_bytes.decode(encoding)
        except UnicodeDecodeError:
            continue
    return raw_bytes.decode("utf-8", errors="replace")


def resolve_batch_import_format(
    *,
    requested_format: BatchImportFormat,
    file_name: str,
    raw_bytes: bytes,
    text: str,
) -> BatchResolvedImportFormat:
    if requested_format != "auto":
        return requested_format
    lower_name = file_name.lower()
    if lower_name.endswith(".zip") or raw_bytes.startswith(b"PK\x03\x04"):
        return "pocket_zip"
    sample = text[:4096].lower()
    if lower_name.endswith((".html", ".htm")) or "<a " in sample:
        return "bookmarks_html"
    if lower_name.endswith(".csv"):
        return "pocket_csv"
    return "url_list"


def parse_bookmark_html(text: str) -> list[ParsedBatchItem]:
    parser = BookmarkHtmlParser()
    parser.feed(text)
    return parser.items


def parse_pocket_csv(text: str) -> list[ParsedBatchItem]:
    reader = csv.DictReader(StringIO(text))
    if not reader.fieldnames:
        raise ValueError("Pocket CSV import needs a header row with a URL column.")
    normalized_fields = {field.lower().strip(): field for field in reader.fieldnames if field}
    url_field = (
        normalized_fields.get("url")
        or normalized_fields.get("given_url")
        or normalized_fields.get("resolved_url")
        or normalized_fields.get("href")
    )
    if not url_field:
        raise ValueError("Pocket CSV import needs a URL column.")
    title_field = (
        normalized_fields.get("title")
        or normalized_fields.get("given_title")
        or normalized_fields.get("resolved_title")
        or normalized_fields.get("name")
    )
    tag_field = normalized_fields.get("tags") or normalized_fields.get("tag")
    status_field = normalized_fields.get("status") or normalized_fields.get("archive")
    items: list[ParsedBatchItem] = []
    for row in reader:
        status = clean_text(row.get(status_field, "") if status_field else "").lower()
        tags = split_tags(row.get(tag_field, "") if tag_field else "")
        if status and status not in {"unread", "archive", "archived", "0", "1", "favorite"}:
            tags = [status, *tags] if status not in tags else tags
        items.append(
            ParsedBatchItem(
                raw_url=row.get(url_field, "") if url_field else "",
                title=clean_text(row.get(title_field, "") if title_field else "") or None,
                tags=tags,
            )
        )
    return items


def parse_url_list(text: str) -> list[ParsedBatchItem]:
    items: list[ParsedBatchItem] = []
    csv_rows: list[dict[str, str]] = []
    try:
        sample = text[:2048]
        if "," in sample and csv.Sniffer().has_header(sample):
            reader = csv.DictReader(StringIO(text))
            csv_rows = list(reader)
    except csv.Error:
        csv_rows = []
    if csv_rows:
        for row in csv_rows:
            row_lower = {key.lower().strip(): value for key, value in row.items() if key}
            url = row_lower.get("url") or row_lower.get("href") or row_lower.get("link") or ""
            title = row_lower.get("title") or row_lower.get("name") or ""
            tags = split_tags(row_lower.get("tags") or "")
            items.append(ParsedBatchItem(raw_url=url, title=clean_text(title) or None, tags=tags))
        return items

    for line in text.splitlines():
        stripped = line.strip()
        if not stripped:
            continue
        match = URL_RE.search(stripped)
        if not match:
            items.append(ParsedBatchItem(raw_url=stripped))
            continue
        url = match.group(0).rstrip(".,;")
        title = clean_text(stripped.replace(match.group(0), " ")) or None
        items.append(ParsedBatchItem(raw_url=url, title=title))
    return items


def _safe_zip_member_name(name: str) -> bool:
    normalized = posixpath.normpath(name.replace("\\", "/"))
    return bool(normalized and not normalized.startswith("../") and not normalized.startswith("/") and normalized != ".")


def parse_pocket_zip(raw_bytes: bytes) -> list[ParsedBatchItem]:
    try:
        archive = ZipFile(BytesIO(raw_bytes))
    except BadZipFile as exc:
        raise ValueError("Pocket ZIP import needs a valid .zip file.") from exc

    items: list[ParsedBatchItem] = []
    with archive:
        for info in sorted(archive.infolist(), key=lambda entry: entry.filename):
            if info.is_dir() or not _safe_zip_member_name(info.filename):
                continue
            lower_name = info.filename.lower()
            if not lower_name.endswith((".csv", ".html", ".htm", ".txt", ".md")):
                continue
            text = decode_upload(archive.read(info))
            try:
                if lower_name.endswith(".csv"):
                    items.extend(parse_pocket_csv(text))
                elif lower_name.endswith((".html", ".htm")):
                    items.extend(parse_bookmark_html(text))
                else:
                    items.extend(parse_url_list(text))
            except ValueError:
                continue
    return items


def parse_batch_items(raw_bytes: bytes, text: str, source_format: BatchResolvedImportFormat) -> list[ParsedBatchItem]:
    if source_format == "bookmarks_html":
        return parse_bookmark_html(text)
    if source_format == "pocket_csv":
        return parse_pocket_csv(text)
    if source_format == "pocket_zip":
        return parse_pocket_zip(raw_bytes)
    return parse_url_list(text)


def collection_names_for_item(item: ParsedBatchItem, source_format: BatchResolvedImportFormat) -> list[str]:
    return [path[-1] for path in collection_paths_for_item(item, source_format) if path]


def split_collection_path(value: str | None) -> list[str]:
    if not value:
        return []
    parts = [clean_text(part) for part in re.split(r"\s*/\s*", value)]
    return [part for part in parts if part]


def collection_path_id(path: list[str], source_format: BatchResolvedImportFormat) -> str:
    normalized_path = "/".join(clean_text(part).casefold() for part in path if clean_text(part))
    key = f"{source_format}|{normalized_path}"
    return f"collection:{sha256(key.encode('utf-8')).hexdigest()[:16]}"


def collection_paths_for_item(item: ParsedBatchItem, source_format: BatchResolvedImportFormat) -> list[list[str]]:
    paths: list[list[str]] = []
    folder_path = split_collection_path(item.folder)
    if folder_path:
        paths.append(folder_path)
    for tag in item.tags or []:
        normalized_tag = clean_text(tag)
        if normalized_tag:
            paths.append([normalized_tag])
    if source_format == "pocket_zip" and not paths:
        paths.append(["Pocket Saves"])
    normalized_paths: list[list[str]] = []
    seen: set[str] = set()
    for path in paths:
        normalized_path = [clean_text(part) for part in path if clean_text(part)]
        if not normalized_path:
            continue
        key = "/".join(part.casefold() for part in normalized_path)
        if key not in seen:
            normalized_paths.append(normalized_path)
            seen.add(key)
    return normalized_paths


def build_collection_suggestions(rows: list[BatchImportPreviewRow]) -> list[BatchImportCollectionSuggestion]:
    suggestion_map: dict[str, tuple[str, str, BatchResolvedImportFormat, str | None, list[str], int, list[str]]] = {}
    for row in rows:
        if row.status != "ready":
            continue
        pseudo_item = ParsedBatchItem(
            raw_url=row.url,
            title=row.title,
            folder=row.folder,
            tags=row.tags,
        )
        for path in collection_paths_for_item(pseudo_item, row.source_format):
            for depth in range(1, len(path) + 1):
                prefix = path[:depth]
                name = prefix[-1]
                key = f"{row.source_format}|{'/'.join(part.casefold() for part in prefix)}"
                parent_id = collection_path_id(prefix[:-1], row.source_format) if len(prefix) > 1 else None
                (
                    suggestion_id,
                    suggestion_name,
                    source_format,
                    suggestion_parent_id,
                    suggestion_path,
                    sort_index,
                    item_ids,
                ) = suggestion_map.setdefault(
                    key,
                    (
                        collection_path_id(prefix, row.source_format),
                        name,
                        row.source_format,
                        parent_id,
                        prefix,
                        len(suggestion_map),
                        [],
                    ),
                )
                if row.id not in item_ids:
                    item_ids.append(row.id)
                suggestion_map[key] = (
                    suggestion_id,
                    suggestion_name,
                    source_format,
                    suggestion_parent_id,
                    suggestion_path,
                    sort_index,
                    item_ids,
                )
    suggestions = [
        BatchImportCollectionSuggestion(
            id=suggestion_id,
            name=suggestion_name,
            source_format=source_format,
            parent_id=parent_id,
            path=list(path),
            sort_index=sort_index,
            item_ids=list(item_ids),
            ready_count=len(item_ids),
        )
        for suggestion_id, suggestion_name, source_format, parent_id, path, sort_index, item_ids in suggestion_map.values()
    ]
    suggestions.sort(key=lambda suggestion: (tuple(part.casefold() for part in suggestion.path), suggestion.id))
    return suggestions


def build_batch_import_preview(
    raw_bytes: bytes,
    *,
    file_name: str,
    requested_format: BatchImportFormat = "auto",
    max_items: int = 25,
    existing_url_checker: Callable[[str], bool] | None = None,
) -> BatchImportPreview:
    if not raw_bytes:
        raise ValueError("Upload a bookmarks, Pocket, or URL-list file before previewing.")
    if max_items < 1 or max_items > 100:
        raise ValueError("max_items must be between 1 and 100.")

    text = "" if (requested_format == "pocket_zip" or file_name.lower().endswith(".zip")) else decode_upload(raw_bytes)
    source_format = resolve_batch_import_format(
        requested_format=requested_format,
        file_name=file_name,
        raw_bytes=raw_bytes,
        text=text,
    )
    if source_format != "pocket_zip" and not text:
        text = decode_upload(raw_bytes)
    items = parse_batch_items(raw_bytes, text, source_format)
    if not items:
        raise ValueError("No importable links were found in that file.")

    rows: list[BatchImportPreviewRow] = []
    seen_urls: set[str] = set()
    for index, item in enumerate(items[:max_items]):
        raw_url = clean_text(item.raw_url)
        title = clean_text(item.title or "") or None
        tags = item.tags or []
        normalized_url = raw_url
        status = "ready"
        reason: str | None = None

        parsed_raw = urlsplit(raw_url if "://" in raw_url else f"https://{raw_url}")
        if parsed_raw.scheme and parsed_raw.scheme not in {"http", "https"}:
            status = "unsupported"
            reason = "Only http and https links can be imported."
        else:
            try:
                normalized_url = normalize_web_url(raw_url)
            except WebImportError as exc:
                status = "invalid"
                reason = exc.detail

        if status == "ready":
            duplicate_key = normalized_url.lower()
            if duplicate_key in seen_urls:
                status = "duplicate"
                reason = "This link already appears in the uploaded file."
            elif existing_url_checker and existing_url_checker(normalized_url):
                status = "duplicate"
                reason = "This link is already saved in Recall."
            else:
                seen_urls.add(duplicate_key)

        row_id = sha256(f"{index}|{normalized_url}|{title or ''}".encode("utf-8")).hexdigest()[:16]
        rows.append(
            BatchImportPreviewRow(
                id=f"batch:{row_id}",
                title=title,
                url=normalized_url,
                source_format=source_format,
                folder=item.folder,
                tags=tags,
                status=status,
                reason=reason,
            )
        )

    status_counts = Counter(row.status for row in rows)
    skipped_count = len(items) - len(rows)
    return BatchImportPreview(
        dry_run=True,
        applied=False,
        source_format=source_format,
        max_items=max_items,
        rows=rows,
        collection_suggestions=build_collection_suggestions(rows),
        summary=BatchImportPreviewSummary(
            total_count=len(rows),
            ready_count=status_counts.get("ready", 0),
            duplicate_count=status_counts.get("duplicate", 0),
            invalid_count=status_counts.get("invalid", 0),
            unsupported_count=status_counts.get("unsupported", 0),
            skipped_count=skipped_count,
        ),
    )
