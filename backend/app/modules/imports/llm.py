"""Calls the vLLM server to turn an audit report's text into structured errors.

vLLM exposes an OpenAI-compatible API, so the OpenAI SDK is used as the client.
When the server supports guided JSON (``response_format`` with a schema) the
output is schema-guaranteed; otherwise we ask for a JSON object, validate it
strictly with Pydantic, and retry once with a repair hint if it does not parse.
"""

from __future__ import annotations

import json
import logging

from openai import AsyncOpenAI
from pydantic import ValidationError

from app.core.config import settings
from app.modules.imports.schemas import LlmExtraction

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


async def extract(report_text: str) -> LlmExtraction:
    """Run the extraction, retrying once on an unparseable response."""
    client = _build_client()
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {
            "role": "user",
            "content": (
                "Voici le texte brut du rapport d'audit RGAA. "
                "Extrais les pages et les erreurs.\n\n" + report_text
            ),
        },
    ]

    for attempt in range(2):
        completion = await client.chat.completions.create(
            model=settings.vllm_model,
            messages=messages,
            max_tokens=settings.llm_max_output_tokens,
            temperature=0,
            response_format=_response_format(),
        )
        content = completion.choices[0].message.content or ""
        try:
            return _parse(content)
        except (json.JSONDecodeError, ValidationError) as exc:
            logger.warning("Extraction parse failed (attempt %d): %s", attempt + 1, exc)
            if attempt == 0:
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
        "Le modèle n'a pas renvoyé de JSON exploitable après deux tentatives."
    )
