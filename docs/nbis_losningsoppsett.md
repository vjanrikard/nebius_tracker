# NBIS-losning: faktisk oppsett i repoet

Dette dokumentet beskriver hvordan losningen faktisk er satt opp i dag, ikke bare et forslag.

## Mappestruktur

```text
.github/
  workflows/
    deploy-pages.yml

backend/
  __init__.py
  main.py
  data/
    __init__.py
    events_data.py
  routes/
    __init__.py
    events.py
    health.py
    nbis.py
  services/
    __init__.py
    stooq_service.py

public/
  config.js
  index.html

src/
  pages/
    nbis-dashboard.js
  services/
    api.js

assets/
  style.css

scripts/
  build-pages.ps1

docs/
  installasjon-og-konfigurasjon.md
  nbis_losningsoppsett.md
```

## Backend

Hovedideen i backend er et tydeleg lagdelt oppsett:

1. [backend/main.py](../backend/main.py) oppretter FastAPI-app, setter CORS og registrerer routes.
2. [backend/routes/nbis.py](../backend/routes/nbis.py) eksponerer GET /api/nbis.
3. [backend/routes/events.py](../backend/routes/events.py) eksponerer GET /api/events.
4. [backend/routes/health.py](../backend/routes/health.py) eksponerer GET /health.
5. [backend/services/stooq_service.py](../backend/services/stooq_service.py) bygger Stooq-URL og henter CSV.
6. [backend/data/events_data.py](../backend/data/events_data.py) holder statisk event-data.

NEBIUS_ALLOWED_ORIGINS brukes for ekstra CORS-origins i miljo, med lokale defaults inkludert.

## Frontend

Frontend er en statisk app som kan hostes direkte paa GitHub Pages:

1. [public/index.html](../public/index.html) er inngangssiden.
2. [public/config.js](../public/config.js) inneholder API_BASE for miljo.
3. [src/services/api.js](../src/services/api.js) kapsler API-kall.
4. [src/pages/nbis-dashboard.js](../src/pages/nbis-dashboard.js) parser CSV og renderer tabell + events.
5. [assets/style.css](../assets/style.css) inneholder styling.

## Dataflyt

1. Nettleser laster [public/index.html](../public/index.html).
2. Siden leser API_BASE fra [public/config.js](../public/config.js).
3. Frontend henter /health, /api/nbis og /api/events via [src/services/api.js](../src/services/api.js).
4. Backend svarer med helse, CSV-priser og eventliste.
5. Dashboard renderer kort, pristabell og eventkort.

## GitHub Pages-flyt

1. [scripts/build-pages.ps1](../scripts/build-pages.ps1) bygger dist/ ved aa kopiere public, src og assets.
2. [deploy-pages.yml](../.github/workflows/deploy-pages.yml) kjorer build ved push til main.
3. Artifact fra dist/ lastes opp og deployes til GitHub Pages.

## Kommandoer

Alle konkrete installasjons- og konfigurasjonskommandoer er samlet i [docs/installasjon-og-konfigurasjon.md](./installasjon-og-konfigurasjon.md).
