#!/usr/bin/env python3
"""Print a check-only API/types contract inventory.

The script is intentionally descriptive. It imports the local FastAPI app,
reads OpenAPI, parses backend Pydantic models and frontend TypeScript exports,
then emits Markdown to stdout. Drift findings are report-only in this slice.
"""

from __future__ import annotations

import argparse
import ast
import subprocess
from dataclasses import asdict, dataclass
import json
from pathlib import Path
import re
import sys
import tempfile
from typing import Any


REPO_ROOT = Path(__file__).resolve().parents[2]
BACKEND_DIR = REPO_ROOT / "backend"
MAIN_PATH = REPO_ROOT / "backend" / "app" / "main.py"
MODELS_PATH = REPO_ROOT / "backend" / "app" / "models.py"
API_TS_PATH = REPO_ROOT / "frontend" / "src" / "api.ts"
API_MODULES_DIR = REPO_ROOT / "frontend" / "src" / "api"
TYPES_TS_PATH = REPO_ROOT / "frontend" / "src" / "types.ts"
TYPES_MODULES_DIR = REPO_ROOT / "frontend" / "src" / "types"
GENERATED_OPENAPI_REFERENCE_PATH = REPO_ROOT / "frontend" / "src" / "generated" / "openapi.ts"
OPENAPI_TYPESCRIPT_BIN = REPO_ROOT / "frontend" / "node_modules" / ".bin" / "openapi-typescript"
EXPECTED_CONTRACT_PATH = REPO_ROOT / "scripts" / "contracts" / "expected_api_types_contract.json"
EXPECTED_OPENAPI_SNAPSHOT_PATH = (
    REPO_ROOT / "scripts" / "contracts" / "expected_openapi_snapshot.json"
)
EXPECTED_GENERATED_TYPE_MAPPING_PATH = (
    REPO_ROOT / "scripts" / "contracts" / "expected_generated_type_mapping.json"
)
EXPECTED_GENERATED_TYPE_ADOPTIONS_PATH = (
    REPO_ROOT / "scripts" / "contracts" / "expected_generated_type_adoptions.json"
)

IGNORED_OPENAPI_SCHEMAS = {"HTTPValidationError", "ValidationError"}

NAMING_ONLY_MATCHES = {
    "DocumentMode": "ViewMode",
    "DetailLevel": "SummaryDetail",
    "SourceDocument": "DocumentRecord / RecallDocumentRecord",
    "GraphDecisionRequest": "inline decision parameter in api.ts",
    "StudyReviewRequest": "StudyReviewRating plus optional attemptId",
    "StudyScheduleStateRequest": "inline schedule/unschedule action",
    "StudyCardBulkDeleteRequest": "bulkDeleteRecallStudyCards(cardIds)",
    "ImportTextRequest": "importTextDocument(text, title)",
    "ImportUrlRequest": "importUrlDocument(url)",
    "TransformRequest": "generateDocumentView(documentId, mode, detailLevel)",
    "ProgressUpdate": "saveProgress(documentId, mode, sentenceIndex, options)",
    "ReadingCompleteRequest": "completeRecallDocumentReading(documentId, mode)",
}

KNOWN_WRAPPER_PATHS = {
    # These wrappers build optional query strings through nested template
    # literals, which intentionally exceeds the simple regex parser below.
    "fetchDocuments": "/api/documents",
    "fetchLibraryReadingQueue": "/api/recall/library/reading-queue",
    "fetchRecallStudyProgress": "/api/recall/study/progress",
}

DOMAIN_NAME_OVERRIDES = {
    "BatchResolvedImportFormat": "import",
    "ChangeEvent": "workspace import/export",
    "GraphReviewStatus": "graph",
    "ReadingCompleteRequest": "recall documents",
    "ReadingCompleteResult": "recall documents",
    "StudyKnowledgeStage": "study",
    "TransformRequest": "reader views",
}


@dataclass(frozen=True)
class RouteInfo:
    method: str
    path: str
    domain: str
    behavior: str
    request: str
    response: str


@dataclass(frozen=True)
class WrapperInfo:
    name: str
    method: str
    path: str
    domain: str
    behavior: str
    request: str
    response: str
    match: str


@dataclass(frozen=True)
class TypeInfo:
    name: str
    kind: str
    domain: str
    match: str


@dataclass(frozen=True)
class ModelInfo:
    name: str
    domain: str
    field_count: int
    required_count: int
    optional_count: int
    defaulted_count: int
    notes: str


def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except OSError as exc:
        raise SystemExit(f"Could not read {path}: {exc}") from exc


def read_frontend_api_source() -> str:
    paths = [API_TS_PATH]
    if API_MODULES_DIR.exists():
        paths.extend(sorted(API_MODULES_DIR.glob("*.ts")))
    return "\n\n".join(read_text(path) for path in paths)


def read_frontend_type_source() -> str:
    paths = [TYPES_TS_PATH]
    if TYPES_MODULES_DIR.exists():
        paths.extend(sorted(TYPES_MODULES_DIR.glob("*.ts")))
    return "\n\n".join(read_text(path) for path in paths)


def read_frontend_type_module_sources() -> dict[str, str]:
    paths = [TYPES_TS_PATH]
    if TYPES_MODULES_DIR.exists():
        paths.extend(sorted(TYPES_MODULES_DIR.glob("*.ts")))
    return {str(path.relative_to(REPO_ROOT)): read_text(path) for path in paths}


def load_openapi() -> dict[str, Any]:
    sys.path.insert(0, str(BACKEND_DIR))
    try:
        from app.main import app  # type: ignore
    except Exception as exc:  # pragma: no cover - diagnostic path
        raise SystemExit(f"Could not import FastAPI app: {exc}") from exc
    try:
        return app.openapi()
    except Exception as exc:  # pragma: no cover - diagnostic path
        raise SystemExit(f"Could not generate OpenAPI: {exc}") from exc


def schema_name(schema: Any) -> str:
    if not isinstance(schema, dict):
        return "-"
    if "$ref" in schema:
        return schema["$ref"].rsplit("/", 1)[-1]
    if "items" in schema:
        return f"list[{schema_name(schema['items'])}]"
    if "anyOf" in schema:
        return " | ".join(schema_name(item) for item in schema["anyOf"])
    if "allOf" in schema:
        return " & ".join(schema_name(item) for item in schema["allOf"])
    if "type" in schema:
        return str(schema["type"])
    return "-"


