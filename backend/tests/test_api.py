from __future__ import annotations

import importlib

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
