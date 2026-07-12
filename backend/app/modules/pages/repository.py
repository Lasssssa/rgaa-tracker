from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.pages.models import Page


class PageRepository:
    """The only place that talks to the database for pages."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def list_for_project(self, project_id: int) -> list[Page]:
        # Oldest first: pages keep the order the sample was entered in.
        return list(
            self.db.scalars(
                select(Page)
                .where(Page.project_id == project_id)
                .order_by(Page.created_at.asc())
            )
        )

    def get(self, page_id: int) -> Page | None:
        return self.db.get(Page, page_id)

    def add(self, page: Page) -> Page:
        self.db.add(page)
        self.db.commit()
        self.db.refresh(page)
        return page

    def save(self, page: Page) -> Page:
        self.db.commit()
        self.db.refresh(page)
        return page

    def delete(self, page: Page) -> None:
        self.db.delete(page)
        self.db.commit()
