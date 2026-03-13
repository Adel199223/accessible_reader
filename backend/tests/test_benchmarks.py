from __future__ import annotations

from app.benchmarks import run_stage8_benchmarks


def test_stage8_benchmark_harness_returns_expected_sections(tmp_path) -> None:
    report = run_stage8_benchmarks(iterations=1, data_dir=tmp_path / ".bench")

    assert report["iterations"] == 1
    assert report["workspace"]["document_count"] >= 3
    assert report["workspace"]["integrity_ok"] is True

    expected_sections = {
        "browser_context_lookup",
        "ingest_file",
        "ingest_text",
        "ingest_webpage_snapshot",
        "recall_retrieve",
        "recall_search",
        "study_generate",
        "study_review",
        "workspace_export_bundle",
        "workspace_export_manifest",
        "workspace_merge_preview",
    }
    assert set(report["benchmarks"]) == expected_sections

    for benchmark in report["benchmarks"].values():
        assert len(benchmark["runs_ms"]) == 1
        assert benchmark["avg_ms"] >= 0
        assert benchmark["min_ms"] >= 0
        assert benchmark["max_ms"] >= 0
