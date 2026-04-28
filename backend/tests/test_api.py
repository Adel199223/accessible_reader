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
        assert attachment["relative_path"] in archive.namelist()
        assert archive.read(attachment["relative_path"]) == raw_bytes
        manifest_in_archive = json.loads(archive.read("manifest.json").decode("utf-8"))
        assert manifest_in_archive["attachments"][0]["id"] == attachment["id"]


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

    list_response = client.get("/api/recall/study/cards", params={"status": "all", "limit": 100})
    assert list_response.status_code == 200
    listed_cards = list_response.json()
    assert any(card["id"] == created_card["id"] for card in listed_cards)

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