def domain_for_path(path: str) -> str:
    if path == "/api/health":
        return "health"
    if path == "/api/settings":
        return "settings/progress"
    if path.startswith("/api/workspace"):
        return "workspace import/export"
    if path.startswith("/api/documents/import"):
        return "import"
    if path.startswith("/api/documents") and ("/view" in path or "/transform" in path or "/progress" in path):
        return "reader views"
    if path.startswith("/api/documents"):
        return "documents"
    if path.startswith("/api/recall/documents"):
        return "recall documents"
    if path.startswith("/api/recall/notes"):
        return "recall notes"
    if path.startswith("/api/recall/browser"):
        return "browser context"
    if path.startswith("/api/recall/graph"):
        return "graph"
    if path.startswith("/api/recall/study"):
        return "study"
    if path.startswith("/api/recall/library"):
        return "library/collections"
    if path.startswith("/api/recall/search") or path.startswith("/api/recall/retrieve"):
        return "search/retrieval"
    return "other"


def domain_for_name(name: str) -> str:
    if name in DOMAIN_NAME_OVERRIDES:
        return DOMAIN_NAME_OVERRIDES[name]
    lowered = name.lower()
    if "workspace" in lowered or "attachment" in lowered or "portable" in lowered:
        return "workspace import/export"
    if "batchimport" in lowered or lowered.startswith("import"):
        return "import"
    if "library" in lowered or "collection" in lowered or "readingqueue" in lowered:
        return "library/collections"
    if "browser" in lowered:
        return "browser context"
    if (
        "knowledge" in lowered
        or "graph" in lowered
        or "mention" in lowered
        or "edge" in lowered
        or "relation" in lowered
        or "evidence" in lowered
    ):
        return "graph"
    if (
        "stud" in lowered
        or ("review" in lowered and "preview" not in lowered)
        or "card" in lowered
        or "attempt" in lowered
    ):
        return "study"
    if "settings" in lowered or "accessibility" in lowered:
        return "settings/progress"
    if "note" in lowered:
        return "recall notes"
    if "documentview" in lowered or "viewblock" in lowered or "reader" in lowered or "progress" in lowered:
        return "reader views"
    if "document" in lowered or "source" in lowered or "chunk" in lowered:
        return "documents"
    if "retrieval" in lowered or "search" in lowered:
        return "search/retrieval"
    if "health" in lowered:
        return "settings/progress"
    return "other"


def route_behavior(path: str, method: str, operation: dict[str, Any]) -> str:
    request_body = operation.get("requestBody", {})
    request_content = sorted((request_body.get("content") or {}).keys())
    if "multipart/form-data" in request_content:
        return "form/upload"
    if path.endswith(".zip") or path.endswith(".md") or "export.zip" in path:
        return "stream/download"
    if path.endswith("/asset") or "/attachments/" in path:
        return "file/download"
    if "application/json" in request_content or method in {"POST", "PUT", "PATCH", "DELETE"}:
        return "json"
    return "json"


def request_shape(operation: dict[str, Any]) -> str:
    parts: list[str] = []
    request_body = operation.get("requestBody", {})
    for content_type, body in sorted((request_body.get("content") or {}).items()):
        parts.append(f"{content_type}: {schema_name(body.get('schema'))}")
    params = operation.get("parameters") or []
    if params:
        rendered = ", ".join(
            f"{param.get('name')}:{param.get('in')}" for param in params if isinstance(param, dict)
        )
        parts.append(f"params: {rendered}")
    return "; ".join(parts) if parts else "-"


def response_shape(operation: dict[str, Any]) -> str:
    responses = operation.get("responses") or {}
    response = responses.get("200") or responses.get("201") or responses.get("204") or {}
    content = response.get("content") or {}
    if not content:
        return "204/no schema" if "204" in responses else "download/no schema"
    rendered = []
    for content_type, payload in sorted(content.items()):
        rendered.append(f"{content_type}: {schema_name(payload.get('schema'))}")
    return "; ".join(rendered)


def collect_routes(openapi: dict[str, Any]) -> list[RouteInfo]:
    routes: list[RouteInfo] = []
    for path, methods in sorted((openapi.get("paths") or {}).items()):
        for method, operation in sorted(methods.items()):
            if method.lower() not in {"get", "post", "put", "patch", "delete"}:
                continue
            routes.append(
                RouteInfo(
                    method=method.upper(),
                    path=path,
                    domain=domain_for_path(path),
                    behavior=route_behavior(path, method.upper(), operation),
                    request=request_shape(operation),
                    response=response_shape(operation),
                )
            )
    return routes


def normalize_route_path(path: str) -> str:
    path = re.sub(r"\?.*", "", path)
    path = re.sub(r"\$\{encodeURIComponent\(([^)]+)\)\}", r"{\1}", path)
    path = re.sub(r"\$\{([^}]+)\}", r"{\1}", path)
    path = path.rstrip("?")
    return path


def path_regex(path: str) -> re.Pattern[str]:
    escaped = re.escape(re.sub(r"\?.*", "", path))
    escaped = re.sub(r"\\\{[^}]+\\\}", r"[^/]+", escaped)
    return re.compile(f"^{escaped}$")


def find_matching_route(path: str, method: str, routes: list[RouteInfo]) -> str:
    if not path:
        return "-"
    normalized = normalize_route_path(path)
    for route in routes:
        if method != "URL" and route.method != method:
            continue
        if path_regex(route.path).match(normalized):
            return f"{route.method} {route.path}"
    if method == "URL":
        for route in routes:
            if path_regex(route.path).match(normalized):
                return f"{route.method} {route.path}"
    return "NO MATCH"


def extract_exported_functions(source: str) -> list[tuple[str, str, str]]:
    matches = list(re.finditer(r"export\s+(async\s+)?function\s+([A-Za-z0-9_]+)\s*\(", source))
    functions: list[tuple[str, str, str]] = []
    for match in matches:
        name = match.group(2)
        paren_depth = 1
        params_end = match.end()
        in_param_string: str | None = None
        param_escaped = False
        for index in range(match.end(), len(source)):
            char = source[index]
            if in_param_string:
                if param_escaped:
                    param_escaped = False
                elif char == "\\":
                    param_escaped = True
                elif char == in_param_string:
                    in_param_string = None
                continue
            if char in {"'", '"', "`"}:
                in_param_string = char
                continue
            if char == "(":
                paren_depth += 1
            elif char == ")":
                paren_depth -= 1
                if paren_depth == 0:
                    params_end = index + 1
                    break
        opening = source.find("{", params_end)
        if opening == -1:
            continue
        depth = 0
        closing = opening
        in_string: str | None = None
        escaped = False
        for index in range(opening, len(source)):
            char = source[index]
            if in_string:
                if escaped:
                    escaped = False
                elif char == "\\":
                    escaped = True
                elif char == in_string:
                    in_string = None
                continue
            if char in {"'", '"', "`"}:
                in_string = char
                continue
            if char == "{":
                depth += 1
            elif char == "}":
                depth -= 1
                if depth == 0:
                    closing = index + 1
                    break
        functions.append((name, source[match.start() : opening], source[opening:closing]))
    return functions


