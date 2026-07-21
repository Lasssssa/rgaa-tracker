"""Calls the vLLM server to turn an audit report's text into structured errors.

vLLM exposes an OpenAI-compatible API, so the OpenAI SDK is used as the client.

To keep every response short — a long report with many errors would otherwise
overflow the output-token cap and truncate the JSON mid-object — the report is
split into size-bounded chunks (on paragraph boundaries) and each chunk is
extracted with its own small call. The per-chunk results are then merged. Since
the model echoes each error's description verbatim, a chunk's output is about
the size of its input, so a small input chunk can never produce a truncated
response.

Each call is streamed and reassembled here (so a reverse proxy in front of the
model does not 504 on a long generation). When the server supports guided JSON
(``response_format`` with a schema) the output is schema-guaranteed; otherwise
we ask for a JSON object, validate it strictly with Pydantic, and retry with a
repair hint if it does not parse (up to ``LLM_MAX_ATTEMPTS`` times).
"""

from __future__ import annotations

import json
import logging

from openai import APIError, AsyncOpenAI
from pydantic import ValidationError

from app.core.config import settings
from app.modules.imports.schemas import LlmError, LlmExtraction, LlmPage

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """Tu es un assistant expert en accessibilité web (RGAA) chargé \
d'extraire, à partir du texte brut d'un rapport d'audit RGAA, la liste \
exhaustive des erreurs et l'échantillon de pages audité.

Le rapport est organisé en sections. Une section décrit un ensemble d'éléments à \
corriger et contient généralement :
- un titre de section (thématique fonctionnelle, ex. « Gabarits - Structure »),
- les pages concernées (ex. « P01 », « Toutes les pages »),
- un bloc « Problème : » listant un ou plusieurs constats, chacun préfixé par un \
numéro de critère RGAA et une gravité, au format « 12.6 - majeur : ... »,
- un bloc « Solution : » (que tu peux ignorer pour l'instant).

Règles :
- Produis UNE erreur par constat listé sous « Problème : ».
- `criterion_code` : le numéro de critère RGAA tel qu'écrit (ex. « 12.6 »). Si \
absent, mets null.
- `severity` : le mot de gravité tel qu'écrit (ex. « majeur », « mineur »). Si \
absent, mets null.
- `name` : un résumé court du constat (max ~120 caractères).
- `description` : le texte complet du constat.
- `pages` : la liste des libellés de pages concernés par CE constat. Utilise \
["*"] si le constat concerne toutes les pages, [] s'il n'est rattaché à aucune \
page précise (élément global/transverse).
- `section_title` : le titre de la section qui contient le constat.
- N'invente rien. N'ajoute pas de critère ou de page qui ne figure pas dans le \
texte.

Extrais aussi l'échantillon de pages audité dans `pages` (niveau racine) : pour \
chaque page, son libellé (`label`, ex. « P01 »), son nom (`name`) et son URL \
(`url`) si disponibles.

Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour, de la forme :
{
  "pages": [{"label": "P01", "name": "Accueil", "url": "https://..."}],
  "errors": [
    {
      "section_title": "...",
      "criterion_code": "12.6",
      "severity": "majeur",
      "name": "...",
      "description": "...",
      "pages": ["P01"]
    }
  ]
}"""

_JSON_SCHEMA = {
    "name": "rgaa_extraction",
    "strict": True,
    "schema": {
        "type": "object",
        "additionalProperties": False,
        "properties": {
            "pages": {
                "type": "array",
                "items": {
                    "type": "object",
                    "additionalProperties": False,
                    "properties": {
                        "label": {"type": ["string", "null"]},
                        "name": {"type": "string"},
                        "url": {"type": ["string", "null"]},
                    },
                    "required": ["label", "name", "url"],
                },
            },
            "errors": {
                "type": "array",
                "items": {
                    "type": "object",
                    "additionalProperties": False,
                    "properties": {
                        "section_title": {"type": ["string", "null"]},
                        "criterion_code": {"type": ["string", "null"]},
                        "severity": {"type": ["string", "null"]},
                        "name": {"type": "string"},
                        "description": {"type": ["string", "null"]},
                        "pages": {"type": "array", "items": {"type": "string"}},
                    },
                    "required": [
                        "section_title",
                        "criterion_code",
                        "severity",
                        "name",
                        "description",
                        "pages",
                    ],
                },
            },
        },
        "required": ["pages", "errors"],
    },
}


class LlmExtractionError(Exception):
    """Raised when the model cannot produce a usable extraction."""


def _build_client() -> AsyncOpenAI:
    if not settings.vllm_model:
        raise LlmExtractionError(
            "VLLM_MODEL n'est pas configuré : impossible d'appeler le modèle."
        )
    return AsyncOpenAI(
        base_url=settings.vllm_base_url,
        api_key=settings.vllm_api_key or "EMPTY",
    )


def _response_format() -> dict:
    if settings.llm_guided_json:
        return {"type": "json_schema", "json_schema": _JSON_SCHEMA}
    return {"type": "json_object"}


def _parse(content: str) -> LlmExtraction:
    data = json.loads(content)
    return LlmExtraction.model_validate(data)


