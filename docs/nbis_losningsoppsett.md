# NBIS-løsning: forslag til oppsett

Dette dokumentet beskriver et enkelt og ryddig oppsett for prosjektet med frontend og backend, basert på repository-planen og FastAPI-scriptet. Frontend-strukturen er tenkt lagt under `src/`, `public/` og `assets/`, mens backend skilles ut i en egen `backend/`-mappe for å holde serverkode adskilt fra frontend-kode [cite:1][cite:4].

## Mappestruktur

Et ryddig utgangspunkt for prosjektet kan se slik ut [cite:1][cite:4]:

```text
public/
  index.html

src/
  pages/
    nbis-dashboard.js
  services/
    api.js
  components/
  models/
  utils/
  hooks/

assets/
  style.css

backend/
  main.py
  __init__.py
  routes/
    __init__.py
    nbis.py
    events.py
  services/
    __init__.py
    stooq_service.py
  data/
    __init__.py
    events_data.py

README.md
```

Denne strukturen bygger på planen din der `src/` brukes til kildekode, `public/` til filer som lastes direkte i nettleseren, `assets/` til statiske ressurser og `README.md` i rotmappen [cite:1]. I tillegg legges FastAPI-koden i en egen `backend/`-mappe fordi den nåværende `backend.py`-filen både oppretter appen, setter CORS og eksponerer API-routes, og derfor naturlig tilhører serverlaget [cite:4].

## Backend-oppsett

Den opprinnelige `backend.py`-filen gjør flere ting samtidig: oppretter `FastAPI()`-appen, konfigurerer `CORSMiddleware`, henter prisdata fra Stooq og returnerer en statisk eventliste via to API-endepunkter [cite:4]. Derfor er det hensiktsmessig å splitte backend-en i mindre filer med tydelig ansvar [cite:4].

### `backend/main.py`

`main.py` bør bare inneholde app-oppsett, CORS-konfigurasjon og registrering av routes [cite:4]. Dette gjør entrypointen enkel å lese og lett å vedlikeholde når flere endepunkter kommer til [cite:4].

### `backend/routes/`

`routes/nbis.py` håndterer endepunktet `/api/nbis`, mens `routes/events.py` håndterer `/api/events` [cite:4]. Ved å flytte route-definisjonene ut av hovedfilen blir det tydelig hva som er HTTP-lag og hva som er datalogikk [cite:4].

### `backend/services/`

`services/stooq_service.py` bør inneholde funksjonen som gjør HTTP-kallet mot Stooq, siden dette er ren service-logikk og ikke serveroppsett [cite:4]. Dette samsvarer også med repo-planen din, der `services/` er ment for API-kall og datalogikk [cite:1][cite:4].

### `backend/data/`

`data/events_data.py` inneholder den statiske `events`-listen som i originalfilen ligger direkte inni route-funksjonen [cite:4]. Når denne listen flyttes ut, blir det lettere å utvide med flere hendelser eller senere bytte til scraping eller database [cite:4].

## Frontend-oppsett

Frontend-en kan holdes svært enkel i starten og likevel gi god læring i hvordan lagene henger sammen [cite:1][cite:4]. Siden backend allerede eksponerer `/api/nbis` og `/api/events`, trenger frontend bare en HTML-fil, en JS-fil for API-kall, en sidefil som renderer data, og en CSS-fil for presentasjon [cite:4].

### `public/index.html`

`index.html` fungerer som inngangsside for appen og laster inn global CSS og JavaScript-modulen for dashboardet [cite:1]. Dette passer godt med planen din der `public/` er ment for filer som nettleseren laster direkte [cite:1].

### `src/services/api.js`

`api.js` kapsler inn kallene til backend-endepunktene `/api/nbis` og `/api/events` [cite:4]. Dette gir et tydelig skille mellom presentasjonslaget og datalaget, og følger rollen til `src/services/` i repository-planen [cite:1].

### `src/pages/nbis-dashboard.js`

`nbis-dashboard.js` fungerer som sidefilen som henter data fra `api.js` og renderer prisdata og hendelser inn i DOM-en [cite:1]. Dette passer med planen din der `pages/` brukes til sidespesifikk frontendlogikk [cite:1].

### `assets/style.css`

`style.css` inneholder global styling og hører naturlig hjemme i `assets/`, siden denne mappen er ment for statiske ressurser som bilder, fonter og stilfiler [cite:1]. Dette holder presentasjon adskilt fra både HTML og JavaScript [cite:1].

## Dataflyt

Løsningen kan forstås som en enkel kjede i fire steg [cite:4]:

1. Nettleseren laster `public/index.html` [cite:1]
2. `nbis-dashboard.js` kaller funksjoner i `src/services/api.js` [cite:1]
3. `api.js` henter data fra FastAPI-endepunktene `/api/nbis` og `/api/events` [cite:4]
4. FastAPI-routene bruker service- og data-laget til å returnere data til frontend-en [cite:4]

Denne separasjonen gjør løsningen lettere å forstå, fordi hvert lag har ett tydelig ansvar: backend leverer data, frontend henter data, og UI-laget viser dataene [cite:1][cite:4].

## Hvorfor denne løsningen er pedagogisk god

Oppsettet er lite nok til å være oversiktlig, men stort nok til å lære grunnleggende arkitektur i et webprosjekt [cite:1][cite:4]. Det viser konkret forskjellen mellom `routes`, `services`, `data`, `pages` og `assets`, uten at prosjektet blir unødvendig komplisert [cite:1][cite:4].

Det er også en naturlig vei videre herfra: pris-CSV kan parses til objekter, vises i tabell eller graf, og event-data kan kobles mot datoer i prisserien i frontend-en [cite:4]. Fordi backend allerede er delt opp etter ansvar, blir slike utvidelser enklere å implementere og vedlikeholde [cite:4].
