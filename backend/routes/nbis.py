from fastapi import APIRouter, Response
from services.stooq_service import fetch_nbis_history

router = APIRouter()

@router.get("/api/nbis")
async def get_nbis_history():
    response = await fetch_nbis_history()

    if response.status_code != 200:
        return Response(
            content=f"Error from Stooq: {response.status_code}",
            status_code=500,
            media_type="text/plain",
        )

    return Response(content=response.text, media_type="text/plain")
