from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.modules.errors.schemas import Severity

# --- Raw shape returned by the LLM ------------------------------------------
# Kept permissive on purpose: the model returns criterion codes and severity
# words as free strings; they are resolved/normalized afterwards, not trusted
# as-is. Only the structure is validated here.


class LlmPage(BaseModel):
    label: str | None = None
    name: str
    url: str | None = None


class LlmError(BaseModel):
    section_title: str | None = None
    criterion_code: str | None = None
    severity: str | None = None
    name: str
    description: str | None = None
    # Page references exactly as written: ["P01"], ["*"] for all pages, or []
    # for a global / transverse element.
    pages: list[str] = Field(default_factory=list)


class LlmExtraction(BaseModel):
    pages: list[LlmPage] = Field(default_factory=list)
    errors: list[LlmError] = Field(default_factory=list)


# --- Normalized proposal shown to the user (stored in ImportJob.result) ------


class PreviewPage(BaseModel):
    label: str | None = None
    name: str = Field(min_length=1, max_length=255)
    url: str | None = Field(default=None, max_length=2048)


class PreviewError(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str | None = None
    criterion_code: str | None = None
    # Resolved against the RGAA referential; None when the code was unknown.
    criterion_id: int | None = None
    severity: Severity = "minor"
    # Single page label this error attaches to, or None for transverse / when
    # it spans several pages (kept simple: one page_id per error for now).
    page_label: str | None = None
    section_title: str | None = None
    # Normalization warnings, e.g. "unknown_criterion", "unknown_severity",
    # "multiple_pages". Surfaced in the review UI.
    flags: list[str] = Field(default_factory=list)


class ExtractionPreview(BaseModel):
    pages: list[PreviewPage] = Field(default_factory=list)
    errors: list[PreviewError] = Field(default_factory=list)


# --- API payloads ------------------------------------------------------------


class ImportJobRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    status: str
    error_detail: str | None
    result: ExtractionPreview | None
    created_at: datetime
    updated_at: datetime


class ConfirmResult(BaseModel):
    pages_created: int
    errors_created: int