def collect_wrappers(api_source: str, routes: list[RouteInfo]) -> list[WrapperInfo]:
    wrappers: list[WrapperInfo] = []
    path_literal_pattern = re.compile(r"([`'\"])(/api/.*?)(?<!\\)\1", re.S)
    for name, signature, body in extract_exported_functions(api_source):
        path_match = path_literal_pattern.search(body)
        path = path_match.group(2).strip() if path_match else ""
        path = KNOWN_WRAPPER_PATHS.get(name, path)
        response_match = re.search(r"request<([^>]+)>", body, re.S)
        response = "URL" if "buildApiUrl" in body and "request<" not in body else "-"
        if response_match:
            response = " ".join(response_match.group(1).split())
        method_match = re.search(r"method:\s*['\"]([A-Z]+)['\"]", body)
        method = method_match.group(1) if method_match else ("URL" if response == "URL" else "GET")
        params = " ".join(signature.split())
        payload_match = re.search(r"payload:\s*([A-Za-z0-9_]+)", params)
        request = payload_match.group(1) if payload_match else "-"
        if "FormData" in body:
            request = "FormData"
        elif "JSON.stringify({" in body and request == "-":
            request = "inline JSON"
        behavior: list[str] = []
        if "FormData" in body:
            behavior.append("form")
        if "URLSearchParams" in body or "?" in path:
            behavior.append("query")
        if response == "URL":
            behavior.append("download-url")
        if "buildApiUrl" in body and response != "URL":
            behavior.append("normalizes asset URL")
        wrappers.append(
            WrapperInfo(
                name=name,
                method=method,
                path=normalize_route_path(path),
                domain=domain_for_path(path),
                behavior=", ".join(behavior) if behavior else "json",
                request=request,
                response=response,
                match=find_matching_route(path, method, routes),
            )
        )
    return wrappers


def parse_frontend_types(source: str, backend_names: set[str]) -> list[TypeInfo]:
    pattern = re.compile(r"^export\s+(interface|type|enum|class)\s+([A-Za-z0-9_]+)", re.M)
    items: list[TypeInfo] = []
    reverse_naming = {frontend: backend for backend, frontend in NAMING_ONLY_MATCHES.items()}
    for kind, name in pattern.findall(source):
        if name in backend_names:
            match = "exact backend name"
        elif name in reverse_naming:
            match = f"naming-only match: {reverse_naming[name]}"
        else:
            match = "frontend-only or UI/helper type"
        items.append(TypeInfo(name=name, kind=kind, domain=domain_for_name(name), match=match))
    return items


def parse_frontend_exported_type_names(source: str) -> set[str]:
    pattern = re.compile(r"^export\s+(?:interface|type|enum|class)\s+([A-Za-z0-9_]+)", re.M)
    return set(pattern.findall(source))


def extract_frontend_interface_body(source: str, name: str) -> str | None:
    match = re.search(rf"^export\s+interface\s+{re.escape(name)}\b", source, re.M)
    if not match:
        return None
    opening = source.find("{", match.end())
    if opening == -1:
        return None
    depth = 0
    for index in range(opening, len(source)):
        char = source[index]
        if char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                return source[opening + 1 : index]
    return None


def parse_frontend_interface_fields(source: str, name: str) -> list[str] | None:
    body = extract_frontend_interface_body(source, name)
    if body is None:
        return None
    fields = re.findall(r"^\s*([A-Za-z_][A-Za-z0-9_]*)\??\s*:", body, re.M)
    return sorted(set(fields))


def parse_generated_schema_aliases(source: str) -> dict[str, str]:
    pattern = re.compile(
        r"^export\s+type\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*"
        r"components\[['\"]schemas['\"]\]\[['\"]([^'\"]+)['\"]\];",
        re.M,
    )
    return {alias: schema for alias, schema in pattern.findall(source)}


def parse_type_import_alias_body(body: str) -> dict[str, str]:
    aliases: dict[str, str] = {}
    for raw_part in body.split(","):
        part = " ".join(raw_part.strip().split())
        if not part:
            continue
        alias_match = re.fullmatch(r"([A-Za-z_$][A-Za-z0-9_$]*)\s+as\s+([A-Za-z_$][A-Za-z0-9_$]*)", part)
        if alias_match:
            source_name, local_name = alias_match.groups()
            aliases[local_name] = source_name
        elif re.fullmatch(r"[A-Za-z_$][A-Za-z0-9_$]*", part):
            aliases[part] = part
    return aliases


def parse_generated_type_imports_by_path(source: str) -> dict[str, dict[str, str]]:
    imports: dict[str, dict[str, str]] = {}
    pattern = re.compile(
        r"import\s+type\s+\{(?P<body>[^}]*)\}\s+from\s+['\"]"
        r"(?P<import_path>\.\.?/generated/openapi)['\"]",
        re.M | re.S,
    )
    for match in pattern.finditer(source):
        imports[match.group("import_path")] = parse_type_import_alias_body(match.group("body"))
    return imports


def parse_generated_type_import_aliases(source: str, import_path: str = "../generated/openapi") -> dict[str, str]:
    return parse_generated_type_imports_by_path(source).get(import_path, {})


def parse_frontend_type_alias_targets(source: str) -> dict[str, str]:
    pattern = re.compile(
        r"^export\s+type\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*"
        r"([A-Za-z_$][A-Za-z0-9_$]*)\s*;?\s*$",
        re.M,
    )
    return {name: target for name, target in pattern.findall(source)}


def parse_backend_models(source: str, openapi_schemas: set[str]) -> list[ModelInfo]:
    try:
        tree = ast.parse(source)
    except SyntaxError as exc:
        raise SystemExit(f"Could not parse backend models.py: {exc}") from exc
    models: list[ModelInfo] = []
    for node in tree.body:
        if not isinstance(node, ast.ClassDef):
            continue
        fields = [item for item in node.body if isinstance(item, ast.AnnAssign)]
        required = 0
        optional = 0
        defaulted = 0
        notes: list[str] = []
        for field in fields:
            annotation = ast.unparse(field.annotation)
            if "None" in annotation:
                optional += 1
            if field.value is None:
                required += 1
            else:
                defaulted += 1
                value_text = ast.unparse(field.value)
                if "Field(" in value_text:
                    notes.append("Field constraints/defaults")
            if "Literal[" in annotation:
                notes.append("literal fields")
        validators = sum(
            1
            for item in node.body
            if isinstance(item, ast.FunctionDef)
            and any(
                isinstance(dec, ast.Call) and getattr(dec.func, "id", "") == "field_validator"
                for dec in item.decorator_list
            )
        )
        if validators:
            notes.append(f"{validators} validators")
        if node.name not in openapi_schemas:
            notes.append("not emitted as OpenAPI component")
        models.append(
            ModelInfo(
                name=node.name,
                domain=domain_for_name(node.name),
                field_count=len(fields),
                required_count=required,
                optional_count=optional,
                defaulted_count=defaulted,
                notes=", ".join(dict.fromkeys(notes)) or "-",
            )
        )
    return models


