from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app import models  # noqa: F401  (ensure models are registered on Base)
from app.database import Base, engine
from app.routers import projects, tickets

Base.metadata.create_all(bind=engine)

app = FastAPI(title="RGAA Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router)
app.include_router(tickets.router)


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
