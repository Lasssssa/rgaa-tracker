"""Text extraction from an uploaded audit PDF.

Only the text layer is read — audit reports exported from Word/Acrobat carry a
real text layer, which is all the LLM needs. Page boundaries are marked so the
model (and later a reviewer) can trace an error back to a page number.
"""

from __future__ import annotations

from pathlib import Path

import pdfplumber

from app.core.exceptions import InvalidFileError


def extract_text(pdf_path: Path) -> str:
    if not pdf_path.exists():
        raise InvalidFileError("Aucun PDF d'audit n'a été téléversé pour ce projet")

    parts: list[str] = []
    has_text = False
    with pdfplumber.open(pdf_path) as pdf:
        for index, page in enumerate(pdf.pages, start=1):
            text = page.extract_text() or ""
            if text.strip():
                has_text = True
            parts.append(f"[Page {index}]\n{text}")

    # The page markers alone are never enough — guard on real page text so a
    # scanned or empty PDF is rejected instead of sent to the model.
    if not has_text:
        raise InvalidFileError(
            "Impossible d'extraire du texte du PDF (document scanné ou vide ?)"
        )
    return "\n\n".join(parts).strip()
