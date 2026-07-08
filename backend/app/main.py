from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

# Import the models so their tables are registered on Base before create_all.
from app.core.database import Base, engine
from app.core.exceptions import EntityNotFoundError
from app.modules.projects import models as _projects_models  # noqa: F401
from app.modules.projects.router import router as projects_router
from app.modules.tickets import models as _tickets_models  # noqa: F401
from app.modules.tickets.router import router as tickets_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="RGAA Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(EntityNotFoundError)
def handle_entity_not_found(_: Request, exc: EntityNotFoundError) -> JSONResponse:
    """Translate a domain 'not found' error into HTTP 404 in one place, so
    services never need to import anything from FastAPI."""
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND, content={"detail": str(exc)}
    )


app.include_router(projects_router)
app.include_router(tickets_router)


@app.get("/")
def read_root():
    return {"message": "RGAA Tracker API"}


@app.get("/health")
def health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as exc:  # noqa: BLE001
        return {"status": "degraded", "database": "unavailable", "detail": str(exc)}
