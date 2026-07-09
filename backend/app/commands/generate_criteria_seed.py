"""Regenerate the RGAA seed file from the official source.

Downloads the criteria and test methodologies published by DINUM (the data
behind https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/)
and writes ``app/data/rgaa_criteria.json``.

Usage:

    python -m app.commands.generate_criteria_seed

Then re-run ``python -m app.commands.import_criteria`` to update the database.
"""

import json
import re
import urllib.request
from pathlib import Path

BASE_URL = (
    "https://raw.githubusercontent.com/DISIC/"
    "accessibilite.numerique.gouv.fr/main/RGAA"
)
SITE_URL = "https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/"
OUTPUT_FILE = Path(__file__).resolve().parent.parent / "data" / "rgaa_criteria.json"


def fetch_json(url: str) -> dict:
    with urllib.request.urlopen(url) as response:  # noqa: S310 (official source)
        return json.load(response)


def clean_title(text: str) -> str:
    """Strip markdown glossary links ([label](#anchor) -> label) and collapse
    whitespace. Titles are displayed as plain text."""
    text = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", text)
    return " ".join(text.split())


def build_seed(criteria_data: dict, methodologies: dict) -> dict:
    thematics = []
    for topic in criteria_data["topics"]:
        thematic = {
            "number": topic["number"],
            "name": clean_title(topic["topic"]),
            "criteria": [],
        }
        for entry in topic["criteria"]:
            criterium = entry["criterium"]
            code = f"{topic['number']}.{criterium['number']}"
            # Every test of the criterion, with its methodology kept as
            # markdown (test codes look like "1.1.1", "1.1.2", ...).
            methodology = [
                {"test": test_code, "content": methodologies[test_code]}
                for test_number in criterium.get("tests", {})
                if (test_code := f"{code}.{test_number}") in methodologies
            ]
            thematic["criteria"].append(
                {
                    "number": criterium["number"],
                    "code": code,
                    "title": clean_title(criterium["title"]),
                    "url": f"{SITE_URL}#{code}",
                    "methodology": methodology,
                }
            )
        thematics.append(thematic)
    return {"source": SITE_URL, "thematics": thematics}


def main() -> None:
    criteria_data = fetch_json(f"{BASE_URL}/criteres.json")
    methodologies = fetch_json(f"{BASE_URL}/methodologies.json")

    seed = build_seed(criteria_data, methodologies)

    with OUTPUT_FILE.open("w", encoding="utf-8") as f:
        json.dump(seed, f, ensure_ascii=False, indent=2)
        f.write("\n")

    criteria_count = sum(len(t["criteria"]) for t in seed["thematics"])
    tests_count = sum(
        len(c["methodology"]) for t in seed["thematics"] for c in t["criteria"]
    )
    print(
        f"Seed written to {OUTPUT_FILE.name}: "
        f"{len(seed['thematics'])} thematics, {criteria_count} criteria, "
        f"{tests_count} test methodologies."
    )


if __name__ == "__main__":
    main()