async def _complete(client: AsyncOpenAI, messages: list[dict]) -> str:
    """Run one streamed completion and return the accumulated text.

    The call is streamed on purpose: a large report can take a while to
    generate, and a non-streaming request keeps the connection silent until the
    whole response is ready — long enough for a reverse proxy in front of the
    model to return a 504 Gateway Timeout. Streaming sends tokens as they come,
    which keeps the connection alive; we reassemble them into the full JSON here
    before parsing.
    """
    try:
        stream = await client.chat.completions.create(
            model=settings.vllm_model,
            messages=messages,
            max_tokens=settings.llm_max_output_tokens,
            temperature=0,
            response_format=_response_format(),
            stream=True,
        )
        chunks: list[str] = []
        async for chunk in stream:
            if not chunk.choices:
                continue
            delta = chunk.choices[0].delta.content
            if delta:
                chunks.append(delta)
        return "".join(chunks)
    except APIError as exc:
        logger.error("vLLM request failed: %s", exc)
        raise LlmExtractionError(
            f"Échec de l'appel au modèle vLLM : {exc}"
        ) from exc


def _split_into_chunks(report_text: str, max_chars: int) -> list[str]:
    """Split the report into chunks of at most ``max_chars`` characters.

    Splitting happens on blank-line (paragraph) boundaries so sections stay
    intact, which keeps each chunk's output small enough that it cannot be
    truncated by the token cap. A single paragraph longer than ``max_chars`` is
    hard-split as a last resort. ``max_chars`` <= 0 disables chunking (the whole
    report is returned as one chunk).
    """
    if max_chars <= 0 or len(report_text) <= max_chars:
        return [report_text]

    chunks: list[str] = []
    current: list[str] = []
    current_len = 0
    for paragraph in report_text.split("\n\n"):
        # A paragraph that cannot fit on its own is flushed then hard-split.
        if len(paragraph) > max_chars:
            if current:
                chunks.append("\n\n".join(current))
                current, current_len = [], 0
            for start in range(0, len(paragraph), max_chars):
                chunks.append(paragraph[start : start + max_chars])
            continue
        # +2 accounts for the "\n\n" re-joined between paragraphs.
        if current and current_len + len(paragraph) + 2 > max_chars:
            chunks.append("\n\n".join(current))
            current, current_len = [], 0
        current.append(paragraph)
        current_len += len(paragraph) + 2

    if current:
        chunks.append("\n\n".join(current))
    return chunks


def _merge(extractions: list[LlmExtraction]) -> LlmExtraction:
    """Combine per-chunk extractions: concatenate errors, de-duplicate pages.

    The page sample usually appears in a single chunk, but a page can be
    mentioned in several; pages are de-duplicated by label (case-insensitive),
    falling back to name for pages without a label.
    """
    errors: list[LlmError] = []
    pages: list[LlmPage] = []
    seen_labels: set[str] = set()
    seen_names: set[str] = set()
    for extraction in extractions:
        errors.extend(extraction.errors)
        for page in extraction.pages:
            label_key = page.label.strip().lower() if page.label else None
            name_key = page.name.strip().lower() if page.name else None
            if label_key is not None:
                if label_key in seen_labels:
                    continue
                seen_labels.add(label_key)
            elif name_key is not None and name_key in seen_names:
                continue
            if name_key is not None:
                seen_names.add(name_key)
            pages.append(page)
    return LlmExtraction(pages=pages, errors=errors)


async def _extract_chunk(client: AsyncOpenAI, chunk_text: str) -> LlmExtraction:
    """Extract one chunk, retrying on an unparseable response.

    Each attempt after the first re-prompts the model with a repair hint, up to
    ``LLM_MAX_ATTEMPTS`` times.
    """
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {
            "role": "user",
            "content": (
                "Voici le texte brut du rapport d'audit RGAA. "
                "Extrais les pages et les erreurs.\n\n" + chunk_text
            ),
        },
    ]

    max_attempts = max(1, settings.llm_max_attempts)
    for attempt in range(max_attempts):
        content = await _complete(client, messages)
        try:
            return _parse(content)
        except (json.JSONDecodeError, ValidationError) as exc:
            logger.warning(
                "Extraction parse failed (attempt %d/%d): %s",
                attempt + 1,
                max_attempts,
                exc,
            )
            if attempt < max_attempts - 1:
                messages.append({"role": "assistant", "content": content})
                messages.append(
                    {
                        "role": "user",
                        "content": (
                            "Ta réponse n'était pas un JSON valide conforme au "
                            "format demandé. Renvoie UNIQUEMENT l'objet JSON "
                            "corrigé, sans aucun texte autour."
                        ),
                    }
                )

    raise LlmExtractionError(
        f"Le modèle n'a pas renvoyé de JSON exploitable après {max_attempts} "
        "tentatives."
    )


async def extract(report_text: str) -> LlmExtraction:
    """Extract pages and errors from a report, chunking it to bound output size.

    The report is split into size-bounded chunks, each extracted with its own
    small call, and the results are merged. See the module docstring for why.
    """
    client = _build_client()
    chunks = _split_into_chunks(report_text, settings.llm_chunk_char_size)
    logger.info("Extracting report in %d chunk(s)", len(chunks))

    results: list[LlmExtraction] = []
    for index, chunk in enumerate(chunks, start=1):
        logger.info(
            "Extracting chunk %d/%d (%d chars)", index, len(chunks), len(chunk)
        )
        results.append(await _extract_chunk(client, chunk))

    return _merge(results)
