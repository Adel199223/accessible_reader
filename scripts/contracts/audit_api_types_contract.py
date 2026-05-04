#!/usr/bin/env python3
"""Print a check-only API/types contract inventory.

The script is intentionally descriptive. It imports the local FastAPI app,
reads OpenAPI, parses backend Pydantic models and frontend TypeScript exports,
then emits Markdown to stdout. Drift findings are report-only in this slice.
"""

from __future__ import annotations

import ast
from dataclasses import dataclass
from pathlib import Path
import re
import sys
from typing import Any


REPO_ROOT = Path(__file__).resolve().parents[2]
BACKEND_DIR = REPO_ROOT / "backend"
MAIN_PATH = REPO_ROOT / "backend" / "app" / "main.py"
MODELS_PATH = REPO_ROOT / "backend" / "app" / "models.py"
API_TS_PATH = REPO_ROOT / "frontend" / "src" / "api.ts"
TYPES_TS_PATH = REPO_ROOT / "frontend" / "src" / "types.ts"

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


def main() -> int:
    openapi = load_openapi()
    models_source = read_text(MODELS_PATH)
    api_source = read_text(API_TS_PATH)
    types_source = read_text(TYPES_TS_PATH)

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

    print("# Accessible Reader API/Types Contract Inventory")
    print()
    print("## Summary")
    print()
    print(f"- OpenAPI paths: {len(openapi.get('paths', {}))}")
    print(f"- OpenAPI route operations: {len(routes)}")
    print(f"- OpenAPI schemas: {len(schemas)}")
    print(f"- Backend Pydantic classes: {len(backend_models)}")
    print(f"- Backend Literal aliases: {len(literal_aliases)}")
    print(f"- Frontend API exports: {len(wrappers)}")
    print(f"- Frontend type exports: {len(frontend_types)}")
    print(f"- Exact frontend/backend contract-name matches: {len(exact_matches)}")
    print(f"- API wrappers without matched route: {len(wrapper_no_match)}")
    print(f"- Backend routes without api.ts wrapper/url builder: {len(route_no_wrapper)}")
    print()

    print("## Backend Route Inventory")
    print()
    markdown_table(
        ["Method", "Path", "Domain", "Behavior", "Request", "Response"],
        [[r.method, r.path, r.domain, r.behavior, r.request, r.response] for r in routes],
    )
    print()

    print("## Frontend API Wrapper Inventory")
    print()
    markdown_table(
        ["Function", "Method", "Path", "Domain", "Behavior", "Request", "Response", "Backend match"],
        [[w.name, w.method, w.path, w.domain, w.behavior, w.request, w.response, w.match] for w in wrappers],
    )
    print()

    print("## Backend Model Inventory")
    print()
    markdown_table(
        ["Model", "Domain", "Fields", "Required", "Optional", "Defaulted", "Notes"],
        [
            [
                m.name,
                m.domain,
                str(m.field_count),
                str(m.required_count),
                str(m.optional_count),
                str(m.defaulted_count),
                m.notes,
            ]
            for m in backend_models
        ],
    )
    print()

    print("## Backend Literal Alias Inventory")
    print()
    markdown_table(
        ["Alias", "Domain", "Definition"],
        [[name, domain_for_name(name), value] for name, value in sorted(literal_aliases.items())],
    )
    print()

    print("## Frontend Type Inventory")
    print()
    markdown_table(
        ["Type", "Kind", "Domain", "Backend match"],
        [[item.name, item.kind, item.domain, item.match] for item in frontend_types],
    )
    print()

    print("## Drift Matrix")
    print()
    print("### Exact Matches")
    print()
    print(", ".join(exact_matches) if exact_matches else "- None")
    print()
    print("### Naming-Only Or Inline Matches")
    print()
    markdown_table(
        ["Backend", "Frontend / api.ts representation"],
        [[backend, frontend] for backend, frontend in sorted(NAMING_ONLY_MATCHES.items())],
    )
    print()
    print("### Backend Route Schemas Missing Frontend Type Names")
    print()
    print(", ".join(backend_only) if backend_only else "- None")
    print()
    print("### Frontend Types Without Backend Names")
    print()
    print(", ".join(frontend_only) if frontend_only else "- None")
    print()
    print("### api.ts Wrappers Without Backend Route")
    print()
    if wrapper_no_match:
        markdown_table(
            ["Function", "Method", "Path"],
            [[wrapper.name, wrapper.method, wrapper.path] for wrapper in wrapper_no_match],
        )
    else:
        print("- None")
    print()
    print("### Backend Routes Without api.ts Wrapper Or URL Builder")
    print()
    markdown_table(
        ["Method", "Path", "Domain", "Behavior"],
        [[route.method, route.path, route.domain, route.behavior] for route in route_no_wrapper],
    )
    print()
    print("### Intentional Browser/Form/Download Cases")
    print()
    special_routes = [route for route in routes if route.behavior != "json"]
    markdown_table(
        ["Method", "Path", "Behavior"],
        [[route.method, route.path, route.behavior] for route in special_routes],
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
