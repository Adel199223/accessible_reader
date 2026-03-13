from __future__ import annotations

import argparse
import json
import platform
import sqlite3
import tempfile
from pathlib import Path
from time import perf_counter_ns
from typing import Any

from .ids import new_uuid7_str
from .models import BrowserContextRequest, DocumentRecord, DocumentView
from .parsers import ParsedDocument, parse_text_input, parse_uploaded_file, parse_web_page
from .reflow import reflow_blocks
from .storage import Repository
from .text_utils import now_iso, sha256_text
from .variant_contract import build_variant_metadata


def run_stage8_benchmarks(*, iterations: int = 3, data_dir: Path | None = None) -> dict[str, Any]:
    if iterations < 1:
        raise ValueError("iterations must be at least 1")

    with tempfile.TemporaryDirectory(prefix="accessible-reader-stage8-bench-") as temp_dir:
        workspace_root = Path(data_dir) if data_dir else Path(temp_dir)
        workspace_root.mkdir(parents=True, exist_ok=True)
        files_dir = workspace_root / "files"
        files_dir.mkdir(parents=True, exist_ok=True)
        repository = Repository(
            workspace_root / "workspace.db",
            legacy_database_path=workspace_root / "reader.db",
        )
        repository.init_db()

        def benchmark(func) -> dict[str, Any]:
            result: Any = None
            runs_ms: list[float] = []
            for index in range(iterations):
                started_at = perf_counter_ns()
                result = func(index)
                ended_at = perf_counter_ns()
                runs_ms.append(round((ended_at - started_at) / 1_000_000, 3))
            return {
                "avg_ms": round(sum(runs_ms) / len(runs_ms), 3),
                "max_ms": max(runs_ms),
                "min_ms": min(runs_ms),
                "result": result,
                "runs_ms": runs_ms,
            }

        ingest_text = benchmark(
            lambda index: _save_parsed_document(
                repository,
                files_dir,
                parse_text_input(
                    (
                        f"Recall benchmark text {index}. "
                        "Knowledge Graphs support Study Cards and retrieval practice."
                    ),
                    f"Benchmark text {index}",
                ),
                raw_bytes=(
                    f"Recall benchmark text {index}. "
                    "Knowledge Graphs support Study Cards and retrieval practice."
                ).encode("utf-8"),
                extension=".txt",
            ).id,
        )

        ingest_file = benchmark(
            lambda index: _save_parsed_document(
                repository,
                files_dir,
                parse_uploaded_file(
                    f"benchmark-{index}.md",
                    (
                        f"# Benchmark file {index}\n\n"
                        "Knowledge Graphs map relationships.\n\n"
                        "1. Study Cards stay grounded.\n"
                        "2. Retrieval practice stays local.\n"
                    ).encode("utf-8"),
                ),
                raw_bytes=(
                    f"# Benchmark file {index}\n\n"
                    "Knowledge Graphs map relationships.\n\n"
                    "1. Study Cards stay grounded.\n"
                    "2. Retrieval practice stays local.\n"
                ).encode("utf-8"),
                extension=".md",
            ).id,
        )

        article_template = """
        <html>
          <body>
            <article>
              <h1>{title}</h1>
              <p>Knowledge Graphs support study review and retrieval practice.</p>
              <p>Browser context lookup should stay grounded in saved sources.</p>
            </article>
          </body>
        </html>
        """
        ingest_web = benchmark(
            lambda index: _save_parsed_document(
                repository,
                files_dir,
                parse_web_page(
                    f"https://bench.example.com/articles/{index}",
                    article_template.format(title=f"Benchmark article {index}"),
                ),
                raw_bytes=article_template.format(title=f"Benchmark article {index}").encode("utf-8"),
                extension=".html",
            ).id,
        )

        retrieval_query = "Knowledge Graphs retrieval practice"
        search_benchmark = benchmark(
            lambda _: len(repository.search_recall(retrieval_query, limit=10)),
        )
        retrieve_benchmark = benchmark(
            lambda _: len(repository.retrieve_recall(retrieval_query, limit=10)),
        )
        browser_context_benchmark = benchmark(
            lambda _: len(
                repository.get_browser_context(
                    BrowserContextRequest(
                        page_url="https://bench.example.com/articles/0",
                        page_title="Benchmark article 0",
                        page_excerpt="Knowledge Graphs support study review and retrieval practice.",
                        manual=False,
                        limit=5,
                    )
                ).hits
            ),
        )
        manifest_benchmark = benchmark(
            lambda _: repository.build_workspace_export_manifest().change_event_count,
        )
        bundle_benchmark = benchmark(
            lambda _: len(repository.build_workspace_export_bundle()[1]),
        )
        merge_benchmark = benchmark(
            lambda _: sum(repository.preview_workspace_merge(repository.build_workspace_export_manifest()).summary.values()),
        )
        study_generate_benchmark = benchmark(
            lambda _: repository.regenerate_study_cards().total_count,
        )

        card_ids = [card.id for card in repository.list_study_cards(status="all", limit=max(iterations, 10))]
        if not card_ids:
            raise RuntimeError("Stage 8 benchmark workspace did not generate any study cards.")
        ratings = ["good", "hard", "easy", "forgot"]
        study_review_benchmark = benchmark(
            lambda index: repository.review_study_card(card_ids[index % len(card_ids)], ratings[index % len(ratings)]).review_count,
        )

        manifest = repository.build_workspace_export_manifest()
        integrity = repository.get_workspace_integrity()

        return {
            "generated_at": now_iso(),
            "iterations": iterations,
            "environment": {
                "platform": platform.platform(),
                "python": platform.python_version(),
                "sqlite": sqlite3.sqlite_version,
            },
            "workspace": {
                "attachment_count": len(manifest.attachments),
                "change_event_count": manifest.change_event_count,
                "document_count": len(repository.list_documents()),
                "entity_counts": manifest.entity_counts,
                "integrity_ok": integrity.ok,
                "integrity_issue_count": len(integrity.issues),
                "warning_count": len(manifest.warnings),
            },
            "benchmarks": {
                "browser_context_lookup": _serialize_benchmark(browser_context_benchmark),
                "ingest_file": _serialize_benchmark(ingest_file),
                "ingest_text": _serialize_benchmark(ingest_text),
                "ingest_webpage_snapshot": _serialize_benchmark(ingest_web),
                "recall_retrieve": _serialize_benchmark(retrieve_benchmark),
                "recall_search": _serialize_benchmark(search_benchmark),
                "study_generate": _serialize_benchmark(study_generate_benchmark),
                "study_review": _serialize_benchmark(study_review_benchmark),
                "workspace_export_bundle": _serialize_benchmark(bundle_benchmark),
                "workspace_export_manifest": _serialize_benchmark(manifest_benchmark),
                "workspace_merge_preview": _serialize_benchmark(merge_benchmark),
            },
        }


