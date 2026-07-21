from __future__ import annotations

import logging

from app.core.database import SessionLocal
from app.core.exceptions import DomainError, EntityNotFoundError
from app.modules.criteria.repository import CriteriaRepository
from app.modules.errors.models import Error
from app.modules.errors.repository import ErrorRepository
from app.modules.imports import llm
from app.modules.imports.models import ImportJob
from app.modules.imports.pdf import extract_text
from app.modules.imports.repository import ImportJobRepository
from app.modules.imports.schemas import (
    ConfirmResult,
    ExtractionPreview,
    LlmExtraction,
    PreviewError,
    PreviewPage,
)
from app.modules.pages.models import Page
from app.modules.pages.repository import PageRepository
from app.modules.projects.repository import ProjectRepository
from app.modules.projects.service import UPLOADS_DIR

logger = logging.getLogger(__name__)

# French audit-report severity words mapped onto the app's enum. Unmapped
# words fall back to "minor" and are flagged for review.
SEVERITY_MAP = {
    "mineur": "minor",
    "mineure": "minor",
    "modéré": "moderate",
    "modere": "moderate",
    "moyen": "moderate",
    "moyenne": "moderate",
    "majeur": "major",
    "majeure": "major",
    "bloquant": "critical",
    "bloquante": "critical",
    "critique": "critical",
}


class InvalidJobStateError(DomainError):
    """Raised when an action is attempted on a job in the wrong status."""


def _normalize_severity(word: str | None) -> tuple[str, bool]:
    """Return (enum_value, was_recognized)."""
    if not word:
        return "minor", False
    mapped = SEVERITY_MAP.get(word.strip().lower())
    if mapped is None:
        return "minor", False
    return mapped, True


def normalize(
    extraction: LlmExtraction, criteria_repository: CriteriaRepository
) -> ExtractionPreview:
    """Turn the raw LLM output into a reviewable, resolved proposal.

    Criterion codes and severity words come from the model as free text; here
    they are resolved against the referential and the enum. Anything that does
    not resolve is kept (so the user can fix it) and flagged.
    """
    # Proposed pages, keyed by lowercased label to de-duplicate.
    pages: dict[str, PreviewPage] = {}
    unlabelled: list[PreviewPage] = []
    for page in extraction.pages:
        preview_page = PreviewPage(label=page.label, name=page.name or (page.label or "Page"), url=page.url)
        if page.label:
            pages.setdefault(page.label.strip().lower(), preview_page)
        else:
            unlabelled.append(preview_page)

    errors: list[PreviewError] = []
    for item in extraction.errors:
        flags: list[str] = []

        criterion_id: int | None = None
        code = item.criterion_code.strip() if item.criterion_code else None
        if code:
            criterion = criteria_repository.get_criterion_by_code(code)
            if criterion is None:
                flags.append("unknown_criterion")
            else:
                criterion_id = criterion.id
        else:
            flags.append("missing_criterion")

        severity, recognized = _normalize_severity(item.severity)
        if not recognized:
            flags.append("unknown_severity")

        # Resolve which single page this error attaches to. "*" (all pages)
        # and empty mean transverse -> no page. Several concrete pages can't be
        # represented by a single page_id yet, so we drop to transverse + flag.
        concrete = [p.strip() for p in item.pages if p.strip() and p.strip() != "*"]
        page_label: str | None = None
        if len(concrete) == 1:
            page_label = concrete[0]
            # Make sure the referenced page exists in the proposal.
            key = page_label.lower()
            if key not in pages:
                pages[key] = PreviewPage(label=page_label, name=page_label, url=None)
        elif len(concrete) > 1:
            flags.append("multiple_pages")

        errors.append(
            PreviewError(
                name=item.name[:255],
                description=item.description,
                criterion_code=code,
                criterion_id=criterion_id,
                severity=severity,
                page_label=page_label,
                section_title=item.section_title,
                flags=flags,
            )
        )

    return ExtractionPreview(pages=list(pages.values()) + unlabelled, errors=errors)


async def run_extraction_job(job_id: int) -> None:
    """Background entry point: read the PDF, call the model, store the proposal.

    Runs outside the request lifecycle, so it opens its own database session.
    Failures are recorded on the job rather than raised.
    """
    db = SessionLocal()
    try:
        jobs = ImportJobRepository(db)
        job = jobs.get(job_id)
        if job is None:
            logger.error("Import job %s vanished before it could run", job_id)
            return

        job.status = "running"
        jobs.save(job)

        try:
            text = extract_text(UPLOADS_DIR / str(job.project_id) / "audit.pdf")
            extraction = await llm.extract(text)
            preview = normalize(extraction, CriteriaRepository(db))
            job.result = preview.model_dump()
            job.status = "succeeded"
            job.error_detail = None
        except Exception as exc:  # noqa: BLE001 — any failure must land on the job
            logger.exception("Import job %s failed", job_id)
            job.status = "failed"
            job.error_detail = str(exc)

        jobs.save(job)
    finally:
        db.close()


class ImportService:
    """Business logic for PDF error extraction (request-scoped)."""

    def __init__(
        self,
        repository: ImportJobRepository,
        project_repository: ProjectRepository,
        page_repository: PageRepository,
        error_repository: ErrorRepository,
    ) -> None:
        self.repository = repository
        self.project_repository = project_repository
        self.page_repository = page_repository
        self.error_repository = error_repository

    def _ensure_project_exists(self, project_id: int) -> None:
        if self.project_repository.get(project_id) is None:
            raise EntityNotFoundError("Project")

    def start_extraction(self, project_id: int) -> ImportJob:
        self._ensure_project_exists(project_id)
        job = ImportJob(project_id=project_id, status="pending")
        return self.repository.add(job)

    def get_job(self, job_id: int) -> ImportJob:
        job = self.repository.get(job_id)
        if job is None:
            raise EntityNotFoundError("ImportJob")
        return job

    def confirm(self, job_id: int, preview: ExtractionPreview) -> ConfirmResult:
        job = self.get_job(job_id)
        if job.status != "succeeded":
            raise InvalidJobStateError(
                "Cette extraction n'est pas prête à être confirmée"
            )

        project_id = job.project_id

        # Map existing pages so we don't create duplicates on re-confirm.
        label_to_id: dict[str, int] = {}
        name_to_id: dict[str, int] = {}
        for existing in self.page_repository.list_for_project(project_id):
            if existing.label:
                label_to_id[existing.label.strip().lower()] = existing.id
            name_to_id[existing.name.strip().lower()] = existing.id

        pages_created = 0
        for preview_page in preview.pages:
            label_key = preview_page.label.strip().lower() if preview_page.label else None
            name_key = preview_page.name.strip().lower()
            if (label_key and label_key in label_to_id) or name_key in name_to_id:
                continue
            page = Page(
                project_id=project_id,
                label=preview_page.label,
                name=preview_page.name,
                url=preview_page.url,
            )
            page = self.page_repository.add(page)
            pages_created += 1
            if label_key:
                label_to_id[label_key] = page.id
            name_to_id[name_key] = page.id

        errors_created = 0
        for preview_error in preview.errors:
            page_id: int | None = None
            if preview_error.page_label:
                page_id = label_to_id.get(preview_error.page_label.strip().lower())
            error = Error(
                project_id=project_id,
                criterion_id=preview_error.criterion_id,
                page_id=page_id,
                name=preview_error.name,
                description=preview_error.description,
                severity=preview_error.severity,
                source="imported",
            )
            self.error_repository.add(error)
            errors_created += 1

        return ConfirmResult(pages_created=pages_created, errors_created=errors_created)
