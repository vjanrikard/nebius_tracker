from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.nbis import router as nbis_router
from routes.events import router as events_router

app = FastAPI()

origins = [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(nbis_router)
app.include_router(events_router)