def parse_literal_aliases(source: str) -> dict[str, str]:
    tree = ast.parse(source)
    aliases: dict[str, str] = {}
    for node in tree.body:
        if not isinstance(node, ast.Assign):
            continue
        if not any(isinstance(target, ast.Name) for target in node.targets):
            continue
        value_text = ast.unparse(node.value)
        if "Literal[" not in value_text:
            continue
        for target in node.targets:
            if isinstance(target, ast.Name):
                aliases[target.id] = value_text
    return aliases


def schema_refs_from_routes(routes: list[RouteInfo]) -> set[str]:
    names: set[str] = set()
    for route in routes:
        for text in (route.request, route.response):
            for name in re.findall(r"\b[A-Z][A-Za-z0-9_]+\b", text):
                if name not in IGNORED_OPENAPI_SCHEMAS:
                    names.add(name)
    return names


def markdown_table(headers: list[str], rows: list[list[str]]) -> None:
    print("| " + " | ".join(headers) + " |")
    print("| " + " | ".join("---" for _ in headers) + " |")
    for row in rows:
        print("| " + " | ".join(cell.replace("\n", " ").replace("|", "\\|") for cell in row) + " |")


def collect_inventory() -> dict[str, Any]:
    openapi = load_openapi()
    models_source = read_text(MODELS_PATH)
    api_source = read_frontend_api_source()
    types_source = read_frontend_type_source()

    routes = collect_routes(openapi)
    schemas = {
        name
        for name in (openapi.get("components", {}).get("schemas", {}) or {})
        if name not in IGNORED_OPENAPI_SCHEMAS
    }
    backend_models = parse_backend_models(models_source, schemas)
    literal_aliases = parse_literal_aliases(models_source)
    backend_contract_names = schemas | set(literal_aliases)
    wrappers = collect_wrappers(api_source, routes)
    frontend_types = parse_frontend_types(types_source, backend_contract_names)
    frontend_type_names = {item.name for item in frontend_types}
    route_schema_refs = schema_refs_from_routes(routes)

    exact_matches = sorted(frontend_type_names & backend_contract_names)
    backend_only = sorted((route_schema_refs | set(literal_aliases)) - frontend_type_names)
    frontend_only = sorted(frontend_type_names - backend_contract_names - set(NAMING_ONLY_MATCHES.values()))
    wrapper_no_match = [wrapper for wrapper in wrappers if wrapper.match == "NO MATCH"]
    wrapped_routes = {wrapper.match for wrapper in wrappers if wrapper.match != "NO MATCH"}
    route_no_wrapper = [
        route for route in routes if f"{route.method} {route.path}" not in wrapped_routes
    ]

    return {
        "summary": {
            "openapi_paths": len(openapi.get("paths", {})),
            "openapi_route_operations": len(routes),
            "openapi_schemas": len(schemas),
            "backend_pydantic_classes": len(backend_models),
            "backend_literal_aliases": len(literal_aliases),
            "frontend_api_exports": len(wrappers),
            "frontend_type_exports": len(frontend_types),
            "exact_frontend_backend_contract_name_matches": len(exact_matches),
            "api_wrappers_without_matched_route": len(wrapper_no_match),
            "backend_routes_without_api_ts_wrapper_or_url_builder": len(route_no_wrapper),
        },
        "routes": [asdict(route) for route in routes],
        "frontend_api_wrappers": [asdict(wrapper) for wrapper in wrappers],
        "backend_models": [asdict(model) for model in backend_models],
        "backend_literal_aliases": [
            {"alias": name, "domain": domain_for_name(name), "definition": value}
            for name, value in sorted(literal_aliases.items())
        ],
        "frontend_types": [asdict(item) for item in frontend_types],
        "drift": {
            "exact_matches": exact_matches,
            "naming_only_or_inline_matches": [
                {"backend": backend, "frontend_or_api_ts": frontend}
                for backend, frontend in sorted(NAMING_ONLY_MATCHES.items())
            ],
            "backend_route_schemas_missing_frontend_type_names": backend_only,
            "frontend_types_without_backend_names": frontend_only,
            "api_wrappers_without_backend_route": [asdict(wrapper) for wrapper in wrapper_no_match],
            "backend_routes_without_api_ts_wrapper_or_url_builder": [
                asdict(route) for route in route_no_wrapper
            ],
            "intentional_browser_form_download_cases": [
                asdict(route) for route in routes if route.behavior != "json"
            ],
        },
    }


def collect_openapi_snapshot(inventory: dict[str, Any]) -> dict[str, Any]:
    openapi = load_openapi()
    schema_names = sorted(
        name
        for name in (openapi.get("components", {}).get("schemas", {}) or {})
        if name not in IGNORED_OPENAPI_SCHEMAS
    )
    schema_name_set = set(schema_names)
    frontend_type_names = {item["name"] for item in inventory["frontend_types"]}
    backend_literal_aliases = {item["alias"] for item in inventory["backend_literal_aliases"]}
    route_operation_keys = sorted(route_key(route) for route in inventory["routes"])
    multipart_or_download_route_keys = sorted(
        route_key(route) for route in inventory["routes"] if route["behavior"] != "json"
    )

    return {
        "openapi_version": openapi.get("openapi", "-"),
        "summary": {
            "schema_count_excluding_validation": len(schema_names),
            "route_operation_count": len(route_operation_keys),
            "multipart_or_download_route_count": len(multipart_or_download_route_keys),
            "openapi_schema_names_without_frontend_type_count": len(schema_name_set - frontend_type_names),
            "frontend_type_names_without_openapi_schema_count": len(frontend_type_names - schema_name_set),
            "backend_literal_aliases_not_emitted_as_schema_count": len(
                backend_literal_aliases - schema_name_set
            ),
        },
        "schema_names": schema_names,
        "route_operation_keys": route_operation_keys,
        "multipart_or_download_route_keys": multipart_or_download_route_keys,
        "openapi_schema_names_without_frontend_type_names": sorted(
            schema_name_set - frontend_type_names
        ),
        "frontend_type_names_without_openapi_schema_names": sorted(
            frontend_type_names - schema_name_set
        ),
        "backend_literal_aliases_not_emitted_as_openapi_schemas": sorted(
            backend_literal_aliases - schema_name_set
        ),
        "compatibility_aliases": dict(sorted(NAMING_ONLY_MATCHES.items())),
    }


