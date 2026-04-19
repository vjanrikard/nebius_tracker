import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routes.events import router as events_router
from backend.routes.health import router as health_router
from backend.routes.nbis import router as nbis_router


def parse_allowed_origins() -> list[str]:
    configured_origins = os.getenv("NEBIUS_ALLOWED_ORIGINS", "")
    default_origins = [
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://127.0.0.1:4173",
        "http://localhost:4173",
        "https://vjanrikard.github.io",
    ]
    extra_origins = [origin.strip() for origin in configured_origins.split(",") if origin.strip()]
    return sorted(set(default_origins + extra_origins))


app = FastAPI(title="Nebius Tracker API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=parse_allowed_origins(),
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(nbis_router)
app.include_router(events_router)
