from __future__ import annotations

import subprocess
import sys
from pathlib import Path


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
