from __future__ import annotations

import importlib.util
import subprocess
import sys
from pathlib import Path
from types import ModuleType


def load_contract_script() -> ModuleType:
    repo_root = Path(__file__).resolve().parents[2]
    script_path = repo_root / "scripts" / "contracts" / "audit_api_types_contract.py"
    spec = importlib.util.spec_from_file_location("audit_api_types_contract", script_path)
    assert spec is not None
    assert spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def test_api_types_contract_inventory_matches_expected_fixture() -> None:
    repo_root = Path(__file__).resolve().parents[2]
    script_path = repo_root / "scripts" / "contracts" / "audit_api_types_contract.py"

    result = subprocess.run(
        [sys.executable, str(script_path), "--check"],
        cwd=repo_root,
        capture_output=True,
        text=True,
        timeout=30,
        check=False,
    )

    assert result.returncode == 0, (
        "API/types contract inventory drifted.\n\n"
        f"stdout:\n{result.stdout}\n\n"
        f"stderr:\n{result.stderr}"
    )


def test_openapi_snapshot_matches_expected_fixture() -> None:
    repo_root = Path(__file__).resolve().parents[2]
    script_path = repo_root / "scripts" / "contracts" / "audit_api_types_contract.py"

    result = subprocess.run(
        [sys.executable, str(script_path), "--check-openapi-snapshot"],
        cwd=repo_root,
        capture_output=True,
        text=True,
        timeout=30,
        check=False,
    )

    assert result.returncode == 0, (
        "OpenAPI snapshot drifted.\n\n"
        f"stdout:\n{result.stdout}\n\n"
        f"stderr:\n{result.stderr}"
    )


def test_generated_openapi_reference_is_current() -> None:
    repo_root = Path(__file__).resolve().parents[2]
    script_path = repo_root / "scripts" / "contracts" / "audit_api_types_contract.py"

    result = subprocess.run(
        [sys.executable, str(script_path), "--check-generated-openapi-reference"],
        cwd=repo_root,
        capture_output=True,
        text=True,
        timeout=60,
        check=False,
    )

    assert result.returncode == 0, (
        "Generated OpenAPI TypeScript reference drifted.\n\n"
        f"stdout:\n{result.stdout}\n\n"
        f"stderr:\n{result.stderr}"
    )


def test_generated_type_mapping_matches_expected_fixture() -> None:
    repo_root = Path(__file__).resolve().parents[2]
    script_path = repo_root / "scripts" / "contracts" / "audit_api_types_contract.py"

    result = subprocess.run(
        [sys.executable, str(script_path), "--check-generated-type-mapping"],
        cwd=repo_root,
        capture_output=True,
        text=True,
        timeout=60,
        check=False,
    )

    assert result.returncode == 0, (
        "Generated OpenAPI TypeScript mapping drifted.\n\n"
        f"stdout:\n{result.stdout}\n\n"
        f"stderr:\n{result.stderr}"
    )


def test_generated_type_adoptions_match_expected_fixture() -> None:
    repo_root = Path(__file__).resolve().parents[2]
    script_path = repo_root / "scripts" / "contracts" / "audit_api_types_contract.py"

    result = subprocess.run(
        [sys.executable, str(script_path), "--check-generated-type-adoptions"],
        cwd=repo_root,
        capture_output=True,
        text=True,
        timeout=60,
        check=False,
    )

    assert result.returncode == 0, (
        "Generated OpenAPI TypeScript adoption guard drifted.\n\n"
        f"stdout:\n{result.stdout}\n\n"
        f"stderr:\n{result.stderr}"
    )


def test_generated_type_alias_parser_requires_pure_identifier_alias() -> None:
    contract_script = load_contract_script()

    aliases = contract_script.parse_frontend_type_alias_targets(
        """
export type DocumentView = GeneratedDocumentView
export type ExpandedDocumentView = GeneratedDocumentView & { extra: string }
export type NullableDocumentView = GeneratedDocumentView | null
"""
    )

    assert aliases == {"DocumentView": "GeneratedDocumentView"}


def test_generated_type_adoption_scanner_reports_unreviewed_aliases() -> None:
    contract_script = load_contract_script()

    adoptions = contract_script.collect_generated_type_alias_adoptions(
        {"DocumentView": "DocumentView", "DocumentRecord": "DocumentRecord"},
        {
            "frontend/src/types/reader.ts": """
import type {
  DocumentView as GeneratedDocumentView,
  DocumentRecord as GeneratedDocumentRecord,
} from '../generated/openapi'

export type DocumentView = GeneratedDocumentView
export type DocumentRecord = GeneratedDocumentRecord
"""
        },
    )

    assert [(item["frontend"], item["schema"]) for item in adoptions] == [
        ("DocumentRecord", "DocumentRecord"),
        ("DocumentView", "DocumentView"),
    ]


def test_generated_type_adoption_check_reports_unreviewed_alias(
    capsys, tmp_path: Path
) -> None:
    contract_script = load_contract_script()
    expected_path = tmp_path / "expected_generated_type_adoptions.json"
    expected_path.write_text(
        """
{
  "version": 1,
  "adoptions": [
    {
      "frontend": "DocumentView",
      "schema": "DocumentView",
      "module": "frontend/src/types/reader.ts",
      "import_path": "../generated/openapi",
      "imported_alias": "GeneratedDocumentView"
    }
  ],
  "deferred_adoptions": []
}
""",
        encoding="utf-8",
    )

    result = contract_script.run_generated_type_adoptions_check(
        {
            "version": 1,
            "adoptions": [
                {
                    "frontend": "DocumentRecord",
                    "schema": "DocumentRecord",
                    "module": "frontend/src/types/documents.ts",
                    "import_path": "../generated/openapi",
                    "imported_alias": "GeneratedDocumentRecord",
                    "generated_root_alias_schema": "DocumentRecord",
                    "imported_alias_schema": "DocumentRecord",
                    "exported_type_alias_target": "GeneratedDocumentRecord",
                    "has_frontend_interface": False,
                },
                {
                    "frontend": "DocumentView",
                    "schema": "DocumentView",
                    "module": "frontend/src/types/reader.ts",
                    "import_path": "../generated/openapi",
                    "imported_alias": "GeneratedDocumentView",
                    "generated_root_alias_schema": "DocumentView",
                    "imported_alias_schema": "DocumentView",
                    "exported_type_alias_target": "GeneratedDocumentView",
                    "has_frontend_interface": False,
                },
            ],
            "deferred_adoptions": [],
        },
        expected_path=expected_path,
    )

    assert result == 1
    assert "Unreviewed generated type adoptions" in capsys.readouterr().err
