from __future__ import annotations

from pathlib import Path
import json
import sqlite3
from typing import Any

from .ids import new_uuid7_str
from .models import ChangeEvent, DocumentRecord, DocumentView, ReaderSettings
from .text_utils import now_iso, safe_query_terms


DEFAULT_DEVICE_ID = "desktop-local"
DEFAULT_SESSION_KIND = "reader"
SCHEMA_VERSION = "1"


class Repository:
    def __init__(
        self,
        database_path: Path,
        *,
        legacy_database_path: Path | None = None,
        device_id: str = DEFAULT_DEVICE_ID,
    ):
        self.database_path = database_path
        self.legacy_database_path = legacy_database_path
        self.device_id = device_id

    def connect(self) -> sqlite3.Connection:
        return self._connect_to_path(self.database_path)

    def init_db(self) -> None:
        self.database_path.parent.mkdir(parents=True, exist_ok=True)
        with self.connect() as connection:
            self._init_workspace_schema(connection)
        self._migrate_legacy_reader_db_if_needed()

    def find_document_by_hash(self, content_hash: str) -> DocumentRecord | None:
        with self.connect() as connection:
            row = connection.execute(
                "SELECT id FROM source_documents WHERE content_hash = ?",
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
        source_locator: str | None,
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
                INSERT INTO source_documents (
                    id,
                    title,
                    source_type,
                    file_name,
                    source_locator,
                    stored_path,
                    content_hash,
                    metadata_json,
                    created_at,
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    document_id,
                    title,
                    source_type,
                    file_name,
                    source_locator,
                    stored_path,
                    content_hash,
                    "{}",
                    timestamp,
                    timestamp,
                ),
            )
            self._save_view_with_connection(connection, document_id, original_view)
            self._save_view_with_connection(connection, document_id, reflowed_view)
            connection.execute(
                "INSERT INTO source_documents_fts (source_document_id, title, body) VALUES (?, ?, ?)",
                (document_id, title, searchable_text),
            )
            self._append_change_event_with_connection(
                connection,
                entity_type="source_document",
                entity_id=document_id,
                event_type="created",
                payload={
                    "title": title,
                    "source_type": source_type,
                    "content_hash": content_hash,
                    "source_locator": source_locator,
                },
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
                        SELECT sd.*
                        FROM source_documents sd
                        INNER JOIN source_documents_fts ON source_documents_fts.source_document_id = sd.id
                        WHERE source_documents_fts MATCH ?
                        ORDER BY sd.updated_at DESC
                        """,
                        (fts_query,),
                    ).fetchall()
                else:
                    rows = connection.execute(
                        "SELECT * FROM source_documents WHERE title LIKE ? ORDER BY updated_at DESC",
                        (f"%{query.strip()}%",),
                    ).fetchall()
            else:
                rows = connection.execute(
                    "SELECT * FROM source_documents ORDER BY updated_at DESC"
                ).fetchall()
            return [self._row_to_record(connection, row) for row in rows]

    def get_document(self, document_id: str) -> DocumentRecord | None:
        with self.connect() as connection:
            row = connection.execute(
                "SELECT * FROM source_documents WHERE id = ?",
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
                FROM document_variants
                WHERE source_document_id = ? AND mode = ? AND detail_level = ?
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
                "SELECT value_json FROM app_settings WHERE namespace = 'reader'",
            ).fetchone()
        if not row:
            return ReaderSettings()
        return ReaderSettings.model_validate_json(row["value_json"])

    def save_reader_settings(self, settings: ReaderSettings) -> ReaderSettings:
        timestamp = now_iso()
        with self.connect() as connection:
            connection.execute(
                """
                INSERT INTO app_settings (namespace, value_json, updated_at)
                VALUES ('reader', ?, ?)
                ON CONFLICT(namespace) DO UPDATE SET
                    value_json = excluded.value_json,
                    updated_at = excluded.updated_at
                """,
                (settings.model_dump_json(), timestamp),
            )
            self._append_change_event_with_connection(
                connection,
                entity_type="app_settings",
                entity_id="reader",
                event_type="updated",
                payload=settings.model_dump(mode="json"),
            )
        return settings

    def save_progress(self, document_id: str, mode: str, sentence_index: int) -> None:
        timestamp = now_iso()
        with self.connect() as connection:
            row = connection.execute(
                """
                SELECT id
                FROM reading_sessions
                WHERE source_document_id = ? AND session_kind = ? AND mode = ? AND device_id = ?
                """,
                (document_id, DEFAULT_SESSION_KIND, mode, self.device_id),
            ).fetchone()
            session_id = row["id"] if row else new_uuid7_str()
            connection.execute(
                """
                INSERT INTO reading_sessions (
                    id,
                    source_document_id,
                    session_kind,
                    mode,
                    sentence_index,
                    device_id,
                    created_at,
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(source_document_id, session_kind, mode, device_id) DO UPDATE SET
                    sentence_index = excluded.sentence_index,
                    updated_at = excluded.updated_at
                """,
                (
                    session_id,
                    document_id,
                    DEFAULT_SESSION_KIND,
                    mode,
                    sentence_index,
                    self.device_id,
                    timestamp,
                    timestamp,
                ),
            )
            self._append_change_event_with_connection(
                connection,
                entity_type="reading_session",
                entity_id=session_id,
                event_type="progress_saved",
                payload={
                    "source_document_id": document_id,
                    "mode": mode,
                    "sentence_index": sentence_index,
                    "device_id": self.device_id,
                },
            )

    def delete_document(self, document_id: str) -> str | None:
        with self.connect() as connection:
            row = connection.execute(
                "SELECT stored_path, title, source_type FROM source_documents WHERE id = ?",
                (document_id,),
            ).fetchone()
            if not row:
                return None

            self._append_change_event_with_connection(
                connection,
                entity_type="source_document",
                entity_id=document_id,
                event_type="deleted",
                payload={
                    "title": row["title"],
                    "source_type": row["source_type"],
                    "stored_path": row["stored_path"],
                },
            )
            connection.execute(
                "DELETE FROM source_documents_fts WHERE source_document_id = ?",
                (document_id,),
            )
            connection.execute(
                "DELETE FROM source_documents WHERE id = ?",
                (document_id,),
            )
            return row["stored_path"]

    def _connect_to_path(self, database_path: Path) -> sqlite3.Connection:
        database_path.parent.mkdir(parents=True, exist_ok=True)
        connection = sqlite3.connect(database_path)
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA foreign_keys = ON;")
        return connection

    def _init_workspace_schema(self, connection: sqlite3.Connection) -> None:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS workspace_meta (
                key TEXT PRIMARY KEY,
                value_text TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS source_documents (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                source_type TEXT NOT NULL,
                file_name TEXT,
                source_locator TEXT,
                stored_path TEXT,
                content_hash TEXT NOT NULL UNIQUE,
                metadata_json TEXT NOT NULL DEFAULT '{}',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS document_variants (
                id TEXT PRIMARY KEY,
                source_document_id TEXT NOT NULL,
                mode TEXT NOT NULL,
                detail_level TEXT NOT NULL DEFAULT 'default',
                generated_by TEXT NOT NULL,
                model TEXT,
                source_hash TEXT NOT NULL,
                view_json TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                UNIQUE(source_document_id, mode, detail_level),
                FOREIGN KEY (source_document_id) REFERENCES source_documents(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS reading_sessions (
                id TEXT PRIMARY KEY,
                source_document_id TEXT NOT NULL,
                session_kind TEXT NOT NULL,
                mode TEXT NOT NULL,
                sentence_index INTEGER NOT NULL DEFAULT 0,
                device_id TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                UNIQUE(source_document_id, session_kind, mode, device_id),
                FOREIGN KEY (source_document_id) REFERENCES source_documents(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS app_settings (
                namespace TEXT PRIMARY KEY,
                value_json TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS change_events (
                id TEXT PRIMARY KEY,
                entity_type TEXT NOT NULL,
                entity_id TEXT NOT NULL,
                event_type TEXT NOT NULL,
                payload_json TEXT NOT NULL,
                device_id TEXT NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS content_chunks (
                id TEXT PRIMARY KEY,
                source_document_id TEXT NOT NULL,
                variant_id TEXT,
                block_id TEXT,
                ordinal INTEGER NOT NULL DEFAULT 0,
                text TEXT NOT NULL,
                metadata_json TEXT NOT NULL DEFAULT '{}',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (source_document_id) REFERENCES source_documents(id) ON DELETE CASCADE,
                FOREIGN KEY (variant_id) REFERENCES document_variants(id) ON DELETE SET NULL
            );

            CREATE TABLE IF NOT EXISTS entity_mentions (
                id TEXT PRIMARY KEY,
                source_document_id TEXT NOT NULL,
                variant_id TEXT,
                block_id TEXT,
                text TEXT NOT NULL,
                normalized_text TEXT,
                entity_type TEXT NOT NULL,
                start_offset INTEGER,
                end_offset INTEGER,
                confidence REAL,
                metadata_json TEXT NOT NULL DEFAULT '{}',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (source_document_id) REFERENCES source_documents(id) ON DELETE CASCADE,
                FOREIGN KEY (variant_id) REFERENCES document_variants(id) ON DELETE SET NULL
            );

            CREATE TABLE IF NOT EXISTS knowledge_nodes (
                id TEXT PRIMARY KEY,
                label TEXT NOT NULL,
                node_type TEXT NOT NULL,
                description TEXT,
                confidence REAL,
                metadata_json TEXT NOT NULL DEFAULT '{}',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS knowledge_edges (
                id TEXT PRIMARY KEY,
                source_id TEXT NOT NULL,
                target_id TEXT NOT NULL,
                relation_type TEXT NOT NULL,
                provenance TEXT NOT NULL,
                confidence REAL,
                metadata_json TEXT NOT NULL DEFAULT '{}',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (source_id) REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
                FOREIGN KEY (target_id) REFERENCES knowledge_nodes(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS review_cards (
                id TEXT PRIMARY KEY,
                source_document_id TEXT NOT NULL,
                prompt TEXT NOT NULL,
                answer TEXT NOT NULL,
                card_type TEXT NOT NULL,
                source_spans_json TEXT NOT NULL DEFAULT '[]',
                scheduling_state_json TEXT NOT NULL DEFAULT '{}',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (source_document_id) REFERENCES source_documents(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS review_events (
                id TEXT PRIMARY KEY,
                review_card_id TEXT NOT NULL,
                rating INTEGER NOT NULL,
                scheduling_state_json TEXT NOT NULL DEFAULT '{}',
                reviewed_at TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (review_card_id) REFERENCES review_cards(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS embeddings (
                id TEXT PRIMARY KEY,
                source_document_id TEXT NOT NULL,
                variant_id TEXT,
                block_id TEXT,
                embedding_model TEXT NOT NULL,
                vector_json TEXT NOT NULL,
                metadata_json TEXT NOT NULL DEFAULT '{}',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (source_document_id) REFERENCES source_documents(id) ON DELETE CASCADE,
                FOREIGN KEY (variant_id) REFERENCES document_variants(id) ON DELETE SET NULL
            );

            CREATE VIRTUAL TABLE IF NOT EXISTS source_documents_fts USING fts5(
                source_document_id UNINDEXED,
                title,
                body
            );
            """
        )
        self._set_meta_value_with_connection(connection, "schema_version", SCHEMA_VERSION)

    def _migrate_legacy_reader_db_if_needed(self) -> None:
        if not self.legacy_database_path or not self.legacy_database_path.exists():
            return
        if self.legacy_database_path.resolve() == self.database_path.resolve():
            return

        with self.connect() as connection:
            already_migrated = connection.execute(
                "SELECT 1 FROM workspace_meta WHERE key = 'legacy_reader_migration_completed_at'",
            ).fetchone()
            has_workspace_documents = connection.execute(
                "SELECT 1 FROM source_documents LIMIT 1",
            ).fetchone()
        if already_migrated or has_workspace_documents:
            return

        with self._connect_to_path(self.legacy_database_path) as legacy_connection:
            if not self._legacy_schema_exists(legacy_connection):
                return

            document_rows = legacy_connection.execute(
                "SELECT * FROM documents ORDER BY created_at ASC"
            ).fetchall()
            variant_rows = legacy_connection.execute(
                "SELECT * FROM document_views ORDER BY created_at ASC"
            ).fetchall()
            progress_rows = legacy_connection.execute(
                "SELECT * FROM reading_progress ORDER BY updated_at ASC"
            ).fetchall()
            settings_rows = legacy_connection.execute(
                "SELECT * FROM settings ORDER BY updated_at ASC"
            ).fetchall()
            fts_rows = legacy_connection.execute(
                "SELECT document_id, title, body FROM documents_fts"
            ).fetchall()

        migration_timestamp = now_iso()
        with self.connect() as connection:
            for row in document_rows:
                connection.execute(
                    """
                    INSERT INTO source_documents (
                        id,
                        title,
                        source_type,
                        file_name,
                        source_locator,
                        stored_path,
                        content_hash,
                        metadata_json,
                        created_at,
                        updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        row["id"],
                        row["title"],
                        row["source_type"],
                        row["file_name"],
                        None,
                        row["stored_path"],
                        row["content_hash"],
                        "{}",
                        row["created_at"],
                        row["updated_at"],
                    ),
                )

            for row in variant_rows:
                connection.execute(
                    """
                    INSERT INTO document_variants (
                        id,
                        source_document_id,
                        mode,
                        detail_level,
                        generated_by,
                        model,
                        source_hash,
                        view_json,
                        created_at,
                        updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        new_uuid7_str(),
                        row["document_id"],
                        row["mode"],
                        row["detail_level"],
                        row["generated_by"],
                        row["model"],
                        row["source_hash"],
                        row["view_json"],
                        row["created_at"],
                        row["updated_at"],
                    ),
                )

            for row in progress_rows:
                connection.execute(
                    """
                    INSERT INTO reading_sessions (
                        id,
                        source_document_id,
                        session_kind,
                        mode,
                        sentence_index,
                        device_id,
                        created_at,
                        updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(source_document_id, session_kind, mode, device_id) DO UPDATE SET
                        sentence_index = excluded.sentence_index,
                        updated_at = excluded.updated_at
                    """,
                    (
                        new_uuid7_str(),
                        row["document_id"],
                        DEFAULT_SESSION_KIND,
                        row["mode"],
                        row["sentence_index"],
                        self.device_id,
                        row["updated_at"],
                        row["updated_at"],
                    ),
                )

            for row in settings_rows:
                connection.execute(
                    """
                    INSERT INTO app_settings (namespace, value_json, updated_at)
                    VALUES (?, ?, ?)
                    ON CONFLICT(namespace) DO UPDATE SET
                        value_json = excluded.value_json,
                        updated_at = excluded.updated_at
                    """,
                    (row["key"], row["value_json"], row["updated_at"]),
                )

            for row in fts_rows:
                connection.execute(
                    "INSERT INTO source_documents_fts (source_document_id, title, body) VALUES (?, ?, ?)",
                    (row["document_id"], row["title"], row["body"]),
                )

            self._append_change_event_with_connection(
                connection,
                entity_type="workspace",
                entity_id="legacy-reader-migration",
                event_type="legacy_reader_db_migrated",
                payload={
                    "legacy_database_path": str(self.legacy_database_path),
                    "document_count": len(document_rows),
                },
                created_at=migration_timestamp,
            )
            self._set_meta_value_with_connection(
                connection,
                "legacy_reader_migrated_from",
                str(self.legacy_database_path),
                updated_at=migration_timestamp,
            )
            self._set_meta_value_with_connection(
                connection,
                "legacy_reader_migration_completed_at",
                migration_timestamp,
                updated_at=migration_timestamp,
            )

    def _legacy_schema_exists(self, connection: sqlite3.Connection) -> bool:
        rows = connection.execute(
            "SELECT name FROM sqlite_master WHERE type = 'table'"
        ).fetchall()
        table_names = {row["name"] for row in rows}
        return {"documents", "document_views", "reading_progress", "settings"}.issubset(table_names)

    def _save_view_with_connection(self, connection: sqlite3.Connection, document_id: str, view: DocumentView) -> None:
        timestamp = now_iso()
        row = connection.execute(
            """
            SELECT id
            FROM document_variants
            WHERE source_document_id = ? AND mode = ? AND detail_level = ?
            """,
            (document_id, view.mode, view.detail_level),
        ).fetchone()
        variant_id = row["id"] if row else new_uuid7_str()
        event_type = "updated" if row else "created"
        connection.execute(
            """
            INSERT INTO document_variants (
                id,
                source_document_id,
                mode,
                detail_level,
                generated_by,
                model,
                source_hash,
                view_json,
                created_at,
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(source_document_id, mode, detail_level) DO UPDATE SET
                generated_by = excluded.generated_by,
                model = excluded.model,
                source_hash = excluded.source_hash,
                view_json = excluded.view_json,
                updated_at = excluded.updated_at
            """,
            (
                variant_id,
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
        connection.execute("UPDATE source_documents SET updated_at = ? WHERE id = ?", (timestamp, document_id))
        self._append_change_event_with_connection(
            connection,
            entity_type="document_variant",
            entity_id=variant_id,
            event_type=event_type,
            payload={
                "source_document_id": document_id,
                "mode": view.mode,
                "detail_level": view.detail_level,
            },
            created_at=timestamp,
        )

    def _row_to_record(self, connection: sqlite3.Connection, row: sqlite3.Row) -> DocumentRecord:
        mode_rows = connection.execute(
            """
            SELECT DISTINCT mode
            FROM document_variants
            WHERE source_document_id = ?
            ORDER BY mode
            """,
            (row["id"],),
        ).fetchall()
        progress_rows = connection.execute(
            """
            SELECT mode, sentence_index
            FROM reading_sessions
            WHERE source_document_id = ? AND session_kind = ? AND device_id = ?
            """,
            (row["id"], DEFAULT_SESSION_KIND, self.device_id),
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

    def _append_change_event_with_connection(
        self,
        connection: sqlite3.Connection,
        *,
        entity_type: str,
        entity_id: str,
        event_type: str,
        payload: dict[str, Any],
        created_at: str | None = None,
    ) -> ChangeEvent:
        event = ChangeEvent(
            id=new_uuid7_str(),
            entity_type=entity_type,
            entity_id=entity_id,
            event_type=event_type,
            payload=payload,
            device_id=self.device_id,
            created_at=created_at or now_iso(),
        )
        connection.execute(
            """
            INSERT INTO change_events (id, entity_type, entity_id, event_type, payload_json, device_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                event.id,
                event.entity_type,
                event.entity_id,
                event.event_type,
                json.dumps(event.payload, sort_keys=True),
                event.device_id,
                event.created_at,
            ),
        )
        return event

    def _set_meta_value_with_connection(
        self,
        connection: sqlite3.Connection,
        key: str,
        value_text: str,
        *,
        updated_at: str | None = None,
    ) -> None:
        connection.execute(
            """
            INSERT INTO workspace_meta (key, value_text, updated_at)
            VALUES (?, ?, ?)
            ON CONFLICT(key) DO UPDATE SET
                value_text = excluded.value_text,
                updated_at = excluded.updated_at
            """,
            (key, value_text, updated_at or now_iso()),
        )
