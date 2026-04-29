from __future__ import annotations

import base64
from contextlib import contextmanager
from datetime import UTC, datetime, timedelta
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import importlib
import json
from hashlib import sha256
import sqlite3
import socket
import threading
from io import BytesIO
from zipfile import ZipFile

from fastapi.testclient import TestClient
from PIL import Image, ImageDraw
import pytest

from app.models import DocumentView, SourceDocument, ViewBlock


def create_client(tmp_path, monkeypatch: pytest.MonkeyPatch) -> TestClient:
    monkeypatch.setenv("ACCESSIBLE_READER_DATA_DIR", str(tmp_path / ".data"))
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)

    from app import config

    config.get_settings.cache_clear()
    import app.main as main_module

    main_module = importlib.reload(main_module)
    client = TestClient(main_module.app)
    client.__enter__()
    return client


@contextmanager
def serve_fixture_routes(routes: dict[str, tuple[int, str, bytes]]):
    class Handler(BaseHTTPRequestHandler):
        def do_GET(self):
            route = routes.get(self.path)
            if route is None:
                self.send_response(404)
                self.end_headers()
                return

            status_code, content_type, body = route
            self.send_response(status_code)
            self.send_header("Content-Type", content_type)
            self.end_headers()
            self.wfile.write(body)

        def log_message(self, format: str, *args) -> None:  # noqa: A003
            return

    server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{server.server_port}"
    finally:
        server.shutdown()
        thread.join()


