from sqlalchemy.orm import Session

from app.modules.imports.models import ImportJob


class ImportJobRepository:
    """The only place that talks to the database for import jobs."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def get(self, job_id: int) -> ImportJob | None:
        return self.db.get(ImportJob, job_id)

    def add(self, job: ImportJob) -> ImportJob:
        self.db.add(job)
        self.db.commit()
        self.db.refresh(job)
        return job

    def save(self, job: ImportJob) -> ImportJob:
        """Persist changes made to an already-tracked job."""
        self.db.commit()
        self.db.refresh(job)
        return job