def _serialize_benchmark(result: dict[str, Any]) -> dict[str, Any]:
    return {
        "avg_ms": result["avg_ms"],
        "max_ms": result["max_ms"],
        "min_ms": result["min_ms"],
        "runs_ms": result["runs_ms"],
        "sample_result": result["result"],
    }

def _save_parsed_document(
    repository: Repository,
    files_dir: Path,
    parsed: ParsedDocument,
    *,
    raw_bytes: bytes,
    extension: str,
) -> DocumentRecord:
    content_hash = sha256_text(parsed.plain_text)
    existing = repository.find_document_by_hash(content_hash)
    if existing:
        return existing

    document_id = new_uuid7_str()
    stored_path = files_dir / f"{document_id}{extension}"
    stored_path.write_bytes(raw_bytes)
    timestamp = now_iso()
    original_view = DocumentView(
        mode="original",
        title=parsed.title,
        blocks=parsed.blocks,
        variant_metadata=build_variant_metadata(parsed.blocks),
        generated_by="local",
        source_hash=content_hash,
        updated_at=timestamp,
    )
    reflowed_blocks = reflow_blocks(parsed.blocks)
    reflowed_view = DocumentView(
        mode="reflowed",
        title=parsed.title,
        blocks=reflowed_blocks,
        variant_metadata=build_variant_metadata(reflowed_blocks),
        generated_by="local",
        source_hash=content_hash,
        updated_at=timestamp,
    )
    return repository.save_document(
        document_id=document_id,
        title=parsed.title,
        source_type=parsed.source_type,
        file_name=parsed.file_name,
        source_locator=parsed.source_locator,
        stored_path=str(stored_path),
        content_hash=content_hash,
        original_view=original_view,
        reflowed_view=reflowed_view,
        searchable_text=parsed.plain_text,
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Run Stage 8 hardening benchmarks.")
    parser.add_argument("--iterations", type=int, default=3, help="Number of runs per benchmark.")
    parser.add_argument("--output", type=Path, default=None, help="Optional JSON output path.")
    args = parser.parse_args()

    result = run_stage8_benchmarks(iterations=args.iterations)
    rendered = json.dumps(result, indent=2)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(rendered + "\n", encoding="utf-8")
    else:
        print(rendered)


if __name__ == "__main__":
    main()