def seed_legacy_reader_db(tmp_path) -> None:
    data_dir = tmp_path / ".data"
    data_dir.mkdir(parents=True, exist_ok=True)
    legacy_db = data_dir / "reader.db"

    with sqlite3.connect(legacy_db) as connection:
        connection.executescript(
            """
            CREATE TABLE documents (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                source_type TEXT NOT NULL,
                file_name TEXT,
                stored_path TEXT,
                content_hash TEXT NOT NULL UNIQUE,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE document_views (
                document_id TEXT NOT NULL,
                mode TEXT NOT NULL,
                detail_level TEXT NOT NULL DEFAULT 'default',
                generated_by TEXT NOT NULL,
                model TEXT,
                source_hash TEXT NOT NULL,
                view_json TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                PRIMARY KEY (document_id, mode, detail_level)
            );

            CREATE TABLE reading_progress (
                document_id TEXT NOT NULL,
                mode TEXT NOT NULL,
                sentence_index INTEGER NOT NULL DEFAULT 0,
                updated_at TEXT NOT NULL,
                PRIMARY KEY (document_id, mode)
            );

            CREATE TABLE settings (
                key TEXT PRIMARY KEY,
                value_json TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE VIRTUAL TABLE documents_fts USING fts5(
                document_id UNINDEXED,
                title,
                body
            );
            """
        )
        connection.execute(
            """
            INSERT INTO documents (id, title, source_type, file_name, stored_path, content_hash, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "legacy-doc-1",
                "Legacy guide",
                "pdf",
                "legacy.pdf",
                str(data_dir / "files" / "legacy-doc-1.pdf"),
                "legacy-hash",
                "2026-03-10T00:00:00+00:00",
                "2026-03-10T00:00:01+00:00",
            ),
        )
        connection.execute(
            """
            INSERT INTO document_views (
                document_id, mode, detail_level, generated_by, model, source_hash, view_json, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "legacy-doc-1",
                "reflowed",
                "default",
                "local",
                None,
                "legacy-hash",
                (
                    '{"mode":"reflowed","detail_level":"default","title":"Legacy guide","blocks":'
                    '[{"id":"block-0","kind":"paragraph","text":"Legacy paragraph."}],"generated_by":"local",'
                    '"cached":false,"source_hash":"legacy-hash","model":null,'
                    '"updated_at":"2026-03-10T00:00:01+00:00"}'
                ),
                "2026-03-10T00:00:00+00:00",
                "2026-03-10T00:00:01+00:00",
            ),
        )
        connection.execute(
            """
            INSERT INTO document_views (
                document_id, mode, detail_level, generated_by, model, source_hash, view_json, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "legacy-doc-1",
                "original",
                "default",
                "local",
                None,
                "legacy-hash",
                (
                    '{"mode":"original","detail_level":"default","title":"Legacy guide","blocks":'
                    '[{"id":"block-0","kind":"paragraph","text":"Legacy paragraph."}],"generated_by":"local",'
                    '"cached":false,"source_hash":"legacy-hash","model":null,'
                    '"updated_at":"2026-03-10T00:00:01+00:00"}'
                ),
                "2026-03-10T00:00:00+00:00",
                "2026-03-10T00:00:01+00:00",
            ),
        )
        connection.execute(
            """
            INSERT INTO reading_progress (document_id, mode, sentence_index, updated_at)
            VALUES (?, ?, ?, ?)
            """,
            ("legacy-doc-1", "reflowed", 4, "2026-03-10T00:00:02+00:00"),
        )
        connection.execute(
            """
            INSERT INTO settings (key, value_json, updated_at)
            VALUES (?, ?, ?)
            """,
            (
                "reader",
                (
                    '{"font_preset":"system","text_size":22,"line_spacing":1.7,"line_width":72,'
                    '"contrast_theme":"soft","focus_mode":false,"preferred_voice":"default","speech_rate":1.0}'
                ),
                "2026-03-10T00:00:03+00:00",
            ),
        )
        connection.execute(
            "INSERT INTO documents_fts (document_id, title, body) VALUES (?, ?, ?)",
            ("legacy-doc-1", "Legacy guide", "Legacy paragraph."),
        )


def build_png_bytes(
    color: tuple[int, int, int] = (52, 104, 180),
    *,
    size: tuple[int, int] = (960, 540),
) -> bytes:
    buffer = BytesIO()
    image = Image.new("RGB", size, color)
    image.save(buffer, format="PNG")
    return buffer.getvalue()


def build_png_data_url(
    color: tuple[int, int, int] = (52, 104, 180),
    *,
    size: tuple[int, int] = (960, 540),
) -> str:
    encoded = base64.b64encode(build_png_bytes(color, size=size)).decode("ascii")
    return f"data:image/png;base64,{encoded}"


def build_contentful_preview_png_bytes(*, size: tuple[int, int] = (960, 540)) -> bytes:
    buffer = BytesIO()
    image = Image.new("RGB", size, (240, 233, 221))
    draw = ImageDraw.Draw(image)
    width, height = size
    draw.rectangle((0, 0, width, 118), fill=(224, 212, 194))
    draw.rounded_rectangle((34, 40, width - 34, height - 36), radius=28, outline=(96, 74, 54), width=3)
    draw.rounded_rectangle((60, 78, width - 60, 168), radius=18, fill=(248, 241, 228), outline=(180, 152, 120), width=2)
    draw.rectangle((72, 94, width - 160, 108), fill=(92, 70, 48))
    draw.rectangle((72, 126, width - 112, 138), fill=(114, 92, 68))
    draw.rectangle((72, 156, width - 240, 166), fill=(136, 110, 80))
    draw.rounded_rectangle((54, 208, 182, 392), radius=26, fill=(168, 124, 78), outline=(214, 181, 144), width=2)
    for row_index, y_offset in enumerate(range(220, 444, 38)):
        inset = 116 if row_index % 2 == 0 else 152
        draw.rectangle((224, y_offset, width - inset, y_offset + 10), fill=(84, 66, 48))
        draw.rectangle((224, y_offset + 20, width - (inset + 96), y_offset + 28), fill=(120, 98, 72))
    image.save(buffer, format="PNG")
    return buffer.getvalue()


def build_low_information_preview_png_bytes(*, size: tuple[int, int] = (960, 540)) -> bytes:
    buffer = BytesIO()
    image = Image.new("RGB", size, (228, 228, 228))
    draw = ImageDraw.Draw(image)
    width, height = size
    for y_offset in range(height):
        tone = 236 - int(20 * (y_offset / max(height - 1, 1)))
        draw.line((0, y_offset, width, y_offset), fill=(tone, tone, tone + 2))
    draw.rounded_rectangle((26, 28, 112, 84), radius=18, fill=(186, 190, 212))
    draw.rounded_rectangle((36, height - 92, 136, height - 28), radius=22, fill=(178, 184, 220))
    image.save(buffer, format="PNG")
    return buffer.getvalue()


def build_preview_source_document(
    *,
    document_id: str = "preview-doc-1",
    title: str = "Preview document",
    source_type: str = "paste",
    file_name: str | None = None,
    source_locator: str | None = None,
) -> SourceDocument:
    return SourceDocument(
        id=document_id,
        title=title,
        source_type=source_type,
        file_name=file_name,
        source_locator=source_locator,
        content_hash=f"{document_id}-hash",
        created_at="2026-03-27T00:00:00+00:00",
        updated_at="2026-03-27T00:00:00+00:00",
    )


def build_preview_view(
    *,
    title: str,
    blocks: list[ViewBlock],
    mode: str = "reflowed",
    source_hash: str = "preview-hash",
) -> DocumentView:
    return DocumentView(
        mode=mode,
        detail_level="default",
        title=title,
        blocks=blocks,
        generated_by="local",
        source_hash=source_hash,
        updated_at="2026-03-27T00:00:00+00:00",
    )


def build_note_anchor(document_id: str, view_payload: dict, *, block_index: int = 0, sentence_start: int = 0, sentence_end: int = 0) -> dict:
    block = view_payload["blocks"][block_index]
    sentence_texts = block["metadata"]["sentence_texts"]
    selected_text = " ".join(sentence_texts[sentence_start : sentence_end + 1]).strip()
    excerpt_start = max(sentence_start - 1, 0)
    excerpt_end = min(sentence_end + 1, len(sentence_texts) - 1)
    excerpt_text = " ".join(sentence_texts[excerpt_start : excerpt_end + 1]).strip()
    if excerpt_start > 0:
        excerpt_text = f"...{excerpt_text}"
    if excerpt_end < len(sentence_texts) - 1:
        excerpt_text = f"{excerpt_text}..."
    return {
        "source_document_id": document_id,
        "variant_id": view_payload["variant_metadata"]["variant_id"],
        "block_id": block["id"],
        "sentence_start": sentence_start,
        "sentence_end": sentence_end,
        "anchor_text": selected_text,
        "excerpt_text": excerpt_text or selected_text,
    }


def build_source_note_anchor(document_id: str, *, title: str = "Notes guide") -> dict:
    return {
        "kind": "source",
        "source_document_id": document_id,
        "variant_id": "source-note-draft",
        "block_id": "source-note-draft",
        "sentence_start": 99,
        "sentence_end": 99,
        "anchor_text": f"Source note for {title}",
        "excerpt_text": f"Manual note attached to {title}.",
    }


def test_import_text_and_restore_reflow_view(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)

    import_response = client.post(
        "/api/documents/import-text",
        json={"title": "Plain guide", "text": "One line.\n\nAnother line."},
    )
    assert import_response.status_code == 200
    document = import_response.json()

    view_response = client.get(
        f"/api/documents/{document['id']}/view",
        params={"mode": "reflowed", "detail_level": "default"},
    )
    assert view_response.status_code == 200
    assert view_response.json()["mode"] == "reflowed"
    assert view_response.json()["variant_metadata"]["variant_contract_version"] == "1"
    assert "reflow_source_block_id" in view_response.json()["blocks"][0]["metadata"]

    progress_response = client.put(
        f"/api/documents/{document['id']}/progress",
        json={"mode": "reflowed", "sentence_index": 2},
    )
    assert progress_response.status_code == 200

    listing_response = client.get("/api/documents")
    assert listing_response.status_code == 200
    assert listing_response.json()[0]["progress_by_mode"]["reflowed"] == 2
    assert (tmp_path / ".data" / "workspace.db").exists()

    recall_listing_response = client.get("/api/recall/documents")
    assert recall_listing_response.status_code == 200
    assert recall_listing_response.json()[0]["chunk_count"] >= 1

    recall_detail_response = client.get(f"/api/recall/documents/{document['id']}")
    assert recall_detail_response.status_code == 200
    assert recall_detail_response.json()["title"] == "Plain guide"


def test_progress_update_persists_reader_session_metadata_and_surfaces_last_session(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)

    import_response = client.post(
        "/api/documents/import-text",
        json={"title": "Session guide", "text": "First sentence. Second sentence."},
    )
    assert import_response.status_code == 200
    document = import_response.json()

    progress_response = client.put(
        f"/api/documents/{document['id']}/progress",
        json={
            "mode": "reflowed",
            "sentence_index": 3,
            "summary_detail": "detailed",
            "accessibility_snapshot": {
                "font_preset": "atkinson",
                "text_size": 24,
                "line_spacing": 1.9,
                "line_width": 68,
                "contrast_theme": "high",
                "focus_mode": True,
                "preferred_voice": "default",
                "speech_rate": 1.1,
            },
        },
    )
    assert progress_response.status_code == 200

    listing_response = client.get("/api/documents")
    assert listing_response.status_code == 200
    listing = listing_response.json()
    assert listing[0]["last_reader_session"]["mode"] == "reflowed"
    assert listing[0]["last_reader_session"]["sentence_index"] == 3
    assert listing[0]["last_reader_session"]["summary_detail"] == "detailed"
    assert listing[0]["last_reader_session"]["accessibility_snapshot"]["font_preset"] == "atkinson"
    assert listing[0]["last_reader_session"]["accessibility_snapshot"]["contrast_theme"] == "high"

    with sqlite3.connect(tmp_path / ".data" / "workspace.db") as connection:
        metadata_row = connection.execute(
            """
            SELECT metadata_json
            FROM reading_sessions
            WHERE source_document_id = ? AND mode = 'reflowed'
            """,
            (document["id"],),
        ).fetchone()

    assert metadata_row is not None
    metadata = json.loads(metadata_row[0])
    assert metadata["summary_detail"] == "detailed"
    assert metadata["accessibility_snapshot"]["focus_mode"] is True
    assert metadata["accessibility_snapshot"]["line_width"] == 68


def test_import_file_creates_searchable_recall_chunks(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)

    import_response = client.post(
        "/api/documents/import-file",
        files={"file": ("memory.txt", b"Recallable sentence one. Recallable sentence two.", "text/plain")},
    )
    assert import_response.status_code == 200
    document = import_response.json()

    search_response = client.get("/api/recall/search", params={"query": "Recallable"})
    assert search_response.status_code == 200
    hits = search_response.json()
    assert hits
    assert hits[0]["source_document_id"] == document["id"]
    assert hits[0]["chunk_id"].startswith(f"{document['id']}:chunk:")
    assert "chunk" in hits[0]["match_context"].lower()


def test_import_url_creates_reflowed_snapshot_and_stores_source_locator(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    article_html = b"""
    <html>
      <head>
        <title>Ignored page title</title>
        <meta property=\"og:title\" content=\"Fixture article\" />
      </head>
      <body>
        <header>Site navigation</header>
        <article>
          <h1>Fixture article</h1>
          <p>Sentence one for the imported article.</p>
          <p>Sentence two for the imported article.</p>
        </article>
      </body>
    </html>
    """

    with serve_fixture_routes({
        "/article": (200, "text/html; charset=utf-8", article_html),
    }) as base_url:
        import_response = client.post(
            "/api/documents/import-url",
            json={"url": f"{base_url}/article"},
        )

    assert import_response.status_code == 200
    document = import_response.json()
    assert document["source_type"] == "web"
    stored_file = tmp_path / ".data" / "files" / f"{document['id']}.html"
    assert stored_file.exists()

    view_response = client.get(
        f"/api/documents/{document['id']}/view",
        params={"mode": "reflowed", "detail_level": "default"},
    )
    assert view_response.status_code == 200
    assert view_response.json()["title"] == "Fixture article"

    with sqlite3.connect(tmp_path / ".data" / "workspace.db") as connection:
        source_locator = connection.execute(
            "SELECT source_locator FROM source_documents WHERE id = ?",
            (document["id"],),
        ).fetchone()
        assert source_locator is not None
        assert source_locator[0] == f"{base_url}/article"
        chunk_count = connection.execute(
            "SELECT COUNT(*) FROM content_chunks WHERE source_document_id = ?",
            (document["id"],),
        ).fetchone()
        assert chunk_count is not None
        assert chunk_count[0] >= 1


def test_import_url_reuses_existing_snapshot_by_content_hash(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    article_html = b"""
    <html>
      <body>
        <article>
          <h1>Same article</h1>
          <p>Same paragraph one.</p>
          <p>Same paragraph two.</p>
        </article>
      </body>
    </html>
    """

    with serve_fixture_routes({
        "/article": (200, "text/html; charset=utf-8", article_html),
    }) as base_url:
        first_response = client.post("/api/documents/import-url", json={"url": f"{base_url}/article"})
        second_response = client.post("/api/documents/import-url", json={"url": f"{base_url}/article"})

    assert first_response.status_code == 200
    assert second_response.status_code == 200
    assert second_response.json()["id"] == first_response.json()["id"]

    listing_response = client.get("/api/documents")
    assert listing_response.status_code == 200
    assert len(listing_response.json()) == 1


def test_import_url_rejects_invalid_url(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)

    import_response = client.post("/api/documents/import-url", json={"url": "not a webpage"})

    assert import_response.status_code == 400
    assert "http or https" in import_response.json()["detail"]


def test_import_url_rejects_non_html_content(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)

    with serve_fixture_routes({
        "/article.pdf": (200, "application/pdf", b"%PDF-1.4"),
    }) as base_url:
        import_response = client.post(
            "/api/documents/import-url",
            json={"url": f"{base_url}/article.pdf"},
        )

    assert import_response.status_code == 400
    assert "file import" in import_response.json()["detail"]


def test_import_url_rejects_pages_without_readable_article_content(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    empty_html = b"""
    <html>
      <head><title>Empty shell</title></head>
      <body>
        <nav>Links only</nav>
        <div class=\"cookie-banner\">Accept cookies</div>
      </body>
    </html>
    """

    with serve_fixture_routes({
        "/empty": (200, "text/html; charset=utf-8", empty_html),
    }) as base_url:
        import_response = client.post(
            "/api/documents/import-url",
            json={"url": f"{base_url}/empty"},
        )

    assert import_response.status_code == 400
    assert "readable article" in import_response.json()["detail"]


def test_import_batch_preview_parses_bookmark_html_without_mutating_workspace(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    bookmark_html = b"""
    <!DOCTYPE NETSCAPE-Bookmark-file-1>
    <DL><p>
      <DT><H3>Research</H3>
      <DL><p>
        <DT><H3>AI</H3>
        <DL><p>
          <DT><A HREF="https://example.com/recall" TAGS="learning,recall">Recall article</A>
        </DL><p>
        <DT><A HREF="ftp://example.com/file">Unsupported file</A>
      </DL><p>
    </DL><p>
    """

    preview_response = client.post(
        "/api/documents/import-batch-preview",
        data={"source_format": "bookmarks_html", "max_items": "10"},
        files={"file": ("bookmarks.html", bookmark_html, "text/html")},
    )

    assert preview_response.status_code == 200
    preview = preview_response.json()
    assert preview["dry_run"] is True
    assert preview["applied"] is False
    assert preview["source_format"] == "bookmarks_html"
    assert preview["summary"]["ready_count"] == 1
    assert preview["summary"]["unsupported_count"] == 1
    ready_row = next(row for row in preview["rows"] if row["status"] == "ready")
    assert ready_row["title"] == "Recall article"
    assert ready_row["folder"] == "Research / AI"
    assert ready_row["tags"] == ["learning", "recall"]
    assert {tuple(suggestion["path"]) for suggestion in preview["collection_suggestions"]} == {
        ("Research",),
        ("Research", "AI"),
        ("learning",),
        ("recall",),
    }
    child_suggestion = next(
        suggestion for suggestion in preview["collection_suggestions"] if suggestion["path"] == ["Research", "AI"]
    )
    parent_suggestion = next(suggestion for suggestion in preview["collection_suggestions"] if suggestion["path"] == ["Research"])
    assert child_suggestion["parent_id"] == parent_suggestion["id"]

    listing_response = client.get("/api/documents")
    assert listing_response.status_code == 200
    assert listing_response.json() == []


def test_library_settings_persist_and_prune_document_ids(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)

    defaults_response = client.get("/api/recall/library/settings")
    assert defaults_response.status_code == 200
    assert defaults_response.json() == {"custom_collections": []}

    document_response = client.post(
        "/api/documents/import-text",
        json={"title": "Library source", "text": "A local source for collection persistence."},
    )
    assert document_response.status_code == 200
    document = document_response.json()

    save_response = client.put(
        "/api/recall/library/settings",
        json={
            "custom_collections": [
                {
                    "id": "collection:manual",
                    "name": "Manual collection",
                    "document_ids": [document["id"], "missing-doc", document["id"]],
                    "origin": "manual",
                    "source_format": None,
                    "sort_index": 0,
                },
                {
                    "id": "collection:manual-child",
                    "name": "Child collection",
                    "document_ids": [document["id"]],
                    "origin": "manual",
                    "parent_id": "collection:manual",
                    "source_format": None,
                    "sort_index": 1,
                }
            ]
        },
    )

    assert save_response.status_code == 200
    saved = save_response.json()
    assert saved["custom_collections"][0]["document_ids"] == [document["id"]]
    assert saved["custom_collections"][0]["parent_id"] is None
    assert saved["custom_collections"][1]["parent_id"] == "collection:manual"
    assert saved["custom_collections"][0]["created_at"]
    assert saved["custom_collections"][0]["updated_at"]

    reloaded_response = client.get("/api/recall/library/settings")
    assert reloaded_response.status_code == 200
    assert reloaded_response.json()["custom_collections"][0]["document_ids"] == [document["id"]]

    invalid_parent_response = client.put(
        "/api/recall/library/settings",
        json={
            "custom_collections": [
                {
                    "id": "collection:orphan",
                    "name": "Orphan",
                    "document_ids": [],
                    "origin": "manual",
                    "parent_id": "collection:missing",
                }
            ]
        },
    )
    assert invalid_parent_response.status_code == 400

    self_parent_response = client.put(
        "/api/recall/library/settings",
        json={
            "custom_collections": [
                {
                    "id": "collection:self",
                    "name": "Self parent",
                    "document_ids": [],
                    "origin": "manual",
                    "parent_id": "collection:self",
                }
            ]
        },
    )
    assert self_parent_response.status_code == 400

    cycle_response = client.put(
        "/api/recall/library/settings",
        json={
            "custom_collections": [
                {
                    "id": "collection:cycle-a",
                    "name": "Cycle A",
                    "document_ids": [],
                    "origin": "manual",
                    "parent_id": "collection:cycle-b",
                },
                {
                    "id": "collection:cycle-b",
                    "name": "Cycle B",
                    "document_ids": [],
                    "origin": "manual",
                    "parent_id": "collection:cycle-a",
                },
            ]
        },
    )
    assert cycle_response.status_code == 400

    too_deep_response = client.put(
        "/api/recall/library/settings",
        json={
            "custom_collections": [
                {
                    "id": f"collection:level-{level}",
                    "name": f"Level {level}",
                    "document_ids": [],
                    "origin": "manual",
                    "parent_id": f"collection:level-{level - 1}" if level > 1 else None,
                }
                for level in range(1, 7)
            ]
        },
    )
    assert too_deep_response.status_code == 400


def test_library_collection_overview_and_learning_export_use_descendant_membership(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    parent_response = client.post(
        "/api/documents/import-text",
        json={
            "title": "Collection parent source",
            "text": "Parent source context. Collection workspaces make parent folders useful.",
        },
    )
    child_response = client.post(
        "/api/documents/import-text",
        json={
            "title": "Collection child source",
            "text": (
                "Child source memory starts here. "
                "Collection workspaces carry notes, graph, and study state. "
                "Readers should resume before the final sentence."
            ),
        },
    )
    assert parent_response.status_code == 200
    assert child_response.status_code == 200
    parent_document = parent_response.json()
    child_document = child_response.json()

    settings_response = client.put(
        "/api/recall/library/settings",
        json={
            "custom_collections": [
                {
                    "id": "collection:learning",
                    "name": "Learning",
                    "document_ids": [parent_document["id"]],
                    "origin": "manual",
                    "sort_index": 0,
                },
                {
                    "id": "collection:learning-ai",
                    "name": "AI",
                    "document_ids": [child_document["id"]],
                    "origin": "manual",
                    "parent_id": "collection:learning",
                    "sort_index": 1,
                },
            ]
        },
    )
    assert settings_response.status_code == 200

    note_response = client.post(
        f"/api/recall/documents/{child_document['id']}/notes",
        json={
            "anchor": build_source_note_anchor(child_document["id"], title=child_document["title"]),
            "body_text": "Child collection note belongs in the parent workspace.",
        },
    )
    assert note_response.status_code == 200
    child_view_response = client.get(
        f"/api/documents/{child_document['id']}/view",
        params={"mode": "reflowed", "detail_level": "default"},
    )
    assert child_view_response.status_code == 200
    highlight_response = client.post(
        f"/api/recall/documents/{child_document['id']}/notes",
        json={
            "anchor": build_note_anchor(child_document["id"], child_view_response.json(), sentence_start=1, sentence_end=1),
            "body_text": "Collection highlight inbox should keep this sentence reviewable.",
        },
    )
    assert highlight_response.status_code == 200
    progress_response = client.put(
        f"/api/documents/{child_document['id']}/progress",
        json={"mode": "reflowed", "sentence_index": 1},
    )
    assert progress_response.status_code == 200
    graph_response = client.post(
        f"/api/recall/notes/{note_response.json()['id']}/promote/graph-node",
        json={"label": "Child concept", "description": "A graph memory from the child collection source."},
    )
    assert graph_response.status_code == 200
    study_response = client.post(
        "/api/recall/study/cards",
        json={
            "source_document_id": child_document["id"],
            "prompt": "What does the parent collection workspace include?",
            "answer": "Descendant source memory",
            "card_type": "short_answer",
        },
    )
    assert study_response.status_code == 200

    missing_response = client.get("/api/recall/library/collections/collection:missing/overview")
    assert missing_response.status_code == 404

    parent_overview_response = client.get("/api/recall/library/collections/collection:learning/overview")
    assert parent_overview_response.status_code == 200
    parent_overview = parent_overview_response.json()
    assert parent_overview["id"] == "collection:learning"
    assert parent_overview["path"] == [{"id": "collection:learning", "name": "Learning"}]
    assert parent_overview["direct_document_count"] == 1
    assert parent_overview["descendant_document_count"] == 2
    assert parent_overview["child_collection_count"] == 1
    assert parent_overview["direct_document_ids"] == [parent_document["id"]]
    assert set(parent_overview["descendant_document_ids"]) == {parent_document["id"], child_document["id"]}
    assert parent_overview["memory_counts"]["notes"] == 2
    assert parent_overview["memory_counts"]["graph_nodes"] >= 1
    assert parent_overview["memory_counts"]["study_cards"] >= 1
    assert parent_overview["study_counts"]["new"] >= 1
    assert parent_overview["study_counts"]["total"] >= 1
    assert parent_overview["reading_summary"]["total_sources"] == 2
    assert parent_overview["reading_summary"]["unread_sources"] == 1
    assert parent_overview["reading_summary"]["in_progress_sources"] == 1
    assert parent_overview["reading_summary"]["completed_sources"] == 0
    assert parent_overview["reading_summary"]["last_read_at"]
    assert len(parent_overview["resume_sources"]) == 1
    assert parent_overview["resume_sources"][0]["id"] == child_document["id"]
    assert parent_overview["resume_sources"][0]["title"] == "Collection child source"
    assert parent_overview["resume_sources"][0]["mode"] == "reflowed"
    assert parent_overview["resume_sources"][0]["sentence_index"] == 1
    assert parent_overview["resume_sources"][0]["sentence_count"] == 3
    assert parent_overview["resume_sources"][0]["progress_percent"] == 67
    assert parent_overview["resume_sources"][0]["membership"] == "descendant"
    assert parent_overview["resume_sources"][0]["updated_at"] == parent_overview["reading_summary"]["last_read_at"]
    assert [item["note_kind"] for item in parent_overview["highlight_review_items"]] == ["sentence", "source"]
    assert parent_overview["highlight_review_items"][0]["note_id"] == highlight_response.json()["id"]
    assert parent_overview["highlight_review_items"][0]["source_document_id"] == child_document["id"]
    assert parent_overview["highlight_review_items"][0]["source_title"] == "Collection child source"
    assert parent_overview["highlight_review_items"][0]["global_sentence_start"] == 1
    assert parent_overview["highlight_review_items"][0]["global_sentence_end"] == 1
    assert parent_overview["highlight_review_items"][0]["membership"] == "descendant"
    assert "Collection highlight inbox" in parent_overview["highlight_review_items"][0]["body_preview"]
    assert parent_overview["highlight_review_items"][1]["note_kind"] == "source"
    assert parent_overview["highlight_review_items"][1]["global_sentence_start"] is None
    assert {source["title"] for source in parent_overview["recent_sources"]} == {
        "Collection parent source",
        "Collection child source",
    }
    assert {"note", "graph_node", "study_card"}.issubset(
        {activity["kind"] for activity in parent_overview["recent_activity"]}
    )

    child_overview_response = client.get("/api/recall/library/collections/collection:learning-ai/overview")
    assert child_overview_response.status_code == 200
    child_overview = child_overview_response.json()
    assert child_overview["path"] == [
        {"id": "collection:learning", "name": "Learning"},
        {"id": "collection:learning-ai", "name": "AI"},
    ]
    assert child_overview["direct_document_count"] == 1
    assert child_overview["descendant_document_count"] == 1
    assert child_overview["reading_summary"]["total_sources"] == 1
    assert child_overview["reading_summary"]["in_progress_sources"] == 1
    assert child_overview["resume_sources"][0]["membership"] == "direct"

    export_response = client.get("/api/recall/library/collections/collection:learning/learning-export.zip")
    assert export_response.status_code == 200
    assert export_response.headers["content-type"].startswith("application/zip")
    assert "collection-learning-pack" in export_response.headers["content-disposition"]
    with ZipFile(BytesIO(export_response.content)) as archive:
        names = archive.namelist()
        assert "collection-manifest.json" in names
        source_pack_paths = [name for name in names if name.startswith("sources/") and name.endswith("/learning-pack.md")]
        assert len(source_pack_paths) == 2
        manifest = json.loads(archive.read("collection-manifest.json").decode("utf-8"))
        assert manifest["collection"]["id"] == "collection:learning"
        assert manifest["collection"]["path"] == ["Learning"]
        assert manifest["source_count"] == 2
        assert manifest["warnings"] == []
        bundled_child_pack = "\n".join(archive.read(path).decode("utf-8") for path in source_pack_paths)
        assert "Child collection note belongs in the parent workspace." in bundled_child_pack
        assert "Child concept" in bundled_child_pack
        assert "What does the parent collection workspace include?" in bundled_child_pack

    empty_settings = settings_response.json()
    empty_settings["custom_collections"].append(
        {
            "id": "collection:empty",
            "name": "Empty",
            "document_ids": [],
            "origin": "manual",
            "sort_index": 2,
        }
    )
    assert client.put("/api/recall/library/settings", json=empty_settings).status_code == 200
    empty_export_response = client.get("/api/recall/library/collections/collection:empty/learning-export.zip")
    assert empty_export_response.status_code == 200
    with ZipFile(BytesIO(empty_export_response.content)) as archive:
        assert archive.namelist() == ["collection-manifest.json"]
        manifest = json.loads(archive.read("collection-manifest.json").decode("utf-8"))
        assert manifest["source_count"] == 0
        assert manifest["warnings"] == ["Collection has no sources to export."]


def test_library_reading_queue_scopes_state_and_collection_membership(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    article_html = b"""
    <html><body><article><h1>Queue web source</h1><p>Queue web sentence one. Queue web sentence two. Queue web sentence three.</p></article></body></html>
    """
    with serve_fixture_routes({"/queue": (200, "text/html; charset=utf-8", article_html)}) as base_url:
        web_response = client.post("/api/documents/import-url", json={"url": f"{base_url}/queue"})
    capture_response = client.post(
        "/api/documents/import-text",
        json={
            "title": "Queue capture source",
            "text": "Capture sentence one. Capture sentence two. Capture sentence three.",
        },
    )
    file_response = client.post(
        "/api/documents/import-file",
        files={"file": ("queue-notes.txt", b"File sentence one. File sentence two.", "text/plain")},
    )
    assert web_response.status_code == 200
    assert capture_response.status_code == 200
    assert file_response.status_code == 200
    web_document = web_response.json()
    capture_document = capture_response.json()
    file_document = file_response.json()

    settings_response = client.put(
        "/api/recall/library/settings",
        json={
            "custom_collections": [
                {
                    "id": "collection:queue",
                    "name": "Queue",
                    "document_ids": [capture_document["id"]],
                    "origin": "manual",
                    "sort_index": 0,
                },
                {
                    "id": "collection:queue-web",
                    "name": "Web",
                    "document_ids": [web_document["id"]],
                    "origin": "manual",
                    "parent_id": "collection:queue",
                    "sort_index": 1,
                },
            ]
        },
    )
    assert settings_response.status_code == 200

    web_view_response = client.get(
        f"/api/documents/{web_document['id']}/view",
        params={"mode": "reflowed", "detail_level": "default"},
    )
    file_view_response = client.get(
        f"/api/documents/{file_document['id']}/view",
        params={"mode": "reflowed", "detail_level": "default"},
    )
    assert web_view_response.status_code == 200
    assert file_view_response.status_code == 200
    assert client.put(
        f"/api/documents/{web_document['id']}/progress",
        json={"mode": "reflowed", "sentence_index": 1},
    ).status_code == 200
    assert client.put(
        f"/api/documents/{file_document['id']}/progress",
        json={"mode": "reflowed", "sentence_index": 1},
    ).status_code == 200
    highlight_response = client.post(
        f"/api/recall/documents/{web_document['id']}/notes",
        json={
            "anchor": build_note_anchor(
                web_document["id"],
                web_view_response.json(),
                block_index=1,
                sentence_start=1,
                sentence_end=1,
            ),
            "body_text": "Queue highlight should be counted.",
        },
    )
    source_note_response = client.post(
        f"/api/recall/documents/{web_document['id']}/notes",
        json={
            "anchor": build_source_note_anchor(web_document["id"], title=web_document["title"]),
            "body_text": "Queue source note should be counted.",
        },
    )
    assert highlight_response.status_code == 200
    assert source_note_response.status_code == 200
    study_response = client.post(
        "/api/recall/study/cards",
        json={
            "source_document_id": web_document["id"],
            "prompt": "What does the queue surface?",
            "answer": "Reading progress and highlights.",
            "card_type": "short_answer",
        },
    )
    assert study_response.status_code == 200

    queue_response = client.get("/api/recall/library/reading-queue", params={"collection_id": "collection:queue"})
    assert queue_response.status_code == 200
    queue = queue_response.json()
    assert queue["dry_run"] is True
    assert queue["scope"] == "all"
    assert queue["collection_id"] == "collection:queue"
    assert queue["summary"] == {
        "total_sources": 2,
        "unread_sources": 1,
        "in_progress_sources": 1,
        "completed_sources": 0,
    }
    web_row = next(row for row in queue["rows"] if row["id"] == web_document["id"])
    capture_row = next(row for row in queue["rows"] if row["id"] == capture_document["id"])
    assert web_row["state"] == "in_progress"
    assert web_row["mode"] == "reflowed"
    assert web_row["sentence_index"] == 1
    assert web_row["sentence_count"] == 4
    assert web_row["progress_percent"] == 50
    assert web_row["membership"] == "descendant"
    assert web_row["note_count"] == 2
    assert web_row["highlight_count"] == 1
    assert web_row["study_counts"]["new"] >= 1
    assert web_row["study_counts"]["total"] >= 1
    assert [item["name"] for item in web_row["collection_paths"][0]] == ["Queue", "Web"]
    assert capture_row["state"] == "unread"
    assert capture_row["membership"] == "direct"

    in_progress_response = client.get(
        "/api/recall/library/reading-queue",
        params={"collection_id": "collection:queue", "state": "in_progress"},
    )
    assert in_progress_response.status_code == 200
    assert [row["id"] for row in in_progress_response.json()["rows"]] == [web_document["id"]]

    web_scope_response = client.get("/api/recall/library/reading-queue", params={"scope": "web"})
    assert web_scope_response.status_code == 200
    assert all(row["source_type"] == "web" for row in web_scope_response.json()["rows"])

    documents_scope_response = client.get("/api/recall/library/reading-queue", params={"scope": "documents"})
    assert documents_scope_response.status_code == 200
    assert any(row["id"] == file_document["id"] and row["state"] == "completed" for row in documents_scope_response.json()["rows"])

    untagged_response = client.get("/api/recall/library/reading-queue", params={"scope": "untagged"})
    assert untagged_response.status_code == 200
    assert {row["id"] for row in untagged_response.json()["rows"]} == {file_document["id"]}

    missing_collection_response = client.get(
        "/api/recall/library/reading-queue",
        params={"collection_id": "collection:missing"},
    )
    assert missing_collection_response.status_code == 404


def test_recall_document_reading_complete_updates_only_reader_progress(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import_response = client.post(
        "/api/documents/import-text",
        json={
            "title": "Complete reading source",
            "text": "Complete sentence one. Complete sentence two. Complete sentence three.",
        },
    )
    assert import_response.status_code == 200
    document = import_response.json()
    note_response = client.post(
        f"/api/recall/documents/{document['id']}/notes",
        json={
            "anchor": build_source_note_anchor(document["id"], title=document["title"]),
            "body_text": "Completion should not mutate this note.",
        },
    )
    card_response = client.post(
        "/api/recall/study/cards",
        json={
            "source_document_id": document["id"],
            "prompt": "What should completion avoid changing?",
            "answer": "Study scheduling.",
            "card_type": "short_answer",
        },
    )
    assert note_response.status_code == 200
    assert card_response.status_code == 200
    before_cards = client.get("/api/recall/study/cards", params={"status": "all", "limit": 20}).json()
    before_notes = client.get(f"/api/recall/documents/{document['id']}/notes").json()

    complete_response = client.post(
        f"/api/recall/documents/{document['id']}/reading/complete",
        json={"mode": "reflowed"},
    )

    assert complete_response.status_code == 200
    completion = complete_response.json()
    assert completion["document_id"] == document["id"]
    assert completion["mode"] == "reflowed"
    assert completion["sentence_index"] == 2
    assert completion["sentence_count"] == 3
    assert completion["completed_at"]

    refreshed_document = client.get(f"/api/documents/{document['id']}").json()
    assert refreshed_document["progress_by_mode"]["reflowed"] == 2
    queue_response = client.get("/api/recall/library/reading-queue", params={"state": "completed"})
    assert queue_response.status_code == 200
    assert any(row["id"] == document["id"] and row["progress_percent"] == 100 for row in queue_response.json()["rows"])
    assert client.get("/api/recall/study/cards", params={"status": "all", "limit": 20}).json() == before_cards
    assert client.get(f"/api/recall/documents/{document['id']}/notes").json() == before_notes

    missing_response = client.post("/api/recall/documents/missing-doc/reading/complete", json={})
    assert missing_response.status_code == 404


def test_import_batch_preview_handles_pocket_csv_duplicates_and_bounds(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    article_html = b"""
    <html><body><article><h1>Existing article</h1><p>Existing paragraph one.</p></article></body></html>
    """

    with serve_fixture_routes({
        "/existing": (200, "text/html; charset=utf-8", article_html),
    }) as base_url:
        import_response = client.post("/api/documents/import-url", json={"url": f"{base_url}/existing"})
        assert import_response.status_code == 200
        pocket_csv = (
            "url,title,tags,status\n"
            f"{base_url}/existing,Existing article,read later,archive\n"
            "https://example.com/new,New article,topic|saved,unread\n"
            "https://example.com/new,New duplicate,topic,unread\n"
        ).encode("utf-8")
        preview_response = client.post(
            "/api/documents/import-batch-preview",
            data={"source_format": "pocket_csv", "max_items": "3"},
            files={"file": ("pocket.csv", pocket_csv, "text/csv")},
        )

    assert preview_response.status_code == 200
    preview = preview_response.json()
    assert preview["source_format"] == "pocket_csv"
    assert preview["summary"]["ready_count"] == 1
    assert preview["summary"]["duplicate_count"] == 2
    duplicate_reasons = [row["reason"] for row in preview["rows"] if row["status"] == "duplicate"]
    assert "This link is already saved in Recall." in duplicate_reasons
    assert "This link already appears in the uploaded file." in duplicate_reasons
    ready_row = next(row for row in preview["rows"] if row["status"] == "ready")
    assert ready_row["tags"] == ["topic", "saved"]


def test_import_batch_preview_parses_pocket_zip_with_collection_suggestions(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    zip_buffer = BytesIO()
    with ZipFile(zip_buffer, "w") as archive:
        archive.writestr(
            "pocket/part.csv",
            "url,title,tags,status\n"
            "https://example.com/pocket-one,Pocket one,ai|reading,unread\n"
            "ftp://example.com/file,Unsupported,archive,archive\n",
        )
        archive.writestr("../ignored.csv", "url,title\nhttps://example.com/unsafe,Unsafe\n")

    preview_response = client.post(
        "/api/documents/import-batch-preview",
        data={"source_format": "auto", "max_items": "10"},
        files={"file": ("pocket-export.zip", zip_buffer.getvalue(), "application/zip")},
    )

    assert preview_response.status_code == 200
    preview = preview_response.json()
    assert preview["source_format"] == "pocket_zip"
    assert preview["summary"]["ready_count"] == 1
    assert preview["summary"]["unsupported_count"] == 1
    assert {suggestion["name"] for suggestion in preview["collection_suggestions"]} == {"ai", "reading"}
    assert all(row["url"] != "https://example.com/unsafe" for row in preview["rows"])


def test_import_batch_imports_selected_ready_links_and_reports_partial_failures(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    readable_html = b"""
    <html><body><article><h1>Bulk source one</h1><p>Bulk paragraph one.</p><p>Bulk paragraph two.</p></article></body></html>
    """
    empty_html = b"<html><body><nav>Navigation only</nav></body></html>"

    with serve_fixture_routes({
        "/one": (200, "text/html; charset=utf-8", readable_html),
        "/empty": (200, "text/html; charset=utf-8", empty_html),
    }) as base_url:
        url_list = f"{base_url}/one\n{base_url}/empty\nhttps://example.com/unselected\n".encode("utf-8")
        preview_response = client.post(
            "/api/documents/import-batch-preview",
            data={"source_format": "url_list", "max_items": "10"},
            files={"file": ("links.txt", url_list, "text/plain")},
        )
        assert preview_response.status_code == 200
        preview_rows = preview_response.json()["rows"]
        selected_ids = [row["id"] for row in preview_rows if row["url"] in {f"{base_url}/one", f"{base_url}/empty"}]
        apply_response = client.post(
            "/api/documents/import-batch",
            data={
                "source_format": "url_list",
                "max_items": "10",
                "selected_item_ids_json": json.dumps(selected_ids),
                "import_confirmation": "import-selected-sources",
            },
            files={"file": ("links.txt", url_list, "text/plain")},
        )

    assert apply_response.status_code == 200
    result = apply_response.json()
    assert result["applied"] is True
    assert result["summary"]["imported_count"] == 1
    assert result["summary"]["failed_count"] == 1
    assert result["summary"]["skipped_count"] == 1
    imported_row = next(row for row in result["rows"] if row["status"] == "imported")
    assert imported_row["document"]["title"] == "Bulk source one"
    failed_row = next(row for row in result["rows"] if row["status"] == "failed")
    assert "readable article" in failed_row["reason"]

    listing_response = client.get("/api/documents")
    assert listing_response.status_code == 200
    assert [document["title"] for document in listing_response.json()] == ["Bulk source one"]


def test_import_batch_creates_collections_and_source_metadata_for_successful_rows(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    readable_html = b"""
    <html><body><article><h1>Organized bulk source</h1><p>Bulk source paragraph one.</p><p>Bulk source paragraph two.</p></article></body></html>
    """

    with serve_fixture_routes({
        "/organized": (200, "text/html; charset=utf-8", readable_html),
    }) as base_url:
        bookmark_html = f"""
        <!DOCTYPE NETSCAPE-Bookmark-file-1>
        <DL><p>
          <DT><H3>Research</H3>
          <DL><p>
            <DT><H3>AI</H3>
            <DL><p>
              <DT><A HREF="{base_url}/organized" TAGS="recall">Organized source</A>
            </DL><p>
          </DL><p>
        </DL><p>
        """.encode("utf-8")
        apply_response = client.post(
            "/api/documents/import-batch",
            data={
                "source_format": "bookmarks_html",
                "max_items": "10",
                "create_collections": "true",
                "import_confirmation": "import-selected-sources",
            },
            files={"file": ("bookmarks.html", bookmark_html, "text/html")},
        )

    assert apply_response.status_code == 200
    result = apply_response.json()
    assert result["summary"]["imported_count"] == 1
    assert result["summary"]["collection_created_count"] == 3
    assert {tuple(collection["path"]) for collection in result["collections"]} == {
        ("Research",),
        ("Research", "AI"),
        ("recall",),
    }
    imported_document = next(row["document"] for row in result["rows"] if row["status"] == "imported")

    settings_response = client.get("/api/recall/library/settings")
    assert settings_response.status_code == 200
    collections = settings_response.json()["custom_collections"]
    assert {collection["name"] for collection in collections} == {"Research", "AI", "recall"}
    research = next(collection for collection in collections if collection["name"] == "Research")
    ai = next(collection for collection in collections if collection["name"] == "AI")
    recall = next(collection for collection in collections if collection["name"] == "recall")
    assert research["document_ids"] == []
    assert ai["parent_id"] == research["id"]
    assert ai["document_ids"] == [imported_document["id"]]
    assert recall["parent_id"] is None
    assert recall["document_ids"] == [imported_document["id"]]

    with sqlite3.connect(tmp_path / ".data" / "workspace.db") as connection:
        row = connection.execute(
            "SELECT metadata_json FROM source_documents WHERE id = ?",
            (imported_document["id"],),
        ).fetchone()
    metadata = json.loads(row[0] or "{}")
    assert metadata["batch_import"]["source_format"] == "bookmarks_html"
    assert metadata["batch_import"]["folder"] == "Research / AI"
    assert metadata["batch_import"]["tags"] == ["recall"]
    assert metadata["batch_import"]["imported_at"]

    learning_pack_response = client.get(f"/api/recall/documents/{imported_document['id']}/learning-export.md")
    assert learning_pack_response.status_code == 200
    learning_pack = learning_pack_response.text
    assert "### Source Provenance" in learning_pack
    assert "Collections: Research, AI, recall" in learning_pack
    assert "Archive folder: Research / AI" in learning_pack
    assert "Archive tags: recall" in learning_pack


def test_import_batch_rejects_unconfirmed_apply_without_mutating_workspace(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)

    apply_response = client.post(
        "/api/documents/import-batch",
        data={"source_format": "url_list", "max_items": "10", "selected_item_ids_json": "[]"},
        files={"file": ("links.txt", b"https://example.com/article", "text/plain")},
    )

    assert apply_response.status_code == 422
    listing_response = client.get("/api/documents")
    assert listing_response.status_code == 200
    assert listing_response.json() == []


def test_recall_document_preview_uses_meta_data_image_and_caches_asset(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    hero_data_url = build_png_data_url((88, 132, 206))
    article_html = f"""
    <html>
      <head>
        <meta property="og:image" content="{hero_data_url}" />
      </head>
      <body>
        <article>
          <h1>Preview fixture article</h1>
          <p>Sentence one for the imported article.</p>
          <p>Sentence two for the imported article.</p>
        </article>
      </body>
    </html>
    """.encode("utf-8")

    with serve_fixture_routes({
        "/article": (200, "text/html; charset=utf-8", article_html),
    }) as base_url:
        import_response = client.post(
            "/api/documents/import-url",
            json={"url": f"{base_url}/article"},
        )
        assert import_response.status_code == 200
        document = import_response.json()

        preview_response = client.get(f"/api/recall/documents/{document['id']}/preview")
        assert preview_response.status_code == 200
        preview = preview_response.json()
        assert preview["kind"] == "image"
        assert preview["source"] == "html-meta-image"
        assert preview["asset_url"]

        asset_response = client.get(preview["asset_url"])
        assert asset_response.status_code == 200
        assert asset_response.headers["content-type"].startswith("image/jpeg")
        with Image.open(BytesIO(asset_response.content)) as preview_image:
            assert preview_image.size == (960, 540)

        cached_preview_response = client.get(f"/api/recall/documents/{document['id']}/preview")
        assert cached_preview_response.status_code == 200
        assert cached_preview_response.json()["asset_url"] == preview["asset_url"]

    with sqlite3.connect(tmp_path / ".data" / "workspace.db") as connection:
        row = connection.execute(
            "SELECT metadata_json FROM source_documents WHERE id = ?",
            (document["id"],),
        ).fetchone()

    assert row is not None
    metadata = json.loads(row[0] or "{}")
    preview_metadata = metadata["home_preview"]
    assert preview_metadata["source"] == "html-meta-image"
    preview_path = tmp_path / ".data" / preview_metadata["relative_path"]
    assert preview_path.exists()


@pytest.mark.parametrize(
    ("article_html_template", "expected_source"),
    [
        (
            """
            <html>
              <head>
                <link rel="preload" as="image" href="{image_url}" />
              </head>
              <body>
                <article>
                  <h1>Preload preview article</h1>
                  <p>Sentence one for the imported article.</p>
                  <p>Sentence two for the imported article.</p>
                </article>
              </body>
            </html>
            """,
            "html-preload-image",
        ),
        (
            """
            <html>
              <body>
                <article>
                  <img src="{image_url}" width="1200" height="675" alt="Article preview" />
                  <h1>Inline preview article</h1>
                  <p>Sentence one for the imported article.</p>
                  <p>Sentence two for the imported article.</p>
                </article>
              </body>
            </html>
            """,
            "html-inline-image",
        ),
    ],
)
def test_recall_document_preview_uses_preload_or_inline_image_when_meta_absent(
    tmp_path,
    monkeypatch,
    article_html_template: str,
    expected_source: str,
) -> None:
    client = create_client(tmp_path, monkeypatch)
    article_html = article_html_template.format(image_url=build_png_data_url((154, 90, 216))).encode("utf-8")

    with serve_fixture_routes({
        "/article": (200, "text/html; charset=utf-8", article_html),
    }) as base_url:
        import_response = client.post(
            "/api/documents/import-url",
            json={"url": f"{base_url}/article"},
        )
        assert import_response.status_code == 200
        document = import_response.json()

        preview_response = client.get(f"/api/recall/documents/{document['id']}/preview")

    assert preview_response.status_code == 200
    preview = preview_response.json()
    assert preview["kind"] == "image"
    assert preview["source"] == expected_source
    assert preview["asset_url"]


def test_recall_document_preview_skips_remote_html_candidates_and_uses_rendered_snapshot(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import app.main as main_module

    monkeypatch.setattr(
        main_module.preview_service,
        "_load_rendered_html_snapshot_bytes",
        lambda stored_path: build_contentful_preview_png_bytes(),
    )
    monkeypatch.setattr(
        socket,
        "create_connection",
        lambda *args, **kwargs: (_ for _ in ()).throw(AssertionError("preview generation should stay local-only")),
    )

    article_html = b"""
    <html>
      <head>
        <meta property=\"og:image\" content=\"https://example.invalid/hero.png\" />
        <link rel=\"preload\" as=\"image\" href=\"https://example.invalid/preload.png\" />
      </head>
      <body>
        <article>
          <img src=\"https://example.invalid/inline.png\" width=\"1200\" height=\"675\" alt=\"Article preview\" />
          <h1>Remote preview article</h1>
          <p>Sentence one for the imported article.</p>
          <p>Sentence two for the imported article.</p>
        </article>
      </body>
    </html>
    """

    import_response = client.post(
        "/api/documents/import-file",
        files={"file": ("remote-preview.html", article_html, "text/html")},
    )
    assert import_response.status_code == 200
    document = import_response.json()

    preview_response = client.get(f"/api/recall/documents/{document['id']}/preview")

    assert preview_response.status_code == 200
    preview = preview_response.json()
    assert preview["kind"] == "image"
    assert preview["source"] == "html-rendered-snapshot"
    assert preview["asset_url"]


def test_recall_document_preview_uses_content_rendered_preview_for_paste_and_txt_sources(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)

    text_import_response = client.post(
        "/api/documents/import-text",
        json={
            "title": "Fallback text",
            "text": "Fallback sentence one. Fallback sentence two. Fallback sentence three.",
        },
    )
    assert text_import_response.status_code == 200
    text_document = text_import_response.json()

    text_preview_response = client.get(f"/api/recall/documents/{text_document['id']}/preview")
    assert text_preview_response.status_code == 200
    text_preview = text_preview_response.json()
    assert text_preview["kind"] == "image"
    assert text_preview["source"] == "content-rendered-preview"
    assert text_preview["asset_url"]

    text_asset_response = client.get(text_preview["asset_url"])
    assert text_asset_response.status_code == 200
    assert text_asset_response.headers["content-type"].startswith("image/jpeg")
    with Image.open(BytesIO(text_asset_response.content)) as preview_image:
        assert preview_image.size == (960, 540)

    file_import_response = client.post(
        "/api/documents/import-file",
        files={
            "file": (
                "fallback-preview.txt",
                b"Uploaded file sentence one. Uploaded file sentence two. Uploaded file sentence three.",
                "text/plain",
            )
        },
    )
    assert file_import_response.status_code == 200
    file_document = file_import_response.json()

    file_preview_response = client.get(f"/api/recall/documents/{file_document['id']}/preview")
    assert file_preview_response.status_code == 200
    file_preview = file_preview_response.json()
    assert file_preview["kind"] == "image"
    assert file_preview["source"] == "content-rendered-preview"
    assert file_preview["asset_url"]

    file_asset_response = client.get(file_preview["asset_url"])
    assert file_asset_response.status_code == 200
    assert file_asset_response.headers["content-type"].startswith("image/jpeg")
    with Image.open(BytesIO(file_asset_response.content)) as preview_image:
        assert preview_image.size == (960, 540)


def test_recall_document_preview_uses_content_rendered_preview_for_sparse_short_sentence_blocks(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import app.main as main_module

    monkeypatch.setattr(main_module.preview_service, "_load_rendered_html_snapshot_bytes", lambda stored_path: None)

    text_import_response = client.post(
        "/api/documents/import-text",
        json={
            "title": "Sparse runtime",
            "text": "Alpha sentence. Beta sentence. Gamma sentence.",
        },
    )
    assert text_import_response.status_code == 200
    text_document = text_import_response.json()

    text_preview_response = client.get(f"/api/recall/documents/{text_document['id']}/preview")
    assert text_preview_response.status_code == 200
    text_preview = text_preview_response.json()
    assert text_preview["kind"] == "image"
    assert text_preview["source"] == "content-rendered-preview"
    assert text_preview["asset_url"]

    text_asset_response = client.get(text_preview["asset_url"])
    assert text_asset_response.status_code == 200
    assert text_asset_response.headers["content-type"].startswith("image/jpeg")
    with Image.open(BytesIO(text_asset_response.content)) as preview_image:
        assert preview_image.size == (960, 540)


def test_content_rendered_layout_variant_uses_note_for_sparse_selector(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import app.main as main_module

    document = build_preview_source_document(title="Sparse runtime", source_type="paste")
    view = build_preview_view(
        title="Sparse runtime",
        source_hash=document.content_hash,
        blocks=[
            ViewBlock(
                id="block-1",
                kind="paragraph",
                text="Alpha sentence. Beta sentence. Gamma sentence.",
            )
        ],
    )

    layout_variant = main_module.preview_service._select_content_rendered_layout_variant(
        document,
        view,
        ["Alpha sentence. Beta sentence. Gamma sentence."],
        used_sparse_selector=True,
    )

    assert layout_variant == "note"


def test_content_rendered_layout_variant_uses_note_for_short_single_block_paste(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import app.main as main_module

    document = build_preview_source_document(title="Quick capture", source_type="paste")
    view = build_preview_view(
        title="Quick capture",
        source_hash=document.content_hash,
        blocks=[
            ViewBlock(
                id="block-1",
                kind="paragraph",
                text="Debug import sentence one. Debug import sentence two.",
            )
        ],
    )

    layout_variant = main_module.preview_service._select_content_rendered_layout_variant(
        document,
        view,
        ["Debug import sentence one.", "Debug import sentence two."],
        used_sparse_selector=False,
    )

    assert layout_variant == "note"


def test_content_rendered_layout_variant_keeps_sheet_for_structured_web_preview(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import app.main as main_module

    document = build_preview_source_document(
        document_id="preview-doc-web",
        title="Stage10 Debug Article",
        source_type="web",
        source_locator="http://127.0.0.1/article",
    )
    view = build_preview_view(
        title="Stage10 Debug Article",
        source_hash=document.content_hash,
        blocks=[
            ViewBlock(id="heading-1", kind="heading", text="Stage10 Debug Article", level=1),
            ViewBlock(
                id="paragraph-1",
                kind="paragraph",
                text="Debug harness sentence alpha. Debug harness sentence beta. Recall note capture stays local.",
            ),
            ViewBlock(
                id="list-1",
                kind="list_item",
                text="Grounded browser notes should reopen Reader on the anchor.",
            ),
        ],
    )

    layout_variant = main_module.preview_service._select_content_rendered_layout_variant(
        document,
        view,
        [
            "Debug harness sentence alpha.",
            "Recall note capture stays local.",
            "• Grounded browser notes should reopen Reader on the anchor.",
        ],
        used_sparse_selector=False,
    )

    assert layout_variant == "sheet"


def test_content_rendered_sheet_variant_uses_article_for_structured_web_preview(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import app.main as main_module

    document = build_preview_source_document(
        document_id="preview-doc-web",
        title="Stage10 Debug Article",
        source_type="web",
        source_locator="http://127.0.0.1/article",
    )

    sheet_variant = main_module.preview_service._select_content_rendered_sheet_variant(
        document,
        [
            "Debug harness sentence alpha.",
            "Debug harness sentence beta.",
            "Recall note capture stays local.",
            "Grounded browser notes should reopen Reader on the anchored sentence range.",
        ],
    )

    assert sheet_variant == "article-sheet"


def test_content_rendered_sheet_variant_uses_outline_for_structured_txt_preview(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import app.main as main_module

    document = build_preview_source_document(
        document_id="preview-doc-file",
        title="Uploaded file sentence one. Uploaded file sentence two.",
        source_type="txt",
        file_name="accessible-reader-edge-import.txt",
    )

    sheet_variant = main_module.preview_service._select_content_rendered_sheet_variant(
        document,
        [
            "Uploaded file sentence one.",
            "Uploaded file sentence two.",
        ],
    )

    assert sheet_variant == "outline-sheet"


def test_content_rendered_sheet_variant_uses_outline_for_structured_paste_sheet_preview(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import app.main as main_module

    document = build_preview_source_document(title="Stage13 Smoke 1773482254662", source_type="paste")

    sheet_variant = main_module.preview_service._select_content_rendered_sheet_variant(
        document,
        [
            "Stage 13 workflow smoke.",
            "First sentence for Reader.",
            "Second sentence for Search.",
        ],
    )

    assert sheet_variant == "outline-sheet"


def test_content_rendered_outline_sheet_variant_uses_document_for_txt_preview(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import app.main as main_module

    document = build_preview_source_document(
        document_id="preview-doc-file",
        title="Uploaded file sentence one. Uploaded file sentence two.",
        source_type="txt",
        file_name="accessible-reader-edge-import.txt",
    )

    outline_variant = main_module.preview_service._select_content_rendered_outline_sheet_variant(
        document,
        [
            "Uploaded file sentence one.",
            "Uploaded file sentence two.",
        ],
    )

    assert outline_variant == "document-outline"


def test_content_rendered_outline_sheet_variant_uses_checklist_for_structured_paste_preview(
    tmp_path, monkeypatch
) -> None:
    client = create_client(tmp_path, monkeypatch)
    import app.main as main_module

    document = build_preview_source_document(title="Stage13 Smoke 1773482254662", source_type="paste")

    outline_variant = main_module.preview_service._select_content_rendered_outline_sheet_variant(
        document,
        [
            "Stage 13 workflow smoke.",
            "First sentence for Reader.",
            "Second sentence for Search.",
        ],
    )

    assert outline_variant == "checklist-outline"


def test_content_rendered_note_variant_uses_focus_for_sparse_selector(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import app.main as main_module

    note_variant = main_module.preview_service._select_content_rendered_note_variant(
        ["Alpha sentence. Beta sentence. Gamma sentence."],
        used_sparse_selector=True,
    )

    assert note_variant == "focus-note"


def test_content_rendered_note_variant_uses_summary_for_short_multi_line_note(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import app.main as main_module

    note_variant = main_module.preview_service._select_content_rendered_note_variant(
        ["Debug import sentence one.", "Debug import sentence two."],
        used_sparse_selector=False,
    )

    assert note_variant == "summary-note"


def test_content_rendered_note_variant_uses_focus_for_single_short_line(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import app.main as main_module

    note_variant = main_module.preview_service._select_content_rendered_note_variant(
        ["Alpha sentence."],
        used_sparse_selector=False,
    )

    assert note_variant == "focus-note"


def test_content_rendered_summary_note_cues_extract_import_for_debug_capture(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import app.main as main_module

    cues = main_module.preview_service._select_content_rendered_summary_note_cues(
        "Stage13 Debug 1773482318378",
        ["Debug import sentence one.", "Debug import sentence two."],
    )

    assert cues == ["IMPORT"]


def test_content_rendered_summary_note_cues_extract_distinct_keywords_for_keep_after_delete(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import app.main as main_module

    cues = main_module.preview_service._select_content_rendered_summary_note_cues(
        "Keep after delete 1773391816129",
        ["Keep sentence one 1773391816129.", "Delete me sentence two 1773391816129."],
    )

    assert cues == ["KEEP", "DELETE"]


def test_content_rendered_summary_note_accent_seed_is_deterministic_and_bounded(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import app.main as main_module

    first_seed = main_module.preview_service._select_content_rendered_summary_note_accent_seed(
        "Stage13 Debug 1773482318378",
        ["Debug import sentence one.", "Debug import sentence two."],
    )
    second_seed = main_module.preview_service._select_content_rendered_summary_note_accent_seed(
        "Stage13 Debug 1773482318378",
        ["Debug import sentence one.", "Debug import sentence two."],
    )

    assert first_seed == second_seed
    assert 0 <= first_seed <= 2


def test_recall_document_preview_uses_content_rendered_preview_when_html_has_no_image_candidate_or_snapshot(
    tmp_path,
    monkeypatch,
) -> None:
    client = create_client(tmp_path, monkeypatch)
    import app.main as main_module

    monkeypatch.setattr(main_module.preview_service, "_load_rendered_html_snapshot_bytes", lambda stored_path: None)

    image_less_html = b"""
    <html>
      <body>
        <article>
          <h1>Image-less article</h1>
          <p>Sentence one for the imported article.</p>
          <p>Sentence two for the imported article.</p>
          <p>Sentence three for the imported article.</p>
        </article>
      </body>
    </html>
    """
    with serve_fixture_routes({
        "/article": (200, "text/html; charset=utf-8", image_less_html),
    }) as base_url:
        import_response = client.post(
            "/api/documents/import-url",
            json={"url": f"{base_url}/article"},
        )
        assert import_response.status_code == 200
        html_document = import_response.json()

        html_preview_response = client.get(f"/api/recall/documents/{html_document['id']}/preview")

    assert html_preview_response.status_code == 200
    html_preview = html_preview_response.json()
    assert html_preview["kind"] == "image"
    assert html_preview["source"] == "content-rendered-preview"
    assert html_preview["asset_url"]

    asset_response = client.get(html_preview["asset_url"])
    assert asset_response.status_code == 200
    assert asset_response.headers["content-type"].startswith("image/jpeg")
    with Image.open(BytesIO(asset_response.content)) as preview_image:
        assert preview_image.size == (960, 540)


def test_recall_document_preview_uses_rendered_snapshot_when_html_has_no_image_candidate(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import app.main as main_module

    monkeypatch.setattr(
        main_module.preview_service,
        "_load_rendered_html_snapshot_bytes",
        lambda stored_path: build_contentful_preview_png_bytes(),
    )

    image_less_html = b"""
    <html>
      <body>
        <article>
          <h1>Rendered snapshot article</h1>
          <p>Sentence one for the imported article.</p>
          <p>Sentence two for the imported article.</p>
        </article>
      </body>
    </html>
    """
    with serve_fixture_routes({
        "/article": (200, "text/html; charset=utf-8", image_less_html),
    }) as base_url:
        import_response = client.post(
            "/api/documents/import-url",
            json={"url": f"{base_url}/article"},
        )
        assert import_response.status_code == 200
        html_document = import_response.json()

        html_preview_response = client.get(f"/api/recall/documents/{html_document['id']}/preview")

    assert html_preview_response.status_code == 200
    html_preview = html_preview_response.json()
    assert html_preview["kind"] == "image"
    assert html_preview["source"] == "html-rendered-snapshot"
    assert html_preview["asset_url"]

    asset_response = client.get(html_preview["asset_url"])
    assert asset_response.status_code == 200
    assert asset_response.headers["content-type"].startswith("image/jpeg")
    with Image.open(BytesIO(asset_response.content)) as preview_image:
        assert preview_image.size == (960, 540)

    with sqlite3.connect(tmp_path / ".data" / "workspace.db") as connection:
        row = connection.execute(
            "SELECT metadata_json FROM source_documents WHERE id = ?",
            (html_document["id"],),
        ).fetchone()

    assert row is not None
    metadata = json.loads(row[0] or "{}")
    assert metadata["home_preview"]["source"] == "html-rendered-snapshot"


def test_recall_document_preview_rejects_low_signal_rendered_snapshot_and_uses_content_rendered_preview(
    tmp_path,
    monkeypatch,
) -> None:
    client = create_client(tmp_path, monkeypatch)
    import app.main as main_module

    monkeypatch.setattr(
        main_module.preview_service,
        "_load_rendered_html_snapshot_bytes",
        lambda stored_path: build_low_information_preview_png_bytes(),
    )

    image_less_html = b"""
    <html>
      <body>
        <article>
          <h1>Washed out article</h1>
          <p>Sentence one for the imported article.</p>
          <p>Sentence two for the imported article.</p>
        </article>
      </body>
    </html>
    """
    with serve_fixture_routes({
        "/article": (200, "text/html; charset=utf-8", image_less_html),
    }) as base_url:
        import_response = client.post(
            "/api/documents/import-url",
            json={"url": f"{base_url}/article"},
        )
        assert import_response.status_code == 200
        html_document = import_response.json()

        html_preview_response = client.get(f"/api/recall/documents/{html_document['id']}/preview")

    assert html_preview_response.status_code == 200
    html_preview = html_preview_response.json()
    assert html_preview["kind"] == "image"
    assert html_preview["source"] == "content-rendered-preview"
    assert html_preview["asset_url"]

    asset_response = client.get(html_preview["asset_url"])
    assert asset_response.status_code == 200
    assert asset_response.headers["content-type"].startswith("image/jpeg")
    with Image.open(BytesIO(asset_response.content)) as preview_image:
        assert preview_image.size == (960, 540)

    with sqlite3.connect(tmp_path / ".data" / "workspace.db") as connection:
        row = connection.execute(
            "SELECT metadata_json FROM source_documents WHERE id = ?",
            (html_document["id"],),
        ).fetchone()

    assert row is not None
    metadata = json.loads(row[0] or "{}")
    assert metadata["home_preview"]["kind"] == "image"
    assert metadata["home_preview"]["source"] == "content-rendered-preview"


def test_recall_document_preview_keeps_fallback_when_content_is_too_sparse(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import app.main as main_module

    monkeypatch.setattr(main_module.preview_service, "_load_rendered_html_snapshot_bytes", lambda stored_path: None)

    text_import_response = client.post(
        "/api/documents/import-text",
        json={"title": "Sparse text", "text": "Tiny note."},
    )
    assert text_import_response.status_code == 200
    text_document = text_import_response.json()

    text_preview_response = client.get(f"/api/recall/documents/{text_document['id']}/preview")
    assert text_preview_response.status_code == 200
    text_preview = text_preview_response.json()
    assert text_preview["kind"] == "fallback"
    assert text_preview["source"] == "fallback"
    assert text_preview["asset_url"] is None


def test_recall_document_preview_cache_invalidates_when_preview_metadata_version_changes(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import app.main as main_module

    rendered_snapshots = [
        build_contentful_preview_png_bytes(),
        build_contentful_preview_png_bytes(size=(1280, 720)),
    ]
    monkeypatch.setattr(
        main_module.preview_service,
        "_load_rendered_html_snapshot_bytes",
        lambda stored_path: rendered_snapshots.pop(0),
    )

    image_less_html = b"""
    <html>
      <body>
        <article>
          <h1>Rendered snapshot versioned article</h1>
          <p>Sentence one for the imported article.</p>
          <p>Sentence two for the imported article.</p>
        </article>
      </body>
    </html>
    """
    with serve_fixture_routes({
        "/article": (200, "text/html; charset=utf-8", image_less_html),
    }) as base_url:
        import_response = client.post(
            "/api/documents/import-url",
            json={"url": f"{base_url}/article"},
        )
        assert import_response.status_code == 200
        html_document = import_response.json()

        first_preview_response = client.get(f"/api/recall/documents/{html_document['id']}/preview")
        assert first_preview_response.status_code == 200
        first_preview = first_preview_response.json()
        first_asset_response = client.get(first_preview["asset_url"])
        assert first_asset_response.status_code == 200

    with sqlite3.connect(tmp_path / ".data" / "workspace.db") as connection:
        row = connection.execute(
            "SELECT metadata_json FROM source_documents WHERE id = ?",
            (html_document["id"],),
        ).fetchone()
        assert row is not None
        metadata = json.loads(row[0] or "{}")
        metadata["home_preview"]["version"] = 2
        connection.execute(
            "UPDATE source_documents SET metadata_json = ? WHERE id = ?",
            (json.dumps(metadata), html_document["id"]),
        )
        connection.commit()

    second_preview_response = client.get(f"/api/recall/documents/{html_document['id']}/preview")
    assert second_preview_response.status_code == 200
    second_preview = second_preview_response.json()
    second_asset_response = client.get(second_preview["asset_url"])
    assert second_asset_response.status_code == 200

    assert first_preview["asset_url"] != second_preview["asset_url"]
    assert first_asset_response.content != second_asset_response.content

    with sqlite3.connect(tmp_path / ".data" / "workspace.db") as connection:
        row = connection.execute(
            "SELECT metadata_json FROM source_documents WHERE id = ?",
            (html_document["id"],),
        ).fetchone()

    assert row is not None
    metadata = json.loads(row[0] or "{}")
    assert metadata["home_preview"]["version"] == 17
    assert metadata["home_preview"]["source"] == "html-rendered-snapshot"


def test_recall_document_preview_cache_invalidates_when_content_hash_changes(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    article_html_a = f"""
    <html>
      <head>
        <meta property="og:image" content="{build_png_data_url((22, 128, 210))}" />
      </head>
      <body>
        <article>
          <h1>Preview cache article</h1>
          <p>Sentence one for the imported article.</p>
          <p>Sentence two for the imported article.</p>
        </article>
      </body>
    </html>
    """.encode("utf-8")
    article_html_b = f"""
    <html>
      <head>
        <meta property="og:image" content="{build_png_data_url((208, 92, 42))}" />
      </head>
      <body>
        <article>
          <h1>Preview cache article updated</h1>
          <p>Sentence three for the imported article.</p>
          <p>Sentence four for the imported article.</p>
        </article>
      </body>
    </html>
    """.encode("utf-8")

    with serve_fixture_routes({
        "/article": (200, "text/html; charset=utf-8", article_html_a),
    }) as base_url:
        import_response = client.post(
            "/api/documents/import-url",
            json={"url": f"{base_url}/article"},
        )
        assert import_response.status_code == 200
        document = import_response.json()

        first_preview_response = client.get(f"/api/recall/documents/{document['id']}/preview")
        assert first_preview_response.status_code == 200
        first_preview = first_preview_response.json()
        first_asset_response = client.get(first_preview["asset_url"])
        assert first_asset_response.status_code == 200

        stored_file = tmp_path / ".data" / "files" / f"{document['id']}.html"
        stored_file.write_bytes(article_html_b)
        new_content_hash = sha256(article_html_b).hexdigest()
        with sqlite3.connect(tmp_path / ".data" / "workspace.db") as connection:
            connection.execute(
                "UPDATE source_documents SET content_hash = ? WHERE id = ?",
                (new_content_hash, document["id"]),
            )
            connection.commit()

        second_preview_response = client.get(f"/api/recall/documents/{document['id']}/preview")
        assert second_preview_response.status_code == 200
        second_preview = second_preview_response.json()
        second_asset_response = client.get(second_preview["asset_url"])
        assert second_asset_response.status_code == 200

    assert first_preview["asset_url"] != second_preview["asset_url"]
    assert first_asset_response.content != second_asset_response.content

    with sqlite3.connect(tmp_path / ".data" / "workspace.db") as connection:
        row = connection.execute(
            "SELECT metadata_json FROM source_documents WHERE id = ?",
            (document["id"],),
        ).fetchone()

    assert row is not None
    metadata = json.loads(row[0] or "{}")
    assert metadata["home_preview"]["content_hash"] == new_content_hash


def test_delete_document_removes_cached_preview_asset(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    article_html = f"""
    <html>
      <head>
        <meta property="og:image" content="{build_png_data_url((74, 150, 98))}" />
      </head>
      <body>
        <article>
          <h1>Delete preview asset</h1>
          <p>Sentence one for the imported article.</p>
          <p>Sentence two for the imported article.</p>
        </article>
      </body>
    </html>
    """.encode("utf-8")

    with serve_fixture_routes({
        "/article": (200, "text/html; charset=utf-8", article_html),
    }) as base_url:
        import_response = client.post(
            "/api/documents/import-url",
            json={"url": f"{base_url}/article"},
        )
        assert import_response.status_code == 200
        document = import_response.json()

        preview_response = client.get(f"/api/recall/documents/{document['id']}/preview")
        assert preview_response.status_code == 200

    with sqlite3.connect(tmp_path / ".data" / "workspace.db") as connection:
        row = connection.execute(
            "SELECT metadata_json FROM source_documents WHERE id = ?",
            (document["id"],),
        ).fetchone()
    assert row is not None
    metadata = json.loads(row[0] or "{}")
    preview_path = tmp_path / ".data" / metadata["home_preview"]["relative_path"]
    assert preview_path.exists()

    delete_response = client.delete(f"/api/documents/{document['id']}")

    assert delete_response.status_code == 204
    assert not preview_path.exists()


def test_delete_document_removes_imported_webpage_snapshot(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    article_html = b"""
    <html>
      <body>
        <article>
          <h1>Delete me</h1>
          <p>Paragraph one.</p>
          <p>Paragraph two.</p>
        </article>
      </body>
    </html>
    """

    with serve_fixture_routes({
        "/delete-me": (200, "text/html; charset=utf-8", article_html),
    }) as base_url:
        import_response = client.post(
            "/api/documents/import-url",
            json={"url": f"{base_url}/delete-me"},
        )

    assert import_response.status_code == 200
    document = import_response.json()
    stored_file = tmp_path / ".data" / "files" / f"{document['id']}.html"
    assert stored_file.exists()

    delete_response = client.delete(f"/api/documents/{document['id']}")

    assert delete_response.status_code == 204
    assert not stored_file.exists()


def test_transform_returns_clear_error_without_openai_key(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import_response = client.post(
        "/api/documents/import-text",
        json={"title": "Plain guide", "text": "One line.\n\nAnother line."},
    )
    document = import_response.json()

    transform_response = client.post(
        f"/api/documents/{document['id']}/transform",
        json={"mode": "summary", "detail_level": "balanced"},
    )

    assert transform_response.status_code == 503
    assert "OPENAI_API_KEY" in transform_response.json()["detail"]


def test_recall_markdown_export_returns_attachment_with_provenance(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import_response = client.post(
        "/api/documents/import-text",
        json={"title": "Export guide", "text": "First paragraph.\n\nSecond paragraph."},
    )
    assert import_response.status_code == 200
    document = import_response.json()

    export_response = client.get(f"/api/recall/documents/{document['id']}/export.md")

    assert export_response.status_code == 200
    assert export_response.headers["content-type"].startswith("text/markdown")
    assert "attachment" in export_response.headers["content-disposition"]
    assert "# Export guide" in export_response.text
    assert "## Provenance" in export_response.text
    assert "### Chunk Mapping" in export_response.text


def test_recall_markdown_export_preserves_lists_quotes_and_variant_metadata(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import_response = client.post(
        "/api/documents/import-file",
        files={
            "file": (
                "guide.md",
                (
                    b"# Export guide\n\n"
                    b"1. Ordered item\n"
                    b"2. Second item\n"
                    b"    - Nested bullet\n\n"
                    b"> Quoted line"
                ),
                "text/markdown",
            )
        },
    )
    assert import_response.status_code == 200
    document = import_response.json()

    export_response = client.get(f"/api/recall/documents/{document['id']}/export.md")

    assert export_response.status_code == 200
    assert "\n1. Ordered item\n" in export_response.text
    assert "\n2. Second item\n" in export_response.text
    assert "\n  - Nested bullet\n" in export_response.text
    assert "\n> Quoted line\n" in export_response.text
    assert "- Variant contract version: 1" in export_response.text
    assert "- Block count:" in export_response.text
    assert "- Word count:" in export_response.text


def test_workspace_change_events_paginate_and_filter(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import_response = client.post(
        "/api/documents/import-text",
        json={"title": "Change log guide", "text": "One sentence.\n\nSecond sentence."},
    )
    assert import_response.status_code == 200
    document = import_response.json()

    progress_response = client.put(
        f"/api/documents/{document['id']}/progress",
        json={"mode": "reflowed", "sentence_index": 2},
    )
    assert progress_response.status_code == 200

    first_page_response = client.get("/api/workspace/change-events", params={"limit": 2})
    assert first_page_response.status_code == 200
    first_page = first_page_response.json()
    assert len(first_page["events"]) == 2
    assert first_page["has_more"] is True
    assert first_page["next_cursor"] is not None
    assert first_page["latest_cursor"] is not None

    second_page_response = client.get(
        "/api/workspace/change-events",
        params={"after": first_page["next_cursor"], "limit": 10},
    )
    assert second_page_response.status_code == 200
    second_page = second_page_response.json()
    assert second_page["events"]
    first_ids = [event["id"] for event in first_page["events"]]
    second_ids = [event["id"] for event in second_page["events"]]
    assert set(first_ids).isdisjoint(second_ids)

    reading_session_response = client.get(
        "/api/workspace/change-events",
        params={"entity_type": "reading_session"},
    )
    assert reading_session_response.status_code == 200
    reading_events = reading_session_response.json()["events"]
    assert reading_events
    assert all(event["entity_type"] == "reading_session" for event in reading_events)
    assert any(event["event_type"] == "progress_saved" for event in reading_events)


def test_workspace_attachments_manifest_and_zip_export(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    raw_bytes = b"Portable attachment content."
    import_response = client.post(
        "/api/documents/import-file",
        files={"file": ("portable.txt", raw_bytes, "text/plain")},
    )
    assert import_response.status_code == 200
    document = import_response.json()

    attachments_response = client.get("/api/workspace/attachments")
    assert attachments_response.status_code == 200
    attachments = attachments_response.json()
    assert len(attachments) == 1
    attachment = attachments[0]
    assert attachment["source_document_id"] == document["id"]
    assert attachment["relative_path"].startswith("files/")
    assert attachment["content_digest"]
    assert attachment["byte_size"] == len(raw_bytes)

    download_response = client.get(f"/api/workspace/attachments/{attachment['id']}")
    assert download_response.status_code == 200
    assert download_response.content == raw_bytes

    manifest_response = client.get("/api/workspace/export.manifest.json")
    assert manifest_response.status_code == 200
    manifest = manifest_response.json()
    assert manifest["format_version"] == "1"
    assert manifest["attachments"][0]["id"] == attachment["id"]
    entity_types = {entity["entity_type"] for entity in manifest["entities"]}
    assert "source_document" in entity_types
    assert "document_variant" in entity_types

    bundle_response = client.get("/api/workspace/export.zip")
    assert bundle_response.status_code == 200
    assert bundle_response.headers["content-type"].startswith("application/zip")
    assert "attachment" in bundle_response.headers["content-disposition"]

    with ZipFile(BytesIO(bundle_response.content)) as archive:
        assert "manifest.json" in archive.namelist()
        assert "workspace-data.json" in archive.namelist()
        assert attachment["relative_path"] in archive.namelist()
        assert archive.read(attachment["relative_path"]) == raw_bytes
        manifest_in_archive = json.loads(archive.read("manifest.json").decode("utf-8"))
        assert manifest_in_archive["attachments"][0]["id"] == attachment["id"]
        workspace_data = json.loads(archive.read("workspace-data.json").decode("utf-8"))
        assert workspace_data["source_documents"][0]["id"] == document["id"]
        assert workspace_data["document_variants"]
        assert workspace_data["content_chunks"]

    preview_response = client.post(
        "/api/workspace/import-preview",
        files={"file": ("workspace-export.zip", bundle_response.content, "application/zip")},
    )
    assert preview_response.status_code == 200
    preview = preview_response.json()
    assert preview["dry_run"] is True
    assert preview["applied"] is False
    assert preview["can_apply"] is True
    assert preview["apply_blockers"] == []
    assert preview["backup"]["source_kind"] == "zip"
    assert preview["backup"]["attachment_count"] == 1
    assert preview["backup"]["bundled_attachment_count"] == 1
    assert preview["backup"]["missing_attachment_paths"] == []
    assert preview["backup"]["bundle_coverage_available"] is True
    assert preview["merge_preview"]["summary"]["skip_equal"] >= 1

    after_preview_manifest_response = client.get("/api/workspace/export.manifest.json")
    assert after_preview_manifest_response.status_code == 200
    assert after_preview_manifest_response.json()["change_event_count"] == manifest["change_event_count"]

    unsafe_manifest = json.loads(json.dumps(manifest))
    unsafe_manifest["attachments"][0]["relative_path"] = "../escaped.txt"
    unsafe_bundle = BytesIO()
    with ZipFile(unsafe_bundle, "w") as archive:
        archive.writestr("manifest.json", json.dumps(unsafe_manifest))
        archive.writestr("../escaped.txt", raw_bytes)
    unsafe_preview_response = client.post(
        "/api/workspace/import-preview",
        files={"file": ("unsafe-workspace.zip", unsafe_bundle.getvalue(), "application/zip")},
    )
    assert unsafe_preview_response.status_code == 200
    unsafe_preview = unsafe_preview_response.json()
    assert unsafe_preview["can_apply"] is False
    assert unsafe_preview["apply_blockers"]
    assert unsafe_preview["backup"]["bundled_attachment_count"] == 0
    assert unsafe_preview["backup"]["missing_attachment_paths"] == ["../escaped.txt"]


def test_source_learning_pack_export_and_workspace_backup_include_study_memory(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import_response = client.post(
        "/api/documents/import-text",
        json={
            "title": "Portable learning source",
            "text": (
                "Learning packs preserve source memory. "
                "Notebook notes can become graph memory. "
                "Study sessions keep quiz history portable."
            ),
        },
    )
    assert import_response.status_code == 200
    document = import_response.json()

    plain_export_response = client.get(f"/api/recall/documents/{document['id']}/export.md")
    assert plain_export_response.status_code == 200
    assert "# Portable learning source" in plain_export_response.text
    assert "## Learning Pack" not in plain_export_response.text

    view_response = client.get(
        f"/api/documents/{document['id']}/view",
        params={"mode": "reflowed", "detail_level": "default"},
    )
    assert view_response.status_code == 200
    note_response = client.post(
        f"/api/recall/documents/{document['id']}/notes",
        json={
            "anchor": build_note_anchor(document["id"], view_response.json()),
            "body_text": "Portable learning note for export.",
        },
    )
    assert note_response.status_code == 200
    note = note_response.json()
    graph_response = client.post(
        f"/api/recall/notes/{note['id']}/promote/graph-node",
        json={"label": "Portable concept", "description": "Graph memory belongs in the learning pack."},
    )
    assert graph_response.status_code == 200

    study_response = client.post(
        "/api/recall/study/cards",
        json={
            "source_document_id": document["id"],
            "prompt": "Which export keeps Study history?",
            "answer": "Learning pack",
            "card_type": "multiple_choice",
            "question_difficulty": "hard",
            "question_payload": {
                "kind": "multiple_choice",
                "choices": [
                    {"id": "a", "text": "Learning pack"},
                    {"id": "b", "text": "Plain source export"},
                ],
                "correct_choice_id": "a",
            },
            "support_payload": {
                "hint": "Look at the source memory export.",
                "explanation": "The learning pack carries source memory and Study history.",
            },
        },
    )
    assert study_response.status_code == 200
    study_card = study_response.json()
    deleted_response = client.post(
        "/api/recall/study/cards",
        json={
            "source_document_id": document["id"],
            "prompt": "Do not export deleted card",
            "answer": "Deleted",
            "card_type": "short_answer",
        },
    )
    assert deleted_response.status_code == 200
    assert client.delete(f"/api/recall/study/cards/{deleted_response.json()['id']}").status_code == 200

    session_response = client.post(
        "/api/recall/study/sessions",
        json={
            "source_document_id": document["id"],
            "filter_snapshot": {"source_document_id": document["id"]},
            "settings_snapshot": {"default_timer_seconds": 30, "default_session_limit": 10},
            "card_ids": [study_card["id"]],
        },
    )
    assert session_response.status_code == 200
    session = session_response.json()
    attempt_response = client.post(
        f"/api/recall/study/cards/{study_card['id']}/attempts",
        json={"session_id": session["id"], "response": {"selected_choice_id": "a"}},
    )
    assert attempt_response.status_code == 200
    attempt = attempt_response.json()
    assert attempt["is_correct"] is True
    review_response = client.post(
        f"/api/recall/study/cards/{study_card['id']}/review",
        json={"rating": "good", "attempt_id": attempt["id"]},
    )
    assert review_response.status_code == 200
    complete_response = client.post(
        f"/api/recall/study/sessions/{session['id']}/complete",
        json={"summary": {"attempted": 1, "correct": 1, "duration_seconds": 25}},
    )
    assert complete_response.status_code == 200

    learning_export_response = client.get(f"/api/recall/documents/{document['id']}/learning-export.md")
    assert learning_export_response.status_code == 200
    assert learning_export_response.headers["content-type"].startswith("text/markdown")
    assert "learning-pack" in learning_export_response.headers["content-disposition"]
    learning_pack = learning_export_response.text
    assert "## Learning Pack" in learning_pack
    assert "Portable learning note for export." in learning_pack
    assert "Portable concept" in learning_pack
    assert "Which export keeps Study history?" in learning_pack
    assert "Recent Study Attempts" in learning_pack
    assert "Recent Review Sessions" in learning_pack
    assert "Do not export deleted card" not in learning_pack

    manifest_response = client.get("/api/workspace/export.manifest.json")
    assert manifest_response.status_code == 200
    manifest = manifest_response.json()
    assert manifest["entity_counts"]["study_answer_attempt"] == 1
    assert manifest["entity_counts"]["study_review_session"] == 1
    assert any(entity["entity_type"] == "study_answer_attempt" for entity in manifest["entities"])
    assert any(entity["entity_type"] == "study_review_session" for entity in manifest["entities"])

    bundle_response = client.get("/api/workspace/export.zip")
    assert bundle_response.status_code == 200
    with ZipFile(BytesIO(bundle_response.content)) as archive:
        assert "workspace-data.json" in archive.namelist()
        source_pack_paths = [
            name
            for name in archive.namelist()
            if name.startswith("sources/") and name.endswith("/learning-pack.md")
        ]
        assert source_pack_paths
        bundled_pack = archive.read(source_pack_paths[0]).decode("utf-8")
        assert "Portable learning note for export." in bundled_pack
        assert "Which export keeps Study history?" in bundled_pack
        manifest_in_archive = json.loads(archive.read("manifest.json").decode("utf-8"))
        assert manifest_in_archive["entity_counts"]["study_answer_attempt"] == 1
        assert manifest_in_archive["entity_counts"]["study_review_session"] == 1
        workspace_data = json.loads(archive.read("workspace-data.json").decode("utf-8"))
        assert len(workspace_data["study_answer_attempts"]) == 1
        assert len(workspace_data["study_review_sessions"]) == 1

    preview_response = client.post(
        "/api/workspace/import-preview",
        files={"file": ("learning-workspace.zip", bundle_response.content, "application/zip")},
    )
    assert preview_response.status_code == 200
    preview = preview_response.json()
    assert preview["dry_run"] is True
    assert preview["applied"] is False
    assert preview["can_apply"] is True
    assert preview["restorable_entity_counts"] == {}
    assert preview["backup"]["entity_counts"]["study_answer_attempt"] == 1
    assert preview["backup"]["entity_counts"]["study_review_session"] == 1
    assert preview["backup"]["learning_pack_count"] >= 1
    assert preview["backup"]["missing_learning_pack_paths"] == []


def test_workspace_import_apply_restores_missing_workspace_data(tmp_path, monkeypatch) -> None:
    source_client = create_client(tmp_path / "source", monkeypatch)
    raw_bytes = b"Portable restore source. Notebook memory and Study attempts should come back."
    import_response = source_client.post(
        "/api/documents/import-file",
        files={"file": ("portable-restore.txt", raw_bytes, "text/plain")},
    )
    assert import_response.status_code == 200
    document = import_response.json()

    settings_response = source_client.put(
        "/api/settings",
        json={
            "font_preset": "atkinson",
            "text_size": 23,
            "line_spacing": 1.7,
            "line_width": 68,
            "contrast_theme": "high",
            "focus_mode": True,
            "preferred_voice": "default",
            "speech_rate": 1.0,
        },
    )
    assert settings_response.status_code == 200

    view_response = source_client.get(
        f"/api/documents/{document['id']}/view",
        params={"mode": "reflowed", "detail_level": "default"},
    )
    assert view_response.status_code == 200
    note_response = source_client.post(
        f"/api/recall/documents/{document['id']}/notes",
        json={
            "anchor": build_note_anchor(document["id"], view_response.json()),
            "body_text": "Restored portable note.",
        },
    )
    assert note_response.status_code == 200
    note = note_response.json()
    graph_response = source_client.post(
        f"/api/recall/notes/{note['id']}/promote/graph-node",
        json={"label": "Restored graph node", "description": "Graph memory should restore."},
    )
    assert graph_response.status_code == 200

    study_response = source_client.post(
        "/api/recall/study/cards",
        json={
            "source_document_id": document["id"],
            "prompt": "What should restore?",
            "answer": "Study attempts",
            "card_type": "short_answer",
        },
    )
    assert study_response.status_code == 200
    study_card = study_response.json()
    session_response = source_client.post(
        "/api/recall/study/sessions",
        json={
            "source_document_id": document["id"],
            "filter_snapshot": {"source_document_id": document["id"]},
            "settings_snapshot": {"default_session_limit": 10},
            "card_ids": [study_card["id"]],
        },
    )
    assert session_response.status_code == 200
    session = session_response.json()
    attempt_response = source_client.post(
        f"/api/recall/study/cards/{study_card['id']}/attempts",
        json={"session_id": session["id"], "response": {"text": "Study attempts"}},
    )
    assert attempt_response.status_code == 200
    review_response = source_client.post(
        f"/api/recall/study/cards/{study_card['id']}/review",
        json={"rating": "good", "attempt_id": attempt_response.json()["id"]},
    )
    assert review_response.status_code == 200
    complete_response = source_client.post(
        f"/api/recall/study/sessions/{session['id']}/complete",
        json={"summary": {"attempted": 1, "correct": 1}},
    )
    assert complete_response.status_code == 200

    bundle_response = source_client.get("/api/workspace/export.zip")
    assert bundle_response.status_code == 200
    bundle = bundle_response.content

    restore_client = create_client(tmp_path / "restore", monkeypatch)
    preview_response = restore_client.post(
        "/api/workspace/import-preview",
        files={"file": ("restore-workspace.zip", bundle, "application/zip")},
    )
    assert preview_response.status_code == 200
    preview = preview_response.json()
    assert preview["can_apply"] is True
    assert preview["restorable_entity_counts"]["source_document"] == 1
    assert preview["restorable_entity_counts"]["recall_note"] == 1
    assert preview["restorable_entity_counts"]["study_answer_attempt"] == 1

    apply_response = restore_client.post(
        "/api/workspace/import-apply",
        data={"restore_confirmation": "restore-missing-items"},
        files={"file": ("restore-workspace.zip", bundle, "application/zip")},
    )
    assert apply_response.status_code == 200
    apply_result = apply_response.json()
    assert apply_result["applied"] is True
    assert apply_result["dry_run"] is False
    assert apply_result["imported_counts"]["source_document"] == 1
    assert apply_result["imported_counts"]["recall_note"] == 1
    assert apply_result["imported_counts"]["review_card"] >= 1
    assert apply_result["imported_counts"]["study_answer_attempt"] == 1
    assert apply_result["imported_counts"]["study_review_session"] == 1
    assert apply_result["imported_counts"]["attachment"] == 1
    assert apply_result["integrity"]["ok"] is True

    documents_response = restore_client.get("/api/documents", params={"query": "portable restore"})
    assert documents_response.status_code == 200
    assert [item["id"] for item in documents_response.json()] == [document["id"]]

    attachments_response = restore_client.get("/api/workspace/attachments")
    assert attachments_response.status_code == 200
    assert len(attachments_response.json()) == 1
    download_response = restore_client.get(f"/api/workspace/attachments/{attachments_response.json()[0]['id']}")
    assert download_response.status_code == 200
    assert download_response.content == raw_bytes

    notes_response = restore_client.get(f"/api/recall/documents/{document['id']}/notes")
    assert notes_response.status_code == 200
    assert notes_response.json()[0]["body_text"] == "Restored portable note."

    graph_snapshot_response = restore_client.get("/api/recall/graph")
    assert graph_snapshot_response.status_code == 200
    assert any(node["label"] == "Restored graph node" for node in graph_snapshot_response.json()["nodes"])

    study_cards_response = restore_client.get(
        "/api/recall/study/cards",
        params={"status": "all", "source_document_id": document["id"]},
    )
    assert study_cards_response.status_code == 200
    assert any(card["prompt"] == "What should restore?" for card in study_cards_response.json())

    progress_response = restore_client.get(
        "/api/recall/study/progress",
        params={"source_document_id": document["id"]},
    )
    assert progress_response.status_code == 200
    progress = progress_response.json()
    assert progress["total_attempts"] == 1
    assert progress["correct_attempts"] == 1
    assert progress["recent_sessions"]

    second_apply_response = restore_client.post(
        "/api/workspace/import-apply",
        data={"restore_confirmation": "restore-missing-items"},
        files={"file": ("restore-workspace.zip", bundle, "application/zip")},
    )
    assert second_apply_response.status_code == 200
    second_apply = second_apply_response.json()
    assert second_apply["imported_counts"] == {}
    assert second_apply["skipped_counts"]["source_document"] >= 1


def test_workspace_integrity_and_repair_rebuild_fts_indexes(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import_response = client.post(
        "/api/documents/import-text",
        json={"title": "Integrity guide", "text": "Knowledge Graphs support grounded retrieval practice."},
    )
    assert import_response.status_code == 200
    document = import_response.json()

    workspace_db = tmp_path / ".data" / "workspace.db"
    with sqlite3.connect(workspace_db) as connection:
        connection.execute("DELETE FROM source_documents_fts")
        connection.execute("DELETE FROM content_chunks_fts")
        connection.commit()

    integrity_response = client.get("/api/workspace/integrity")
    assert integrity_response.status_code == 200
    integrity = integrity_response.json()
    issue_codes = {issue["code"] for issue in integrity["issues"]}
    assert "source_documents_fts_drift" in issue_codes
    assert "content_chunks_fts_drift" in issue_codes
    assert integrity["ok"] is False

    repair_response = client.post("/api/workspace/repair")
    assert repair_response.status_code == 200
    repair = repair_response.json()
    assert any(action.startswith("rebuild_source_documents_fts:") for action in repair["actions"])
    assert any(action.startswith("rebuild_content_chunks_fts:") for action in repair["actions"])
    assert repair["report"]["ok"] is True

    search_response = client.get("/api/recall/search", params={"query": "grounded"})
    assert search_response.status_code == 200
    assert search_response.json()

    list_response = client.get("/api/documents", params={"query": "Integrity"})
    assert list_response.status_code == 200
    assert [item["id"] for item in list_response.json()] == [document["id"]]


def test_workspace_manifest_warns_when_attachment_payload_is_missing(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    raw_bytes = b"Missing attachment payload."
    import_response = client.post(
        "/api/documents/import-file",
        files={"file": ("missing.txt", raw_bytes, "text/plain")},
    )
    assert import_response.status_code == 200
    document = import_response.json()

    stored_file = tmp_path / ".data" / "files" / f"{document['id']}.txt"
    stored_file.unlink()
    with sqlite3.connect(tmp_path / ".data" / "workspace.db") as connection:
        connection.execute("DELETE FROM document_variants WHERE source_document_id = ?", (document["id"],))
        connection.commit()

    integrity_response = client.get("/api/workspace/integrity")
    assert integrity_response.status_code == 200
    integrity = integrity_response.json()
    missing_issue = next(issue for issue in integrity["issues"] if issue["code"] == "missing_attachment_payloads")
    assert missing_issue["severity"] == "warning"
    assert missing_issue["repairable"] is False

    manifest_response = client.get("/api/workspace/export.manifest.json")
    assert manifest_response.status_code == 200
    manifest = manifest_response.json()
    assert manifest["attachments"] == []
    assert manifest["warnings"]
    assert "Missing attachment payload" in manifest["warnings"][0]
    assert any("Missing reflowed/default view for learning-pack export" in warning for warning in manifest["warnings"])

    bundle_response = client.get("/api/workspace/export.zip")
    assert bundle_response.status_code == 200
    with ZipFile(BytesIO(bundle_response.content)) as archive:
        manifest_in_archive = json.loads(archive.read("manifest.json").decode("utf-8"))
        assert manifest_in_archive["warnings"] == manifest["warnings"]


def test_workspace_merge_preview_returns_deterministic_decisions(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import_response = client.post(
        "/api/documents/import-file",
        files={"file": ("merge.txt", b"Merge preview content.", "text/plain")},
    )
    assert import_response.status_code == 200
    document = import_response.json()

    settings_response = client.put(
        "/api/settings",
        json={
            "font_preset": "atkinson",
            "text_size": 24,
            "line_spacing": 1.8,
            "line_width": 70,
            "contrast_theme": "high",
            "focus_mode": False,
            "preferred_voice": "default",
            "speech_rate": 1.0,
        },
    )
    assert settings_response.status_code == 200

    progress_response = client.put(
        f"/api/documents/{document['id']}/progress",
        json={"mode": "reflowed", "sentence_index": 1},
    )
    assert progress_response.status_code == 200

    view_response = client.get(
        f"/api/documents/{document['id']}/view",
        params={"mode": "reflowed", "detail_level": "default"},
    )
    assert view_response.status_code == 200
    note_response = client.post(
        f"/api/recall/documents/{document['id']}/notes",
        json={"anchor": build_note_anchor(document["id"], view_response.json()), "body_text": "Portable merge note."},
    )
    assert note_response.status_code == 200

    manifest_response = client.get("/api/workspace/export.manifest.json")
    assert manifest_response.status_code == 200
    remote_manifest = json.loads(json.dumps(manifest_response.json()))

    source_entity = next(entity for entity in remote_manifest["entities"] if entity["entity_type"] == "source_document")
    source_entity["payload_digest"] = "f" * 64
    source_entity["updated_at"] = "2030-01-01T00:00:00+00:00"

    variant_entity = next(entity for entity in remote_manifest["entities"] if entity["entity_type"] == "document_variant")
    variant_entity["payload_digest"] = "0" * 64
    variant_entity["updated_at"] = "2020-01-01T00:00:00+00:00"

    note_entity = next(entity for entity in remote_manifest["entities"] if entity["entity_type"] == "recall_note")
    note_entity["payload_digest"] = "b" * 64
    note_entity["updated_at"] = "2030-01-01T00:00:00+00:00"

    setting_entity = next(entity for entity in remote_manifest["entities"] if entity["entity_type"] == "app_setting")
    imported_entity = {
        "entity_type": "app_setting",
        "entity_key": "app_setting:reader-remote",
        "entity_id": "reader-remote",
        "updated_at": "2030-01-02T00:00:00+00:00",
        "payload_digest": "a" * 64,
        "source_document_id": None,
        "metadata": {"namespace": "reader-remote"},
    }
    remote_manifest["entities"].append(imported_entity)
    imported_note_entity = {
        "entity_type": "recall_note",
        "entity_key": "recall_note:remote-portable",
        "entity_id": "note-remote",
        "updated_at": "2030-01-04T00:00:00+00:00",
        "payload_digest": "d" * 64,
        "source_document_id": document["id"],
        "metadata": {
            "block_id": "block-remote",
            "created_at": "2030-01-04T00:00:00+00:00",
            "excerpt_text": "Remote portable note.",
        },
    }
    remote_manifest["entities"].append(imported_note_entity)

    remote_manifest["attachments"][0]["content_digest"] = "e" * 64
    remote_manifest["attachments"][0]["updated_at"] = "2030-01-03T00:00:00+00:00"

    preview_response = client.post("/api/workspace/merge-preview", json={"manifest": remote_manifest})
    assert preview_response.status_code == 200
    preview = preview_response.json()

    operations = {
        (operation["entity_type"], operation["entity_key"]): operation
        for operation in preview["operations"]
    }
    assert operations[(source_entity["entity_type"], source_entity["entity_key"])]["decision"] == "prefer_remote"
    assert operations[(variant_entity["entity_type"], variant_entity["entity_key"])]["decision"] == "keep_local"
    assert operations[(note_entity["entity_type"], note_entity["entity_key"])]["decision"] == "prefer_remote"
    assert operations[(setting_entity["entity_type"], setting_entity["entity_key"])]["decision"] == "skip_equal"
    assert operations[(imported_entity["entity_type"], imported_entity["entity_key"])]["decision"] == "import_remote"
    assert operations[(imported_note_entity["entity_type"], imported_note_entity["entity_key"])]["decision"] == "import_remote"
    attachment_key = remote_manifest["attachments"][0]["logical_key"]
    assert operations[("attachment", attachment_key)]["decision"] == "prefer_remote"

    assert preview["summary"]["import_remote"] >= 1
    assert preview["summary"]["keep_local"] >= 1
    assert preview["summary"]["prefer_remote"] >= 1
    assert preview["summary"]["skip_equal"] >= 1

    manifest_upload_response = client.post(
        "/api/workspace/import-preview",
        files={"file": ("manifest.json", json.dumps(remote_manifest).encode("utf-8"), "application/json")},
    )
    assert manifest_upload_response.status_code == 200
    manifest_upload_preview = manifest_upload_response.json()
    assert manifest_upload_preview["dry_run"] is True
    assert manifest_upload_preview["applied"] is False
    assert manifest_upload_preview["can_apply"] is False
    assert "raw manifest files are preview-only" in manifest_upload_preview["apply_blockers"][0]
    assert manifest_upload_preview["backup"]["source_kind"] == "manifest"
    assert manifest_upload_preview["backup"]["bundle_coverage_available"] is False
    assert manifest_upload_preview["backup"]["entity_counts"] == remote_manifest["entity_counts"]
    assert manifest_upload_preview["merge_preview"]["summary"]["import_remote"] >= 1


def test_workspace_import_preview_rejects_invalid_backups(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)

    invalid_zip_response = client.post(
        "/api/workspace/import-preview",
        files={"file": ("not-a-backup.zip", b"not a zip", "application/zip")},
    )
    assert invalid_zip_response.status_code == 400
    assert "workspace ZIP" in invalid_zip_response.json()["detail"]

    zip_without_manifest = BytesIO()
    with ZipFile(zip_without_manifest, "w") as archive:
        archive.writestr("sources/example/learning-pack.md", "# Example")
    missing_manifest_response = client.post(
        "/api/workspace/import-preview",
        files={"file": ("missing-manifest.zip", zip_without_manifest.getvalue(), "application/zip")},
    )
    assert missing_manifest_response.status_code == 400
    assert "missing manifest.json" in missing_manifest_response.json()["detail"]

    invalid_manifest_response = client.post(
        "/api/workspace/import-preview",
        files={"file": ("manifest.json", b"{", "application/json")},
    )
    assert invalid_manifest_response.status_code == 400
    assert "valid workspace export manifest" in invalid_manifest_response.json()["detail"]

    apply_without_confirmation_response = client.post(
        "/api/workspace/import-apply",
        data={"restore_confirmation": "nope"},
        files={"file": ("not-a-backup.zip", b"not a zip", "application/zip")},
    )
    assert apply_without_confirmation_response.status_code == 400
    assert "Confirm restore-missing-items" in apply_without_confirmation_response.json()["detail"]

    manifest_response = client.get("/api/workspace/export.manifest.json")
    assert manifest_response.status_code == 200
    zip_without_data = BytesIO()
    with ZipFile(zip_without_data, "w") as archive:
        archive.writestr("manifest.json", json.dumps(manifest_response.json()))
    apply_old_zip_response = client.post(
        "/api/workspace/import-apply",
        data={"restore_confirmation": "restore-missing-items"},
        files={"file": ("old-workspace.zip", zip_without_data.getvalue(), "application/zip")},
    )
    assert apply_old_zip_response.status_code == 400
    assert "workspace-data.json" in apply_old_zip_response.json()["detail"]


def test_startup_repair_recovers_drifted_workspace(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import_response = client.post(
        "/api/documents/import-text",
        json={"title": "Startup repair guide", "text": "Recovery paths keep retrieval grounded and durable."},
    )
    assert import_response.status_code == 200
    client.__exit__(None, None, None)

    workspace_db = tmp_path / ".data" / "workspace.db"
    with sqlite3.connect(workspace_db) as connection:
        connection.execute("DELETE FROM source_documents_fts")
        connection.execute("DELETE FROM content_chunks_fts")
        connection.commit()

    reopened_client = create_client(tmp_path, monkeypatch)
    integrity_response = reopened_client.get("/api/workspace/integrity")
    assert integrity_response.status_code == 200
    assert integrity_response.json()["ok"] is True

    search_response = reopened_client.get("/api/recall/search", params={"query": "durable"})
    assert search_response.status_code == 200
    assert search_response.json()


def test_recall_graph_summary_and_manual_decision_flow(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import_response = client.post(
        "/api/documents/import-text",
        json={
            "title": "Graph guide",
            "text": (
                "Recall Workspace uses Knowledge Graphs. "
                "Knowledge Graphs support Study Cards."
            ),
        },
    )
    assert import_response.status_code == 200

    graph_response = client.get("/api/recall/graph")
    assert graph_response.status_code == 200
    graph = graph_response.json()
    assert graph["nodes"]
    assert graph["edges"]

    knowledge_node = next(
        node for node in graph["nodes"] if node["label"] == "Knowledge Graphs"
    )
    assert knowledge_node["mention_count"] >= 1

    uses_edge = next(
        edge
        for edge in graph["edges"]
        if edge["relation_type"] == "uses"
        and edge["source_label"] == "Recall Workspace"
        and edge["target_label"] == "Knowledge Graphs"
    )

    detail_response = client.get(f"/api/recall/graph/nodes/{knowledge_node['id']}")
    assert detail_response.status_code == 200
    detail = detail_response.json()
    assert detail["mentions"]
    assert detail["outgoing_edges"] or detail["incoming_edges"]

    decision_response = client.post(
        f"/api/recall/graph/edges/{uses_edge['id']}/decision",
        json={"decision": "confirmed"},
    )
    assert decision_response.status_code == 200
    decided_edge = decision_response.json()
    assert decided_edge["status"] == "confirmed"
    assert decided_edge["provenance"] == "manual"

    refreshed_graph_response = client.get("/api/recall/graph")
    assert refreshed_graph_response.status_code == 200
    assert refreshed_graph_response.json()["confirmed_edges"] >= 1


def test_recall_hybrid_retrieval_and_study_review_cycle(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import_response = client.post(
        "/api/documents/import-text",
        json={
            "title": "Study guide",
            "text": (
                "Recall Workspace uses Knowledge Graphs. "
                "Knowledge Graphs support Study Cards. "
                "Study Cards keep review sessions grounded in source chunks."
            ),
        },
    )
    assert import_response.status_code == 200

    retrieval_response = client.get(
        "/api/recall/retrieve",
        params={"query": "Recall Workspace"},
    )
    assert retrieval_response.status_code == 200
    retrieval_hits = retrieval_response.json()
    assert retrieval_hits
    assert {hit["hit_type"] for hit in retrieval_hits}.issubset({"chunk", "node", "card"})
    assert any(hit["hit_type"] == "node" for hit in retrieval_hits)
    assert any("lexical overlap" in hit["reasons"] for hit in retrieval_hits)

    overview_response = client.get("/api/recall/study/overview")
    assert overview_response.status_code == 200
    overview = overview_response.json()
    assert overview["new_count"] >= 1

    cards_response = client.get("/api/recall/study/cards", params={"status": "all"})
    assert cards_response.status_code == 200
    cards = cards_response.json()
    assert cards
    assert cards[0]["status"] == "new"

    regenerate_response = client.post("/api/recall/study/cards/generate")
    assert regenerate_response.status_code == 200
    assert regenerate_response.json()["total_count"] >= len(cards)

    review_response = client.post(
        f"/api/recall/study/cards/{cards[0]['id']}/review",
        json={"rating": "good"},
    )
    assert review_response.status_code == 200
    reviewed_card = review_response.json()
    assert reviewed_card["review_count"] == 1
    assert reviewed_card["last_rating"] == "good"
    assert reviewed_card["status"] in {"due", "scheduled"}
    assert reviewed_card["knowledge_stage"] in {"learning", "practiced", "confident", "mastered"}

    refreshed_overview_response = client.get("/api/recall/study/overview")
    assert refreshed_overview_response.status_code == 200
    assert refreshed_overview_response.json()["review_event_count"] >= 1

    progress_response = client.get("/api/recall/study/progress")
    assert progress_response.status_code == 200
    progress = progress_response.json()
    assert progress["total_reviews"] >= 1
    assert progress["today_count"] >= 1
    assert progress["current_daily_streak"] >= 1
    assert progress["recent_reviews"][0]["review_card_id"] == cards[0]["id"]
    assert progress["recent_reviews"][0]["rating"] == "good"
    assert sum(entry["count"] for entry in progress["knowledge_stage_counts"]) >= 1


def test_recall_study_generation_controls_scope_types_and_payloads(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    first_import_response = client.post(
        "/api/documents/import-text",
        json={
            "title": "Typed quiz generation guide",
            "text": (
                "Active Recall uses Spaced Repetition. "
                "Retrieval Practice supports Long Term Memory. "
                "Interleaving includes Mixed Topics. "
                "Study Cards keep review sessions grounded in source evidence."
            ),
        },
    )
    assert first_import_response.status_code == 200
    first_document = first_import_response.json()
    second_import_response = client.post(
        "/api/documents/import-text",
        json={
            "title": "Preserved manual source",
            "text": "Manual source questions should survive generation for other sources.",
        },
    )
    assert second_import_response.status_code == 200
    second_document = second_import_response.json()

    manual_response = client.post(
        "/api/recall/study/cards",
        json={
            "source_document_id": second_document["id"],
            "prompt": "Which source owns this manual card?",
            "answer": "The preserved manual source.",
            "card_type": "flashcard",
        },
    )
    assert manual_response.status_code == 200
    manual_card = manual_response.json()

    all_types_response = client.post(
        "/api/recall/study/cards/generate",
        json={"source_document_id": first_document["id"], "max_per_source": 7},
    )
    assert all_types_response.status_code == 200
    all_types_result = all_types_response.json()
    assert all_types_result["source_document_id"] == first_document["id"]
    assert "relation" not in all_types_result["total_by_type"]
    assert "cloze" not in all_types_result["total_by_type"]

    cards_after_all_types = client.get(
        "/api/recall/study/cards",
        params={"status": "all", "limit": 100},
    ).json()
    first_source_cards = [
        card for card in cards_after_all_types if card["source_document_id"] == first_document["id"]
    ]
    preserved_unrequested_card = next(
        card for card in first_source_cards if card["card_type"] != "short_answer"
    )

    selected_response = client.post(
        "/api/recall/study/cards/generate",
        json={
            "source_document_id": first_document["id"],
            "question_types": ["multiple_choice", "fill_in_blank"],
            "max_per_source": 3,
        },
    )
    assert selected_response.status_code == 200
    selected_result = selected_response.json()
    assert selected_result["source_document_id"] == first_document["id"]
    assert selected_result["question_types"] == ["multiple_choice", "fill_in_blank"]
    assert selected_result["total_count"] <= 3
    assert set(selected_result["total_by_type"]).issubset({"multiple_choice", "fill_in_blank"})

    cards_after_selected = client.get(
        "/api/recall/study/cards",
        params={"status": "all", "limit": 100},
    ).json()
    structured_cards = [
        card
        for card in cards_after_selected
        if card["source_document_id"] == first_document["id"]
        and card["card_type"] in {"multiple_choice", "fill_in_blank"}
    ]
    assert structured_cards
    assert all("generated_question_payload" in card["scheduling_state"] for card in structured_cards)
    assert all(
        card["question_payload"]["kind"] == card["scheduling_state"]["generated_question_payload"]["kind"]
        for card in structured_cards
    )
    generated_choice_text = structured_cards[0]["question_payload"]["choices"][0]["text"]
    retrieval_response = client.get(
        "/api/recall/retrieve",
        params={"query": generated_choice_text, "limit": 50},
    )
    assert retrieval_response.status_code == 200
    structured_card_ids = {card["id"] for card in structured_cards}
    assert any(hit.get("card_id") in structured_card_ids for hit in retrieval_response.json())
    assert any(card["id"] == preserved_unrequested_card["id"] for card in cards_after_selected)
    assert any(card["id"] == manual_card["id"] for card in cards_after_selected)


def test_recall_study_card_schedule_state_controls(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import_response = client.post(
        "/api/documents/import-text",
        json={
            "title": "Manual scheduling guide",
            "text": (
                "Manual scheduling keeps recall questions available when the learner chooses. "
                "Unscheduled questions should leave the review queue until their pause expires."
            ),
        },
    )
    assert import_response.status_code == 200

    cards_response = client.get("/api/recall/study/cards", params={"status": "all", "limit": 100})
    assert cards_response.status_code == 200
    cards = cards_response.json()
    assert cards
    card_id = cards[0]["id"]

    unschedule_response = client.post(
        f"/api/recall/study/cards/{card_id}/schedule-state",
        json={"action": "unschedule"},
    )
    assert unschedule_response.status_code == 200
    unscheduled_card = unschedule_response.json()
    assert unscheduled_card["status"] == "unscheduled"
    assert unscheduled_card["scheduling_state"]["manual_schedule_state"] == "unscheduled"
    unscheduled_at = datetime.fromisoformat(unscheduled_card["scheduling_state"]["unscheduled_at"])
    unscheduled_until = datetime.fromisoformat(unscheduled_card["scheduling_state"]["unscheduled_until"])
    assert timedelta(days=6, hours=23) < unscheduled_until - unscheduled_at < timedelta(days=7, minutes=1)

    unscheduled_list_response = client.get("/api/recall/study/cards", params={"status": "unscheduled", "limit": 100})
    assert unscheduled_list_response.status_code == 200
    assert any(card["id"] == card_id for card in unscheduled_list_response.json())

    schedule_response = client.post(
        f"/api/recall/study/cards/{card_id}/schedule-state",
        json={"action": "schedule"},
    )
    assert schedule_response.status_code == 200
    scheduled_now_card = schedule_response.json()
    assert scheduled_now_card["status"] == "new"
    assert "manual_schedule_state" not in scheduled_now_card["scheduling_state"]
    assert "unscheduled_until" not in scheduled_now_card["scheduling_state"]

    review_response = client.post(
        f"/api/recall/study/cards/{card_id}/review",
        json={"rating": "good"},
    )
    assert review_response.status_code == 200
    reviewed_card = review_response.json()
    assert reviewed_card["review_count"] == 1
    assert reviewed_card["status"] in {"due", "scheduled"}

    progress_before = client.get("/api/recall/study/progress").json()
    reviewed_unschedule_response = client.post(
        f"/api/recall/study/cards/{card_id}/schedule-state",
        json={"action": "unschedule"},
    )
    assert reviewed_unschedule_response.status_code == 200
    assert reviewed_unschedule_response.json()["status"] == "unscheduled"
    progress_after = client.get("/api/recall/study/progress").json()
    assert progress_after["total_reviews"] == progress_before["total_reviews"]
    assert progress_after["recent_reviews"][0]["review_card_id"] == card_id

    from app import main as main_module

    expired_state = reviewed_unschedule_response.json()["scheduling_state"]
    expired_state["unscheduled_until"] = (datetime.now(UTC) - timedelta(minutes=1)).isoformat()
    with main_module.repository.connect() as connection:
        connection.execute(
            """
            UPDATE review_cards
            SET scheduling_state_json = ?
            WHERE id = ?
            """,
            (json.dumps(expired_state, sort_keys=True), card_id),
        )

    expired_cards_response = client.get("/api/recall/study/cards", params={"status": "all", "limit": 100})
    assert expired_cards_response.status_code == 200
    expired_card = next(card for card in expired_cards_response.json() if card["id"] == card_id)
    assert expired_card["status"] in {"due", "scheduled"}

    reviewed_schedule_response = client.post(
        f"/api/recall/study/cards/{card_id}/schedule-state",
        json={"action": "schedule"},
    )
    assert reviewed_schedule_response.status_code == 200
    rescheduled_card = reviewed_schedule_response.json()
    assert rescheduled_card["status"] == "due"
    assert "unscheduled_at" not in rescheduled_card["scheduling_state"]


def test_recall_study_card_edit_and_soft_delete_management(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    for index in range(3):
        import_response = client.post(
            "/api/documents/import-text",
            json={
                "title": f"Question management guide {index}",
                "text": (
                    f"Question management topic {index} keeps Study cards editable and removable. "
                    f"Bulk deletion should hide selected questions without deleting source material. "
                    f"Edited generated questions should survive a later regeneration pass for topic {index}."
                ),
            },
        )
        assert import_response.status_code == 200

    cards_response = client.get("/api/recall/study/cards", params={"status": "all", "limit": 100})
    assert cards_response.status_code == 200
    cards = cards_response.json()
    assert len(cards) >= 3
    edited_id = cards[0]["id"]
    deleted_id = cards[1]["id"]
    bulk_deleted_id = cards[2]["id"]

    blank_response = client.patch(
        f"/api/recall/study/cards/{edited_id}",
        json={"prompt": "   ", "answer": "Still blank"},
    )
    assert blank_response.status_code == 422

    edit_response = client.patch(
        f"/api/recall/study/cards/{edited_id}",
        json={
            "prompt": " What should the edited Study question preserve? ",
            "answer": " Manual prompt and answer edits. ",
        },
    )
    assert edit_response.status_code == 200
    edited_card = edit_response.json()
    assert edited_card["prompt"] == "What should the edited Study question preserve?"
    assert edited_card["answer"] == "Manual prompt and answer edits."
    assert "manual_content_edited_at" in edited_card["scheduling_state"]

    regenerate_response = client.post("/api/recall/study/cards/generate")
    assert regenerate_response.status_code == 200
    regenerated_cards = client.get("/api/recall/study/cards", params={"status": "all", "limit": 100}).json()
    regenerated_edited_card = next(card for card in regenerated_cards if card["id"] == edited_id)
    assert regenerated_edited_card["prompt"] == "What should the edited Study question preserve?"
    assert regenerated_edited_card["answer"] == "Manual prompt and answer edits."

    review_response = client.post(
        f"/api/recall/study/cards/{deleted_id}/review",
        json={"rating": "good"},
    )
    assert review_response.status_code == 200
    progress_before_delete = client.get("/api/recall/study/progress").json()
    assert progress_before_delete["total_reviews"] == 1

    delete_response = client.delete(f"/api/recall/study/cards/{deleted_id}")
    assert delete_response.status_code == 200
    assert delete_response.json() == {"id": deleted_id, "deleted": True}

    cards_after_delete = client.get("/api/recall/study/cards", params={"status": "all", "limit": 100}).json()
    assert all(card["id"] != deleted_id for card in cards_after_delete)
    assert client.post(f"/api/recall/study/cards/{deleted_id}/review", json={"rating": "easy"}).status_code == 404
    assert client.post(
        f"/api/recall/study/cards/{deleted_id}/schedule-state",
        json={"action": "schedule"},
    ).status_code == 404
    assert client.patch(
        f"/api/recall/study/cards/{deleted_id}",
        json={"prompt": "Restore?", "answer": "No"},
    ).status_code == 404

    progress_after_delete = client.get("/api/recall/study/progress").json()
    assert progress_after_delete["total_reviews"] == 0
    assert progress_after_delete["recent_reviews"] == []

    bulk_response = client.post(
        "/api/recall/study/cards/bulk-delete",
        json={"card_ids": [bulk_deleted_id, "missing-card"]},
    )
    assert bulk_response.status_code == 200
    bulk_result = bulk_response.json()
    assert bulk_result["deleted_ids"] == [bulk_deleted_id]
    assert bulk_result["missing_ids"] == ["missing-card"]

    regenerate_after_delete_response = client.post("/api/recall/study/cards/generate")
    assert regenerate_after_delete_response.status_code == 200
    final_cards = client.get("/api/recall/study/cards", params={"status": "all", "limit": 100}).json()
    final_ids = {card["id"] for card in final_cards}
    assert deleted_id not in final_ids
    assert bulk_deleted_id not in final_ids
    assert next(card for card in final_cards if card["id"] == edited_id)["prompt"] == "What should the edited Study question preserve?"


def test_recall_study_manual_question_creation_preserves_source_owned_cards(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    missing_source_response = client.post(
        "/api/recall/study/cards",
        json={
            "source_document_id": "missing-source",
            "prompt": "What is missing?",
            "answer": "A saved source.",
        },
    )
    assert missing_source_response.status_code == 404

    import_response = client.post(
        "/api/documents/import-text",
        json={
            "title": "Manual card source",
            "text": (
                "Manual Study questions stay grounded to saved sources. "
                "A flashcard can be scheduled, reviewed, edited, or deleted without changing source content."
            ),
        },
    )
    assert import_response.status_code == 200
    document = import_response.json()

    blank_response = client.post(
        "/api/recall/study/cards",
        json={
            "source_document_id": document["id"],
            "prompt": "   ",
            "answer": "Manual answer",
        },
    )
    assert blank_response.status_code == 422

    create_response = client.post(
        "/api/recall/study/cards",
        json={
            "source_document_id": document["id"],
            "prompt": " Which manual card type is supported? ",
            "answer": " Flashcard. ",
            "card_type": "flashcard",
        },
    )
    assert create_response.status_code == 200
    created_card = create_response.json()
    assert created_card["id"].startswith("card:manual:")
    assert created_card["source_document_id"] == document["id"]
    assert created_card["document_title"] == "Manual card source"
    assert created_card["prompt"] == "Which manual card type is supported?"
    assert created_card["answer"] == "Flashcard."
    assert created_card["card_type"] == "flashcard"
    assert created_card["status"] == "new"
    assert created_card["review_count"] == 0
    assert created_card["knowledge_stage"] == "new"
    assert created_card["scheduling_state"]["manual_content_created_at"]
    assert created_card["scheduling_state"]["manual_content_edited_at"]
    assert created_card["scheduling_state"]["manual_card_type"] == "flashcard"
    assert created_card["source_spans"][0]["manual_source"] == "study_manual"

    default_type_response = client.post(
        "/api/recall/study/cards",
        json={
            "source_document_id": document["id"],
            "prompt": "What is the default manual type?",
            "answer": "Short answer.",
        },
    )
    assert default_type_response.status_code == 200
    assert default_type_response.json()["card_type"] == "short_answer"

    other_import_response = client.post(
        "/api/documents/import-text",
        json={
            "title": "Other manual card source",
            "text": "This source owns a separate Study question for source-scoped card list reads.",
        },
    )
    assert other_import_response.status_code == 200
    other_document = other_import_response.json()
    other_card_response = client.post(
        "/api/recall/study/cards",
        json={
            "source_document_id": other_document["id"],
            "prompt": "Which source owns this card?",
            "answer": "The other source.",
        },
    )
    assert other_card_response.status_code == 200

    list_response = client.get("/api/recall/study/cards", params={"status": "all", "limit": 100})
    assert list_response.status_code == 200
    listed_cards = list_response.json()
    assert any(card["id"] == created_card["id"] for card in listed_cards)

    scoped_list_response = client.get(
        "/api/recall/study/cards",
        params={"status": "all", "limit": 100, "source_document_id": document["id"]},
    )
    assert scoped_list_response.status_code == 200
    scoped_cards = scoped_list_response.json()
    assert {card["source_document_id"] for card in scoped_cards} == {document["id"]}
    assert any(card["id"] == created_card["id"] for card in scoped_cards)
    assert all(card["id"] != other_card_response.json()["id"] for card in scoped_cards)

    progress_response = client.get("/api/recall/study/progress", params={"source_document_id": document["id"]})
    assert progress_response.status_code == 200
    progress = progress_response.json()
    assert progress["scope_source_document_id"] == document["id"]
    assert any(entry["stage"] == "new" and entry["count"] >= 2 for entry in progress["knowledge_stage_counts"])

    retrieve_response = client.get("/api/recall/retrieve", params={"query": "Which manual card type"})
    assert retrieve_response.status_code == 200
    assert any(hit.get("card_id") == created_card["id"] for hit in retrieve_response.json())

    regenerate_response = client.post("/api/recall/study/cards/generate")
    assert regenerate_response.status_code == 200
    regenerated_cards = client.get("/api/recall/study/cards", params={"status": "all", "limit": 100}).json()
    regenerated_manual_card = next(card for card in regenerated_cards if card["id"] == created_card["id"])
    assert regenerated_manual_card["prompt"] == "Which manual card type is supported?"
    assert regenerated_manual_card["card_type"] == "flashcard"

    unschedule_response = client.post(
        f"/api/recall/study/cards/{created_card['id']}/schedule-state",
        json={"action": "unschedule"},
    )
    assert unschedule_response.status_code == 200
    assert unschedule_response.json()["status"] == "unscheduled"
    schedule_response = client.post(
        f"/api/recall/study/cards/{created_card['id']}/schedule-state",
        json={"action": "schedule"},
    )
    assert schedule_response.status_code == 200
    assert schedule_response.json()["status"] == "new"

    review_response = client.post(
        f"/api/recall/study/cards/{created_card['id']}/review",
        json={"rating": "easy"},
    )
    assert review_response.status_code == 200
    assert review_response.json()["last_rating"] == "easy"

    delete_response = client.delete(f"/api/recall/study/cards/{created_card['id']}")
    assert delete_response.status_code == 200
    final_cards = client.get("/api/recall/study/cards", params={"status": "all", "limit": 100}).json()
    assert all(card["id"] != created_card["id"] for card in final_cards)


def test_recall_study_choice_question_types_validate_and_review(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import_response = client.post(
        "/api/documents/import-text",
        json={
            "title": "Choice card source",
            "text": (
                "Choice Study questions can ask about retrieval practice, active recall, "
                "and true false scheduling while staying grounded to a saved source."
            ),
        },
    )
    assert import_response.status_code == 200
    document = import_response.json()

    missing_payload_response = client.post(
        "/api/recall/study/cards",
        json={
            "source_document_id": document["id"],
            "prompt": "Which answer is missing choices?",
            "answer": "Active recall",
            "card_type": "multiple_choice",
        },
    )
    assert missing_payload_response.status_code == 400

    duplicate_choice_response = client.post(
        "/api/recall/study/cards",
        json={
            "source_document_id": document["id"],
            "prompt": "Which duplicate should fail?",
            "answer": "Active recall",
            "card_type": "multiple_choice",
            "question_payload": {
                "kind": "multiple_choice",
                "choices": [
                    {"id": "a", "text": "Active recall"},
                    {"id": "b", "text": "active recall"},
                ],
                "correct_choice_id": "a",
            },
        },
    )
    assert duplicate_choice_response.status_code == 400

    create_mc_response = client.post(
        "/api/recall/study/cards",
        json={
            "source_document_id": document["id"],
            "prompt": "Which practice asks you to retrieve from memory?",
            "answer": "This value is normalized from the correct choice",
            "card_type": "multiple_choice",
            "question_payload": {
                "kind": "multiple_choice",
                "choices": [
                    {"id": "a", "text": "Passive rereading"},
                    {"id": "b", "text": "Active recall"},
                    {"id": "c", "text": "Highlighting only"},
                ],
                "correct_choice_id": "b",
            },
        },
    )
    assert create_mc_response.status_code == 200
    multiple_choice_card = create_mc_response.json()
    assert multiple_choice_card["card_type"] == "multiple_choice"
    assert multiple_choice_card["answer"] == "Active recall"
    assert multiple_choice_card["question_payload"]["kind"] == "multiple_choice"
    assert multiple_choice_card["question_payload"]["correct_choice_id"] == "b"
    assert multiple_choice_card["scheduling_state"]["manual_question_payload"]["choices"][1]["text"] == "Active recall"

    retrieve_distractor_response = client.get("/api/recall/retrieve", params={"query": "Passive rereading"})
    assert retrieve_distractor_response.status_code == 200
    assert any(hit.get("card_id") == multiple_choice_card["id"] for hit in retrieve_distractor_response.json())

    create_tf_response = client.post(
        "/api/recall/study/cards",
        json={
            "source_document_id": document["id"],
            "prompt": "True or false: review attempts are stored in Stage 940.",
            "answer": "false",
            "card_type": "true_false",
            "question_payload": {
                "kind": "true_false",
                "choices": [
                    {"id": "true", "text": "True"},
                    {"id": "false", "text": "False"},
                ],
                "correct_choice_id": "false",
            },
        },
    )
    assert create_tf_response.status_code == 200
    true_false_card = create_tf_response.json()
    assert true_false_card["card_type"] == "true_false"
    assert true_false_card["answer"] == "False"
    assert true_false_card["question_payload"]["correct_choice_id"] == "false"
    assert true_false_card["question_payload"]["choices"] == [
        {"id": "true", "text": "True"},
        {"id": "false", "text": "False"},
    ]

    update_response = client.patch(
        f"/api/recall/study/cards/{multiple_choice_card['id']}",
        json={
            "prompt": "Which practice best checks memory?",
            "answer": "Active recall",
            "question_payload": {
                "kind": "multiple_choice",
                "choices": [
                    {"id": "a", "text": "Copying notes"},
                    {"id": "b", "text": "Active recall"},
                    {"id": "c", "text": "Skipping review"},
                ],
                "correct_choice_id": "b",
            },
        },
    )
    assert update_response.status_code == 200
    updated_card = update_response.json()
    assert updated_card["prompt"] == "Which practice best checks memory?"
    assert updated_card["answer"] == "Active recall"
    assert updated_card["question_payload"]["choices"][0]["text"] == "Copying notes"
    assert updated_card["scheduling_state"]["manual_question_payload"]["choices"][0]["text"] == "Copying notes"

    schedule_response = client.post(
        f"/api/recall/study/cards/{updated_card['id']}/schedule-state",
        json={"action": "unschedule"},
    )
    assert schedule_response.status_code == 200
    assert schedule_response.json()["status"] == "unscheduled"
    reschedule_response = client.post(
        f"/api/recall/study/cards/{updated_card['id']}/schedule-state",
        json={"action": "schedule"},
    )
    assert reschedule_response.status_code == 200
    assert reschedule_response.json()["status"] == "new"

    review_response = client.post(
        f"/api/recall/study/cards/{updated_card['id']}/review",
        json={"rating": "good"},
    )
    assert review_response.status_code == 200
    assert review_response.json()["last_rating"] == "good"

    progress_response = client.get("/api/recall/study/progress", params={"source_document_id": document["id"]})
    assert progress_response.status_code == 200
    progress = progress_response.json()
    assert progress["scope_source_document_id"] == document["id"]
    assert any(source["source_document_id"] == document["id"] and source["card_count"] >= 2 for source in progress["source_breakdown"])

    regenerate_response = client.post("/api/recall/study/cards/generate")
    assert regenerate_response.status_code == 200
    regenerated_cards = client.get("/api/recall/study/cards", params={"status": "all", "limit": 100}).json()
    regenerated_mc = next(card for card in regenerated_cards if card["id"] == updated_card["id"])
    assert regenerated_mc["question_payload"]["choices"][0]["text"] == "Copying notes"

    delete_response = client.delete(f"/api/recall/study/cards/{true_false_card['id']}")
    assert delete_response.status_code == 200
    final_cards = client.get("/api/recall/study/cards", params={"status": "all", "limit": 100}).json()
    assert all(card["id"] != true_false_card["id"] for card in final_cards)


def test_recall_study_fill_in_blank_cards_validate_and_review(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import_response = client.post(
        "/api/documents/import-text",
        json={
            "title": "Fill blank card source",
            "text": (
                "Fill in the blank Study questions ask the learner to choose the missing phrase "
                "from a grounded sentence template before rating recall."
            ),
        },
    )
    assert import_response.status_code == 200
    document = import_response.json()

    missing_marker_response = client.post(
        "/api/recall/study/cards",
        json={
            "source_document_id": document["id"],
            "prompt": "Which template is invalid?",
            "answer": "active recall",
            "card_type": "fill_in_blank",
            "question_payload": {
                "kind": "fill_in_blank",
                "template": "Active recall strengthens memory.",
                "choices": [
                    {"id": "a", "text": "active recall"},
                    {"id": "b", "text": "passive rereading"},
                ],
                "correct_choice_id": "a",
            },
        },
    )
    assert missing_marker_response.status_code == 400

    duplicate_choice_response = client.post(
        "/api/recall/study/cards",
        json={
            "source_document_id": document["id"],
            "prompt": "Which duplicate should fail?",
            "answer": "active recall",
            "card_type": "fill_in_blank",
            "question_payload": {
                "kind": "fill_in_blank",
                "template": "{{blank}} strengthens memory.",
                "choices": [
                    {"id": "a", "text": "Active recall"},
                    {"id": "b", "text": "active recall"},
                ],
                "correct_choice_id": "a",
            },
        },
    )
    assert duplicate_choice_response.status_code == 400

    create_response = client.post(
        "/api/recall/study/cards",
        json={
            "source_document_id": document["id"],
            "prompt": "Which phrase completes the retrieval sentence?",
            "answer": "This value is normalized from the correct blank choice",
            "card_type": "fill_in_blank",
            "question_payload": {
                "kind": "fill_in_blank",
                "template": "{{blank}} strengthens memory better than rereading.",
                "choices": [
                    {"id": "a", "text": "Passive rereading"},
                    {"id": "b", "text": "Active recall"},
                    {"id": "c", "text": "Skipping review"},
                ],
                "correct_choice_id": "b",
            },
        },
    )
    assert create_response.status_code == 200
    fill_card = create_response.json()
    assert fill_card["card_type"] == "fill_in_blank"
    assert fill_card["answer"] == "Active recall"
    assert fill_card["question_payload"]["kind"] == "fill_in_blank"
    assert fill_card["question_payload"]["template"] == "{{blank}} strengthens memory better than rereading."
    assert fill_card["question_payload"]["correct_choice_id"] == "b"
    assert fill_card["scheduling_state"]["manual_question_payload"]["choices"][1]["text"] == "Active recall"

    scoped_list_response = client.get(
        "/api/recall/study/cards",
        params={"status": "all", "limit": 100},
    )
    assert scoped_list_response.status_code == 200
    assert any(card["id"] == fill_card["id"] for card in scoped_list_response.json())

    retrieve_template_response = client.get(
        "/api/recall/retrieve",
        params={"query": "strengthens memory better"},
    )
    assert retrieve_template_response.status_code == 200
    assert any(hit.get("card_id") == fill_card["id"] for hit in retrieve_template_response.json())

    update_response = client.patch(
        f"/api/recall/study/cards/{fill_card['id']}",
        json={
            "prompt": "Which phrase completes the updated sentence?",
            "answer": "Active recall",
            "question_payload": {
                "kind": "fill_in_blank",
                "template": "Durable memory improves with {{blank}}.",
                "choices": [
                    {"id": "a", "text": "Copying notes"},
                    {"id": "b", "text": "Active recall"},
                    {"id": "c", "text": "Skipping review"},
                ],
                "correct_choice_id": "b",
            },
        },
    )
    assert update_response.status_code == 200
    updated_card = update_response.json()
    assert updated_card["answer"] == "Active recall"
    assert updated_card["question_payload"]["template"] == "Durable memory improves with {{blank}}."
    assert updated_card["question_payload"]["choices"][0]["text"] == "Copying notes"

    review_response = client.post(
        f"/api/recall/study/cards/{updated_card['id']}/review",
        json={"rating": "good"},
    )
    assert review_response.status_code == 200
    assert review_response.json()["last_rating"] == "good"

    progress_response = client.get("/api/recall/study/progress", params={"source_document_id": document["id"]})
    assert progress_response.status_code == 200
    assert any(
        source["source_document_id"] == document["id"] and source["card_count"] >= 1
        for source in progress_response.json()["source_breakdown"]
    )

    regenerate_response = client.post("/api/recall/study/cards/generate")
    assert regenerate_response.status_code == 200
    regenerated_cards = client.get("/api/recall/study/cards", params={"status": "all", "limit": 100}).json()
    regenerated_fill = next(card for card in regenerated_cards if card["id"] == updated_card["id"])
    assert regenerated_fill["question_payload"]["template"] == "Durable memory improves with {{blank}}."
    assert regenerated_fill["question_payload"]["choices"][0]["text"] == "Copying notes"

    delete_response = client.delete(f"/api/recall/study/cards/{updated_card['id']}")
    assert delete_response.status_code == 200
    final_cards = client.get("/api/recall/study/cards", params={"status": "all", "limit": 100}).json()
    assert all(card["id"] != updated_card["id"] for card in final_cards)


def test_recall_study_matching_and_ordering_cards_validate_and_review(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import_response = client.post(
        "/api/documents/import-text",
        json={
            "title": "Matching ordering card source",
            "text": (
                "Matching Study questions connect concepts to definitions, while ordering questions "
                "ask the learner to arrange steps in the correct sequence."
            ),
        },
    )
    assert import_response.status_code == 200
    document = import_response.json()

    duplicate_pair_response = client.post(
        "/api/recall/study/cards",
        json={
            "source_document_id": document["id"],
            "prompt": "Which matching pair is invalid?",
            "answer": "manual summary",
            "card_type": "matching",
            "question_payload": {
                "kind": "matching",
                "pairs": [
                    {"id": "a", "left": "Concept", "right": "Definition"},
                    {"id": "b", "left": "concept", "right": "Another definition"},
                ],
            },
        },
    )
    assert duplicate_pair_response.status_code == 400

    short_order_response = client.post(
        "/api/recall/study/cards",
        json={
            "source_document_id": document["id"],
            "prompt": "Which ordering item list is invalid?",
            "answer": "manual summary",
            "card_type": "ordering",
            "question_payload": {
                "kind": "ordering",
                "items": [
                    {"id": "one", "text": "Read source"},
                ],
            },
        },
    )
    assert short_order_response.status_code == 400

    create_matching_response = client.post(
        "/api/recall/study/cards",
        json={
            "source_document_id": document["id"],
            "prompt": "Match the learning terms to their definitions.",
            "answer": "This value is normalized from matching pairs",
            "card_type": "matching",
            "question_payload": {
                "kind": "matching",
                "pairs": [
                    {"id": "pair-a", "left": "Active recall", "right": "Retrieving from memory"},
                    {"id": "pair-b", "left": "Spacing", "right": "Reviewing over time"},
                    {"id": "pair-c", "left": "Interleaving", "right": "Mixing related topics"},
                ],
            },
        },
    )
    assert create_matching_response.status_code == 200
    matching_card = create_matching_response.json()
    assert matching_card["card_type"] == "matching"
    assert matching_card["answer"] == (
        "Active recall -> Retrieving from memory; "
        "Spacing -> Reviewing over time; "
        "Interleaving -> Mixing related topics"
    )
    assert matching_card["question_payload"]["kind"] == "matching"
    assert matching_card["question_payload"]["pairs"][0]["right"] == "Retrieving from memory"

    create_ordering_response = client.post(
        "/api/recall/study/cards",
        json={
            "source_document_id": document["id"],
            "prompt": "Order the review workflow.",
            "answer": "This value is normalized from ordering items",
            "card_type": "ordering",
            "question_payload": {
                "kind": "ordering",
                "items": [
                    {"id": "step-a", "text": "Read the source"},
                    {"id": "step-b", "text": "Answer from memory"},
                    {"id": "step-c", "text": "Reveal and rate"},
                ],
            },
        },
    )
    assert create_ordering_response.status_code == 200
    ordering_card = create_ordering_response.json()
    assert ordering_card["card_type"] == "ordering"
    assert ordering_card["answer"] == "Read the source; Answer from memory; Reveal and rate"
    assert ordering_card["question_payload"]["items"][1]["text"] == "Answer from memory"

    retrieve_pair_response = client.get("/api/recall/retrieve", params={"query": "Retrieving from memory"})
    assert retrieve_pair_response.status_code == 200
    assert any(hit.get("card_id") == matching_card["id"] for hit in retrieve_pair_response.json())

    retrieve_order_response = client.get("/api/recall/retrieve", params={"query": "Reveal and rate"})
    assert retrieve_order_response.status_code == 200
    assert any(hit.get("card_id") == ordering_card["id"] for hit in retrieve_order_response.json())

    update_matching_response = client.patch(
        f"/api/recall/study/cards/{matching_card['id']}",
        json={
            "prompt": "Match updated learning terms.",
            "answer": matching_card["answer"],
            "question_payload": {
                "kind": "matching",
                "pairs": [
                    {"id": "pair-a", "left": "Retrieval", "right": "Answering from memory"},
                    {"id": "pair-b", "left": "Spacing", "right": "Reviewing over time"},
                    {"id": "pair-c", "left": "Interleaving", "right": "Mixing related topics"},
                ],
            },
        },
    )
    assert update_matching_response.status_code == 200
    updated_matching = update_matching_response.json()
    assert updated_matching["prompt"] == "Match updated learning terms."
    assert updated_matching["answer"].startswith("Retrieval -> Answering from memory")
    assert updated_matching["question_payload"]["pairs"][0]["left"] == "Retrieval"

    review_response = client.post(
        f"/api/recall/study/cards/{updated_matching['id']}/review",
        json={"rating": "good"},
    )
    assert review_response.status_code == 200
    assert review_response.json()["last_rating"] == "good"

    progress_response = client.get("/api/recall/study/progress", params={"source_document_id": document["id"]})
    assert progress_response.status_code == 200
    assert any(
        source["source_document_id"] == document["id"] and source["card_count"] >= 2
        for source in progress_response.json()["source_breakdown"]
    )

    regenerate_response = client.post("/api/recall/study/cards/generate")
    assert regenerate_response.status_code == 200
    regenerated_cards = client.get("/api/recall/study/cards", params={"status": "all", "limit": 100}).json()
    regenerated_matching = next(card for card in regenerated_cards if card["id"] == updated_matching["id"])
    regenerated_ordering = next(card for card in regenerated_cards if card["id"] == ordering_card["id"])
    assert regenerated_matching["question_payload"]["pairs"][0]["right"] == "Answering from memory"
    assert regenerated_ordering["question_payload"]["items"][2]["text"] == "Reveal and rate"

    delete_response = client.delete(f"/api/recall/study/cards/{ordering_card['id']}")
    assert delete_response.status_code == 200
    final_cards = client.get("/api/recall/study/cards", params={"status": "all", "limit": 100}).json()
    assert all(card["id"] != ordering_card["id"] for card in final_cards)


def test_recall_study_answer_attempts_grade_locally_and_link_reviews(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import_response = client.post(
        "/api/documents/import-text",
        json={
            "title": "Attempt memory source",
            "text": (
                "Answer attempts should be local memory. "
                "Active recall is answering from memory. "
                "A session recap should not change scheduling by itself."
            ),
        },
    )
    assert import_response.status_code == 200
    document = import_response.json()

    create_payloads = [
        {
            "prompt": "What is active recall?",
            "answer": "Answering from memory",
            "card_type": "short_answer",
        },
        {
            "prompt": "Remember the definition of attempt memory.",
            "answer": "Attempts are local Study responses.",
            "card_type": "flashcard",
        },
        {
            "prompt": "Which method answers from memory?",
            "answer": "Active recall",
            "card_type": "multiple_choice",
            "question_payload": {
                "kind": "multiple_choice",
                "choices": [
                    {"id": "a", "text": "Passive rereading"},
                    {"id": "b", "text": "Active recall"},
                    {"id": "c", "text": "Copying notes"},
                ],
                "correct_choice_id": "b",
            },
        },
        {
            "prompt": "Active recall answers from memory.",
            "answer": "True",
            "card_type": "true_false",
            "question_payload": {"kind": "true_false", "correct_choice_id": "true"},
        },
        {
            "prompt": "Fill the memory method.",
            "answer": "Active recall",
            "card_type": "fill_in_blank",
            "question_payload": {
                "kind": "fill_in_blank",
                "template": "{{blank}} means answering from memory.",
                "choices": [
                    {"id": "a", "text": "Passive review"},
                    {"id": "b", "text": "Active recall"},
                    {"id": "c", "text": "Highlighting"},
                ],
                "correct_choice_id": "b",
            },
        },
        {
            "prompt": "Match the attempt memory terms.",
            "answer": "Attempt -> Response; Recap -> Summary",
            "card_type": "matching",
            "question_payload": {
                "kind": "matching",
                "pairs": [
                    {"id": "p1", "left": "Attempt", "right": "Response"},
                    {"id": "p2", "left": "Recap", "right": "Summary"},
                ],
            },
        },
        {
            "prompt": "Order the local review flow.",
            "answer": "Submit answer; See feedback; Rate card",
            "card_type": "ordering",
            "question_payload": {
                "kind": "ordering",
                "items": [
                    {"id": "i1", "text": "Submit answer"},
                    {"id": "i2", "text": "See feedback"},
                    {"id": "i3", "text": "Rate card"},
                ],
            },
        },
    ]
    cards = []
    for payload in create_payloads:
        create_response = client.post(
            "/api/recall/study/cards",
            json={"source_document_id": document["id"], **payload},
        )
        assert create_response.status_code == 200
        cards.append(create_response.json())

    cards_by_type = {card["card_type"]: card for card in cards}
    before_state = {
        card["id"]: {
            "due_at": card["due_at"],
            "review_count": card["review_count"],
            "status": card["status"],
            "knowledge_stage": card["knowledge_stage"],
        }
        for card in cards
    }
    attempt_requests = {
        "short_answer": {"answer_text": "answering from memory"},
        "flashcard": {"revealed": True},
        "multiple_choice": {"selected_choice_id": "b"},
        "true_false": {"selected_choice_id": "true"},
        "fill_in_blank": {"selected_choice_id": "b"},
        "matching": {"selections": {"p1": "p1", "p2": "p2"}},
        "ordering": {"item_ids": ["i1", "i2", "i3"]},
    }
    expected_correctness = {
        "short_answer": True,
        "flashcard": None,
        "multiple_choice": True,
        "true_false": True,
        "fill_in_blank": True,
        "matching": True,
        "ordering": True,
    }
    attempts = {}
    for question_type, response_payload in attempt_requests.items():
        card = cards_by_type[question_type]
        attempt_response = client.post(
            f"/api/recall/study/cards/{card['id']}/attempts",
            json={"session_id": "stage-948-session", "response": response_payload},
        )
        assert attempt_response.status_code == 200
        attempt = attempt_response.json()
        attempts[question_type] = attempt
        assert attempt["review_card_id"] == card["id"]
        assert attempt["source_document_id"] == document["id"]
        assert attempt["question_type"] == question_type
        assert attempt["response"] == response_payload
        assert attempt["is_correct"] is expected_correctness[question_type]
        assert attempt["review_event_id"] is None

    cards_after_attempts = client.get("/api/recall/study/cards", params={"status": "all", "limit": 200}).json()
    cards_after_attempts_by_id = {card["id"]: card for card in cards_after_attempts}
    for card in cards:
        after_card = cards_after_attempts_by_id[card["id"]]
        assert after_card["due_at"] == before_state[card["id"]]["due_at"]
        assert after_card["review_count"] == before_state[card["id"]]["review_count"]
        assert after_card["status"] == before_state[card["id"]]["status"]
        assert after_card["knowledge_stage"] == before_state[card["id"]]["knowledge_stage"]

    reviewed_card = cards_by_type["multiple_choice"]
    review_response = client.post(
        f"/api/recall/study/cards/{reviewed_card['id']}/review",
        json={"rating": "good", "attempt_id": attempts["multiple_choice"]["id"]},
    )
    assert review_response.status_code == 200
    assert review_response.json()["last_rating"] == "good"

    progress_response = client.get(
        "/api/recall/study/progress",
        params={"source_document_id": document["id"]},
    )
    assert progress_response.status_code == 200
    progress = progress_response.json()
    assert progress["total_attempts"] == 7
    assert progress["correct_attempts"] == 6
    assert progress["accuracy"] == 1.0
    assert progress["recent_reviews"][0]["attempt_id"] == attempts["multiple_choice"]["id"]
    assert progress["recent_reviews"][0]["attempt_is_correct"] is True
    assert {attempt["question_type"] for attempt in progress["recent_attempts"]} == set(attempt_requests)
    assert progress["source_breakdown"][0]["source_document_id"] == document["id"]
    assert progress["source_breakdown"][0]["attempt_count"] == 7
    assert progress["source_breakdown"][0]["correct_attempt_count"] == 6
    assert progress["source_breakdown"][0]["accuracy"] == 1.0

    with sqlite3.connect(tmp_path / ".data" / "workspace.db") as connection:
        linked_attempt = connection.execute(
            "SELECT review_event_id FROM study_answer_attempts WHERE id = ?",
            (attempts["multiple_choice"]["id"],),
        ).fetchone()
    assert linked_attempt[0] == progress["recent_reviews"][0]["id"]


def test_recall_study_support_payloads_generation_and_timed_attempts(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import_response = client.post(
        "/api/documents/import-text",
        json={
            "title": "Support payload source",
            "text": (
                "Hints should point back to source evidence. "
                "Explanations should stay deterministic and local. "
                "Timed review expiry records an attempt without changing scheduling."
            ),
        },
    )
    assert import_response.status_code == 200
    document = import_response.json()

    support_payload = {
        "hint": "Look for the deterministic source clue.",
        "explanation": "The answer is grounded in the saved source evidence.",
    }
    create_payloads = [
        {
            "prompt": "What should hints point back to?",
            "answer": "Source evidence",
            "card_type": "short_answer",
        },
        {
            "prompt": "Remember the explanation policy.",
            "answer": "Stay deterministic and local.",
            "card_type": "flashcard",
        },
        {
            "prompt": "Which answer is grounded?",
            "answer": "Source evidence",
            "card_type": "multiple_choice",
            "question_payload": {
                "kind": "multiple_choice",
                "choices": [
                    {"id": "a", "text": "A cloud challenge"},
                    {"id": "b", "text": "Source evidence"},
                    {"id": "c", "text": "A chat transcript"},
                ],
                "correct_choice_id": "b",
            },
        },
        {
            "prompt": "Hints stay local.",
            "answer": "True",
            "card_type": "true_false",
            "question_payload": {"kind": "true_false", "correct_choice_id": "true"},
        },
        {
            "prompt": "Fill the support source.",
            "answer": "source evidence",
            "card_type": "fill_in_blank",
            "question_payload": {
                "kind": "fill_in_blank",
                "template": "Hints point back to {{blank}}.",
                "choices": [
                    {"id": "a", "text": "source evidence"},
                    {"id": "b", "text": "shared timers"},
                ],
                "correct_choice_id": "a",
            },
        },
        {
            "prompt": "Match support terms.",
            "answer": "Hint -> Clue; Explanation -> Source answer",
            "card_type": "matching",
            "question_payload": {
                "kind": "matching",
                "pairs": [
                    {"id": "p1", "left": "Hint", "right": "Clue"},
                    {"id": "p2", "left": "Explanation", "right": "Source answer"},
                ],
            },
        },
        {
            "prompt": "Order the timed flow.",
            "answer": "Start timer; Time out; Rate later",
            "card_type": "ordering",
            "question_payload": {
                "kind": "ordering",
                "items": [
                    {"id": "i1", "text": "Start timer"},
                    {"id": "i2", "text": "Time out"},
                    {"id": "i3", "text": "Rate later"},
                ],
            },
        },
    ]
    cards = []
    for payload in create_payloads:
        create_response = client.post(
            "/api/recall/study/cards",
            json={
                "source_document_id": document["id"],
                "support_payload": support_payload,
                **payload,
            },
        )
        assert create_response.status_code == 200
        created_card = create_response.json()
        cards.append(created_card)
        assert created_card["question_support_payload"]["hint"] == support_payload["hint"]
        assert created_card["question_support_payload"]["explanation"] == support_payload["explanation"]
        assert created_card["question_support_payload"]["source_excerpt"] is None
        assert created_card["scheduling_state"]["manual_question_support_payload"] == support_payload

    edited_response = client.patch(
        f"/api/recall/study/cards/{cards[0]['id']}",
        json={
            "prompt": "What should updated hints point back to?",
            "answer": "Source evidence",
            "support_payload": {
                "hint": "Updated deterministic source clue.",
                "explanation": "Updated explanation still cites local evidence.",
            },
        },
    )
    assert edited_response.status_code == 200
    edited_card = edited_response.json()
    assert edited_card["question_support_payload"]["hint"] == "Updated deterministic source clue."

    preserve_response = client.patch(
        f"/api/recall/study/cards/{cards[1]['id']}",
        json={
            "prompt": "Remember the preserved explanation policy.",
            "answer": "Stay deterministic and local.",
        },
    )
    assert preserve_response.status_code == 200
    preserved_support_payload = preserve_response.json()["question_support_payload"]
    assert preserved_support_payload["hint"] == support_payload["hint"]
    assert preserved_support_payload["explanation"] == support_payload["explanation"]
    assert preserved_support_payload["source_excerpt"] is None

    clear_response = client.patch(
        f"/api/recall/study/cards/{cards[2]['id']}",
        json={
            "prompt": "Which answer is grounded?",
            "answer": "Source evidence",
            "question_payload": cards[2]["question_payload"],
            "support_payload": None,
        },
    )
    assert clear_response.status_code == 200
    assert clear_response.json()["question_support_payload"] is None
    assert "manual_question_support_payload" not in clear_response.json()["scheduling_state"]

    retrieval_response = client.get(
        "/api/recall/retrieve",
        params={"query": "Updated deterministic source clue", "limit": 10},
    )
    assert retrieval_response.status_code == 200
    assert any(hit.get("card_id") == cards[0]["id"] for hit in retrieval_response.json())

    omit_support_response = client.post(
        "/api/recall/study/cards/generate",
        json={
            "source_document_id": document["id"],
            "question_types": ["short_answer"],
            "max_per_source": 1,
            "include_hints": False,
            "include_explanations": False,
        },
    )
    assert omit_support_response.status_code == 200
    omit_support_result = omit_support_response.json()
    assert omit_support_result["include_hints"] is False
    assert omit_support_result["include_explanations"] is False
    generated_without_support = [
        card
        for card in client.get("/api/recall/study/cards", params={"status": "all", "limit": 200}).json()
        if card["source_document_id"] == document["id"]
        and card["card_type"] == "short_answer"
        and not card["scheduling_state"].get("manual_content_created_at")
    ]
    assert generated_without_support
    assert all("generated_question_support_payload" not in card["scheduling_state"] for card in generated_without_support)
    assert all(card["question_support_payload"] is None for card in generated_without_support)

    include_support_response = client.post(
        "/api/recall/study/cards/generate",
        json={
            "source_document_id": document["id"],
            "question_types": ["short_answer"],
            "max_per_source": 1,
        },
    )
    assert include_support_response.status_code == 200
    include_support_result = include_support_response.json()
    assert include_support_result["include_hints"] is True
    assert include_support_result["include_explanations"] is True
    generated_with_support = [
        card
        for card in client.get("/api/recall/study/cards", params={"status": "all", "limit": 200}).json()
        if card["source_document_id"] == document["id"]
        and card["card_type"] == "short_answer"
        and not card["scheduling_state"].get("manual_content_created_at")
    ]
    assert generated_with_support
    assert all("generated_question_support_payload" in card["scheduling_state"] for card in generated_with_support)
    assert all(card["question_support_payload"]["hint"] for card in generated_with_support)
    assert all(card["question_support_payload"]["explanation"] for card in generated_with_support)

    timed_card = cards[0]
    before_timed_card = next(
        card
        for card in client.get("/api/recall/study/cards", params={"status": "all", "limit": 200}).json()
        if card["id"] == timed_card["id"]
    )
    timed_attempt_response = client.post(
        f"/api/recall/study/cards/{timed_card['id']}/attempts",
        json={
            "session_id": "stage-950-timed-session",
            "response": {
                "answer_text": "",
                "elapsed_ms": 30000,
                "time_limit_seconds": 30,
                "timed_out": True,
            },
        },
    )
    assert timed_attempt_response.status_code == 200
    timed_attempt = timed_attempt_response.json()
    assert timed_attempt["response"]["timed_out"] is True
    assert timed_attempt["response"]["elapsed_ms"] == 30000
    assert timed_attempt["response"]["time_limit_seconds"] == 30
    assert timed_attempt["is_correct"] is False

    after_timed_card = next(
        card
        for card in client.get("/api/recall/study/cards", params={"status": "all", "limit": 200}).json()
        if card["id"] == timed_card["id"]
    )
    assert after_timed_card["due_at"] == before_timed_card["due_at"]
    assert after_timed_card["review_count"] == before_timed_card["review_count"]
    assert after_timed_card["status"] == before_timed_card["status"]
    assert after_timed_card["knowledge_stage"] == before_timed_card["knowledge_stage"]
    assert client.get("/api/recall/study/progress").json()["total_reviews"] == 0

    review_response = client.post(
        f"/api/recall/study/cards/{timed_card['id']}/review",
        json={"rating": "hard", "attempt_id": timed_attempt["id"]},
    )
    assert review_response.status_code == 200
    progress_response = client.get("/api/recall/study/progress")
    assert progress_response.status_code == 200
    progress = progress_response.json()
    assert progress["total_attempts"] == 1
    assert progress["correct_attempts"] == 0
    assert progress["accuracy"] == 0.0
    assert progress["recent_reviews"][0]["attempt_id"] == timed_attempt["id"]
    assert progress["recent_reviews"][0]["attempt_is_correct"] is False


def test_recall_study_quiz_settings_difficulty_and_sessions(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import_response = client.post(
        "/api/documents/import-text",
        json={
            "title": "Quiz settings source",
            "text": (
                "Quiz sessions make review deliberate. "
                "Difficulty filters keep hard questions visible. "
                "Session history summarizes local attempts without changing scheduling."
            ),
        },
    )
    assert import_response.status_code == 200
    document = import_response.json()

    settings_response = client.get("/api/recall/study/settings")
    assert settings_response.status_code == 200
    assert settings_response.json() == {
        "default_timer_seconds": 0,
        "default_session_limit": 10,
        "default_difficulty_filter": "all",
        "streak_goal_mode": "daily",
        "daily_goal_reviews": 1,
        "weekly_goal_days": 3,
    }

    saved_settings_response = client.put(
        "/api/recall/study/settings",
        json={
            "default_timer_seconds": 60,
            "default_session_limit": 5,
            "default_difficulty_filter": "hard",
        },
    )
    assert saved_settings_response.status_code == 200
    assert client.get("/api/recall/study/settings").json()["default_difficulty_filter"] == "hard"
    invalid_settings_response = client.put(
        "/api/recall/study/settings",
        json={
            "default_timer_seconds": 45,
            "default_session_limit": 5,
            "default_difficulty_filter": "hard",
        },
    )
    assert invalid_settings_response.status_code == 422

    manual_response = client.post(
        "/api/recall/study/cards",
        json={
            "source_document_id": document["id"],
            "prompt": "Which sessions summarize local attempts?",
            "answer": "Quiz sessions",
            "card_type": "multiple_choice",
            "question_difficulty": "easy",
            "question_payload": {
                "kind": "multiple_choice",
                "choices": [
                    {"id": "a", "text": "Import sessions"},
                    {"id": "b", "text": "Quiz sessions"},
                    {"id": "c", "text": "Reader sessions"},
                ],
                "correct_choice_id": "b",
            },
        },
    )
    assert manual_response.status_code == 200
    manual_card = manual_response.json()
    assert manual_card["question_difficulty"] == "easy"
    assert manual_card["scheduling_state"]["manual_question_difficulty"] == "easy"

    updated_manual_response = client.patch(
        f"/api/recall/study/cards/{manual_card['id']}",
        json={
            "prompt": manual_card["prompt"],
            "answer": manual_card["answer"],
            "question_payload": manual_card["question_payload"],
            "question_difficulty": "hard",
        },
    )
    assert updated_manual_response.status_code == 200
    hard_card = updated_manual_response.json()
    assert hard_card["question_difficulty"] == "hard"
    assert hard_card["scheduling_state"]["manual_question_difficulty"] == "hard"

    generation_response = client.post(
        "/api/recall/study/cards/generate",
        json={
            "source_document_id": document["id"],
            "question_types": ["flashcard", "true_false"],
            "difficulty": "easy",
            "max_per_source": 4,
        },
    )
    assert generation_response.status_code == 200
    generation_result = generation_response.json()
    assert generation_result["difficulty"] == "easy"

    cards_after_generation = client.get(
        "/api/recall/study/cards",
        params={"status": "all", "limit": 100},
    ).json()
    generated_easy_cards = [
        card
        for card in cards_after_generation
        if card["source_document_id"] == document["id"]
        and not card["scheduling_state"].get("manual_content_created_at")
        and card["card_type"] in {"flashcard", "true_false"}
    ]
    assert generated_easy_cards
    assert all(card["question_difficulty"] == "easy" for card in generated_easy_cards)
    assert all(card["scheduling_state"]["generated_question_difficulty"] == "easy" for card in generated_easy_cards)
    assert next(card for card in cards_after_generation if card["id"] == hard_card["id"])["question_difficulty"] == "hard"

    session_cards = [hard_card["id"], generated_easy_cards[0]["id"]]
    start_session_response = client.post(
        "/api/recall/study/sessions",
        json={
            "source_document_id": document["id"],
            "filter_snapshot": {"difficulty_filter": "hard"},
            "settings_snapshot": {
                "default_timer_seconds": 60,
                "default_session_limit": 5,
                "default_difficulty_filter": "hard",
            },
            "card_ids": session_cards,
        },
    )
    assert start_session_response.status_code == 200
    session = start_session_response.json()
    assert session["source_document_id"] == document["id"]
    assert session["card_ids"] == session_cards
    assert session["completed_at"] is None

    before_attempt_card = client.get("/api/recall/study/cards", params={"status": "all", "limit": 100}).json()
    before_attempt_card = next(card for card in before_attempt_card if card["id"] == hard_card["id"])
    attempt_response = client.post(
        f"/api/recall/study/cards/{hard_card['id']}/attempts",
        json={"session_id": session["id"], "response": {"selected_choice_id": "b"}},
    )
    assert attempt_response.status_code == 200
    attempt = attempt_response.json()
    assert attempt["session_id"] == session["id"]
    assert attempt["is_correct"] is True

    after_attempt_card = client.get("/api/recall/study/cards", params={"status": "all", "limit": 100}).json()
    after_attempt_card = next(card for card in after_attempt_card if card["id"] == hard_card["id"])
    assert after_attempt_card["due_at"] == before_attempt_card["due_at"]
    assert after_attempt_card["review_count"] == before_attempt_card["review_count"]
    assert after_attempt_card["status"] == before_attempt_card["status"]
    assert after_attempt_card["knowledge_stage"] == before_attempt_card["knowledge_stage"]

    review_response = client.post(
        f"/api/recall/study/cards/{hard_card['id']}/review",
        json={"rating": "good", "attempt_id": attempt["id"]},
    )
    assert review_response.status_code == 200

    complete_session_response = client.post(
        f"/api/recall/study/sessions/{session['id']}/complete",
        json={
            "summary": {
                "attempted": 1,
                "correct": 1,
                "skipped": 1,
                "sources_touched": 1,
                "timed_out": 0,
                "hint_used": 0,
                "duration_seconds": 42,
                "difficulty_counts": {"easy": 1, "medium": 0, "hard": 1},
            }
        },
    )
    assert complete_session_response.status_code == 200
    completed_session = complete_session_response.json()
    assert completed_session["completed_at"] is not None
    assert completed_session["summary"]["difficulty_counts"]["hard"] == 1

    progress_response = client.get(
        "/api/recall/study/progress",
        params={"source_document_id": document["id"]},
    )
    assert progress_response.status_code == 200
    progress = progress_response.json()
    assert progress["recent_sessions"][0]["id"] == session["id"]
    assert progress["recent_sessions"][0]["summary"]["duration_seconds"] == 42
    assert progress["total_attempts"] == 1
    assert progress["correct_attempts"] == 1
    assert progress["accuracy"] == 1.0
    difficulty_rows = {row["difficulty"]: row for row in progress["difficulty_accuracy"]}
    assert difficulty_rows["hard"]["attempt_count"] == 1
    assert difficulty_rows["hard"]["correct_attempt_count"] == 1
    assert difficulty_rows["hard"]["accuracy"] == 1.0
    assert progress["recent_reviews"][0]["attempt_id"] == attempt["id"]


def test_recall_study_habit_goals_and_review_targets(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    first_response = client.post(
        "/api/documents/import-text",
        json={
            "title": "Habit goals first source",
            "text": (
                "Habit goals should count rated reviews only. "
                "Attempts can help feedback without completing a target."
            ),
        },
    )
    second_response = client.post(
        "/api/documents/import-text",
        json={
            "title": "Habit goals second source",
            "text": (
                "Weekly review targets should count active review days. "
                "Source scoped progress should show local contribution."
            ),
        },
    )
    assert first_response.status_code == 200
    assert second_response.status_code == 200
    first_document = first_response.json()
    second_document = second_response.json()

    first_card_response = client.post(
        "/api/recall/study/cards",
        json={
            "source_document_id": first_document["id"],
            "prompt": "What completes a habit target?",
            "answer": "Rated reviews",
            "card_type": "multiple_choice",
            "question_payload": {
                "kind": "multiple_choice",
                "choices": [
                    {"id": "a", "text": "Attempts alone"},
                    {"id": "b", "text": "Rated reviews"},
                    {"id": "c", "text": "Opened sessions"},
                ],
                "correct_choice_id": "b",
            },
        },
    )
    second_card_response = client.post(
        "/api/recall/study/cards",
        json={
            "source_document_id": second_document["id"],
            "prompt": "Which target counts active days?",
            "answer": "Weekly target",
            "card_type": "short_answer",
        },
    )
    assert first_card_response.status_code == 200
    assert second_card_response.status_code == 200
    first_card = first_card_response.json()
    second_card = second_card_response.json()

    saved_daily_response = client.put(
        "/api/recall/study/settings",
        json={
            "default_timer_seconds": 0,
            "default_session_limit": 10,
            "default_difficulty_filter": "all",
            "streak_goal_mode": "daily",
            "daily_goal_reviews": 3,
            "weekly_goal_days": 3,
        },
    )
    assert saved_daily_response.status_code == 200
    assert saved_daily_response.json()["daily_goal_reviews"] == 3

    invalid_goal_response = client.put(
        "/api/recall/study/settings",
        json={
            "default_timer_seconds": 0,
            "default_session_limit": 10,
            "default_difficulty_filter": "all",
            "streak_goal_mode": "weekly",
            "daily_goal_reviews": 3,
            "weekly_goal_days": 4,
        },
    )
    assert invalid_goal_response.status_code == 422

    attempt_response = client.post(
        f"/api/recall/study/cards/{first_card['id']}/attempts",
        json={"session_id": "habit-goal-session", "response": {"selected_choice_id": "b"}},
    )
    assert attempt_response.status_code == 200
    before_rating_progress = client.get("/api/recall/study/progress").json()
    assert before_rating_progress["total_attempts"] == 1
    assert before_rating_progress["habit_goal"]["mode"] == "daily"
    assert before_rating_progress["habit_goal"]["target_count"] == 3
    assert before_rating_progress["habit_goal"]["current_count"] == 0
    assert before_rating_progress["habit_goal"]["remaining_count"] == 3
    assert before_rating_progress["habit_goal"]["is_met"] is False

    review_response = client.post(
        f"/api/recall/study/cards/{first_card['id']}/review",
        json={"rating": "good", "attempt_id": attempt_response.json()["id"]},
    )
    assert review_response.status_code == 200

    now = datetime.now(UTC).replace(microsecond=0)
    yesterday = now - timedelta(days=1)
    week_start = now.date() - timedelta(days=now.date().weekday())
    weekly_extra_days = [
        datetime.combine(week_start + timedelta(days=offset), now.time(), tzinfo=UTC)
        for offset in range(3)
    ]
    with sqlite3.connect(tmp_path / ".data" / "workspace.db") as connection:
        connection.executemany(
            """
            INSERT INTO review_events (
                id,
                review_card_id,
                rating,
                scheduling_state_json,
                reviewed_at,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?)
            """,
            [
                (
                    "habit-second-today",
                    second_card["id"],
                    3,
                    json.dumps({"last_rating": "good", "due_at": second_card["due_at"]}),
                    (now + timedelta(seconds=1)).isoformat(),
                    (now + timedelta(seconds=1)).isoformat(),
                ),
                (
                    "habit-second-yesterday",
                    second_card["id"],
                    2,
                    json.dumps({"last_rating": "hard", "due_at": second_card["due_at"]}),
                    yesterday.isoformat(),
                    yesterday.isoformat(),
                ),
            ]
            + [
                (
                    f"habit-weekly-extra-{index}",
                    second_card["id"],
                    3,
                    json.dumps({"last_rating": "good", "due_at": second_card["due_at"]}),
                    review_day.isoformat(),
                    review_day.isoformat(),
                )
                for index, review_day in enumerate(weekly_extra_days)
            ],
        )

    daily_progress_response = client.get("/api/recall/study/progress")
    assert daily_progress_response.status_code == 200
    daily_progress = daily_progress_response.json()
    assert daily_progress["habit_goal"]["mode"] == "daily"
    assert daily_progress["habit_goal"]["current_count"] >= 2
    assert daily_progress["habit_goal"]["remaining_count"] <= 1
    assert daily_progress["habit_goal"]["recent_history"][-1]["count"] >= 2
    first_scope_progress = client.get(
        "/api/recall/study/progress",
        params={"source_document_id": first_document["id"]},
    ).json()
    assert first_scope_progress["habit_goal"]["current_count"] == 1
    assert first_scope_progress["habit_goal"]["remaining_count"] == 2

    saved_weekly_response = client.put(
        "/api/recall/study/settings",
        json={
            "default_timer_seconds": 0,
            "default_session_limit": 10,
            "default_difficulty_filter": "all",
            "streak_goal_mode": "weekly",
            "daily_goal_reviews": 3,
            "weekly_goal_days": 3,
        },
    )
    assert saved_weekly_response.status_code == 200
    weekly_progress_response = client.get("/api/recall/study/progress")
    assert weekly_progress_response.status_code == 200
    weekly_progress = weekly_progress_response.json()
    assert weekly_progress["habit_goal"]["mode"] == "weekly"
    assert weekly_progress["habit_goal"]["target_count"] == 3
    assert weekly_progress["habit_goal"]["current_count"] >= 3
    assert weekly_progress["habit_goal"]["remaining_count"] == 0
    assert weekly_progress["habit_goal"]["is_met"] is True
    assert len(weekly_progress["habit_goal"]["recent_history"]) == 6
    second_scope_progress = client.get(
        "/api/recall/study/progress",
        params={"source_document_id": second_document["id"]},
    ).json()
    assert second_scope_progress["habit_goal"]["mode"] == "weekly"
    assert second_scope_progress["habit_goal"]["current_count"] >= 3


def test_recall_study_progress_empty_activity_range_and_validation(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)

    progress_response = client.get("/api/recall/study/progress", params={"period_days": 365})
    assert progress_response.status_code == 200
    progress = progress_response.json()
    assert progress["total_reviews"] == 0
    assert progress["today_count"] == 0
    assert progress["active_days"] == 0
    assert progress["current_daily_streak"] == 0
    assert progress["period_days"] == 365
    assert len(progress["daily_activity"]) == 365
    assert all(day["review_count"] == 0 for day in progress["daily_activity"])
    assert len(progress["memory_progress"]) == 365
    assert all(snapshot["total_count"] == 0 for snapshot in progress["memory_progress"])
    assert all(
        {entry["stage"]: entry["count"] for entry in snapshot["stage_counts"]} == {
            "new": 0,
            "learning": 0,
            "practiced": 0,
            "confident": 0,
            "mastered": 0,
        }
        for snapshot in progress["memory_progress"]
    )
    assert {entry["rating"]: entry["count"] for entry in progress["rating_counts"]} == {
        "forgot": 0,
        "hard": 0,
        "good": 0,
        "easy": 0,
    }

    invalid_response = client.get("/api/recall/study/progress", params={"period_days": 366})
    assert invalid_response.status_code == 422


def test_recall_study_progress_summarizes_review_events_and_source_scope(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    first_response = client.post(
        "/api/documents/import-text",
        json={
            "title": "Progress first source",
            "text": (
                "Progress reviews need durable memory. "
                "Daily activity keeps the Study dashboard honest. "
                "A source row should reopen scoped questions."
            ),
        },
    )
    second_response = client.post(
        "/api/documents/import-text",
        json={
            "title": "Progress second source",
            "text": (
                "Another review source keeps scope filtering clear. "
                "Rating mix should include event fallback values. "
                "Recent reviews sort newest first."
            ),
        },
    )
    assert first_response.status_code == 200
    assert second_response.status_code == 200
    first_document = first_response.json()
    second_document = second_response.json()

    cards_response = client.get("/api/recall/study/cards", params={"status": "all", "limit": 100})
    assert cards_response.status_code == 200
    cards = cards_response.json()
    first_card = next(card for card in cards if card["source_document_id"] == first_document["id"])
    second_card = next(card for card in cards if card["source_document_id"] == second_document["id"])
    first_card_count = sum(1 for card in cards if card["source_document_id"] == first_document["id"])
    second_card_count = sum(1 for card in cards if card["source_document_id"] == second_document["id"])

    now = datetime.now(UTC).replace(microsecond=0)
    yesterday = now - timedelta(days=1)
    two_days_ago = now - timedelta(days=2)
    with sqlite3.connect(tmp_path / ".data" / "workspace.db") as connection:
        connection.execute(
            "UPDATE review_cards SET created_at = ? WHERE id IN (?, ?)",
            (two_days_ago.isoformat(), first_card["id"], second_card["id"]),
        )
        connection.executemany(
            """
            INSERT INTO review_events (
                id,
                review_card_id,
                rating,
                scheduling_state_json,
                reviewed_at,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?)
            """,
            [
                (
                    "progress-event-today",
                    first_card["id"],
                    3,
                    json.dumps({"last_rating": "good", "due_at": first_card["due_at"]}),
                    now.isoformat(),
                    now.isoformat(),
                ),
                (
                    "progress-event-yesterday",
                    first_card["id"],
                    2,
                    json.dumps({"due_at": first_card["due_at"]}),
                    yesterday.isoformat(),
                    yesterday.isoformat(),
                ),
                (
                    "progress-event-two-days-ago",
                    second_card["id"],
                    4,
                    json.dumps({"last_rating": "easy", "due_at": second_card["due_at"]}),
                    two_days_ago.isoformat(),
                    two_days_ago.isoformat(),
                ),
            ],
        )

    progress_response = client.get("/api/recall/study/progress")
    assert progress_response.status_code == 200
    progress = progress_response.json()
    assert progress["scope_source_document_id"] is None
    assert progress["total_reviews"] == 3
    assert progress["today_count"] == 1
    assert progress["active_days"] == 3
    assert progress["current_daily_streak"] == 3
    assert progress["period_days"] == 14
    assert progress["daily_activity"][-1] == {"date": now.date().isoformat(), "review_count": 1}
    assert len(progress["memory_progress"]) == 14
    latest_memory_counts = {entry["stage"]: entry["count"] for entry in progress["memory_progress"][-1]["stage_counts"]}
    assert progress["memory_progress"][-1]["date"] == now.date().isoformat()
    assert progress["memory_progress"][-1]["total_count"] == first_card_count + second_card_count
    assert latest_memory_counts["practiced"] >= 2
    assert latest_memory_counts["new"] == first_card_count + second_card_count - latest_memory_counts["practiced"]
    yesterday_memory_counts = {entry["stage"]: entry["count"] for entry in progress["memory_progress"][-2]["stage_counts"]}
    assert yesterday_memory_counts["learning"] >= 1
    assert yesterday_memory_counts["practiced"] >= 1
    assert {entry["rating"]: entry["count"] for entry in progress["rating_counts"]} == {
        "forgot": 0,
        "hard": 1,
        "good": 1,
        "easy": 1,
    }
    assert [review["id"] for review in progress["recent_reviews"]] == [
        "progress-event-today",
        "progress-event-yesterday",
        "progress-event-two-days-ago",
    ]
    assert progress["recent_reviews"][1]["rating"] == "hard"
    assert {entry["stage"]: entry["count"] for entry in progress["knowledge_stage_counts"]}["new"] >= 2
    assert progress["source_breakdown"][0]["source_document_id"] == first_document["id"]
    assert progress["source_breakdown"][0]["review_count"] == 2
    assert progress["source_breakdown"][0]["card_count"] == first_card_count
    assert progress["source_breakdown"][0]["dominant_knowledge_stage"] == "new"
    assert (
        {entry["stage"]: entry["count"] for entry in progress["source_breakdown"][0]["knowledge_stage_counts"]}["new"]
        == first_card_count
    )

    range_response = client.get("/api/recall/study/progress", params={"period_days": 30})
    assert range_response.status_code == 200
    ranged_progress = range_response.json()
    assert ranged_progress["period_days"] == 30
    assert len(ranged_progress["daily_activity"]) == 30
    assert len(ranged_progress["memory_progress"]) == 30
    assert ranged_progress["daily_activity"][-1] == {"date": now.date().isoformat(), "review_count": 1}
    assert ranged_progress["current_daily_streak"] == 3

    ninety_day_response = client.get("/api/recall/study/progress", params={"period_days": 90})
    assert ninety_day_response.status_code == 200
    ninety_day_progress = ninety_day_response.json()
    assert ninety_day_progress["period_days"] == 90
    assert len(ninety_day_progress["daily_activity"]) == 90
    assert len(ninety_day_progress["memory_progress"]) == 90

    scoped_response = client.get(
        "/api/recall/study/progress",
        params={"source_document_id": second_document["id"], "period_days": 365},
    )
    assert scoped_response.status_code == 200
    scoped = scoped_response.json()
    assert scoped["scope_source_document_id"] == second_document["id"]
    assert scoped["period_days"] == 365
    assert len(scoped["daily_activity"]) == 365
    assert len(scoped["memory_progress"]) == 365
    assert scoped["total_reviews"] == 1
    assert scoped["today_count"] == 0
    assert scoped["current_daily_streak"] == 0
    assert scoped["daily_activity"][-3]["review_count"] == 1
    assert [review["source_document_id"] for review in scoped["recent_reviews"]] == [second_document["id"]]
    assert [source["source_document_id"] for source in scoped["source_breakdown"]] == [second_document["id"]]
    assert scoped["source_breakdown"][0]["card_count"] == second_card_count
    assert {entry["stage"]: entry["count"] for entry in scoped["knowledge_stage_counts"]}["new"] == second_card_count
    scoped_latest_memory_counts = {entry["stage"]: entry["count"] for entry in scoped["memory_progress"][-1]["stage_counts"]}
    assert scoped["memory_progress"][-1]["total_count"] == second_card_count
    assert scoped_latest_memory_counts["practiced"] >= 1


def test_recall_study_knowledge_stages_serialize_cards_and_progress_counts(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import_response = client.post(
        "/api/documents/import-text",
        json={
            "title": "Knowledge stage source",
            "text": (
                "Knowledge stages are derived locally from review state. "
                "Weak ratings should stay visible as learning. "
                "Higher stability should move questions toward mastery."
            ),
        },
    )
    assert import_response.status_code == 200
    document = import_response.json()

    cards_response = client.get("/api/recall/study/cards", params={"status": "all", "limit": 100})
    assert cards_response.status_code == 200
    generated_cards = [card for card in cards_response.json() if card["source_document_id"] == document["id"]]
    generated_card = generated_cards[0]
    generated_new_count = len(generated_cards)
    assert generated_card["knowledge_stage"] == "new"

    now = datetime.now(UTC).replace(microsecond=0)
    synthetic_cards = [
        (
            "stage-card-learning",
            "Learning knowledge prompt?",
            {"due_at": now.isoformat(), "review_count": 1, "last_rating": "hard", "fsrs": {"state": 2, "stability": 2.0}},
        ),
        (
            "stage-card-practiced",
            "Practiced knowledge prompt?",
            {"due_at": now.isoformat(), "review_count": 2, "last_rating": "good", "fsrs": {"state": 2, "stability": 3.0}},
        ),
        (
            "stage-card-confident",
            "Confident knowledge prompt?",
            {"due_at": now.isoformat(), "review_count": 3, "last_rating": "good", "fsrs": {"state": 2, "stability": 10.0}},
        ),
        (
            "stage-card-mastered",
            "Mastered knowledge prompt?",
            {"due_at": now.isoformat(), "review_count": 5, "last_rating": "easy", "fsrs": {"state": 2, "stability": 45.0}},
        ),
    ]
    with sqlite3.connect(tmp_path / ".data" / "workspace.db") as connection:
        connection.executemany(
            """
            INSERT INTO review_cards (
                id,
                source_document_id,
                prompt,
                answer,
                card_type,
                source_spans_json,
                scheduling_state_json,
                created_at,
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            [
                (
                    card_id,
                    document["id"],
                    prompt,
                    "Derived from scheduling state.",
                    "fact",
                    "[]",
                    json.dumps(state, sort_keys=True),
                    now.isoformat(),
                    now.isoformat(),
                )
                for card_id, prompt, state in synthetic_cards
            ],
        )

    refreshed_cards_response = client.get("/api/recall/study/cards", params={"status": "all", "limit": 100})
    assert refreshed_cards_response.status_code == 200
    cards_by_id = {card["id"]: card for card in refreshed_cards_response.json()}
    assert cards_by_id[generated_card["id"]]["knowledge_stage"] == "new"
    assert cards_by_id["stage-card-learning"]["knowledge_stage"] == "learning"
    assert cards_by_id["stage-card-practiced"]["knowledge_stage"] == "practiced"
    assert cards_by_id["stage-card-confident"]["knowledge_stage"] == "confident"
    assert cards_by_id["stage-card-mastered"]["knowledge_stage"] == "mastered"

    progress_response = client.get("/api/recall/study/progress")
    assert progress_response.status_code == 200
    progress = progress_response.json()
    stage_counts = {entry["stage"]: entry["count"] for entry in progress["knowledge_stage_counts"]}
    assert stage_counts == {
        "new": generated_new_count,
        "learning": 1,
        "practiced": 1,
        "confident": 1,
        "mastered": 1,
    }
    assert progress["source_breakdown"][0]["source_document_id"] == document["id"]
    assert progress["source_breakdown"][0]["card_count"] == generated_new_count + 4
    assert progress["source_breakdown"][0]["dominant_knowledge_stage"] == (
        "new" if generated_new_count > 1 else "mastered"
    )

    scoped_response = client.get("/api/recall/study/progress", params={"source_document_id": document["id"]})
    assert scoped_response.status_code == 200
    scoped = scoped_response.json()
    assert scoped["scope_source_document_id"] == document["id"]
    assert {entry["stage"]: entry["count"] for entry in scoped["knowledge_stage_counts"]} == stage_counts


def test_recall_notes_create_list_update_delete_and_change_events(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import_response = client.post(
        "/api/documents/import-text",
        json={
            "title": "Notes guide",
            "text": "Alpha sentence. Beta sentence. Gamma sentence.\n\nDelta sentence.",
        },
    )
    assert import_response.status_code == 200
    document = import_response.json()

    view_response = client.get(
        f"/api/documents/{document['id']}/view",
        params={"mode": "reflowed", "detail_level": "default"},
    )
    assert view_response.status_code == 200
    reflowed_view = view_response.json()
    anchor = build_note_anchor(document["id"], reflowed_view, sentence_start=0, sentence_end=1)

    create_response = client.post(
        f"/api/recall/documents/{document['id']}/notes",
        json={"anchor": anchor, "body_text": "Remember the beta range."},
    )
    assert create_response.status_code == 200
    created_note = create_response.json()
    assert created_note["anchor"]["global_sentence_start"] == 0
    assert created_note["anchor"]["global_sentence_end"] == 1
    assert created_note["anchor"]["anchor_text"] == "Alpha sentence. Beta sentence."

    list_response = client.get(f"/api/recall/documents/{document['id']}/notes")
    assert list_response.status_code == 200
    assert [note["id"] for note in list_response.json()] == [created_note["id"]]

    update_response = client.patch(
        f"/api/recall/notes/{created_note['id']}",
        json={"body_text": "Updated note body."},
    )
    assert update_response.status_code == 200
    assert update_response.json()["body_text"] == "Updated note body."

    search_response = client.get("/api/recall/notes/search", params={"query": "updated"})
    assert search_response.status_code == 200
    assert [hit["id"] for hit in search_response.json()] == [created_note["id"]]

    delete_response = client.delete(f"/api/recall/notes/{created_note['id']}")
    assert delete_response.status_code == 204

    final_list_response = client.get(f"/api/recall/documents/{document['id']}/notes")
    assert final_list_response.status_code == 200
    assert final_list_response.json() == []

    workspace_db = tmp_path / ".data" / "workspace.db"
    with sqlite3.connect(workspace_db) as connection:
        rows = connection.execute(
            """
            SELECT event_type
            FROM change_events
            WHERE entity_type = 'recall_note' AND entity_id = ?
            ORDER BY created_at ASC
            """,
            (created_note["id"],),
        ).fetchall()
        assert [row[0] for row in rows] == ["created", "updated", "deleted"]


def test_recall_notes_create_source_anchor_and_preserve_sentence_validation(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import_response = client.post(
        "/api/documents/import-text",
        json={
            "title": "Source draft guide",
            "text": "Alpha source sentence. Beta source sentence.",
        },
    )
    assert import_response.status_code == 200
    document = import_response.json()

    source_anchor = build_source_note_anchor(document["id"], title="Source draft guide")
    create_response = client.post(
        f"/api/recall/documents/{document['id']}/notes",
        json={"anchor": source_anchor, "body_text": "A manual source-level note."},
    )
    assert create_response.status_code == 200
    created_note = create_response.json()
    assert created_note["anchor"]["kind"] == "source"
    assert created_note["anchor"]["variant_id"] != "source-note-draft"
    assert created_note["anchor"]["block_id"] == f"source:{document['id']}"
    assert created_note["anchor"]["global_sentence_start"] == 0
    assert created_note["anchor"]["global_sentence_end"] == 0
    assert created_note["anchor"]["anchor_text"] == "Source note for Source draft guide"

    list_response = client.get(f"/api/recall/documents/{document['id']}/notes")
    assert list_response.status_code == 200
    assert list_response.json()[0]["anchor"]["kind"] == "source"

    search_response = client.get("/api/recall/notes/search", params={"query": "manual source-level"})
    assert search_response.status_code == 200
    assert search_response.json()[0]["id"] == created_note["id"]
    assert search_response.json()[0]["anchor"]["kind"] == "source"

    update_response = client.patch(
        f"/api/recall/notes/{created_note['id']}",
        json={"body_text": "Updated source-level note."},
    )
    assert update_response.status_code == 200
    assert update_response.json()["body_text"] == "Updated source-level note."

    graph_response = client.post(
        f"/api/recall/notes/{created_note['id']}/promote/graph-node",
        json={"label": "Source Draft", "description": "Source-level note promotion."},
    )
    assert graph_response.status_code == 200
    graph_detail = graph_response.json()
    assert graph_detail["node"]["label"] == "Source Draft"
    source_note_mention = graph_detail["mentions"][0]
    assert source_note_mention["anchor_kind"] == "source"
    assert source_note_mention["manual_source"] == "note"
    assert source_note_mention["note_id"] == created_note["id"]
    assert source_note_mention["chunk_id"] is None
    assert source_note_mention["excerpt"] == "Updated source-level note."
    assert source_note_mention["note_body"] == "Updated source-level note."
    assert source_note_mention["note_anchor_text"] == "Source draft guide personal note"
    assert "Source note for Source draft guide" not in source_note_mention["excerpt"]

    graph_snapshot_response = client.get("/api/recall/graph")
    assert graph_snapshot_response.status_code == 200
    assert any(node["id"] == graph_detail["node"]["id"] for node in graph_snapshot_response.json()["nodes"])

    study_response = client.post(
        f"/api/recall/notes/{created_note['id']}/promote/study-card",
        json={"prompt": "What kind of note was created?", "answer": "A source-attached note."},
    )
    assert study_response.status_code == 200
    source_note_span = study_response.json()["source_spans"][0]
    assert source_note_span["anchor_kind"] == "source"
    assert source_note_span["note_id"] == created_note["id"]
    assert source_note_span["chunk_id"] is None
    assert source_note_span["global_sentence_start"] is None
    assert source_note_span["global_sentence_end"] is None
    assert source_note_span["sentence_start"] is None
    assert source_note_span["sentence_end"] is None
    assert source_note_span["anchor_text"] == "Source draft guide personal note"
    assert source_note_span["excerpt"] == "Updated source-level note."
    assert source_note_span["note_body"] == "Updated source-level note."
    assert source_note_span["source_title"] == "Source draft guide"
    assert "Source note for Source draft guide" not in source_note_span["excerpt"]

    view_response = client.get(
        f"/api/documents/{document['id']}/view",
        params={"mode": "reflowed", "detail_level": "default"},
    )
    assert view_response.status_code == 200
    invalid_sentence_anchor = build_note_anchor(document["id"], view_response.json())
    invalid_sentence_anchor["kind"] = "sentence"
    invalid_sentence_anchor["sentence_end"] = 99
    invalid_response = client.post(
        f"/api/recall/documents/{document['id']}/notes",
        json={"anchor": invalid_sentence_anchor, "body_text": "Should still fail."},
    )
    assert invalid_response.status_code == 400

    delete_response = client.delete(f"/api/recall/notes/{created_note['id']}")
    assert delete_response.status_code == 204


def test_recall_note_promotions_survive_refresh_and_manual_card_regeneration(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import_response = client.post(
        "/api/documents/import-text",
        json={
            "title": "Promotion guide",
            "text": "Alpha sentence. Beta sentence. Gamma sentence.",
        },
    )
    assert import_response.status_code == 200
    document = import_response.json()

    view_response = client.get(
        f"/api/documents/{document['id']}/view",
        params={"mode": "reflowed", "detail_level": "default"},
    )
    assert view_response.status_code == 200
    anchor = build_note_anchor(document["id"], view_response.json(), sentence_start=0, sentence_end=1)
    create_response = client.post(
        f"/api/recall/documents/{document['id']}/notes",
        json={"anchor": anchor, "body_text": "Remember alpha support."},
    )
    assert create_response.status_code == 200
    note = create_response.json()

    promote_graph_response = client.post(
        f"/api/recall/notes/{note['id']}/promote/graph-node",
        json={"label": "Alpha Concept", "description": "A manual note-backed concept."},
    )
    assert promote_graph_response.status_code == 200
    node_detail = promote_graph_response.json()
    assert node_detail["node"]["label"] == "Alpha Concept"
    assert node_detail["node"]["status"] == "confirmed"
    assert any(mention["excerpt"] == note["anchor"]["excerpt_text"] for mention in node_detail["mentions"])

    promote_card_response = client.post(
        f"/api/recall/notes/{note['id']}/promote/study-card",
        json={
            "prompt": "What concept should you remember from the alpha note?",
            "answer": "Alpha Concept",
        },
    )
    assert promote_card_response.status_code == 200
    manual_card = promote_card_response.json()
    assert manual_card["card_type"] == "manual_note"
    assert manual_card["source_spans"][0]["note_id"] == note["id"]

    second_import_response = client.post(
        "/api/documents/import-text",
        json={"title": "Refresh trigger", "text": "Delta sentence. Epsilon sentence."},
    )
    assert second_import_response.status_code == 200

    refreshed_node_response = client.get(f"/api/recall/graph/nodes/{node_detail['node']['id']}")
    assert refreshed_node_response.status_code == 200
    refreshed_node = refreshed_node_response.json()
    assert refreshed_node["node"]["status"] == "confirmed"
    assert any(mention["excerpt"] == note["anchor"]["excerpt_text"] for mention in refreshed_node["mentions"])

    regenerate_response = client.post("/api/recall/study/cards/generate")
    assert regenerate_response.status_code == 200

    cards_response = client.get("/api/recall/study/cards", params={"status": "all"})
    assert cards_response.status_code == 200
    cards = cards_response.json()
    promoted_card = next(card for card in cards if card["id"] == manual_card["id"])
    assert promoted_card["card_type"] == "manual_note"
    assert promoted_card["prompt"] == "What concept should you remember from the alpha note?"


def test_recall_notes_reject_non_reflowed_or_cross_block_anchors(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import_response = client.post(
        "/api/documents/import-text",
        json={
            "title": "Invalid note guide",
            "text": "First block sentence.\n\nSecond block sentence.",
        },
    )
    assert import_response.status_code == 200
    document = import_response.json()

    reflowed_response = client.get(
        f"/api/documents/{document['id']}/view",
        params={"mode": "reflowed", "detail_level": "default"},
    )
    assert reflowed_response.status_code == 200
    reflowed_view = reflowed_response.json()
    invalid_cross_block_anchor = build_note_anchor(document["id"], reflowed_view)
    invalid_cross_block_anchor["sentence_end"] = 1

    cross_block_response = client.post(
        f"/api/recall/documents/{document['id']}/notes",
        json={"anchor": invalid_cross_block_anchor, "body_text": "Should fail."},
    )
    assert cross_block_response.status_code == 400
    assert "single block" in cross_block_response.json()["detail"]

    original_response = client.get(
        f"/api/documents/{document['id']}/view",
        params={"mode": "original", "detail_level": "default"},
    )
    assert original_response.status_code == 200
    original_view = original_response.json()
    invalid_variant_anchor = build_note_anchor(document["id"], original_view)

    invalid_variant_response = client.post(
        f"/api/recall/documents/{document['id']}/notes",
        json={"anchor": invalid_variant_anchor, "body_text": "Wrong variant."},
    )
    assert invalid_variant_response.status_code == 400
    assert "reflowed/default variant" in invalid_variant_response.json()["detail"]


def test_recall_notes_search_filter_and_repair_rebuild_note_fts(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    first_document_response = client.post(
        "/api/documents/import-text",
        json={"title": "First note doc", "text": "Graph memory sentence. Second sentence."},
    )
    second_document_response = client.post(
        "/api/documents/import-text",
        json={"title": "Second note doc", "text": "Graph memory reminder. Different sentence."},
    )
    assert first_document_response.status_code == 200
    assert second_document_response.status_code == 200
    first_document = first_document_response.json()
    second_document = second_document_response.json()

    first_view = client.get(
        f"/api/documents/{first_document['id']}/view",
        params={"mode": "reflowed", "detail_level": "default"},
    ).json()
    second_view = client.get(
        f"/api/documents/{second_document['id']}/view",
        params={"mode": "reflowed", "detail_level": "default"},
    ).json()

    first_create = client.post(
        f"/api/recall/documents/{first_document['id']}/notes",
        json={"anchor": build_note_anchor(first_document["id"], first_view), "body_text": "Graph memory"},
    )
    second_create = client.post(
        f"/api/recall/documents/{second_document['id']}/notes",
        json={"anchor": build_note_anchor(second_document["id"], second_view), "body_text": "Graph memory"},
    )
    assert first_create.status_code == 200
    assert second_create.status_code == 200

    search_response = client.get("/api/recall/notes/search", params={"query": "memory"})
    assert search_response.status_code == 200
    assert len(search_response.json()) == 2

    filtered_search_response = client.get(
        "/api/recall/notes/search",
        params={"query": "memory", "document_id": first_document["id"]},
    )
    assert filtered_search_response.status_code == 200
    filtered_hits = filtered_search_response.json()
    assert len(filtered_hits) == 1
    assert filtered_hits[0]["anchor"]["source_document_id"] == first_document["id"]

    workspace_db = tmp_path / ".data" / "workspace.db"
    with sqlite3.connect(workspace_db) as connection:
        connection.execute("DELETE FROM recall_notes_fts")
        connection.commit()

    integrity_response = client.get("/api/workspace/integrity")
    assert integrity_response.status_code == 200
    integrity = integrity_response.json()
    issue_codes = {issue["code"] for issue in integrity["issues"]}
    assert "recall_notes_fts_drift" in issue_codes

    repair_response = client.post("/api/workspace/repair")
    assert repair_response.status_code == 200
    repair = repair_response.json()
    assert any(action.startswith("rebuild_recall_notes_fts:") for action in repair["actions"])

    repaired_search_response = client.get("/api/recall/notes/search", params={"query": "memory"})
    assert repaired_search_response.status_code == 200
    assert len(repaired_search_response.json()) == 2


def test_recall_retrieval_includes_note_hits_with_anchor_data(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import_response = client.post(
        "/api/documents/import-text",
        json={"title": "Note retrieval guide", "text": "Alpha sentence. Beta sentence. Gamma sentence."},
    )
    assert import_response.status_code == 200
    document = import_response.json()

    view_response = client.get(
        f"/api/documents/{document['id']}/view",
        params={"mode": "reflowed", "detail_level": "default"},
    )
    assert view_response.status_code == 200
    create_response = client.post(
        f"/api/recall/documents/{document['id']}/notes",
        json={
            "anchor": build_note_anchor(document["id"], view_response.json(), sentence_start=0, sentence_end=1),
            "body_text": "Sticky memory cue.",
        },
    )
    assert create_response.status_code == 200
    created_note = create_response.json()

    retrieval_response = client.get("/api/recall/retrieve", params={"query": "sticky memory"})
    assert retrieval_response.status_code == 200
    note_hit = next((hit for hit in retrieval_response.json() if hit["hit_type"] == "note"), None)
    assert note_hit is not None
    assert note_hit["note_id"] == created_note["id"]
    assert note_hit["note_anchor"]["source_document_id"] == document["id"]
    assert note_hit["note_anchor"]["global_sentence_start"] == 0
    assert "saved note match" in note_hit["reasons"]
    assert "note text overlap" in note_hit["reasons"]


def test_delete_document_cleans_recall_notes_and_note_fts_rows(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import_response = client.post(
        "/api/documents/import-text",
        json={"title": "Delete note guide", "text": "Delete me. Delete me later."},
    )
    assert import_response.status_code == 200
    document = import_response.json()

    view_response = client.get(
        f"/api/documents/{document['id']}/view",
        params={"mode": "reflowed", "detail_level": "default"},
    )
    note_response = client.post(
        f"/api/recall/documents/{document['id']}/notes",
        json={"anchor": build_note_anchor(document["id"], view_response.json()), "body_text": "Delete note body"},
    )
    assert note_response.status_code == 200

    delete_response = client.delete(f"/api/documents/{document['id']}")
    assert delete_response.status_code == 204

    notes_response = client.get(f"/api/recall/documents/{document['id']}/notes")
    assert notes_response.status_code == 404

    search_response = client.get("/api/recall/notes/search", params={"query": "delete"})
    assert search_response.status_code == 200
    assert search_response.json() == []

    workspace_db = tmp_path / ".data" / "workspace.db"
    with sqlite3.connect(workspace_db) as connection:
        note_count = connection.execute("SELECT COUNT(*) FROM recall_notes").fetchone()[0]
        note_fts_count = connection.execute("SELECT COUNT(*) FROM recall_notes_fts").fetchone()[0]
        assert note_count == 0
        assert note_fts_count == 0


def test_recall_browser_context_prompts_for_selected_text(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import_response = client.post(
        "/api/documents/import-text",
        json={
            "title": "Selection guide",
            "text": "Spaced repetition improves working memory and retrieval practice.",
        },
    )
    assert import_response.status_code == 200

    context_response = client.post(
        "/api/recall/browser/context",
        json={
            "page_url": "https://notes.example.com/learning",
            "page_title": "Working memory strategies",
            "selection_text": "Spaced repetition improves working memory and retrieval practice.",
            "page_excerpt": "This page discusses study habits and retention.",
            "manual": False,
        },
    )

    assert context_response.status_code == 200
    payload = context_response.json()
    assert payload["trigger_mode"] == "selection"
    assert payload["should_prompt"] is True
    assert payload["hits"]
    assert any("selection overlap" in hit["reasons"] for hit in payload["hits"])


def test_recall_browser_context_boosts_exact_saved_webpage_matches(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    article_html = b"""
    <html>
      <body>
        <article>
          <h1>Fixture browser article</h1>
          <p>Knowledge Graphs support study review.</p>
        </article>
      </body>
    </html>
    """

    with serve_fixture_routes({
        "/browser-article": (200, "text/html; charset=utf-8", article_html),
    }) as base_url:
        import_response = client.post(
            "/api/documents/import-url",
            json={"url": f"{base_url}/browser-article"},
        )
        assert import_response.status_code == 200
        document = import_response.json()

        context_response = client.post(
            "/api/recall/browser/context",
            json={
                "page_url": f"{base_url}/browser-article",
                "page_title": "Fixture browser article",
                "page_excerpt": "Knowledge Graphs support study review.",
                "manual": False,
            },
        )

    assert context_response.status_code == 200
    payload = context_response.json()
    assert payload["should_prompt"] is True
    assert payload["summary"] == "Recall already knows this saved page."
    assert payload["matched_document"]["source_document_id"] == document["id"]
    assert payload["hits"][0]["source_document_id"] == document["id"]
    assert "exact saved page" in payload["hits"][0]["reasons"]


def test_recall_browser_context_reports_exact_saved_page_match_even_without_hits(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    article_html = b"""
    <html>
      <body>
        <article>
          <h1>Fixture browser article</h1>
          <p>Knowledge Graphs support study review.</p>
        </article>
      </body>
    </html>
    """

    with serve_fixture_routes({
        "/browser-article": (200, "text/html; charset=utf-8", article_html),
    }) as base_url:
        import_response = client.post(
            "/api/documents/import-url",
            json={"url": f"{base_url}/browser-article"},
        )
        assert import_response.status_code == 200
        document = import_response.json()

        context_response = client.post(
            "/api/recall/browser/context",
            json={
                "page_url": f"{base_url}/browser-article",
                "page_title": "Home",
                "manual": False,
            },
        )

    assert context_response.status_code == 200
    payload = context_response.json()
    assert payload["should_prompt"] is False
    assert payload["hits"] == []
    assert payload["summary"] == "Recall already knows this saved page."
    assert payload["matched_document"]["source_document_id"] == document["id"]


def test_browser_note_capture_creates_note_for_exact_saved_webpage_match(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    article_html = b"""
    <html>
      <body>
        <article>
          <h1>Fixture browser article</h1>
          <p>Knowledge Graphs support study review.</p>
          <p>Browser notes stay linked to saved sources.</p>
        </article>
      </body>
    </html>
    """

    with serve_fixture_routes({
        "/browser-article": (200, "text/html; charset=utf-8", article_html),
    }) as base_url:
        import_response = client.post(
            "/api/documents/import-url",
            json={"url": f"{base_url}/browser-article"},
        )
        assert import_response.status_code == 200
        document = import_response.json()

        note_response = client.post(
            "/api/recall/browser/notes",
            json={
                "page_url": f"{base_url}/browser-article",
                "selection_text": "Knowledge Graphs support study review.",
                "body_text": "Saved from the browser companion.",
            },
        )

    assert note_response.status_code == 200
    payload = note_response.json()
    assert payload["anchor"]["source_document_id"] == document["id"]
    assert payload["anchor"]["anchor_text"] == "Knowledge Graphs support study review."
    assert payload["body_text"] == "Saved from the browser companion."

    retrieval_response = client.get("/api/recall/retrieve", params={"query": "browser companion"})
    assert retrieval_response.status_code == 200
    assert any(hit["hit_type"] == "note" and hit["note_id"] == payload["id"] for hit in retrieval_response.json())


def test_browser_note_capture_rejects_ambiguous_saved_page_selections(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    article_html = b"""
    <html>
      <body>
        <article>
          <p>Repeated idea.</p>
          <p>Repeated idea.</p>
        </article>
      </body>
    </html>
    """

    with serve_fixture_routes({
        "/browser-article": (200, "text/html; charset=utf-8", article_html),
    }) as base_url:
        import_response = client.post(
            "/api/documents/import-url",
            json={"url": f"{base_url}/browser-article"},
        )
        assert import_response.status_code == 200

        note_response = client.post(
            "/api/recall/browser/notes",
            json={
                "page_url": f"{base_url}/browser-article",
                "selection_text": "Repeated idea.",
            },
        )

    assert note_response.status_code == 400
    assert "multiple saved passages" in note_response.json()["detail"]


def test_recall_browser_context_suppresses_internal_workspace_pages(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)

    context_response = client.post(
        "/api/recall/browser/context",
        json={
            "page_url": "http://127.0.0.1:8000/recall",
            "page_title": "Recall",
            "manual": False,
        },
    )

    assert context_response.status_code == 200
    payload = context_response.json()
    assert payload["should_prompt"] is False
    assert payload["hits"] == []
    assert "internal workspace page" in payload["suppression_reasons"]


def test_recall_browser_context_manual_mode_returns_hits_when_auto_stays_quiet(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import_response = client.post(
        "/api/documents/import-text",
        json={
            "title": "Focus guide",
            "text": "Focus sessions reduce context switching and distractions for deep work.",
        },
    )
    assert import_response.status_code == 200

    auto_response = client.post(
        "/api/recall/browser/context",
        json={
            "page_url": "https://workspace.example.com/post",
            "page_title": "Notes",
            "page_excerpt": "Focus sessions reduce context switching and distractions for deep work.",
            "manual": False,
        },
    )
    assert auto_response.status_code == 200
    auto_payload = auto_response.json()
    assert auto_payload["should_prompt"] is False
    assert auto_payload["hits"] == []
    assert "automatic prompt stayed below confidence threshold" in auto_payload["suppression_reasons"]

    manual_response = client.post(
        "/api/recall/browser/context",
        json={
            "page_url": "https://workspace.example.com/post",
            "page_title": "Notes",
            "page_excerpt": "Focus sessions reduce context switching and distractions for deep work.",
            "manual": True,
        },
    )
    assert manual_response.status_code == 200
    manual_payload = manual_response.json()
    assert manual_payload["should_prompt"] is False
    assert manual_payload["trigger_mode"] == "page"
    assert manual_payload["hits"]


def test_delete_document_removes_document_views_progress_and_stored_file(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)
    import_response = client.post(
        "/api/documents/import-text",
        json={"title": "Plain guide", "text": "One line.\n\nAnother line."},
    )
    assert import_response.status_code == 200
    document = import_response.json()
    stored_file = tmp_path / ".data" / "files" / f"{document['id']}.txt"
    assert stored_file.exists()

    progress_response = client.put(
        f"/api/documents/{document['id']}/progress",
        json={"mode": "reflowed", "sentence_index": 2},
    )
    assert progress_response.status_code == 200

    delete_response = client.delete(f"/api/documents/{document['id']}")
    assert delete_response.status_code == 204
    assert delete_response.content == b""

    listing_response = client.get("/api/documents")
    assert listing_response.status_code == 200
    assert listing_response.json() == []

    view_response = client.get(
        f"/api/documents/{document['id']}/view",
        params={"mode": "reflowed", "detail_level": "default"},
    )
    assert view_response.status_code == 404
    assert not stored_file.exists()


def test_delete_document_returns_404_for_unknown_id(tmp_path, monkeypatch) -> None:
    client = create_client(tmp_path, monkeypatch)

    delete_response = client.delete("/api/documents/missing-document")

    assert delete_response.status_code == 404
    assert delete_response.json()["detail"] == "Document not found."


def test_legacy_reader_db_is_migrated_into_workspace_schema(tmp_path, monkeypatch) -> None:
    seed_legacy_reader_db(tmp_path)
    client = create_client(tmp_path, monkeypatch)

    listing_response = client.get("/api/documents")
    assert listing_response.status_code == 200
    documents = listing_response.json()
    assert [document["id"] for document in documents] == ["legacy-doc-1"]
    assert documents[0]["progress_by_mode"]["reflowed"] == 4

    view_response = client.get(
        "/api/documents/legacy-doc-1/view",
        params={"mode": "reflowed", "detail_level": "default"},
    )
    assert view_response.status_code == 200
    assert view_response.json()["blocks"][0]["text"] == "Legacy paragraph."

    settings_response = client.get("/api/settings")
    assert settings_response.status_code == 200
    assert settings_response.json()["contrast_theme"] == "soft"

    workspace_db = tmp_path / ".data" / "workspace.db"
    assert workspace_db.exists()

    with sqlite3.connect(workspace_db) as connection:
        change_event = connection.execute(
            """
            SELECT event_type, payload_json
            FROM change_events
            WHERE entity_type = 'workspace' AND event_type = 'legacy_reader_db_migrated'
            ORDER BY created_at DESC
            LIMIT 1
            """
        ).fetchone()
        assert change_event is not None
        assert change_event[0] == "legacy_reader_db_migrated"

        migrated_from = connection.execute(
            "SELECT value_text FROM workspace_meta WHERE key = 'legacy_reader_migrated_from'"
        ).fetchone()
        assert migrated_from is not None
        assert migrated_from[0].endswith("reader.db")

        chunk_rows = connection.execute(
            "SELECT COUNT(*) FROM content_chunks WHERE source_document_id = 'legacy-doc-1'"
        ).fetchone()
        assert chunk_rows is not None
        assert chunk_rows[0] >= 1

    recall_detail_response = client.get("/api/recall/documents/legacy-doc-1")
    assert recall_detail_response.status_code == 200
    assert recall_detail_response.json()["chunk_count"] >= 1

    search_response = client.get("/api/recall/search", params={"query": "Legacy"})
    assert search_response.status_code == 200
    assert search_response.json()
