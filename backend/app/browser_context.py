from __future__ import annotations

from dataclasses import dataclass
from typing import Literal
from urllib.parse import urlsplit, urlunsplit

from .text_utils import normalize_whitespace, safe_query_terms


SUPPORTED_WEB_SCHEMES = {"http", "https"}
INTERNAL_HOSTS = {"127.0.0.1", "localhost"}
GENERIC_PAGE_TERMS = {
    "article",
    "blog",
    "dashboard",
    "docs",
    "home",
    "index",
    "login",
    "news",
    "page",
    "post",
    "profile",
    "search",
    "settings",
    "story",
    "untitled",
    "welcome",
}
MAX_SELECTION_CHARS = 640
MAX_PAGE_EXCERPT_CHARS = 720
MAX_META_DESCRIPTION_CHARS = 320
MAX_QUERY_CHARS = 640


@dataclass(frozen=True)
class BrowserQueryPlan:
    query: str
    trigger_mode: Literal["selection", "page", "none"]
    suppression_reasons: list[str]


def canonicalize_page_url(url: str) -> str:
    candidate = normalize_whitespace(url)
    if not candidate:
        return ""
    parts = urlsplit(candidate)
    if parts.scheme not in SUPPORTED_WEB_SCHEMES:
        return candidate

    normalized_path = parts.path.rstrip("/") or "/"
    return urlunsplit((parts.scheme.lower(), parts.netloc.lower(), normalized_path, "", ""))


def is_supported_page_url(url: str) -> bool:
    parts = urlsplit(normalize_whitespace(url))
    return parts.scheme in SUPPORTED_WEB_SCHEMES and bool(parts.netloc)


def is_internal_workspace_page(url: str) -> bool:
    parts = urlsplit(normalize_whitespace(url))
    if parts.scheme not in SUPPORTED_WEB_SCHEMES:
        return True
    if parts.hostname not in INTERNAL_HOSTS:
        return False
    return parts.path.startswith("/api") or parts.path.startswith("/reader") or parts.path.startswith("/recall")


def build_browser_query_plan(
    *,
    page_title: str | None,
    selection_text: str | None,
    page_excerpt: str | None,
    meta_description: str | None,
) -> BrowserQueryPlan:
    normalized_title = normalize_whitespace(page_title or "")
    normalized_selection = normalize_whitespace(selection_text or "")[:MAX_SELECTION_CHARS]
    normalized_excerpt = normalize_whitespace(page_excerpt or "")[:MAX_PAGE_EXCERPT_CHARS]
    normalized_meta = normalize_whitespace(meta_description or "")[:MAX_META_DESCRIPTION_CHARS]

    if _selection_is_meaningful(normalized_selection):
        return BrowserQueryPlan(
            query=normalized_selection[:MAX_QUERY_CHARS],
            trigger_mode="selection",
            suppression_reasons=[],
        )

    title_terms = safe_query_terms(normalized_title)
    meta_terms = safe_query_terms(normalized_meta)
    excerpt_terms = safe_query_terms(normalized_excerpt)
    if not title_terms and not meta_terms and not excerpt_terms:
        return BrowserQueryPlan(query="", trigger_mode="none", suppression_reasons=["not enough page context"])

    if _title_is_generic(normalized_title) and len(meta_terms) < 4 and len(excerpt_terms) < 6:
        return BrowserQueryPlan(query="", trigger_mode="none", suppression_reasons=["page title is too generic"])

    page_segments = [segment for segment in [normalized_title, normalized_meta, normalized_excerpt] if segment]
    combined = normalize_whitespace(" ".join(page_segments))
    if len(safe_query_terms(combined)) < 4:
        return BrowserQueryPlan(query="", trigger_mode="none", suppression_reasons=["page context is too thin"])

    return BrowserQueryPlan(
        query=combined[:MAX_QUERY_CHARS],
        trigger_mode="page",
        suppression_reasons=[],
    )


def path_prefix(url: str, *, segments: int = 2) -> str:
    parts = urlsplit(normalize_whitespace(url))
    if parts.scheme not in SUPPORTED_WEB_SCHEMES:
        return ""
    path_parts = [part for part in parts.path.split("/") if part]
    return "/".join(path_parts[:segments])


def summarize_context_result(
    *,
    hit_count: int,
    trigger_mode: Literal["selection", "page", "none"],
    exact_match: bool,
    same_site: bool,
    prompted: bool,
) -> str:
    if hit_count <= 0:
        return "Recall stayed quiet on this page."
    if exact_match:
        return "Recall already knows this saved page."
    if trigger_mode == "selection":
        return f"Recall found {hit_count} related item{'s' if hit_count != 1 else ''} for the selected text."
    if same_site and prompted:
        return f"Recall found {hit_count} related item{'s' if hit_count != 1 else ''} from this site."
    return f"Recall found {hit_count} related item{'s' if hit_count != 1 else ''} for this page."


def _selection_is_meaningful(selection_text: str) -> bool:
    return len(selection_text) >= 24 and len(safe_query_terms(selection_text)) >= 3


def _title_is_generic(page_title: str) -> bool:
    title_terms = safe_query_terms(page_title)
    if not title_terms:
        return True
    if len(title_terms) == 1 and title_terms[0] in GENERIC_PAGE_TERMS:
        return True
    specific_terms = [term for term in title_terms if term not in GENERIC_PAGE_TERMS]
    return len(specific_terms) < 2