def collect_generated_type_mapping() -> dict[str, Any]:
    openapi = load_openapi()
    type_source = read_frontend_type_source()
    generated_source = read_text(GENERATED_OPENAPI_REFERENCE_PATH)
    schema_map = openapi.get("components", {}).get("schemas", {}) or {}
    frontend_type_names = parse_frontend_exported_type_names(type_source)
    generated_aliases = parse_generated_schema_aliases(generated_source)

    try:
        expected = json.loads(read_text(EXPECTED_GENERATED_TYPE_MAPPING_PATH))
    except json.JSONDecodeError as exc:
        raise SystemExit(f"Could not parse {EXPECTED_GENERATED_TYPE_MAPPING_PATH}: {exc}") from exc

    mappings = []
    for item in expected.get("exact_interface_property_mappings", []):
        schema = item["schema"]
        frontend = item["frontend"]
        openapi_fields = sorted((schema_map.get(schema, {}).get("properties") or {}).keys())
        frontend_fields = parse_frontend_interface_fields(type_source, frontend)
        alias_target = parse_frontend_type_alias_targets(type_source).get(frontend)
        import_aliases = parse_generated_type_import_aliases(type_source)
        adopted_schema = import_aliases.get(alias_target or "")
        frontend_shape_source = "frontend interface"
        if frontend_fields is None and adopted_schema == schema:
            frontend_fields = openapi_fields
            frontend_shape_source = "generated alias"
        mappings.append(
            {
                "schema": schema,
                "frontend": frontend,
                "expected_fields": item.get("fields", []),
                "openapi_fields": openapi_fields,
                "frontend_fields": frontend_fields if frontend_fields is not None else [],
                "frontend_shape_source": frontend_shape_source,
                "generated_alias_schema": generated_aliases.get(frontend),
                "frontend_type_exported": frontend in frontend_type_names,
                "reason": item.get("reason", "-"),
            }
        )

    return {
        "version": expected.get("version", 1),
        "generated_reference": str(GENERATED_OPENAPI_REFERENCE_PATH.relative_to(REPO_ROOT)),
        "exact_interface_property_mappings": mappings,
        "intentional_alias_decisions": expected.get("intentional_alias_decisions", []),
        "deferred_public_type_decisions": expected.get("deferred_public_type_decisions", []),
    }


def collect_generated_type_adoptions() -> dict[str, Any]:
    generated_source = read_text(GENERATED_OPENAPI_REFERENCE_PATH)
    generated_aliases = parse_generated_schema_aliases(generated_source)
    try:
        expected = json.loads(read_text(EXPECTED_GENERATED_TYPE_ADOPTIONS_PATH))
    except json.JSONDecodeError as exc:
        raise SystemExit(f"Could not parse {EXPECTED_GENERATED_TYPE_ADOPTIONS_PATH}: {exc}") from exc

    expected_reasons = {
        (item["frontend"], item["schema"]): item.get("reason", "-")
        for item in expected.get("adoptions", [])
    }
    adoptions = collect_generated_type_alias_adoptions(generated_aliases)
    for item in adoptions:
        item["reason"] = expected_reasons.get(
            (item["frontend"], item["schema"]),
            "unreviewed generated type alias adoption",
        )

    return {
        "version": expected.get("version", 1),
        "adoptions": adoptions,
        "deferred_adoptions": expected.get("deferred_adoptions", []),
    }


def collect_generated_type_alias_adoptions(
    generated_aliases: dict[str, str],
    module_sources: dict[str, str] | None = None,
) -> list[dict[str, Any]]:
    sources = module_sources if module_sources is not None else read_frontend_type_module_sources()
    adoptions: list[dict[str, Any]] = []
    for module, source in sources.items():
        import_paths = parse_generated_type_imports_by_path(source)
        if not import_paths:
            continue
        type_alias_targets = parse_frontend_type_alias_targets(source)
        for frontend, imported_alias in type_alias_targets.items():
            for import_path, import_aliases in import_paths.items():
                generated_alias = import_aliases.get(imported_alias)
                if generated_alias is None:
                    continue
                schema = generated_aliases.get(generated_alias)
                if schema is None:
                    continue
                adoptions.append(
                    {
                        "frontend": frontend,
                        "schema": schema,
                        "module": module,
                        "import_path": import_path,
                        "imported_alias": imported_alias,
                        "generated_root_alias_schema": generated_aliases.get(frontend),
                        "imported_alias_schema": schema,
                        "exported_type_alias_target": imported_alias,
                        "has_frontend_interface": extract_frontend_interface_body(source, frontend) is not None,
                    }
                )
    return sorted(adoptions, key=lambda item: (item["frontend"], item["schema"], item["module"]))


def generate_openapi_reference_source() -> str:
    if not OPENAPI_TYPESCRIPT_BIN.exists():
        raise SystemExit(
            "Could not find frontend/node_modules/.bin/openapi-typescript. "
            "Run `cd frontend && npm install` before checking the generated OpenAPI reference."
        )

    openapi = load_openapi()
    with tempfile.TemporaryDirectory(prefix="accessible-reader-openapi-") as temp_dir:
        temp_path = Path(temp_dir)
        openapi_path = temp_path / "openapi.json"
        output_path = temp_path / "openapi.ts"
        openapi_path.write_text(json.dumps(openapi, indent=2, sort_keys=True), encoding="utf-8")
        result = subprocess.run(
            [
                str(OPENAPI_TYPESCRIPT_BIN),
                str(openapi_path),
                "--output",
                str(output_path),
                "--root-types",
                "--root-types-no-schema-prefix",
                "--alphabetize",
            ],
            cwd=REPO_ROOT / "frontend",
            capture_output=True,
            text=True,
            check=False,
        )
        if result.returncode != 0:
            raise SystemExit(
                "openapi-typescript generation failed.\n\n"
                f"stdout:\n{result.stdout}\n\nstderr:\n{result.stderr}"
            )
        return output_path.read_text(encoding="utf-8")


def write_generated_openapi_reference() -> int:
    GENERATED_OPENAPI_REFERENCE_PATH.parent.mkdir(parents=True, exist_ok=True)
    source = generate_openapi_reference_source()
    GENERATED_OPENAPI_REFERENCE_PATH.write_text(source, encoding="utf-8")
    print(f"Wrote {GENERATED_OPENAPI_REFERENCE_PATH.relative_to(REPO_ROOT)}")
    return 0


