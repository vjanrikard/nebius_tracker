import httpx

STOOQ_URL = "https://stooq.com/q/d/l/?s=NBIS.US&i=d&d1=20250302&d2=20260302"

async def fetch_nbis_history():
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(STOOQ_URL)
        return response
