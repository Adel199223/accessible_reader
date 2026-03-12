from __future__ import annotations

from pathlib import Path
import sqlite3

from .models import DocumentRecord, DocumentView, ReaderSettings
from .text_utils import now_iso, safe_query_terms


class Repository:
    def __init__(self, database_path: Path):
        self.database_path = database_path

    def connect(self) -> sqlite3.Connection:
        self.database_path.parent.mkdir(parents=True, exist_ok=True)
        connection = sqlite3.connect(self.database_path)
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA foreign_keys = ON;")
        return connection

    def init_db(self) -> None:
        self.database_path.parent.mkdir(parents=True, exist_ok=True)
        with self.connect() as connection:
            connection.executescript(
                """
                CREATE TABLE IF NOT EXISTS documents (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    source_type TEXT NOT NULL,
                    file_name TEXT,
                    stored_path TEXT,
                    content_hash TEXT NOT NULL UNIQUE,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS document_views (
                    document_id TEXT NOT NULL,
                    mode TEXT NOT NULL,
                    detail_level TEXT NOT NULL DEFAULT 'default',
                    generated_by TEXT NOT NULL,
                    model TEXT,
                    source_hash TEXT NOT NULL,
                    view_json TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    PRIMARY KEY (document_id, mode, detail_level),
                    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
                );

                CREATE TABLE IF NOT EXISTS reading_progress (
                    document_id TEXT NOT NULL,
                    mode TEXT NOT NULL,
                    sentence_index INTEGER NOT NULL DEFAULT 0,
                    updated_at TEXT NOT NULL,
                    PRIMARY KEY (document_id, mode),
                    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
                );

                CREATE TABLE IF NOT EXISTS settings (
                    key TEXT PRIMARY KEY,
                    value_json TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );

                CREATE VIRTUAL TABLE IF NOT EXISTS documents_fts USING fts5(
                    document_id UNINDEXED,
                    title,
                    body
                );
                """
            )

    def find_document_by_hash(self, content_hash: str) -> DocumentRecord | None:
        with self.connect() as connection:
            row = connection.execute(
                "SELECT id FROM documents WHERE content_hash = ?",
                (content_hash,),
            ).fetchone()
        if not row:
            return None
        return self.get_document(row["id"])

    def save_document(
        self,
        *,
        document_id: str,
        title: str,
        source_type: str,
        file_name: str | None,
        stored_path: str | None,
        content_hash: str,
        original_view: DocumentView,
        reflowed_view: DocumentView,
        searchable_text: str,
    ) -> DocumentRecord:
        timestamp = now_iso()
        with self.connect() as connection:
            connection.execute(
                """
                INSERT INTO documents (
                    id, title, source_type, file_name, stored_path, content_hash, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (document_id, title, source_type, file_name, stored_path, content_hash, timestamp, timestamp),
            )
            self._save_view_with_connection(connection, document_id, original_view)
            self._save_view_with_connection(connection, document_id, reflowed_view)
            connection.execute(
                "INSERT INTO documents_fts (document_id, title, body) VALUES (?, ?, ?)",
                (document_id, title, searchable_text),
            )
        return self.get_document(document_id)

    def list_documents(self, query: str = "") -> list[DocumentRecord]:
        with self.connect() as connection:
            if query.strip():
                terms = safe_query_terms(query)
                if terms:
                    fts_query = " AND ".join(f"{term}*" for term in terms)
                    rows = connection.execute(
                        """
                        SELECT d.*
                        FROM documents d
                        INNER JOIN documents_fts ON documents_fts.document_id = d.id
                        WHERE documents_fts MATCH ?
                        ORDER BY d.updated_at DESC
                        """,
                        (fts_query,),
                    ).fetchall()
                else:
                    rows = connection.execute(
                        "SELECT * FROM documents WHERE title LIKE ? ORDER BY updated_at DESC",
                        (f"%{query.strip()}%",),
                    ).fetchall()
            else:
                rows = connection.execute(
                    "SELECT * FROM documents ORDER BY updated_at DESC"
                ).fetchall()
            return [self._row_to_record(connection, row) for row in rows]

    def get_document(self, document_id: str) -> DocumentRecord | None:
        with self.connect() as connection:
            row = connection.execute(
                "SELECT * FROM documents WHERE id = ?",
                (document_id,),
            ).fetchone()
            if not row:
                return None
            return self._row_to_record(connection, row)

    def get_view(self, document_id: str, mode: str, detail_level: str = "default") -> DocumentView | None:
        with self.connect() as connection:
            row = connection.execute(
                """
                SELECT view_json
                FROM document_views
                WHERE document_id = ? AND mode = ? AND detail_level = ?
                """,
                (document_id, mode, detail_level),
            ).fetchone()
        if not row:
            return None
        return DocumentView.model_validate_json(row["view_json"])

    def save_view(self, document_id: str, view: DocumentView) -> DocumentView:
        with self.connect() as connection:
            self._save_view_with_connection(connection, document_id, view)
        return view

    def get_reader_settings(self) -> ReaderSettings:
        with self.connect() as connection:
            row = connection.execute(
                "SELECT value_json FROM settings WHERE key = 'reader'",
            ).fetchone()
        if not row:
            return ReaderSettings()
        return ReaderSettings.model_validate_json(row["value_json"])

    def save_reader_settings(self, settings: ReaderSettings) -> ReaderSettings:
        timestamp = now_iso()
        with self.connect() as connection:
            connection.execute(
                """
                INSERT INTO settings (key, value_json, updated_at)
                VALUES ('reader', ?, ?)
                ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = excluded.updated_at
                """,
                (settings.model_dump_json(), timestamp),
            )
        return settings

    def save_progress(self, document_id: str, mode: str, sentence_index: int) -> None:
        timestamp = now_iso()
        with self.connect() as connection:
            connection.execute(
                """
                INSERT INTO reading_progress (document_id, mode, sentence_index, updated_at)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(document_id, mode) DO UPDATE SET
                    sentence_index = excluded.sentence_index,
                    updated_at = excluded.updated_at
                """,
                (document_id, mode, sentence_index, timestamp),
            )

    def _save_view_with_connection(self, connection: sqlite3.Connection, document_id: str, view: DocumentView) -> None:
        timestamp = now_iso()
        connection.execute(
            """
            INSERT INTO document_views (
                document_id, mode, detail_level, generated_by, model, source_hash, view_json, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(document_id, mode, detail_level) DO UPDATE SET
                generated_by = excluded.generated_by,
                model = excluded.model,
                source_hash = excluded.source_hash,
                view_json = excluded.view_json,
                updated_at = excluded.updated_at
            """,
            (
                document_id,
                view.mode,
                view.detail_level,
                view.generated_by,
                view.model,
                view.source_hash,
                view.model_dump_json(),
                timestamp,
                timestamp,
            ),
        )
        connection.execute("UPDATE documents SET updated_at = ? WHERE id = ?", (timestamp, document_id))

    def _row_to_record(self, connection: sqlite3.Connection, row: sqlite3.Row) -> DocumentRecord:
        mode_rows = connection.execute(
            "SELECT DISTINCT mode FROM document_views WHERE document_id = ? ORDER BY mode",
            (row["id"],),
        ).fetchall()
        progress_rows = connection.execute(
            "SELECT mode, sentence_index FROM reading_progress WHERE document_id = ?",
            (row["id"],),
        ).fetchall()
        return DocumentRecord(
            id=row["id"],
            title=row["title"],
            source_type=row["source_type"],
            file_name=row["file_name"],
            created_at=row["created_at"],
            updated_at=row["updated_at"],
            available_modes=[mode_row["mode"] for mode_row in mode_rows],
            progress_by_mode={progress_row["mode"]: progress_row["sentence_index"] for progress_row in progress_rows},
        )
