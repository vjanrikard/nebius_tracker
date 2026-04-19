# NBIS Dashboard

Kort oversikt over den ferdige losningen i dette repoet.

## Hva prosjektet gjor

NBIS Dashboard viser:

1. Prisdata (CSV via backend-proxy mot Stooq)
2. Statisk eventliste for Nebius
3. Enkel status for backend-tilgjengelighet

Lokal backend kjores med FastAPI, mens frontend er statisk og egnet for GitHub Pages.

## Struktur

```text
backend/
public/
src/
assets/
scripts/
.github/workflows/
docs/
```

Detaljert struktur og ansvar per mappe er dokumentert i [docs/nbis_losningsoppsett.md](./nbis_losningsoppsett.md).

## Kjoring og konfigurasjon

Full installasjon, alle kommandoer, CORS-oppsett, frontend-konfig og deploy-flyt ligger i [docs/installasjon-og-konfigurasjon.md](./installasjon-og-konfigurasjon.md).

## Viktige endepunkter

1. GET /health
2. GET /api/nbis
3. GET /api/events

## Deploy

GitHub Pages deployes automatisk fra main via [deploy-pages.yml](../.github/workflows/deploy-pages.yml).
