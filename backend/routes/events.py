from fastapi import APIRouter

from backend.data.events_data import events

router = APIRouter(prefix="/api", tags=["events"])


@router.get("/events")
async def get_events() -> dict[str, list[dict[str, str | int]]]:
    sorted_events = sorted(events, key=lambda item: item["date"], reverse=True)
    return {"events": sorted_events}
