# Endringslogg

## 2026-04-26 — Style refresh: UI matched mot fed_macro_terminal

### Motivasjon

Nebius Tracker hadde et eldre visuelt uttrykk (JetBrains Mono, mørk navy/sort). Målet var å bringe den i linje med [fed_macro_terminal](https://vjanrikard.github.io/fed_macro_terminal/) — samme fargepalett, fonter og designspråk for konsistent look på tvers av dashboards.

### Endrede filer

| Fil | Endring |
| --- | --- |
| `assets/style.css` | Komplett redesign — ny palett, fonter, animasjoner og grid-overlay |
| `public/index.html` | La til `.bg-grid`-div og Google Fonts preconnect for IBM Plex Mono + Space Grotesk |

### Visuelle endringer

| Element | Før | Etter |
| --- | --- | --- |
| Font | JetBrains Mono | IBM Plex Mono + Space Grotesk (headings) |
| Bakgrunn | Flat `#0a0e13` + scanlines | Radialt gradient (`#06131a`) + CSS grid-overlay |
| Primær aksent | `#4db8ff` (blå) | `#67d6ff` (cool teal-blå) |
| Grønn | `#00d46a` | `#70e28f` |
| Rød/hot | `#ff4a4a` | `#ff7a59` |
| Gul/warn | `#f5a623` | `#ffd166` |
| Border | `#1e2a35` | `#245268` (teal-blå) |
| Terminal shell | Ingen blur | `backdrop-filter: blur(4px)` + gradient |
| Animasjoner | Ingen | `rise` (shell ved innlasting), `fadeIn` (kort/events) |
| Event-cards | Avrundede hjørner | Rette hjørner, `border-left: 3px solid var(--cool)` |
| Tags | Avrundede badges | Rette kanter med `border: 1px solid currentColor` |

### Effekt

- Visuelt konsistent med fed_macro_terminal på tvers av begge dashboards.
- Mer dybde og bevegelse gjennom animasjoner og gradient-bakgrunn.
- Ingen funksjonelle endringer — kun styling.

---

## 2026-04-20 — Konsolidering: siste samsvar og feilsokingsforbedringer

### Endringer i frontend-repo (nebius_tracker)

| Fil | Endring |
| --------------------------- | ------------------------------------------------------------------ |
| `docs/README_generated.md`  | Oppdatert til frontend-only repo + ekstern Render-backend |
| `docs/startup-prosedyre.md` | Oppdatert workflow og hurtigkommandoer for ekstern backend         |
| `src/services/api.js`       | Bedre fallback API-base og viser backend `detail`-melding ved feil |

### Endringer i backend-repo (Common)

| Fil 			| Endring                                                              |
| --- ------------------| -------------------------------------------------------------------- |
| `backend/main.py` 	| La til GET/HEAD for `/` for aa unngaa 404-stoy i health/probe-logger |

### Effekt (konsolidering)

- Dokumentasjon og faktisk drift er mer konsistent.
- Frontend viser mer nyttige feilmeldinger naer backend returnerer 4xx/5xx.
- Render-prober mot `/` gir ikke lenger 404.

---

## 2026-04-20 — Dokumentasjon oppdatert til faktisk drift

### Problem (dokumentasjon)

Dokumentasjonen beskrev backend-filer som om de la i dette repoet, selv om denne repoen i praksis kun inneholder frontend og bruker ekstern backend pa Render.

### Endringer (dokumentasjon)

| Fil | Endring |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `docs/nbis_losningsoppsett.md`          | Fjernet lokal backend-struktur og oppdatert arkitekturtekst til ekstern Render-backend               |
| `docs/installasjon-og-konfigurasjon.md` | Fjernet lokal backend-start (uvicorn) og la til verifisering/feilsoking mot ekstern backend          |
| `README.md`                             | Presisert at backend er ekstern FastAPI-tjeneste pa Render                                           |

### Effekt (dokumentasjon)

- Dokumentasjonen samsvarer med faktisk repo-innhold.
- Driftssituasjonen "health ok, /api/nbis 502" har en tydelig feilsokingssti.

---

## 2026-04-19 — Fiks: webside oppdaterer seg ikke

### Problem

Websiden lastet data kun én gang ved sideinnlasting og oppdaterte seg ikke etterpå. I tillegg bufret nettleseren API-svar, noe som gjorde at en manuell reload av siden kunne returnere utdaterte priser fra nettleserens hurtigbuffer i stedet for ferske data fra backend.

Stooq-proxyen manglet også validering av svaret — hvis Stooq returnerte en HTML-feilside i stedet for CSV, ble dette stille passert videre til frontend der CSV-parseren feilet uten en klar feilmelding.

### Årsaker

| Årsak                                                        | Fil                           |
| ------------------------------------------------------------ | ----------------------------- |
| `fetch()` brukte standard nettleserbuffer — cachede GET-svar | `src/services/api.js`         |
| Ingen `setInterval` — data ble aldri oppdatert automatisk    | `src/pages/nbis-dashboard.js` |
| Backend satte ingen `Cache-Control`-header                   | `backend/routes/nbis.py`      |
| Ingen validering av at Stooq-svaret er                       | `backend/routes/nbis.py       |

### Endringer

#### `src/services/api.js`

Lagt til `cache: "no-store"` i alle `fetch()`-kall. Dette forteller nettleseren at den aldri skal lese fra eller skrive til hurtigbufferen for disse forespørslene, slik at siden alltid henter ferske data fra backend.

```js
// Før
const response = await fetch(`${getApiBase()}${pathname}`);

// Etter
const response = await fetch(`${getApiBase()}${pathname}`, { cache: "no-store" });
```

#### `src/pages/nbis-dashboard.js`

Lagt til `setInterval` som kaller `loadPrices()` og `loadBackendStatus()` automatisk hvert 5. minutt mens siden er åpen. Events-data er statisk og trenger ikke periodisk refresh.

```js
const PRICE_REFRESH_MS = 5 * 60 * 1000;

init();
setInterval(() => Promise.all([loadBackendStatus(), loadPrices()]), PRICE_REFRESH_MS);
```

#### `backend/routes/nbis.py`

To endringer:

1. Lagt til `Cache-Control: no-store, max-age=0` i svaret fra `/api/nbis`. Dette hindrer eventuelle mellomliggende proxyer og nettleseren i å cache prisdata.

2. Lagt til validering av Stooq-svaret: hvis innholdet ikke starter med `Date` (forventet CSV-header), returneres HTTP 502 med en klar feilmelding i stedet for å sende videre en HTML-feilside.

```python
# Valider at svaret er CSV
if not content.strip().startswith("Date"):
    raise HTTPException(status_code=502, detail="Unexpected response from Stooq: not CSV data")

# Cache-Control-header
return Response(
    content=content,
    media_type="text/plain",
    headers={"Cache-Control": "no-store, max-age=0"},
)
```

### Effekt

- Siden oppdaterer seg automatisk hvert 5. minutt uten at brukeren trenger å refreshe manuelt.
- En manuell reload vil alltid hente ferske data, aldri utdaterte bufrede svar.
- Feilmeldingen ved problemer med Stooq er nå presis og lesbar.

---

## 2026-04-19 — Opprydding: mappestruktur

### Bakgrunn

Repositoriet lå med dobbel nesting (`Finance/Nebius/nebius_tracker/nebius_tracker/`), to stale duplikater lå feil plassert i `Common/`, og `Common/` inneholdt et prosjektspesifikt `.venv`.

### Utførte flytt

| Handling                  | Fra                                             | Til / Resultat                                                                |
| --------------------- --- | --- |
| Fiks dobbel nesting       | `Finance/Nebius/nebius_tracker/nebius_tracker/` | Innhold flyttet opp til `Finance/Nebius/nebius_tracker/`                      |
| Fjernet stale duplikat    | `Common/backend/`                               | Slettet — eldre kopi av nebius_tracker-backend (manglet fixes fra 2026-04-19) |
| Fjernet feilplassert venv | `Common/.venv/`                                 | Slettet — prosjektspesifikt Python-miljø, ikke en felles ressurs              |

### Gjenstående

`Finance/Nebius/nebius_tracker - Copy/` — gammel arbeidskopi med `src/backend/backend_v0.1.py`, `analyst-targets.js` m.m. Avventer beslutning fra eier om sletting.

---

## 2026-04-19 — Deploy: backend til Render (Alternativ B)

### Motivasjon

GitHub Pages serverer kun statiske filer. `config.js` pekte til `http://127.0.0.1:8000` (localhost), noe som aldri virker fra en offentlig nettleser. Løsningen er å hoste backend-en permanent i skyen på Render.com.

### Nye filer

| Fil               | Formål                                                                                |
| ----------------- | ------------------------------------------------------------------------------------- |
| `render.yaml`     | Render Infrastructure as Code — definerer service, runtime, startkommando og CORS-env |
| `.python-version` | Forteller Render å bruke Python 3.12.0                                                |

### Endrede filer

| Fil | Endring |
| --- | --- |
| `public/config.js` | `API_BASE` endret fra `http://127.0.0.1:8000` til `https://nebius-tracker-api.onrender.com` |
| `config.js` (rot)  | Samme endring — holdes i sync med `public/config.js`                                        |

### Render-konfigurasjon

```yaml
name: nebius-tracker-api
region: frankfurt
plan: free
startCommand: uvicorn backend.main:app --host 0.0.0.0 --port $PORT
NEBIUS_ALLOWED_ORIGINS: https://vjanrikard.github.io
```

Forventet URL: `https://nebius-tracker-api.onrender.com`

### Manuelt steg etter push

1. Gå til [render.com](https://render.com) → **New** → **Web Service**
2. Koble til GitHub-repo `vjanrikard/nebius_tracker`
3. Render oppdager `render.yaml` automatisk og foreslår konfigurasjon
4. Klikk **Deploy** — første bygg tar ~2 minutter
5. Verifiser at URL-en matcher `nebius-tracker-api.onrender.com`. Hvis Render la til et suffix (f.eks. `-abc12`), oppdater `public/config.js` tilsvarende og push på nytt

### Kjent begrensning — gratis tier

Render slår av tjenesten etter 15 minutters inaktivitet. Første forespørsel etter inaktivitet tar 30–50 sekunder (kald oppstart). Dashbordet viser da "Checking..." i Backend Status-feltet midlertidig.