def render_markdown(inventory: dict[str, Any]) -> None:
    summary = inventory["summary"]
    routes = inventory["routes"]
    wrappers = inventory["frontend_api_wrappers"]
    backend_models = inventory["backend_models"]
    literal_aliases = inventory["backend_literal_aliases"]
    frontend_types = inventory["frontend_types"]
    drift = inventory["drift"]

    print("# Accessible Reader API/Types Contract Inventory")
    print()
    print("## Summary")
    print()
    print(f"- OpenAPI paths: {summary['openapi_paths']}")
    print(f"- OpenAPI route operations: {summary['openapi_route_operations']}")
    print(f"- OpenAPI schemas: {summary['openapi_schemas']}")
    print(f"- Backend Pydantic classes: {summary['backend_pydantic_classes']}")
    print(f"- Backend Literal aliases: {summary['backend_literal_aliases']}")
    print(f"- Frontend API exports: {summary['frontend_api_exports']}")
    print(f"- Frontend type exports: {summary['frontend_type_exports']}")
    print(
        "- Exact frontend/backend contract-name matches: "
        f"{summary['exact_frontend_backend_contract_name_matches']}"
    )
    print(f"- API wrappers without matched route: {summary['api_wrappers_without_matched_route']}")
    print(
        "- Backend routes without api.ts wrapper/url builder: "
        f"{summary['backend_routes_without_api_ts_wrapper_or_url_builder']}"
    )
    print()

    print("## Backend Route Inventory")
    print()
    markdown_table(
        ["Method", "Path", "Domain", "Behavior", "Request", "Response"],
        [
            [route["method"], route["path"], route["domain"], route["behavior"], route["request"], route["response"]]
            for route in routes
        ],
    )
    print()

    print("## Frontend API Wrapper Inventory")
    print()
    markdown_table(
        ["Function", "Method", "Path", "Domain", "Behavior", "Request", "Response", "Backend match"],
        [
            [
                wrapper["name"],
                wrapper["method"],
                wrapper["path"],
                wrapper["domain"],
                wrapper["behavior"],
                wrapper["request"],
                wrapper["response"],
                wrapper["match"],
            ]
            for wrapper in wrappers
        ],
    )
    print()

    print("## Backend Model Inventory")
    print()
    markdown_table(
        ["Model", "Domain", "Fields", "Required", "Optional", "Defaulted", "Notes"],
        [
            [
                model["name"],
                model["domain"],
                str(model["field_count"]),
                str(model["required_count"]),
                str(model["optional_count"]),
                str(model["defaulted_count"]),
                model["notes"],
            ]
            for model in backend_models
        ],
    )
    print()

    print("## Backend Literal Alias Inventory")
    print()
    markdown_table(
        ["Alias", "Domain", "Definition"],
        [[item["alias"], item["domain"], item["definition"]] for item in literal_aliases],
    )
    print()

    print("## Frontend Type Inventory")
    print()
    markdown_table(
        ["Type", "Kind", "Domain", "Backend match"],
        [[item["name"], item["kind"], item["domain"], item["match"]] for item in frontend_types],
    )
    print()

    print("## Drift Matrix")
    print()
    print("### Exact Matches")
    print()
    print(", ".join(drift["exact_matches"]) if drift["exact_matches"] else "- None")
    print()
    print("### Naming-Only Or Inline Matches")
    print()
    markdown_table(
        ["Backend", "Frontend / api.ts representation"],
        [
            [item["backend"], item["frontend_or_api_ts"]]
            for item in drift["naming_only_or_inline_matches"]
        ],
    )
    print()
    print("### Backend Route Schemas Missing Frontend Type Names")
    print()
    backend_only = drift["backend_route_schemas_missing_frontend_type_names"]
    print(", ".join(backend_only) if backend_only else "- None")
    print()
    print("### Frontend Types Without Backend Names")
    print()
    frontend_only = drift["frontend_types_without_backend_names"]
    print(", ".join(frontend_only) if frontend_only else "- None")
    print()
    print("### api.ts Wrappers Without Backend Route")
    print()
    wrapper_no_match = drift["api_wrappers_without_backend_route"]
    if wrapper_no_match:
        markdown_table(
            ["Function", "Method", "Path"],
            [[wrapper["name"], wrapper["method"], wrapper["path"]] for wrapper in wrapper_no_match],
        )
    else:
        print("- None")
    print()
    print("### Backend Routes Without api.ts Wrapper Or URL Builder")
    print()
    route_no_wrapper = drift["backend_routes_without_api_ts_wrapper_or_url_builder"]
    markdown_table(
        ["Method", "Path", "Domain", "Behavior"],
        [[route["method"], route["path"], route["domain"], route["behavior"]] for route in route_no_wrapper],
    )
    print()
    print("### Intentional Browser/Form/Download Cases")
    print()
    special_routes = drift["intentional_browser_form_download_cases"]
    markdown_table(
        ["Method", "Path", "Behavior"],
        [[route["method"], route["path"], route["behavior"]] for route in special_routes],
    )


def route_key(route: dict[str, Any]) -> str:
    return f"{route['method']} {route['path']}"


def run_contract_check(inventory: dict[str, Any], expected_path: Path = EXPECTED_CONTRACT_PATH) -> int:
    try:
        expected = json.loads(read_text(expected_path))
    except json.JSONDecodeError as exc:
        raise SystemExit(f"Could not parse {expected_path}: {exc}") from exc

    failures: list[str] = []
    expected_summary = expected.get("summary", {})
    current_summary = inventory["summary"]
    for key, expected_value in sorted(expected_summary.items()):
        current_value = current_summary.get(key)
        if current_value != expected_value:
            failures.append(f"Summary count changed for {key}: expected {expected_value}, got {current_value}")

    wrapper_no_match = inventory["drift"]["api_wrappers_without_backend_route"]
    if wrapper_no_match:
        rendered = ", ".join(
            f"{wrapper['name']} ({wrapper['method']} {wrapper['path'] or '-'})"
            for wrapper in wrapper_no_match
        )
        failures.append(f"api.ts wrappers without backend route: {rendered}")

    expected_wrappers = expected.get("frontend_wrappers_without_backend_route", [])
    if expected_wrappers:
        failures.append("Expected fixture must keep frontend_wrappers_without_backend_route empty")

    expected_routes = expected.get("accepted_backend_routes_without_wrapper", [])
    missing_reasons = [
        f"{route.get('method', '-')} {route.get('path', '-')}"
        for route in expected_routes
        if not route.get("reason")
    ]
    if missing_reasons:
        failures.append("Accepted backend-only routes missing reason: " + ", ".join(missing_reasons))

    current_route_keys = {
        route_key(route)
        for route in inventory["drift"]["backend_routes_without_api_ts_wrapper_or_url_builder"]
    }
    expected_route_keys = {route_key(route) for route in expected_routes}
    added_routes = sorted(current_route_keys - expected_route_keys)
    removed_routes = sorted(expected_route_keys - current_route_keys)
    if added_routes:
        failures.append("Unreviewed backend-only routes added: " + ", ".join(added_routes))
    if removed_routes:
        failures.append("Accepted backend-only routes no longer present: " + ", ".join(removed_routes))

    if failures:
        print("Contract drift check failed:", file=sys.stderr)
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        print(
            f"Update {expected_path.relative_to(REPO_ROOT)} only after reviewing intentional contract changes.",
            file=sys.stderr,
        )
        return 1

    print("Contract drift check passed.")
    print(
        "- Summary counts match, api.ts has no unmatched wrappers, and backend-only routes match the accepted fixture."
    )
    return 0


def _compare_scalar(
    failures: list[str],
    label: str,
    current: Any,
    expected: Any,
) -> None:
    if current != expected:
        failures.append(f"{label} changed: expected {expected!r}, got {current!r}")


