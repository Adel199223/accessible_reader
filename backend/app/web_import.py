from __future__ import annotations

from dataclasses import dataclass
from urllib.parse import urlsplit, urlunsplit

import httpx


FETCH_TIMEOUT = httpx.Timeout(connect=5.0, read=10.0, write=10.0, pool=10.0)
FETCH_HEADERS = {
    "Accept": "text/html,application/xhtml+xml;q=0.9,text/plain;q=0.4,*/*;q=0.1",
    "Accept-Language": "en-US,en;q=0.8",
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36"
    ),
}
HTML_MEDIA_TYPES = ("text/html", "application/xhtml+xml")


class WebImportError(ValueError):
    def __init__(self, detail: str, *, status_code: int = 400) -> None:
        super().__init__(detail)
        self.detail = detail
        self.status_code = status_code


@dataclass(slots=True)
class FetchedWebPage:
    requested_url: str
    resolved_url: str
    html: str


def normalize_web_url(raw_url: str) -> str:
    candidate = raw_url.strip()
    if not candidate:
        raise WebImportError("Enter a public article link.")

    if "://" not in candidate and " " not in candidate and "." in candidate:
        candidate = f"https://{candidate}"

    parsed = urlsplit(candidate)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise WebImportError("Enter a full http or https article link.")

    return urlunsplit((parsed.scheme, parsed.netloc, parsed.path or "/", parsed.query, parsed.fragment))


def fetch_webpage_snapshot(raw_url: str) -> FetchedWebPage:
    normalized_url = normalize_web_url(raw_url)

    try:
        with httpx.Client(
            follow_redirects=True,
            headers=FETCH_HEADERS,
            timeout=FETCH_TIMEOUT,
        ) as client:
            response = client.get(normalized_url)
    except httpx.TimeoutException as error:
        raise WebImportError(
            "The webpage took too long to respond. Try again or open a simpler article page.",
            status_code=504,
        ) from error
    except httpx.HTTPError as error:
        raise WebImportError(
            "The webpage could not be fetched. It may require sign-in or block direct access.",
            status_code=502,
        ) from error

    if response.status_code >= 400:
        raise WebImportError(
            "The webpage could not be fetched. It may require sign-in or block direct access.",
            status_code=502,
        )

    content_type = response.headers.get("content-type", "").lower()
    if not any(media_type in content_type for media_type in HTML_MEDIA_TYPES):
        if "pdf" in content_type or response.url.path.lower().endswith(".pdf"):
            raise WebImportError("That link points to a PDF. Download it and use file import instead.")
        raise WebImportError("Only public webpage articles are supported here. Use file import for other links.")

    html = response.text.strip()
    if not html:
        raise WebImportError("The webpage did not return readable article content.")

    return FetchedWebPage(
        requested_url=normalized_url,
        resolved_url=str(response.url),
        html=html,
    )
