from pathlib import Path

from app.core.exceptions import EntityNotFoundError, InvalidFileError
from app.modules.projects.models import Project
from app.modules.projects.repository import ProjectRepository
from app.modules.projects.schemas import ProjectCreate, ProjectUpdate

# Uploaded audit reports live outside the package, next to the app code
# (bind-mounted in dev). One folder per project, a fixed name so re-uploads
# simply replace the previous report.
UPLOADS_DIR = Path("uploads")
MAX_PDF_SIZE = 100 * 1024 * 1024  # 100 MB


class ProjectService:
    """Business logic for projects.

    The router calls this; it never touches SQLAlchemy directly. When a rule is
    violated (e.g. project not found) it raises a domain error, not an
    ``HTTPException`` — translating that to HTTP is the web layer's job.
    """

    def __init__(self, repository: ProjectRepository) -> None:
        self.repository = repository

    def list_projects(self) -> list[Project]:
        return self.repository.list()

    def get_project(self, project_id: int) -> Project:
        project = self.repository.get(project_id)
        if project is None:
            raise EntityNotFoundError("Project")
        return project

    def create_project(self, data: ProjectCreate) -> Project:
        project = Project(**data.model_dump())
        return self.repository.add(project)

    def update_project(self, project_id: int, data: ProjectUpdate) -> Project:
        project = self.get_project(project_id)
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(project, field, value)
        return self.repository.save(project)

    def delete_project(self, project_id: int) -> None:
        project = self.get_project(project_id)
        self.repository.delete(project)

    def save_audit_pdf(
        self, project_id: int, filename: str, content: bytes
    ) -> dict:
        """Store the uploaded audit report for later extraction.

        Only validates and persists the file for now — the error-extraction
        step will be built on top of it.
        """
        self.get_project(project_id)

        if not content.startswith(b"%PDF-"):
            raise InvalidFileError("Le fichier doit être un PDF valide")
        if len(content) > MAX_PDF_SIZE:
            raise InvalidFileError("Le fichier dépasse la taille maximale (100 Mo)")

        destination_dir = UPLOADS_DIR / str(project_id)
        destination_dir.mkdir(parents=True, exist_ok=True)
        (destination_dir / "audit.pdf").write_bytes(content)

        return {"filename": filename, "size": len(content)}