def _compare_list(
    failures: list[str],
    label: str,
    current: list[str],
    expected: list[str],
) -> None:
    current_set = set(current)
    expected_set = set(expected)
    added = sorted(current_set - expected_set)
    removed = sorted(expected_set - current_set)
    if added:
        failures.append(f"{label} added: " + ", ".join(added))
    if removed:
        failures.append(f"{label} removed: " + ", ".join(removed))


def _compare_mapping(
    failures: list[str],
    label: str,
    current: dict[str, str],
    expected: dict[str, str],
) -> None:
    current_keys = set(current)
    expected_keys = set(expected)
    added = sorted(current_keys - expected_keys)
    removed = sorted(expected_keys - current_keys)
    changed = sorted(
        key for key in current_keys & expected_keys if current.get(key) != expected.get(key)
    )
    if added:
        failures.append(f"{label} added: " + ", ".join(added))
    if removed:
        failures.append(f"{label} removed: " + ", ".join(removed))
    for key in changed:
        failures.append(
            f"{label} changed for {key}: expected {expected[key]!r}, got {current[key]!r}"
        )


def run_openapi_snapshot_check(
    snapshot: dict[str, Any],
    expected_path: Path = EXPECTED_OPENAPI_SNAPSHOT_PATH,
) -> int:
    try:
        expected = json.loads(read_text(expected_path))
    except json.JSONDecodeError as exc:
        raise SystemExit(f"Could not parse {expected_path}: {exc}") from exc

    failures: list[str] = []
    _compare_scalar(
        failures,
        "OpenAPI version",
        snapshot.get("openapi_version"),
        expected.get("openapi_version"),
    )

    current_summary = snapshot.get("summary", {})
    expected_summary = expected.get("summary", {})
    for key in sorted(set(current_summary) | set(expected_summary)):
        _compare_scalar(
            failures,
            f"summary.{key}",
            current_summary.get(key),
            expected_summary.get(key),
        )

    for key in (
        "schema_names",
        "route_operation_keys",
        "multipart_or_download_route_keys",
        "openapi_schema_names_without_frontend_type_names",
        "frontend_type_names_without_openapi_schema_names",
        "backend_literal_aliases_not_emitted_as_openapi_schemas",
    ):
        _compare_list(failures, key, snapshot.get(key, []), expected.get(key, []))

    _compare_mapping(
        failures,
        "compatibility_aliases",
        snapshot.get("compatibility_aliases", {}),
        expected.get("compatibility_aliases", {}),
    )

    if failures:
        print("OpenAPI snapshot check failed:", file=sys.stderr)
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        print(
            f"Update {expected_path.relative_to(REPO_ROOT)} only after reviewing intentional schema changes.",
            file=sys.stderr,
        )
        return 1

    print("OpenAPI snapshot check passed.")
    print(
        "- OpenAPI version, schema names, route operations, exceptions, aliases, and "
        "frontend/backend name gaps match the expected fixture."
    )
    return 0


def run_generated_openapi_reference_check() -> int:
    if not GENERATED_OPENAPI_REFERENCE_PATH.exists():
        print(
            f"Generated OpenAPI reference is missing: "
            f"{GENERATED_OPENAPI_REFERENCE_PATH.relative_to(REPO_ROOT)}",
            file=sys.stderr,
        )
        print(
            "Run `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py "
            "--write-generated-openapi-reference` after reviewing the OpenAPI snapshot.",
            file=sys.stderr,
        )
        return 1

    expected_source = GENERATED_OPENAPI_REFERENCE_PATH.read_text(encoding="utf-8")
    current_source = generate_openapi_reference_source()
    if current_source != expected_source:
        print("Generated OpenAPI reference is stale.", file=sys.stderr)
        print(
            "Regenerate with `backend/.venv/bin/python "
            "scripts/contracts/audit_api_types_contract.py --write-generated-openapi-reference` "
            "and review the diff.",
            file=sys.stderr,
        )
        return 1

    required_tokens = (
        "export interface paths",
        "export interface components",
        "export interface operations",
        "export type webhooks",
        "export type $defs",
        "export type DocumentRecord",
        "export type DocumentView",
        "export type RecallDocumentRecord",
        "export type RecallNoteRecord",
        "export type LibraryReadingQueueRow",
        "export type KnowledgeGraphSnapshot",
        "export type StudyCardRecord",
        "export type GraphDecisionRequest",
        "export type ProgressUpdate",
        "export type StudyCardBulkDeleteRequest",
        "export type StudyReviewRequest",
        "export type StudyScheduleStateRequest",
        "export type TransformRequest",
        "export type BodyImportFileApiDocumentsImportFilePost",
        "export type BodyPreviewWorkspaceImportApiWorkspaceImportPreviewPost",
        "export type HttpValidationError",
        "export type ValidationError",
        "export type WorkspaceExportManifest",
    )
    missing_tokens = [token for token in required_tokens if token not in current_source]
    if missing_tokens:
        print(
            "Generated OpenAPI reference is missing expected type anchors: "
            + ", ".join(missing_tokens),
            file=sys.stderr,
        )
        return 1

    print("Generated OpenAPI reference check passed.")
    print(
        "- frontend/src/generated/openapi.ts matches the current FastAPI OpenAPI schema "
        "and exposes the expected private reference type anchors."
    )
    return 0


def run_generated_type_mapping_check(
    mapping: dict[str, Any],
    expected_path: Path = EXPECTED_GENERATED_TYPE_MAPPING_PATH,
) -> int:
    try:
        expected = json.loads(read_text(expected_path))
    except json.JSONDecodeError as exc:
        raise SystemExit(f"Could not parse {expected_path}: {exc}") from exc

    failures: list[str] = []
    if mapping.get("generated_reference") != expected.get("generated_reference"):
        failures.append(
            "Generated reference path changed: "
            f"expected {expected.get('generated_reference')}, got {mapping.get('generated_reference')}"
        )

    expected_items = expected.get("exact_interface_property_mappings", [])
    current_items = mapping.get("exact_interface_property_mappings", [])
    expected_keys = [(item.get("schema"), item.get("frontend")) for item in expected_items]
    current_keys = [(item.get("schema"), item.get("frontend")) for item in current_items]
    if current_keys != expected_keys:
        failures.append(f"Generated type mapping set changed: expected {expected_keys}, got {current_keys}")

    for item in current_items:
        schema = item["schema"]
        frontend = item["frontend"]
        expected_fields = item["expected_fields"]
        openapi_fields = item["openapi_fields"]
        frontend_fields = item["frontend_fields"]
        if not item["frontend_type_exported"]:
            failures.append(f"{frontend} is not exported from the public frontend type surface")
        if item["generated_alias_schema"] != schema:
            failures.append(
                f"Generated alias mismatch for {frontend}: expected schema {schema}, "
                f"got {item['generated_alias_schema']}"
            )
        if openapi_fields != expected_fields:
            failures.append(
                f"OpenAPI fields drifted for {schema}: expected {expected_fields}, got {openapi_fields}"
            )
        if frontend_fields != expected_fields:
            failures.append(
                f"Frontend fields drifted for {frontend}: expected {expected_fields}, got {frontend_fields}"
            )
        if openapi_fields != frontend_fields:
            failures.append(
                f"OpenAPI/frontend fields differ for {schema} -> {frontend}: "
                f"OpenAPI {openapi_fields}, frontend {frontend_fields}"
            )

    if mapping.get("intentional_alias_decisions") != expected.get("intentional_alias_decisions", []):
        failures.append("Intentional alias decisions changed without fixture review")
    if mapping.get("deferred_public_type_decisions") != expected.get("deferred_public_type_decisions", []):
        failures.append("Deferred public type decisions changed without fixture review")

    if failures:
        print("Generated type mapping check failed:", file=sys.stderr)
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        print(
            "Review OpenAPI/frontend type drift before adopting generated aliases.",
            file=sys.stderr,
        )
        return 1

    print("Generated type mapping check passed.")
    print(
        "- Selected generated schema aliases, OpenAPI properties, and public frontend "
        "interface fields match the expected mapping fixture."
    )
    return 0


