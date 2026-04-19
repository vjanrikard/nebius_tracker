import httpx
from fastapi import APIRouter, HTTPException, Response

from backend.services.stooq_service import fetch_nbis_history

router = APIRouter(prefix="/api", tags=["nbis"])


@router.get("/nbis")
async def get_nbis_history() -> Response:
    try:
        response = await fetch_nbis_history()
    except httpx.HTTPError as error:
        raise HTTPException(status_code=502, detail=f"Unable to fetch NBIS data: {error}") from error

    return Response(content=response.text, media_type="text/plain")
