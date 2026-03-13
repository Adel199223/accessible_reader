from __future__ import annotations

from contextlib import contextmanager
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import importlib
import sqlite3
import threading

from fastapi.testclient import TestClient
import pytest


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

    progress_response = client.put(
        f"/api/documents/{document['id']}/progress",
        json={"mode": "reflowed", "sentence_index": 2},
    )
    assert progress_response.status_code == 200

    listing_response = client.get("/api/documents")
    assert listing_response.status_code == 200
    assert listing_response.json()[0]["progress_by_mode"]["reflowed"] == 2
    assert (tmp_path / ".data" / "workspace.db").exists()


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
            WHERE entity_type = 'workspace'
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
