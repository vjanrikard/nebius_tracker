from datetime import date, timedelta

import httpx


def build_stooq_url() -> str:
    end_date = date.today()
    start_date = end_date - timedelta(days=400)
    return (
        "https://stooq.com/q/d/l/?"
        f"s=NBIS.US&i=d&d1={start_date:%Y%m%d}&d2={end_date:%Y%m%d}"
    )


async def fetch_nbis_history() -> httpx.Response:
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(build_stooq_url())
        response.raise_for_status()
        return response