def run_generated_type_adoptions_check(
    adoptions: dict[str, Any],
    expected_path: Path = EXPECTED_GENERATED_TYPE_ADOPTIONS_PATH,
) -> int:
    try:
        expected = json.loads(read_text(expected_path))
    except json.JSONDecodeError as exc:
        raise SystemExit(f"Could not parse {expected_path}: {exc}") from exc

    failures: list[str] = []
    expected_items = expected.get("adoptions", [])
    current_items = adoptions.get("adoptions", [])
    expected_by_key = {
        (item.get("frontend"), item.get("schema")): item for item in expected_items
    }
    current_by_key = {
        (item.get("frontend"), item.get("schema")): item for item in current_items
    }
    expected_keys = set(expected_by_key)
    current_keys = set(current_by_key)
    added_keys = sorted(current_keys - expected_keys)
    missing_keys = sorted(expected_keys - current_keys)
    if added_keys:
        failures.append(
            "Unreviewed generated type adoptions: "
            + ", ".join(f"{frontend} -> {schema}" for frontend, schema in added_keys)
        )
    if missing_keys:
        failures.append(
            "Missing expected generated type adoptions: "
            + ", ".join(f"{frontend} -> {schema}" for frontend, schema in missing_keys)
        )

    for item in current_items:
        frontend = item["frontend"]
        schema = item["schema"]
        imported_alias = item["imported_alias"]
        expected_item = expected_by_key.get((frontend, schema))
        if expected_item is not None:
            if item["module"] != expected_item["module"]:
                failures.append(
                    f"Module changed for {frontend}: expected {expected_item['module']}, "
                    f"got {item['module']}"
                )
            if item["import_path"] != expected_item["import_path"]:
                failures.append(
                    f"Import path changed for {frontend}: expected {expected_item['import_path']}, "
                    f"got {item['import_path']}"
                )
            if imported_alias != expected_item["imported_alias"]:
                failures.append(
                    f"Imported alias changed for {frontend}: expected {expected_item['imported_alias']}, "
                    f"got {imported_alias}"
                )
        if item["generated_root_alias_schema"] != schema:
            failures.append(
                f"Generated root alias mismatch for {frontend}: expected schema {schema}, "
                f"got {item['generated_root_alias_schema']}"
            )
        if item["imported_alias_schema"] != schema:
            failures.append(
                f"{item['module']} does not import {schema} as {imported_alias} "
                f"from {item['import_path']}"
            )
        if item["exported_type_alias_target"] != imported_alias:
            failures.append(
                f"{item['module']} does not export {frontend} as a type alias to {imported_alias}"
            )
        if item["has_frontend_interface"]:
            failures.append(f"{item['module']} still declares an interface for adopted type {frontend}")

    if adoptions.get("deferred_adoptions") != expected.get("deferred_adoptions", []):
        failures.append("Deferred generated type adoption decisions changed without fixture review")

    if failures:
        print("Generated type adoption check failed:", file=sys.stderr)
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        print(
            "Keep generated adoption type-only and fixture-reviewed before expanding aliases.",
            file=sys.stderr,
        )
        return 1

    print("Generated type adoption check passed.")
    print("- Expected generated type aliases are adopted through type-only public frontend exports.")
    return 0


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--format",
        choices=("markdown", "json"),
        default="markdown",
        help="Output inventory format. Default: markdown.",
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Validate the current inventory against the expected check-only fixture.",
    )
    parser.add_argument(
        "--openapi-snapshot",
        action="store_true",
        help="Print a normalized OpenAPI snapshot as JSON.",
    )
    parser.add_argument(
        "--check-openapi-snapshot",
        action="store_true",
        help="Validate the normalized OpenAPI snapshot against the expected fixture.",
    )
    parser.add_argument(
        "--write-generated-openapi-reference",
        action="store_true",
        help="Regenerate the private TypeScript OpenAPI reference file.",
    )
    parser.add_argument(
        "--check-generated-openapi-reference",
        action="store_true",
        help="Validate the private TypeScript OpenAPI reference file is current.",
    )
    parser.add_argument(
        "--generated-type-mapping",
        action="store_true",
        help="Print the generated OpenAPI to public frontend type mapping as JSON.",
    )
    parser.add_argument(
        "--check-generated-type-mapping",
        action="store_true",
        help="Validate the generated OpenAPI to public frontend type mapping fixture.",
    )
    parser.add_argument(
        "--generated-type-adoptions",
        action="store_true",
        help="Print intentionally adopted generated OpenAPI type aliases as JSON.",
    )
    parser.add_argument(
        "--check-generated-type-adoptions",
        action="store_true",
        help="Validate intentionally adopted generated OpenAPI type aliases.",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(sys.argv[1:] if argv is None else argv)
    inventory = collect_inventory()
    if args.openapi_snapshot:
        print(json.dumps(collect_openapi_snapshot(inventory), indent=2, sort_keys=True))
        return 0
    if args.check_openapi_snapshot:
        return run_openapi_snapshot_check(collect_openapi_snapshot(inventory))
    if args.write_generated_openapi_reference:
        return write_generated_openapi_reference()
    if args.check_generated_openapi_reference:
        return run_generated_openapi_reference_check()
    if args.generated_type_mapping:
        print(json.dumps(collect_generated_type_mapping(), indent=2, sort_keys=True))
        return 0
    if args.check_generated_type_mapping:
        return run_generated_type_mapping_check(collect_generated_type_mapping())
    if args.generated_type_adoptions:
        print(json.dumps(collect_generated_type_adoptions(), indent=2, sort_keys=True))
        return 0
    if args.check_generated_type_adoptions:
        return run_generated_type_adoptions_check(collect_generated_type_adoptions())
    if args.check:
        return run_contract_check(inventory)
    if args.format == "json":
        print(json.dumps(inventory, indent=2, sort_keys=True))
    else:
        render_markdown(inventory)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
