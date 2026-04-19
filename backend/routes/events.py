from fastapi import APIRouter
from data.events_data import events

router = APIRouter()

@router.get("/api/events")
async def get_events():
    return {"events": events}
