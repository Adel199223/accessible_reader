from __future__ import annotations

from contextlib import contextmanager
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import importlib
import json
import sqlite3
import threading
from io import BytesIO
from zipfile import ZipFile

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

    manifest_response = client.get("/api/workspace/export.manifest.json")
    assert manifest_response.status_code == 200
    remote_manifest = json.loads(json.dumps(manifest_response.json()))

    source_entity = next(entity for entity in remote_manifest["entities"] if entity["entity_type"] == "source_document")
    source_entity["payload_digest"] = "f" * 64
    source_entity["updated_at"] = "2030-01-01T00:00:00+00:00"

    variant_entity = next(entity for entity in remote_manifest["entities"] if entity["entity_type"] == "document_variant")
    variant_entity["payload_digest"] = "0" * 64
    variant_entity["updated_at"] = "2020-01-01T00:00:00+00:00"

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
    assert operations[(setting_entity["entity_type"], setting_entity["entity_key"])]["decision"] == "skip_equal"
    assert operations[(imported_entity["entity_type"], imported_entity["entity_key"])]["decision"] == "import_remote"
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

    refreshed_overview_response = client.get("/api/recall/study/overview")
    assert refreshed_overview_response.status_code == 200
    assert refreshed_overview_response.json()["review_event_count"] >= 1


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
